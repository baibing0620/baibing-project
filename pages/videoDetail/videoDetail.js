const app = getApp();
import { fetchApi, getCardInfo } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite, showTips, shareParam } from '../../utils/util';

Page({ 

    /**
     * 页面的初始数据s
     */
    data: {
        id: "",
        list: [],
        showStyle: 0,
        swiper: true,
        video: false,
        hasLiked: false,
        extConfig: app.extConfig,
    },

    getVideoInfo(id, index = 0) {
        let params = {
            url: app.API_HOST + "card/getCardVideoInfoByVid",
            data: {
                vid: id
            }
        }

        if (this.data.beid) {
            params.url = app.API_HOST + "Card/getCardMarketVideoInfoByVid";
            params.data.mcardId = this.data.cardId;
            params.data.mbeid = this.data.beid;
        }

        fetchApi(this, params).then(res => {
            app.globalData.transToVideoList.push(id);
            let data = res.data.data.this;
            let before = res.data.data.up;
            let after = res.data.data.under;
            wx.setNavigationBarTitle({
                title: data.video_title
            });
            let info = this.formatVideo({
                height: data.video_height,
                width: data.video_width,
            });
            data.height = info.height;
            data.width = info.width;
            data.direction = info.direction;
            if (this.first) {
                this.first = false;
                this.notNewPlay = false;
                if (this.videoTimer) clearTimeout(this.videoTimer);
                this.setData({
                    swiper: true,
                    video: false,
                    list: [ after, data, before],
                    hasLiked: parseInt(data.has_self),
                    likeNum: parseInt(data.like_num),
                    relayNum: parseInt(data.relay_num),
                    title: data.video_title,
                    content: data.video_content,
                    imageUrl: data.video_image_url,
                    id: id,
                });
                this.swiperTimer = setTimeout(() => {
                    this.setData({
                        showStyle: 1
                    });
                    this.videoTimer = setTimeout(() => {
                        this.setData({
                            video: true
                        });
                    }, 300);
                }, 300);
            } else {
                this.readyData = {
                    swiper: false,
                    video: false,
                    list: [ after, data, before],
                    hasLiked: parseInt(data.has_self || 0),
                    likeNum: parseInt(data.like_num || 0),
                    relayNum: parseInt(data.relay_num || 0),
                    title: data.video_title,
                    imageUrl: data.video_image_url,
                    id: id,
                    showStyle: 1
                };
            }
        }).catch(res => {
            this.setData({
                showStyle: 2
            })
            console.log("error: ", res);
        })
    },

    getSystenInfo(e) {
        wx.getSystemInfo({
            success: (e) => {
                this.setData({
                    isIOS: e.system.indexOf("iOS") != -1,
                });
            }
        })
    },

    hasChange(e) {
        let id = e.detail.currentItemId;
        let index = parseInt(e.detail.current);
        this.data.id = id;
        this.getVideoInfo(id, index);
    },

    changeVideo(e) {
        this.notNewPlay = false;
        if (this.readyData) {
            this.changeVideoData(this.readyData);
            this.readyData = "";
        } else {
            this.timer = setInterval(() => {
                if (this.readyData) {
                    clearInterval(this.timer);
                    this.changeVideoData(this.readyData);
                    this.readyData = "";
                }
            }, 300);
        }
    },

    changeVideoData(data) {
        this.setData(data);
        this.notNewPlay = false;
        if (this.videoTimer) clearTimeout(this.videoTimer);
        this.setData({
            swiper: true
        });
        this.videoTimer = setTimeout(() => {
            this.setData({
                video: true
            })
        }, 300);
    },

    init(id) {
        this.first = true;
        this.getVideoInfo(id);
    },

    formatVideo(object) {
        if (!object.height && !object.width) {
            return
        }
        if (!this.data.screenHeight) {
            let data = wx.getSystemInfoSync()
            this.data.screenHeight = data.windowHeight * 2;
            this.data.screenWidth = data.windowWidth * 2;
        }
        let windowHeight = this.data.screenHeight;
        let windowWidth = this.data.screenWidth;
        if ( windowWidth != 750 ) windowHeight = 750 * (windowHeight / windowWidth);
        let maxHeight = this.data.isFromNotice ? windowHeight - 346 : windowHeight - 218;
        let maxWidth = 750;
        let height = parseInt(object.height || maxHeight);
        let width = parseInt(object.width || maxWidth);
        let scale = width / height;

        if (maxWidth / scale > maxHeight) {
            return {
                height: maxHeight,
                width: maxHeight * scale,
                direction: scale < 1 ? 0 : 90
            }
        } else {
            return {
                height: maxWidth / scale,
                width: maxWidth,
                direction: scale < 1 ? 0 : 90
            }
        }
    },

    clickLike() {
        if (!this.liking) {
            this.liking = true;
            this.data.hasLiked ? this.disLike() : this.like();
        }
    },

    like() {
        let params = {
            url: app.API_HOST + "card/likeVideo",
            data: {
                vid: this.data.id
            }
        }
        fetchApi(this, params).then(res => {
            this.liking = false;
            this.data.likeNum++
            this.setData({
                hasLiked: true,
                likeNum: this.data.likeNum
            })
        }).catch(res => {
            this.liking = false;
            console.log("error: ", res);
        });
    },

    disLike() {
        let params = {
            url: app.API_HOST + "card/unLikeVideo",
            data: {
                vid: this.data.id
            }
        }
        fetchApi(this, params).then(res => {
            this.liking = false;
            this.data.likeNum --;
            this.data.likeNum < 0 ? this.data.likeNum = 0 : "";
            this.setData({
                hasLiked: false,
                likeNum: this.data.likeNum
            })
        }).catch(res => {
            this.liking = false;
            console.log("error: ", res);
        });
    },

    share() {
        this.data.relayNum++;
        this.setData({
            relayNum: this.data.relayNum
        })
        let params = {
            url: app.API_HOST + "card/relay",
            data: {
                vid: this.data.id
            }
        }
        fetchApi(this, params).then(res => {
        }).then(res => {
        })
    },

    addPlayNum() {
        let params = {
            url: app.API_HOST + "card/addCardVideoPlayNum",
            data: {
                vid: this.data.id
            }
        }
        fetchApi(this, params).then(res => {
        }).then(res => {
            console.log("error: ", res);
        })
    },

    onVideoEndOrError() {
        this.notNewPlay = false;
    },

    previewImage(e) {
        this.setData({
            showCover: true,
            showShare:false,
            painting: this.palette()
        })
        this.share();
    },

    palette(){
        const { id, title, imageUrl, avatar_url} = this.data
        let t = new Date().getTime(),
            path = encodeURIComponent(`pages/videoDetail/videoDetail?id=${id}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`),
            qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${t}`,
            fodderRows = 616,        //行高
            fodderCols = 453,        //列宽
            top = 160,               //封面图位置
            qrCodeDiameter = 182,    //小程序码直径
            //小程序码位置
            qrleft = 536,
            qrtop = 800,
            qrAvaOffset = 1,         //头像与头像蒙版图偏移量
            membanDiameter = qrCodeDiameter / 2 - (qrAvaOffset * 2);
        if (app.globalData.videoShowStyle == 2) {
            fodderRows = 349;
            fodderCols = 452;
            top = 305;
        }
        
        return {
            "width": "750px",
            "height": "1000px",
            "background": "#ff9b1f",
            "views": [
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200326/1f13fa92d2a2ee43.png", //背景图
                    "css": {
                        "width": "531px",
                        "height": "738px",
                        "top": "53px",
                        "left": "110px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "image",
                    "url": `${imageUrl}?imageView2/1/w/${fodderCols}/h/${fodderRows}`,  //封面图
                    "css": {
                        "width": `${fodderCols}px`,
                        "height": `${fodderRows}px`,
                        "top": `${top}px`,
                        "left": "141px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "aspectFill"
                    }
                },
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200326/2dcba6a3de3553af.png", //play
                    "css": {
                        "width": "125px",
                        "height": "125px",
                        "top": "424px",
                        "left": "305px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200325/b864dbe4688defbd.jpg",//whiteBg
                    "css": {
                        "width": "750px",
                        "height": "225px",
                        "top": "775px",
                        "left": "0px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "image",
                    "url": qrcode,
                    "css": {
                        "width": `${qrCodeDiameter}px`,
                        "height": `${qrCodeDiameter}px`,
                        "top": `${qrtop}px`,
                        "left": `${qrleft}px`,
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                  "type": "image",
                  "url": "https://facing-1256908372.file.myqcloud.com//image/20200512/f22e57e2ce5ae071.png",   //89px  89px  845.5px 	581.5px
                  "css": {
                    "width": `${membanDiameter}px`, 
                    "height": `${membanDiameter}px`,
                    "top": `${qrtop + (membanDiameter / 2) + qrAvaOffset}px`,
                    "left": `${qrleft + (membanDiameter / 2) + qrAvaOffset}px`,
                    "rotate": "0",
                    "borderRadius": "500px",
                    "shadow": ""
                  }
                },
                {
                    "type": "image",
                    "url": `${avatar_url}?imageView2/1/w/100/h/100`,   //头像
                    "css": {
                        "width": "70px",
                        "height": "70px",
                        "top": "856px",
                        "left": "593px",
                        "rotate": "0",
                        "borderRadius": "250px",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "text",
                    "text": title,//标题
                    "css": {
                        "color": "#ff9b1f",
                        "background": "rgba(0,0,0,0)",
                        "width": "400px",
                        "height": "57.19999999999999px",
                        "top": "834px",
                        "left": "40px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "40px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "57.72000000000001px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": "长按识别图中小程序码,   查看视频",
                    "css": {
                        "color": "#666666",
                        "background": "rgba(0,0,0,0)",
                        "width": "493px",
                        "height": "42.89999999999999px",
                        "top": "906px",
                        "left": "40px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "30px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "43.290000000000006px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                }
            ]
        }
    },

    coverHide() {
        this.setData({
            showCover: false
        })
    },

    showOpenSetting(e) {
        this.setData({
            showopenSetting: e.detail.showopenSetting,
            setttingContent: e.detail.setttingContent
        })
    },
    cancelSetting() {
        this.setData({
            showopenSetting: false,
        })
    },
    hideShare() {
        if (this.showShare) {
            this.setData({
                showShare: false
            });
        }
    },

    showShare() {
        this.setData({
            showShare: true
        })
    },

    toCardList() {
        wx.reLaunch({
            url: '/pages/cardList/cardList'
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getSystenInfo();
        if (options.cardId) {
            app.globalData.cardId = options.cardId;
            this.setData({
                isFromShare: true
            });
        }
        if (options.mCardId) {
            this.data.cardId = options.mCardId;
        }
        if (options.beid) {
            this.setData({
                beid: options.beid
            });
        }
        if (options.fromUser) {
            app.globalData.fromUser = options.fromUser;
        }
        if (options.id) {
            app.globalData.transToVideoList = [];
            this.data.id = options.id;
            this.init(options.id);
        }
        this.addPlayNum()
        this.getCardInfo()
    },
    getCardInfo(){
        getCardInfo().then(data=>{
            const { avatar_url} = data
            this.data.avatar_url = avatar_url
        })
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

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.init(this.data.id);
        

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const shareData = {
            title: this.data.content,
            path: `/pages/videoDetail/videoDetail?cardId=${app.globalData.cardId}&id=${this.data.id}&fromUser=${app.globalData.uid}`,
            imageUrl: this.data.imageUrl + "?imageView2/1/w/710/h/400"
        }
        if (this.data.beid) {
            shareData.path = `/pages/videoDetail/videoDetail?cardId=${app.globalData.cardId}&id=${this.data.id}&fromUser=${app.globalData.uid}&mCardId=${this.data.cardId}&beid=${this.data.beid}`;
        }
        this.share();
        return shareData;
    }
})