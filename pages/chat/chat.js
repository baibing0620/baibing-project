const app = getApp();
import {
    fetchApi,
    addActionLog
} from "./../../api/api.js";
import {
    showTips,
    nav,
    showToast
} from "../../utils/util";
import {
    emojiSplitByGroup,
    hasEmojiCharacter
} from "../../emoji/emoji";
let time1, time2, time3;
Page({
    data: {
        height: "100vh", //聊天窗口的高度
        emoji: emojiSplitByGroup(20),
        fromUser: 0,
        toUser: 0,
        userInfo: {},
        input: "",
        extConfig: app.extConfig,
        msgList: [],
        cantoLower: true,
        time: true,
        pageIndex: 1,
        pageSize: 20,
        hasMore: true,
        loading: false,
        toViewId: "",
        gotoViewId: "",
        official: null,   // 官网信息
        readyToSend: "",  // 携带商品/资讯信息
        moreEditor: false,
        isFromNotice: false,
        false: false,
    },

    dataStore: {
        startTime: 0
    },

    send(message, type = "text", msg_type='') {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "Chat/sendNew",
                data: {
                    uid: app.globalData.uid,
                    toUser: this.data.toUser,
                    cardId: app.globalData.cardId,
                    content: {
                        type: type
                    }
                }
            };
            if (msg_type){
                params.data.content.msg_type = msg_type
            }
            if (type === "text") {
                params.data.content.content = message;
            } else if (type === "image") {
                params.data.content.id = message.id;
                params.data.content.url = message.url;
                params.data.content.width = message.width;
                params.data.content.height = message.height;
            } else if (type === "shop") {
                params.data.content.id = message.id;
                params.data.content.title = message.title;
                params.data.content.url = message.url;
                params.data.content.price = message.price;
            } else if (type === "info") {
                params.data.content.id = message.id;
                params.data.content.title = message.title;
                params.data.content.url = message.url;
            } else if (type === "service") {
                params.data.content.id = message.id;
                params.data.content.title = message.title;
                params.data.content.url = message.url;
            } else if (type === "official") {
                params.data.content.title = message.title;
                params.data.content.url = message.url;
            } 
            if (!this.data.formUser || !this.data.toUser) {
                this.getChatInfo().then(res => {
                    this.setData({
                        userInfo: res,
                        toUser: res.toUser.id,
                        fromUser: res.formUser.id,
                        isAdmin: parseInt(res.isAdmin),
                        official: res.official
                    })

                    fetchApi(this, params).then(res => {
                        resolve(res.data.data);
                    }).catch(res => {
                        reject(res);
                    })
                })
            } else {
                fetchApi(this, params).then(res => {
                    resolve(res.data.data);
                }).catch(res => {
                    reject(res);
                })
            }
        })
    },

    getChatInfo() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "Chat/getChatInfo",
                data: {
                    fromUid: app.globalData.uid,
                    cardId: app.globalData.cardId,
                    toUser: this.data.toUser,
                }
            };
            fetchApi(this, params).then(res => {
                if (res.data.data.toUser.id == res.data.data.formUser.id) {
                    wx.showModal({
                        title: '提示',
                        confirmColor: "#fe952e",
                        content: '你不能和自己聊天',
                        success: () => {
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    })
                    return;
                }
                if (!this.hasBindWSHandle) app.WSManager.initResHandle(this.WSRequest());
                resolve(res.data.data);
                app.globalData.currentLoginUserCardInfo.cardId != app.globalData.cardId
            }).catch(res => {
                reject(res);
            })
        })
    },

    getMsgList() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "chat/getMsgListNew",
                data: {
                    uid: app.globalData.uid,
                    cardId: app.globalData.cardId,
                    toUser: this.data.toUser,
                    pageIndex: this.data.pageIndex,
                    pageSize: this.data.pageSize
                }
            };
            fetchApi(this, params).then(res => {
                resolve(res.data.data);
            }).catch(res => {
                reject(res);
            })
        })
    },

    getNewMsg() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "Chat/getNewMsg",
                data: {
                    uid: app.globalData.uid,
                    cardId: app.globalData.cardId,
                    fromUid: this.data.toUser,
                }
            };
            fetchApi(this, params).then(res => {
                resolve(res.data.data);
            }).catch(res => {
                reject(res);
            })
        })
    },

    chooseImages() {
        return new Promise((resolve, reject) => {
            wx.chooseImage({
                sizeType: ["compressed"],
                success: (res) => {
                    resolve(res.tempFilePaths);
                },
                fail: (res) => {
                    reject(res);
                }
            })
        })
    },

    uploadMyImgs() {
        this.chooseImages().then((res) => {
            let imgs = res.map(imgUrl => {
                return {
                    from_user: this.data.fromUser,
                    content: {
                        url: imgUrl,
                        type: "image",
                        imgProgress: 0,
                        imgStatus: 0,
                        errorMsg: "发送失败",
                    },
                    hideTime: !this.data.time,
                    sending: true
                }
            });

            let length = this.data.msgList.length;


            this.data.msgList = this.data.msgList.concat(imgs);


            imgs.map((img, index) => {
                let n = index + length
                wx.getImageInfo({
                    src: img.content.url,
                    success: (res) => {
                        this.data.msgList[n].content.height = res.height;
                        this.data.msgList[n].content.width = res.width;
                        let info = this.formatImage({
                            height: res.height,
                            width: res.width
                        })
                        this.data.msgList[n].height = info.height;
                        this.data.msgList[n].width = info.width;
                        this.setData({
                            msgList: this.data.msgList,
                        });
                        // 开始上传
                        this.toUploadMyImgs(img.content.url, n);
                    }
                })
            });

            this.goToView();

        }).catch((res) => {
            console.log(res, "取消");
        })

    },

    toUploadMyImgs(imgPath, index) {
        let imgMsg = this.data.msgList[index];
        if (imgMsg.content.imgStatus === 0) {
            imgMsg.content.imgStatus = 1;
            let uploadTask = wx.uploadFile({
                url: app.API_HOST + 'card/uploadImg',
                formData: {
                    token: app.globalData.token,
                },
                filePath: imgMsg.content.url,
                name: 'file',
                success: (res) => {
                    res.data = JSON.parse(res.data);
                    if (parseInt(res.data.code) >= 0) {
                        imgMsg.content.id = res.data.data.id;
                        imgMsg.content.url = res.data.data.url;
                        imgMsg.content.imgStatus = 2;

                        this.setData({
                            msgList: this.data.msgList,
                        });

                        this.sendImage(imgMsg);

                    } else {
                        imgMsg.content.imgStatus = -1;
                        imgMsg.content.errorMsg = res.data.msg;
                        this.data.msgList[index].content = img;
                        this.setData({
                            msgList: this.data.msgList,
                        })
                    }
                },
                fail: (res) => {
                    imgMsg.content.imgStatus = -1;
                    this.data.msgList[index].content = imgMsg.content;
                    this.setData({
                        msgList: this.data.msgList
                    })
                }
            });

            // 上传进度
            uploadTask.onProgressUpdate((res) => {
                if (res.progress < 100 && res.progress > 0) {
                    this.data.msgList[index].content.imgProgress = res.progress;
                    this.setData({
                        msgList: this.data.msgList
                    })
                }
            })
        }
    },

    toViewId() {
        if (this.data.cantoLower) {
            return "holder" + this.data.msgList.length
        } else {
            return ""
        }
    },

    goToView(toViewId) {
        this.toViewTimer && clearTimeout(this.toViewTimer);
        this.setData({
            toViewId: toViewId || this.toViewId()
        })
        this.toViewTimer = setTimeout(() => {
            this.setData({
                gotoViewId: this.data.toViewId
            })
        }, 300)
    },

    getCurrentTime() {
        let time = new Date();
        let year = time.getFullYear();
        let month = time.getMonth() + 1;
        let day = time.getDate();
        let hour = time.getHours();
        let min = time.getMinutes();
        let sec = time.getSeconds();
        month.toString().length < 2 ? month = '0' + month : "";
        day.toString().length < 2 ? day = '0' + day : "";
        hour.toString().length < 2 ? hour = '0' + hour : "";
        min.toString().length < 2 ? min = '0' + min : "";
        sec.toString().length < 2 ? sec = '0' + sec : "";
        return `${year}-${month}-${day} ${hour}:${min}:${sec}`
    },

    timeInterval() {
        time1 = setInterval(() => {
            this.data.time = true;
        }, 60000)
    },

    clearInput() {
        if (this.clearInputTimer) clearTimeout(this.clearInputTimer);
        this.clearInputTimer = setTimeout(() => {
            this.setData({
                input: ''
            });
        }, 100);
    },

    // 这里开始才是调用的
    sendMessage(e) {
        let formId = e.detail.formId;
        let time = this.data.time;
        let message = e.detail.value.message;
        if (message.replace(/\s+/g, "")) {
            let newMsg = {
                from_user: this.data.fromUser,
                to_user: this.data.toUser,
                content: {
                    content: message,
                    type: "text"
                },
                sending: true,
                hideTime: !time
            };

            this.setData({
                msgList: this.data.msgList.concat(newMsg),
                time: false,
            });

            this.clearInput();

            let index = this.data.msgList.length - 1;
            this.send(message).then(res => {
                res.content ? res.content = JSON.parse(res.content) : "";
                res.hideTime = !time;
                if (res.content.content === newMsg.content.content && this.data.msgList[index].sending) {
                    this.data.msgList[index] = res;
                    this.setData({
                        msgList: this.data.msgList
                    })
                } else {
                    let list = this.data.msgList;
                    let change = false;
                    for (let i = list.length - 1; i >= 0; i--) {
                        if (list[i].content === res.content && list[i].sending) {
                            list[i] = res;
                            change = true;
                            return;
                        }
                    }
                    if (change) {
                        this.setData({
                            msgList: list
                        })
                    }
                }
            });

            this.goToView();
        }
    },

    getSubscribe() {
        fetchApi(this, {
            url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
            data: {
                tpl_msg_type: '11, 14'
            }
        }).then(_res => {
            wx.getSetting({
                withSubscriptions: true,
                success(res) {
                    const { itemSettings } = res.subscriptionsSetting
                    const tmplIds = _res.data.data.filter(element => !(itemSettings || {})[element])
                    tmplIds.length && wx.showModal({
                        title: '提示',
                        content: '请允许我们发送订阅消息',
                        success: res => res.confirm && wx.requestSubscribeMessage({
                            tmplIds,
                            success: res => console.log('订阅成功了？: ', res),
                            complete: res => console.log('订阅失败了？: ', res),
                        })
                    })
                }
            })
        }).catch(e => console.log(e))
    },

    sendImage(imageMessage) {
        this.send(imageMessage.content, "image").then(res => {
            res.content ? res.content = JSON.parse(res.content) : "";
            let idx = -1;
            for (let i = this.data.msgList.length - 1; i >= 0; i--) {
                if (this.data.msgList[i].content.id == res.content.id && this.data.msgList[i].sending) {
                    idx = i;
                    break
                }
            }
            if (idx >= 0) {
                this.data.msgList.splice(idx, 1);
                imageMessage.sending = false;
                this.setData({
                    msgList: this.data.msgList.concat([imageMessage]),
                })

                this.goToView();
            }
        });
    },

    sendGoodsAndNews(messages) {
        try {
            let length = this.data.msgList.length;
            this.setData({
                msgList: this.data.msgList.concat(messages)
            });
            //新增话术库
            if (messages.formSelect == 'talkLibrary') {
                let content = []
                messages.map((i, n) => {
                    let obj = {}
                    obj.type = i.content.type
                    obj.content = i.content.content
                    content.push(obj)
                })

                this.sendNewWords(content).then(res => {
                    console.log(res);
                    res.forEach((item, n) => {
                        let index = length + n;
                        if (this.data.msgList[index].sending) {
                            this.data.msgList[index].sending = false;
                            this.data.msgList[index].hideTime = !this.data.time;
                            this.setData({
                                msgList: this.data.msgList
                            })
                        }
                    })
                });
            } else {
                messages.map((i, n) => {
                    let index = length + n;
                    this.send(i.content, i.content.type).then(res => {
                        console.log(res);
                        res.content ? res.content = JSON.parse(res.content) : "";
                        if ((res.content.id === i.content.id && this.data.msgList[index].sending) || this.data.msgList[index].content.type === "official") {
                            this.data.msgList[index].sending = false;
                            this.data.msgList[index].hideTime = !this.data.time;
                            this.setData({
                                msgList: this.data.msgList
                            })
                        } else {
                            let list = this.data.msgList;
                            let length = list.length;
                            let change = false;
                            for (let idx = length - 1; idx >= 0; idx--) {
                                if ((list[idx].content && list[idx].content.id == res.content.id && list[idx].sending) || (list[idx].content && list[idx].content.type === "official")) {
                                    list[idx].sending = false;
                                    list[idx].hideTime = !this.data.time;
                                    change = true;
                                    return;
                                }
                            }
                            if (change) {
                                this.setData({
                                    msgList: list
                                })
                            }
                        }
                    });
                })
            }
        } catch (err) {
            console.log("error: ", err);
        }

        this.goToView();
    },
    sendNewWords(content) {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "Chat/sendNewWords",
                data: {
                    uid: app.globalData.uid,
                    toUser: this.data.toUser,
                    cardId: app.globalData.cardId,
                    content: content
                }
            };
            fetchApi(this, params).then(res => {
                resolve(res.data.data);
            }).catch(res => {
                reject(res);
            })
        })
    },
    sendOfficial() {
        this.sendGoodsAndNews([{
            from_user: this.data.fromUser,
            sending: true,
            content: {
                type: "official",
                title: this.data.official.title,
                url: this.data.official.url
            }
        }])
    },

    sendReadyToSend(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        let type = e.currentTarget.dataset.type;
        let msg = this.data.msgList[index];
        this.data.msgList.splice(index, 1);
        msg.type = "";
        msg.from_user = this.data.fromUser;
        msg.sending = true;
        if (type == 'official') {
            this.sendOfficial()
        } else {
            this.sendGoodsAndNews([msg]);
        }
    },

    getNewMessage(res) {
        if (Array.isArray(res)) {
            res.map(item => {
                item.hideTime = !this.data.time;
                let data = {};
                if ((parseInt(item.from_user) === parseInt(this.data.toUser) || parseInt(item.from_user) === parseInt(this.data.fromUser)) && parseInt(item.card_id) === parseInt(app.globalData.cardId)) {
                    try {
                        data = JSON.parse(item.content);
                        item.content = data;
                        if (item.content.type === "image" && item.content.height && item.content.width) {
                            let info = this.formatImage({
                                height: item.content.height,
                                width: item.content.width
                            });
                            item.content.width = info.width;
                            item.content.height = info.height;
                        }
                    } catch (e) { }
                    this.setData({
                        msgList: this.data.msgList.concat([item]),
                        time: false
                    });
                    app.WSManager.send({
                        data: {
                            msgId: item.id,
                        },
                        action: "WS/chat/setMsgRead"
                    });
                    this.goToView();
                }
            })
        } else {
            res.hideTime = !this.data.time;
            let data = {};
            if ((parseInt(res.from_user) === parseInt(this.data.toUser) || parseInt(res.from_user) === parseInt(this.data.fromUser)) && parseInt(res.card_id) === parseInt(app.globalData.cardId)) {
                try {
                    data = JSON.parse(res.content);
                    res.content = data;
                    if (res.content.type === "image" && res.content.height && res.content.width) {
                        let info = this.formatImage({
                            height: res.content.height,
                            width: res.content.width
                        });
                        res.content.width = info.width;
                        res.content.height = info.height;
                    }
                } catch (e) { }
                this.setData({
                    msgList: this.data.msgList.concat([res]),
                    time: false
                });
                app.WSManager.send({
                    data: {
                        msgId: res.id,
                    },
                    action: "WS/chat/setMsgRead"
                });
                this.goToView();
            }

        }
    },

    getUnread() {
        let params = {
            url: app.API_HOST + "chat/getNewMsg",
            data: {
                uid: app.globalData.uid,
                cardId: app.globalData.cardId,
                fromUid: this.data.toUser,
            }
        };
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            data.map(i => {
                let newData = {};
                try {
                    if (i.content) {
                        newData = JSON.parse(i.content);
                        i.content = newData;
                        if (i.content.type === "image" && i.content.height && i.content.width) {
                            let info = this.formatImage({
                                height: i.content.height,
                                width: i.content.width
                            })
                            i.content.width = info.width;
                            i.content.height = info.height;
                        }
                    }
                } catch (res) {
                    // console.log("error: ", res);
                }
            });

            this.setData({
                msgList: this.data.msgList.concat(data),
                loading: false
            });

            this.goToView();
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    getMoreMessage() {
        this.data.cantoLower = false;
        if (this.data.hasMore && !this.data.loading) {
            this.setData({
                pageIndex: this.data.pageIndex + 1,
                loading: true
            });
            this.getMsgList().then(res => {
                res.map(i => {
                    let data = {};
                    try {
                        if (i.content) {
                            data = JSON.parse(i.content);
                            i.content = data;
                            if (i.content.type === "image" && i.content.height && i.content.width) {
                                let info = this.formatImage({
                                    height: i.content.height,
                                    width: i.content.width
                                })
                                i.content.width = info.width;
                                i.content.height = info.height;
                            }
                        }
                    } catch (res) {
                        console.log("error: ", res);
                    }
                });
                this.setData({
                    msgList: res.concat(this.data.msgList),
                    hasMore: res.length >= this.data.pageSize,
                    loading: false
                })
            }).catch(res => {
                this.setData({
                    loading: false,
                    hasMore: true,
                    pageIndex: this.data.pageIndex - 1
                })
            })
        }
    },

    bindscrolltoLower() {
        this.data.cantoLower = true;
    },

    setToUserName(name) {
        const {isAdmin} = this.data;
        if (name && isAdmin) {
            wx.setNavigationBarTitle({
                title: name
            })
        }
    },

    getSystemInfo() {
        return new Promise((resolve, reject) => {
            wx.getSystemInfo({
                success: (res) => {
                    console.log("running at: ", `${res.brand}_${res.model} with ${res.system}`);
                    resolve(res);
                },
                fail: (res) => {
                    reject(res);
                }
            })
        })
    },

    bindInput(e) {
        this.setData({
            input: e.detail.value
        })
    },

    emojiInput(e) {
        let emoji = e.currentTarget.dataset.emoji;
        this.setData({
            input: this.data.input + emoji
        });
        let i = this.data.input.charCodeAt(1);
    },

    deleteInput() {
        let str = this.data.input;
        if (str.length > 0) {

            if (str.length > 1 && hasEmojiCharacter(str.substring(str.length - 2))) {
                this.setData({
                    input: str.substring(0, str.length - 2)
                })
            } else {
                this.setData({
                    input: str.substring(0, str.length - 1)
                })
            }
        }
    },

    init() {
        const {options} = this.data;
        if (options.toUid) {
            this.data.toUser = options.toUid;
        }
        if (options.cardId) {
            app.globalData.cardId = options.cardId;
        }
        if (options.readyToSend) {
            try {
                this.data.readyToSend = JSON.parse(options.readyToSend);
            } catch (err) {
                console.log(err);
            }
        }
        this.data.pageIndex = 1;
        this.data.hasMore = true;
        this.data.time = true;
        this.setData({
            toUser: this.data.toUser,
            loading: false,
        });

        this.getChatInfo().then(res => {
            this.setData({
                userInfo: res,
                toUser: res.toUser.id,
                fromUser: res.formUser.id,
                isAdmin: parseInt(res.isAdmin),
                official: res.official
            });

            this.setToUserName(res.toUser.realname);            

            this.getMsgList().then(res => {

                res.map(i => {
                    let data = {};
                    try {
                        if (i.content) {
                            data = JSON.parse(i.content);
                            i.content = data;
                            if (i.content.type === "image" && i.content.height && i.content.width) {
                                let info = this.formatImage({
                                    height: i.content.height,
                                    width: i.content.width
                                })
                                i.content.width = info.width;
                                i.content.height = info.height;
                            }
                        }
                    } catch (res) {
                        // console.log("error: ", res);
                    }
                });

                this.setData({
                    fromUser: app.globalData.uid,
                    msgList: this.data.readyToSend ? res.concat([this.data.readyToSend]) : res,
                    hasMore: res.length >= this.data.pageSize,
                    loading: false
                });
                if (options.phoneToSend) {
                    this.data.phoneToSend = JSON.parse(options.phoneToSend)
                    this.phoneToSend()
                }
                this.timeInterval();

                this.goToView();

                this.getToUserStatus();

            }).catch(res => {
                console.log(res);
                this.setData({
                    hasMore: true,
                    loading: false
                })
            });

            this.getSystemInfo().then(res => {
                const {isAdmin} = this.data
                const {windowHeight, windowWidth} = res
                const screenHeight = windowHeight * ( 750 / windowWidth )
                const height =  isAdmin ? screenHeight : screenHeight - 150
                this.setData({
                    screenHeight,
                    height: `${height}rpx`
                });
            }).catch(err => console.log('Error :', err));

            if (!res.formUser.id || !res.toUser.id) {
                this.getChatInfo().then(res => {
                    this.setData({
                        userInfo: res,
                        toUser: res.toUser.id,
                        fromUser: res.formUser.id,
                        isAdmin: parseInt(res.isAdmin),
                        official: res.official
                    })
                })
            }

        }).then(res => {
            console.log(res);
        })
    },
    phoneToSend(){
        let time = this.data.time
        let phoneToSend = this.data.phoneToSend
        let newMsg = {
            from_user: this.data.fromUser,
            to_user: this.data.toUser,
            content: {
                content: this.data.phoneToSend.content.message,
                type: "text"
            },
            sending: true,
            hideTime: !time
        };
        this.setData({
            msgList: this.data.msgList.concat(newMsg)
        });
        let index = this.data.msgList.length - 1;
        this.send(phoneToSend.content.message, phoneToSend.content.type, phoneToSend.content.msg_type).then(res => {
            res.content ? res.content = JSON.parse(res.content) : "";
            res.hideTime = !time;
            if (this.data.msgList[index].sending) {
                this.data.msgList[index] = res;
                this.setData({
                    msgList: this.data.msgList
                })
            } else {
                let list = this.data.msgList;
                let change = false;
                for (let i = list.length - 1; i >= 0; i--) {
                    if (list[i].content === res.content && list[i].sending) {
                        list[i] = res;
                        change = true;
                        return;
                    }
                }
                if (change) {
                    this.setData({
                        msgList: list
                    })
                }
            }
        })
        this.goToView();
    },
    // 跳转
    toCard() {
        nav({
            url: "/pages/home/home"
        })
    },

    toSite() {
        nav({
            url: "/pages/about/about"
        })
    },

    toInfo() {
        nav({
            url: "/pages/news/news"
        })
    },

    toProduct() {
        nav({
            url: "/pages/mall/mall"
        })
    },

    navigate(e) {
        let name = e.currentTarget.dataset.name;
        nav({ url: `/pages/${name}/${name}` });
    },

    toCall(e) {
        let mobile = this.data.userInfo.toUser.mobile.replace(/\s+/g, "");
        if (mobile) {
            wx.makePhoneCall({
                phoneNumber: mobile
            })
        } else {
            showTips("暂时无法获取对方手机号", this);
        }
    },

    toWechat(e) {
        let wechat = this.data.userInfo.toUser.wechat;
        if (wechat.replace(/\s+/g, "")) {
            wx.setClipboardData({
                data: wechat,
                success: function (res) {
                    showToast('复制成功', 'success');
                }
            })
        } else {
            showTips("暂时无法获取对方微信号", this);
        }
    },

    toSee(e) {
        let data = {
            cardId: app.globalData.cardId
        };
        let path = "";
        if (this.data.isAdmin) {
            path = "clueDetail";
            data.crmId = this.data.userInfo.toUser.crmId || 0;
            data.crmUid = this.data.userInfo.toUser.id || 0;
        } else {
            path = "home";
        }
        nav({
            url: `/pages/${path}/${path}`,
            data: data
        })
    },

    toSelf() {
        if (this.data.isAdmin) {
            nav({
                url: `/pages/home/home`,
                data: {
                    cardId: app.globalData.cardId
                }
            })
        }
    },

    navByMsg(e) {
        let id = parseInt(e.currentTarget.dataset.id);
        let type = e.currentTarget.dataset.type;
        switch (type) {
            case 'official': 
                this.toSite();
                break;
            case 'shop':
                nav({
                    url: "/pages/goodsdetail/goodsdetail",
                    data: {
                        id: id
                    }
                });
                break;
            case 'info':
                nav({
                    url: "/pages/contentDetail/contentDetail",
                    data: {
                        id: id
                    }
                });
                break;
            case 'service':
                nav({
                    url: "/pages/serviceCommodityDetail/serviceCommodityDetail",
                    data: {
                        id: id
                    }
                });
                break;
        }
    },

    copyMessage(e) {
        let message = e.currentTarget.dataset.message;
        wx.setClipboardData({
            data: message,
            success: () => {
                wx.showToast({
                    title: '已复制到剪切板',
                    icon: 'success',
                })
            },
            fail: () => {
                wx.showToast({
                    title: '复制失败',
                    icon: 'loading',
                })
            }
        })
    },

    moreEditor(mode = 0) {
        const {screenHeight, isAdmin} = this.data;
        if (mode === 0) {
            this.setData({
                moreEditor: mode,
                height: isAdmin ? '100vh' : `${screenHeight - 150}rpx`
            })
        } else {
            this.setData({
                moreEditor: mode,
                height: isAdmin ? `${screenHeight * .6}rpx` : `${screenHeight * .6 - 150}rpx`
            });

            if (this.data.cantoLower) {

                let toViewId = this.data.toViewId === "holder" ? this.toViewId() : "holder"

                this.goToView(toViewId);
            }
        }
    },

    bindFocus() {
        if (this.data.moreEditor) {
            this.setData({
                moreEditor: -1
            })
        }
        this.setData({
            messageFocus: true
        })
    },

    bindBlur() {
        if (this.readytoOpenMoreEditor || this.data.moreEditor !== -1) {
            this.readytoOpenMoreEditor = false;
        } else {
            this.closeMoreEditor();
        }
        this.setData({
            messageFocus: false
        })
    },

    closeMoreEditor() {
        this.moreEditor();
    },

    openEmoji() {
        if (this.data.moreEditor === 1) {
            this.closeMoreEditor();
        } else {
            this.readytoOpenMoreEditor = true;
            this.moreEditor(1);
        }
    },

    openMoreOther() {
        if (this.data.moreEditor === 2) {
            this.closeMoreEditor();
        } else {
            this.readytoOpenMoreEditor = true;
            this.moreEditor(2);
        }
    },

    imageLoad(e) {
        let index = e.currentTarget.dataset.index;
        let width = e.detail.width;
        let height = e.detail.height;
        let scale = width / height;
        let info = this.formatImage({
            height: height,
            width: width
        });
        this.data.msgList[index].height = info.height;
        this.data.msgList[index].width = info.width;

        this.data.msgList[index].imageLoaded = 1;
        this.setData({
            msgList: this.data.msgList
        })
    },

    formatImage(object = {}) {
        if (object.width && object.height) {
            let width = object.width;
            let height = object.height;
            let scale = width / height;
            let info = {};
            if (scale < 1) {
                info.height = 298;
                info.width = 298 * scale;
            } else {
                info.width = 384;
                info.height = 384 / scale;
            }
            return info;
        } else {
            return object;
        }
    },

    previewImage(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        let arr = [];
        this.data.msgList.map(i => {
            if (i.content && i.content.type === "image") {
                arr.push(i.content.url);
            }
        });
        wx.previewImage({
            current: this.data.msgList[index].content.url,
            urls: arr,
        })
    },

    getToUserStatus() {
        if (!this.data.isAdmin) return;
        app.WSManager.send({
            data: {
                id: this.data.toUser,
            },
            action: "WS/user/getConnectStatus"
        }, this.userConnectStatusChange);
    },

    userConnectStatusChange(res) {
        if (!this.data.isAdmin) return;
        if (parseInt(this.data.userInfo.toUser.id) === parseInt(res.uid) || !res.uid) {
            let status = {
                type: "status",
                status: res.status
            }
            this.setData({
                msgList: this.data.msgList.concat([status])
            })
            this.goToView();
        }
    },
    sendPhoneNumber(e){
        let time = this.data.time;
        let msgIndex = e.currentTarget.dataset.msgindex
        let message = '您好，我的手机号是' + this.data.userInfo.formUser.mobile;
            let newMsg = {
                from_user: this.data.fromUser,
                to_user: this.data.toUser,
                content: {
                    content: message,
                    type: "text"
                },
                sending: true,
                hideTime: !time
            };

            this.setData({
                msgList: this.data.msgList.concat(newMsg),
                time: false,
            });

            let index = this.data.msgList.length - 1;
            this.send(message,'text',5).then(res => {
                res.content ? res.content = JSON.parse(res.content) : "";
                res.hideTime = !time;
                if (res.content.content === newMsg.content.content && this.data.msgList[index].sending) {
                    this.data.msgList[index] = res;
                    this.data.msgList[msgIndex].has_send = 1
                    this.setData({
                        msgList: this.data.msgList
                    })
                } else {
                    let list = this.data.msgList;
                    let change = false;
                    for (let i = list.length - 1; i >= 0; i--) {
                        if (list[i].content === res.content && list[i].sending) {
                            list[i] = res;
                            list[msgIndex].has_send = 1
                            change = true;
                            return;
                        }
                    }
                    if (change) {
                        this.setData({
                            msgList: list
                        })
                    }
                }
            });

            this.goToView();
    },

    WSRequest() {
        return {
            receiveNewMsg: (res) => {
                this.getNewMessage(res);
                // 如果收到了消息，取消定时
                clearTimeout(time3)
            },
            userConnectStatusChange: (res) => {
                this.userConnectStatusChange(res);
            },
            onOpen: (res) => {
                if (this.needToGetUnread) {
                    this.needToGetUnreadg = false;
                    this.getUnread();
                }
            },
            onClose: (res) => {
                this.needToGetUnread = true;
            },
            onError: (res) => {
                this.needToGetUnread = true;
            },
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            options
        });
        this.init();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.dataStore.startTime = new Date().getTime();
        app.showRemind(this);
        if (app.globalData.uid) {
            this.hasBindWSHandle = true;
            app.WSManager.initResHandle(this.WSRequest());
        }
        if (app.globalData.transData_chat) {
            this.sendGoodsAndNews(app.globalData.transData_chat);
            app.globalData.transData_chat = "";
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        app.WSManager.initResHandle();
        addActionLog(this, {
            type: 12,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime
            }
        });
        clearTimeout(time3)
        clearInterval(time1);
        clearInterval(time2);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },


});