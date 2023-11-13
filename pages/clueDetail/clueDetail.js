const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    nav,
    makePhoneCall,
    previewImage
} from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        switchTab: {
            tabs: [
                "客户动态",
                "我的跟进"
            ],
            themeColor: "",
            currentIndex: 0,
            top: 0,
            noShadow: true
        },

        userInfo: {},

        crmFollowList: {
            data: [],
            pageIndex: 1,
            pageSize: 20,
            hasMore: true
        },

        crmUserDynamic: {
            data: [],
            pageIndex: 1,
            pageSize: 20,
            hasMore: true
        },

        status: [],
        customerStatusIndex: -1,
        extConfig: {},
        showAddFollow: false,
        hideCanvas: false,
        // 
        crmId: 0,
        crmUid: 0,
        card_id: 0,
        cityArray: ['未知', '18岁以下', '18~30岁', '31~50岁', '51~70岁', '70岁以上'],
        percent: "",
        remind: false,
        timeStart: "00:00",
        showDelete: false,
        hasTagChange: false,
        isIphoneX: app.globalData.isIphoneX
    },

    /**
     * 页面的方法
     */
    toAI() {
        nav({
            url: '/centerControl/aiAnalysis/aiAnalysis',
            data: {
                crmId: this.data.crmId,
                cardId: this.data.card_id
            }
        })
    },

    makePhoneCall() {
        makePhoneCall(this.data.userInfo.phone, () => {})
    },

    getUserInfo() {
        let params = {
            url: app.API_HOST + "crmUser/getCrmUserInfo",
            data: {
                crm_id: this.data.crmId,
                cardId: this.data.card_id
            }
        }
        fetchApi(this, params).then(res => {
            res.data.data.status = parseInt(res.data.data.status);
            res.data.data.tag ? res.data.data.tag = JSON.parse(res.data.data.tag) : "";
            if (res.data.data.userTagRelation.length ){
                const arr = res.data.data.userTagRelation.map(e => {
                    return {
                        name: e.tagItemInfo.name
                    }
                })
                res.data.data.tags = res.data.data.tags.length ? res.data.data.tags.concat(arr) : arr
            }
            this.data.percent = res.data.data.cooperRate || 0
            this.setData({
                userInfo: res.data.data
            })
            this.getUserStatus()
        }).catch(res => {
            console.log(res);
        })
    },
    getUserStatus() {
        let params = {
            url: app.API_HOST + "CrmUser/getUserStatus",
        }
        fetchApi(this, params).then(res => {
            console.log(res.data.data)
            const list = res.data.data
            for (let index = 0; index < list.length; index++) {
                const element = list[index];
                if (element.status_id == this.data.userInfo.status) {
                    this.data.customerStatusIndex = index
                }
            }
            this.setData({
                status: list,
                customerStatusIndex: this.data.customerStatusIndex
            })
        }).catch(res => {
            console.log(res);
        })
    },
    

    getCrmUserFollowList() {
        let params = {
            url: app.API_HOST + "CrmUser/getCrmUserFollowList",
            data: {
                crmId: this.data.crmId,
                crmUserId: this.data.crmUid,
                pageIndex: this.data.crmFollowList.pageIndex,
                pageSize: this.data.crmFollowList.pageSize,
                cardId: this.data.card_id
            }
        }
        fetchApi(this, params).then(res => {
            const {data} = res.data;
            const {crmFollowList} = this.data;
            const {pageIndex, pageSize} = crmFollowList;
            crmFollowList.data = pageIndex == 1 ? data : crmFollowList.data.concat(data);
            crmFollowList.hasMore = data.length >= pageSize;
            this.setData({
                crmFollowList
            })
        }).catch(res => {
            console.log(res);
        })
    },

    getCrmUserDynamic() {
        let params = {
            url: app.API_HOST + "CrmUser/getCrmUserDynamic",
            data: {
                uid: app.globalData.uid,
                fromUid: this.data.crmUid,
                pageIndex: this.data.crmUserDynamic.pageIndex,
                pageSize: this.data.crmUserDynamic.pageSize,
                cardId: this.data.card_id,
                admin_uid: this.data.admin_uid
            }
        }

        fetchApi(this, params).then(res => {
            const {data} = res.data;
            const {crmUserDynamic} = this.data;
            const {pageIndex, pageSize} = crmUserDynamic;
            data.map(i => i.detail = i.detail.replace(", " + i.period_end_time, ""));
            crmUserDynamic.data = pageIndex == 1 ? data : crmUserDynamic.data.concat(res.data.data);
            crmUserDynamic.hasMore = data.length >= pageSize;
            this.setData({
                crmUserDynamic
            })
        }).catch(res => {
            console.log(res);
        })
    },

    showAddFollow() {
        this.setData({
            showAddFollow: true,
            hideCanvas: true
        })
    },

    hideAddFollow() {
        this.setData({
            showAddFollow: false
        })
        setTimeout(() => {
            this.setData({
                hideCanvas: false
            })
        }, 150)
    },

    addCrmUserFollowList(e) {
        if (this.adding) return;
        this.adding = true;
        let value = e.detail.value;
        let content = value.content;
        if (content.replace(/\s+/g, "")) {
            let params = {
                url: app.API_HOST + "CrmUser/addCrmUserFollow",
                data: {
                    uid: app.globalData.uid,
                    crmId: this.data.crmId,
                    cardId: this.data.card_id,
                    crmUid: this.data.crmUid,
                    remind_time: value.remind ? `${ value.date } ${ value.time }:00` : "",
                    content: content
                }
            }

            fetchApi(this, params).then(res => {
                this.data.crmFollowList.data.unshift({
                    content: content,
                    create_time: getCurrentTime()
                })
                this.data.switchTab.currentIndex = 1;
                this.setData({
                    content: "",
                    crmFollowList: this.data.crmFollowList,
                    showAddFollow: false,
                    hideCanvas: false,
                    switchTab: this.data.switchTab
                })
                this.adding = false;
                this.initInputData();
            }).catch(res => {
                this.adding = false;
                console.log(res);
            })
        }
    },

    bindPickerChange(e) {
        console.log(e.detail.value)
        let params = {
            url: app.API_HOST + "crmUser/updateCrmUserStatus",
            data: {
                crmUid: this.data.crmId,
                status: this.data.status[e.detail.value].status_id
            }
        }
        fetchApi(this, params).then(res => {
            console.log(res);
            this.data.userInfo.status = this.data.status[e.detail.value].status_id
            this.setData({
                userInfo: this.data.userInfo,
                customerStatusIndex: e.detail.value
            })
        }).catch(res => {
            console.log(res);
        })
    },

    changeStatus() {
        if (this.data.touristMode) return;
        wx.showActionSheet({
            itemList: this.data.status,
            success: (res) => {
                this.data.userInfo.status = res.tapIndex + 1;
                this.setData({
                    userInfo: this.data.userInfo
                })
                let params = {
                    url: app.API_HOST + "crmUser/updateCrmUserStatus",
                    data: {
                        crmUid: this.data.crmId,
                        status: res.tapIndex + 1
                    }
                }
                fetchApi(this, params).then(res => {
                    console.log(res);
                }).catch(res => {
                    console.log(res);
                })
            }
        })
    },

    toChat() {

        this.setData({
            'userInfo.notReadMsgTotal': 0
        });

        nav({
            url: '/pages/chat/chat',
            data: {
                toUid: this.data.crmUid,
                toUserName: this.data.userInfo.name || this.data.userInfo.nickname
            }
        });
    },

    onTabClick(e) {
        this.data.switchTab.currentIndex = e.detail.currentIndex;
        this.setData({
            switchTab: this.data.switchTab
        })
    },

    init() {
        this.data.crmFollowList = {
            data: [],
            pageIndex: 1,
            pageSize: 20,
            hasMore: true
        },

        this.data.crmUserDynamic = {
            data: [],
            pageIndex: 1,
            pageSize: 20,
            hasMore: true
        },

        this.getUserInfo();
        this.getCrmUserFollowList();
        this.getCrmUserDynamic();
        this.initInputData();
    },

    initInputData() {
        let dateToday = new Date();
        let inputDate = new Date(Number(dateToday) + 1 * 24 * 60 * 60 * 1000);
        
        let todayMonth = dateToday.getMonth() + 1;
        let inputMonth = inputDate.getMonth() + 1;
        let todayDay = dateToday.getDate();
        let inputDay = inputDate.getDate();                                                                                              

        todayMonth < 10 ? todayMonth = `0${todayMonth}` : "";
        inputMonth < 10 ? inputMonth = `0${inputMonth}` : "";
        todayDay < 10 ? todayDay = `0${todayDay}` : "";
        inputDay < 10 ? inputDay = `0${inputDay}` : "";
        this.setData({
            dateToday: `${dateToday.getFullYear()}-${todayMonth}-${todayDay}`,
            inputDate: `${inputDate.getFullYear()}-${inputMonth}-${inputDay}`,
            between: "明天",
            inputTime: "09:00"
        });
    },

    draw(per) {
        let percent = per / 100;

        // 字体渐变色
        // iOS字体渐变上不去，有丶诡异
        let gradientText = "#ff5b1f";
        if (!this.data.isIos) {

            // 还是安卓好，都买安卓！
            gradientText = this.data.context.createLinearGradient(0, 59, 0, 21);
            gradientText.addColorStop(percent, "#ff5b1f");
            gradientText.addColorStop(1, "#ffc71f");
        }

        // 填充圈渐变色
        let gradientRound = this.data.context.createLinearGradient(0, 0, 0, 70);
        gradientRound.addColorStop(0, "#ffc71f");
        gradientRound.addColorStop(1, "#ff5b1f");

        // 写字（百分比）
        this.data.context.beginPath();
        this.data.context.setFillStyle(gradientText);
        this.data.context.setFontSize(19);
        this.data.context.setTextAlign("center");
        this.data.context.fillText(`${ parseInt(per) }%`, 40, 40);

        // 写字（"成交率"）
        this.data.context.beginPath();
        this.data.context.setFillStyle("rgba(255, 255, 255, .2)");
        this.data.context.setFontSize(12);
        this.data.context.setTextAlign("center");
        this.data.context.fillText("成交率", 40, 58);

        // 底圈
        this.data.context.beginPath();
        this.data.context.setLineWidth(2);
        this.data.context.setStrokeStyle("#222a35");
        this.data.context.arc(40, 40, 34, 0, 2 * Math.PI);
        this.data.context.stroke();

        // 填充圈
        this.data.context.beginPath();
        this.data.context.setStrokeStyle(gradientRound);
        this.data.context.setLineWidth(1);
        this.data.context.arc(40, 40, 34, -Math.PI / 2, Math.PI * (percent * 2 - .5));
        this.data.context.stroke();

        // 那个大点
        this.data.context.beginPath();
        this.data.context.setFillStyle("#ff5b1f");
        this.data.context.arc(34, 0, 2.5, 0, 2 * Math.PI);
        this.data.context.translate(40, 40);
        this.data.context.rotate(Math.PI * (percent * 2 - .5));
        this.data.context.fill();

        // 开画
        this.data.context.draw();
    },

    toDraw(per) {
        this.notFirst = true;
        let time = 1;
        per = Number(per);
        let n = 0
        if (per > 0) {
            let timer = setInterval(() => {
                n = n + 1;
                if (n >= 100) {
                    clearInterval(timer);
                    this.draw(per);
                } else {
                    this.draw(per / 100 * n);
                }
            }, 10)
        }
    },

    createCanvas() {

        this.data.context = wx.createCanvasContext('canvas');
        this.draw(0);

        setTimeout(() => {
            if (this.data.percent) {
                this.toDraw(this.data.percent);
            } else {

                let timer = setInterval(() => {
                    if (this.data.percent) {
                        clearInterval(timer);
                        this.toDraw(this.data.percent);
                    }
                }, 300)
            }
        }, 1000)

    },

    switchChange(e) {
        this.setData({
            remind: e.detail.value
        });
    },

    bindFocus() {
        this.setData({
            showDelete: false
        })
    },

    bindDateChange(e) {
        let date = e.detail.value;
        let select = new Date(`${date} 00:00:00`);
        let today = new Date(`${this.data.dateToday} 00:00:00`);
        let between = parseInt((select - today) / (24 * 60 * 60 * 1000));
        let betweenMessage = "";
        let time = new Date(Number(new Date()) + 5 * 60 * 1000);
        let hour = `${time.getHours()}`;
        let minute = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;

        switch (between) {
            case 0:
                betweenMessage = "今天";
                break;
            case 1:
                betweenMessage = "明天";
                break;
            case 2:
                betweenMessage = "后天";
                break;
            default:
                if (between > 0) {
                    betweenMessage = `${between}天后`
                }
        }
        
        this.setData({
            inputDate: date,
            between: betweenMessage,
            timeStart: between > 0 ? "00:00" : `${hour}:${minute}`,
            inputTime: between > 0 ? this.data.inputTime : `${hour}:${minute}`
        });
    },

    bindTimeChange(e) {
        this.setData({
            inputTime: e.detail.value
        });
    },

    contentInput(e) {
        this.setData({
            contentLength: e.detail.value.replace(/\s+/g, "").length
        });
    }, 

    addTag(e) {
        let value = e.detail.value.replace(/(^\s*)|(\s*$)/g, "");
        if (value) {
            if (this.data.userInfo.tag) {
                if (this.data.userInfo.tag.indexOf(e.detail.value) != -1) {
                    showTips("客户有过此标签啦，重新换一个吧", this);
                    return;
                }
            }
            this.setData({
                "userInfo.tag": this.data.userInfo.tag ? this.data.userInfo.tag.concat([value]) : [value],
                inputValue: ""
            })

            let param = {
                url: `crmUser/addCrmUserTag`,
                data: {
                    crm_id: this.data.crmId,
                    tag: value
                }
            }

            fetchApi(this, param).then(res => {
                console.log(res);
            }).catch(err => {
                console.log(err);
            })

        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.data.switchTab.themeColor = app.extConfig.themeColor;
        this.setData({
            extConfig: app.extConfig,
            switchTab: this.data.switchTab
        });
        this.data.crmId = options.crmId || 0;
        this.data.crmUid = options.crmUid || 0;
        this.data.admin_uid = options.admin_uid || 0;
        this.data.card_id = options.cardId || app.globalData.cardId;
        if (options.cardId && options.cardId != app.globalData.currentLoginUserCardInfo.cardId) {
            this.setData({
                touristMode: true
            });
        }
        this.init();
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        let systemInfo = wx.getSystemInfoSync();
        this.setData({
            isIos: systemInfo.system.indexOf("iOS" || "ios" || "IOS") > -1
        });
        this.createCanvas();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (app.globalData.refresh) {
            app.globalData.refresh = false;
            this.init();
        }
        if (this.notFirst) {
            this.toDraw(this.data.percent);
        }
        app.showRemind(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.init();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        const {currentIndex} = this.data.switchTab;
        const {crmFollowList, crmUserDynamic} = this.data;
        if (parseInt(currentIndex) == 1 && crmFollowList.hasMore) {
            this.data.crmFollowList.pageIndex = crmFollowList.pageIndex + 1;
            this.getCrmUserFollowList();
        } else if (currentIndex == 0 && crmUserDynamic.hasMore) {
            this.data.crmUserDynamic.pageIndex = crmUserDynamic.pageIndex + 1;
            this.getCrmUserDynamic();
        }
    },

    toEdit() {
        nav({
            url: '/centerControl/editUserData/editUserData',
            data: {
                crmId: this.data.crmId
            }
        })
    },

    navTag() {
        nav({
            url: '/centerControl/systemTags/systemTags',
            data: {
                crmId: this.data.crmId
            }
        })
    },

    previewImg(e) {
        previewImage(e)
    }
})


let getCurrentTime = (num) => {
    let time;
    if (num) {
        time = new Date(Number(num) * 1000);
    } else {
        time = new Date();
    }
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();
    month.toString().length < 2 ? month = `0${month}` : "";
    day.toString().length < 2 ? day = `0${day}` : "";
    hour.toString().length < 2 ? hour = `0${hour}` : "";
    min.toString().length < 2 ? min = `0${min}` : "";
    sec.toString().length < 2 ? sec = `0${sec}` : "";
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}