class WSManager {
    constructor() {
        this.host = "";
        this.port = "";
        this.token = "";
        this.cbPool = {};
        this.reConnectLock = false; // 心跳检测频率锁
        this.beatTime = 10000; // 心跳频率
        this.reConnectTime = 8000; // 重连频率
        this.heartTimer = null;
        this.closeTimer = null;
        this.resHandle = {};
        this.globleResHandle = {};
        this.globleMessageResHandle = {};
        this.config = {};
        this.status = "close"
    }

    checkCode(code, msg) {
        return new Promise((resolve, reject) => {
            if (!code && code !== 0) {
                return;
            }
            if (parseInt(code) >= 0) {
                resolve("");
            } else {
                reject("");
            }
        })
    }

    // 初始化
    init(config = {}, resHandle = {}) {
        this.host = config.host || "";
        this.port = config.port || "443";
        this.token = config.token || "";
        this.config = config;
        this.initResHandle(resHandle);
        this.initConnect();
    }

    // 更新token
    updateToken(token) {
        this.token = token;
    }

    // 设置回调函数
    initResHandle(resHandle = {}) {
        this.resHandle = resHandle;
    }

    // 设置全局回调函数
    initGlobleResHandle(resHandle = {}) {
        this.globleResHandle = resHandle;
    }

    // 设置全局组件接收消息函数
    initGlobleMessageResHandle(resHandle = {}) {
        this.globleMessageResHandle = resHandle;
    }

    // 创建连接
    initConnect() {
        let wsServer = `${ this.host }:${ this.port }?token=${this.token}`;
        try {
            this.ws = wx.connectSocket({
                url: wsServer,
                header: {
                    'content-type': 'application/json'
                },
                method: "GET",
                success: res => {
                    console.log("[webSocket] init connect success: ",  res);
                    this.initEventHandle();
                },
                fail: res => {
                    console.log("[webSocket] init connect fail: ",  res);
                    this.reConnect();
                }
            })
        } catch (err) {
            console.log("[webSocket] init connect error: ",  err);
            this.reConnect();
        }
    }

    // 事件监听
    initEventHandle() {
        wx.onSocketClose(res => {
            console.log("[webSocket] onClose",  res);
            this.status = "close";
            typeof this.globleResHandle["onClose"] === 'function' && this.globleResHandle["onClose"](res);
            typeof this.resHandle["onClose"] === 'function' && this.resHandle["onClose"](res);
            this.reConnect();
        });
        wx.onSocketError(res => {
            console.log("[webSocket] onError",  res);
            this.status = "error";
            typeof this.globleResHandle["onError"] === 'function' && this.globleResHandle["onError"](res);
            typeof this.resHandle["onError"] === 'function' && this.resHandle["onError"](res);
            this.reConnect();
        });
        wx.onSocketOpen(res => {
            console.log("[webSocket] onOpen",  res);
            this.status = "open";
            this.heartCheck();
            typeof this.globleResHandle["onOpen"] === 'function' && this.globleResHandle["onOpen"](res);
            typeof this.resHandle["onOpen"] === 'function' && this.resHandle["onOpen"](res);
            this.config.onOpen ?  this.config.onOpen() :  this.config.onopen ?  this.config.onopen() :  "";
        });
        wx.onSocketMessage(res => {
            this.heartCheck();
            this.onMessage(res);
        });
    }

    // 收到消息
    onMessage(res) {
        try {
            let data = JSON.parse(res.data),
                handle = this.resHandle,
                messageHandle = this.globleMessageResHandle;
            
            // 检查code
            this.checkCode(data.code, data.msg).then(() => {
                // 执行
                typeof messageHandle[data.action] === 'function' && messageHandle[data.action](data.data);
                typeof handle[data.action] === 'function' && handle[data.action](data.data);
                let cbHandle = this.cbPool[data.reqId];
                cbHandle && typeof cbHandle['cb'] === 'function' && this.exec(cbHandle,  data.data);

            }).catch(err => {
                console.log("[webSocket] CheckCode Error: ", err);
            })

        } catch (err) {
            console.log("[webSocket] Message Error: ",  err);
        }
    }

    // 发送消息
    send(req, cb) {
        return new Promise((resolve, reject) => {
            // console.group("[webSocket] Send Message Start");
            let data = {
                action: req.action,
                type: cb ?  2 :  1,
                reqId: new Date().getTime(),
                code: 0,
                msg: "请求消息",
                data: req.data instanceof Object ?  req.data :  {}
            };

            // console.log("[webSocket] Send Data", data);

            // 更好的删除机制
            cb ?  this.cbPool[data.reqId] = { cb } :  "";

            wx.sendSocketMessage({
                data: JSON.stringify(data),
                success: res => {
                    // console.log("[webSocket] Send Message success",  res);
                    console.groupEnd();
                    resolve(res);
                },
                fail: res => {
                    console.log("[webSocket] Send Message fail",  res);
                    console.groupEnd();
                    reject(res);
                }
            })
        });
    }

    // 执行回调
    exec(cbHandle, res) {
        cbHandle['cb'](res);
        delete this.cbPool[res.reqId];
    }

    // 重连机制
    reConnect() {
        console.log("reConnect");
        this.status = "reConnect";
        if (this.reConnectLock) return;
        this.reConnectLock = true;
        setTimeout(() => {
            console.log("try reConnect");
            this.init(this.config, this.resHandle);
            this.reConnectLock = false;
        }, this.reConnectTime)
    }

    // 断开连接
    close() {
        wx.closeSocket();
    }

    // 心跳检测
    heartCheck() {
        clearTimeout(this.closeTimer);
        clearTimeout(this.heartTimer);
        this.heartTimer = setTimeout(() => {
            // console.log("heartCheck");
            wx.sendSocketMessage({
                data: "1"
            });
            this.closeTimer = setTimeout(() => {
                this.close();
                this.ws = null;
            }, this.beatTime);
        }, this.beatTime);
    }
}

export {
    WSManager
}