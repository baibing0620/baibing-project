const app = getApp();
import { fetchApi, getCardInfo, addActionLog } from '../../api/api.js';
import { nav, showLoading, showTips } from '../../utils/util';

Page({ 

    /**
     * 页面的初始数据s
     */
    data: {
        id: "",
        list: [],
        showStyle: 0,
        videoheight: 0,
        swiper: true,
        video: false,
        hasLiked: false,
        extConfig: app.extConfig,
        commentHeight: '300px',
        comment: false,
        pageindex: 1,
        pageSize: 10,
        commentList:[],
        total: 0,
        pageIndex: 1,
        pageSize: 20,
        userComment: '',
        swiperAutoplay: false,
        swiperInterval: 50000
    },
    dataStore : {
        startTime: ''
    },

    getVideoInfo(id, index = 0) {
        this.setData({
            swiperAutoplay: false
        })
        let params = {
            url: app.API_HOST + "ShortVideo/getShortVideoDetail",
            data: {
                id: id
            }
        }
        fetchApi(this, params).then(res => {
            console.log(res)
            app.globalData.transToVideoList.push(id);
            let data = res.data.data;
            let before = res.data.data.up;
            let after = res.data.data.under;
            wx.setNavigationBarTitle({
                title: data.name
            });
            
            if (this.first) {
                this.first = false;
                this.notNewPlay = false;
                if (this.videoTimer) clearTimeout(this.videoTimer);
                this.setData({
                    swiper: true,
                    video: true,
                    list: [ before, data, after],
                    goodsInfo: data.goods,
                    hasLiked: false,
                    likeNum: data.zan? parseInt(data.zan):0,
                    relayNum: data.browse? parseInt(data.browse):0,
                    forward: data.forward? parseInt(data.forward):0,
                    commentTotal: parseInt(data.comment[0] ? data.comment[0].total : 0),
                    title: data.name,
                    content: data.share,
                    imageUrl: data.img_url,
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
                    list: [ before, data, after],
                    goodsInfo: data.goods,
                    hasLiked: false,
                    likeNum: data.zan? parseInt(data.zan):0,
                    relayNum: data.browse? parseInt(data.browse):0,
                    forward: data.forward? parseInt(data.forward):0,
                    commentTotal: parseInt(data.comment[0] ? data.comment[0].total : 0),
                    title: data.name,
                    content: data.share,
                    imageUrl: data.img_url,
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
                console.log(e.windowHeight)
                console.log(e.screenHeight)
                let commentHeight = (e.windowHeight*0.7) - 110
                this.setData({
                    videoheight: e.windowHeight-50,
                    commentHeight: commentHeight,
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
        this.like()
    },

    clickComment() {
        let params = {
            url: app.API_HOST + "ShortVideo/getShortVideoCommentList",
            data: {
                videoId: this.data.id,
                pageIndex: this.data.pageIndex,
                pageSize: this.data.pageSize
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data.shortVideoCommentList
            let total = res.data.data.total
            this.setData({
                comment: true,
                commentList: this.data.pageIndex == 1 ? data : this.data.commentList.concat(data),
                total: total
            })
        }).catch(res => {

        });
        
    },

    getMore() {
        if (this.data.commentList.length < this.data.total) {
            this.setData({
                pageIndex: ++this.data.pageIndex
            })
            this.clickComment();
        }
    },

    like() {
        let params = {
          url: app.API_HOST + "ShortVideo/addMarketingLog",
            data: {
                video_id: this.data.id,
                source_type: 1,
                goods_id: 0,
                content_id: 0,
                type: 4
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
        this.data.forward++;
        this.setData({
            relayNum: this.data.relayNum,
            forward: this.data.forward
        })
        let params = {
          url: app.API_HOST + "ShortVideo/addMarketingLog",
            data: {
                video_id: this.data.id,
                source_type: 1,
                goods_id: 0,
                content_id: 0,
                type: 3
            }
        }
        fetchApi(this, params).then(res => {
        }).then(res => {
            console.log("error: ", res);
        })
    },

    addPlayNum() {
        let params = {
          url: app.API_HOST + "ShortVideo/addMarketingLog",
            data: {
                video_id: this.data.id,
                source_type: 1,
                goods_id: 0,
                content_id: 0,
                type: 2
            }
        }
        fetchApi(this, params).then(res => {
        }).then(res => {
            console.log("error: ", res);
        })
    },

    metaVideo(e) {
        console.log('加载完成', e)
        this.setData({
            swiperAutoplay: true,
            swiperInterval: e.detail.duration*1000
        })
    },
    onVideoEndOrError() {
        this.notNewPlay = false;
    },

    previewImage(e) {
        this.setData({
            image: this.palette(),
            showCover: true,
            showShare: false
        })
        this.share();
    },

    coverHide() {
        this.setData({
            showCover: false
        })
    },

    palette(){
        const { id, title, imageUrl, avatar_url } = this.data
        let t = new Date().getTime(),
          path = encodeURIComponent(`shortVideo/shortvideoDetail/shortvideoDetail?id=${id}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`),
          qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${t}`,
          fodderRows = 616,        //行高
          fodderCols = 453,       //列宽
          top = 160              //位置
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
              "url": `${imageUrl}?imageView2/1/w/${fodderCols}/h/${fodderRows}`,
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
                "width": "182px",
                "height": "182px",
                "top": "800px",
                "left": "536px",
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
                "width": '89px',
                "height": '89px',
                "top": '845.5px',
                "left": '581.5px',
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
        // return `${app.API_HOST}ShortVideo/makeCardVideoShareImg?token=${app.globalData.token}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&vid=${this.data.id}&_t${t}`;
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

    closeComment () {
        this.setData({
            comment: false
        })
    },

    setComment(e) {
        this.setData({
            userComment: e.detail.value
        })
    },

    addShortVideoComment() {
        if (this.data.userComment.trim().length == '') {
            return
        }
        let params = {
            url: app.API_HOST + "ShortVideo/addShortVideoComment",
            data: {
                videoId: this.data.id,
                comment: this.data.userComment,
            }
        }
        fetchApi(this, params).then(res => {
            console.log(res)
            this.setData({
                userComment:'',
                commentTotal:this.data.commentTotal + 1
            })
            this.clickComment()
        }).then(res => {
            console.log("error: ", res);
        })
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
        setTimeout(this.addPlayNum, 10000)
        this.getCardInfo()
    },

    getCardInfo() {
        getCardInfo().then(data => {
            const { avatar_url } = data
            this.data.avatar_url = avatar_url
        })
    },

    toGoodsDetails() {
        let params = {
            url: "/pages/goodsdetail/goodsdetail",
            data: {
                sourceType: 1,
                videoId: this.data.id,
                goodsId: this.data.goodsInfo.id,
            }
        }
        let param = {
          url: app.API_HOST + "ShortVideo/addMarketingLog",
            data: {
                video_id: this.data.id,
                source_type: 1,
                goods_id: this.data.goodsInfo.id,
                content_id: 0,
                type: 1
            }
        }
        fetchApi(this, param).then(res => {
            nav(params);
        }).then(res => {
            console.log("error: ", res);
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
        this.dataStore.startTime = new Date().getTime();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        addActionLog(this, {
            type: 49,
            detail: {
                name: this.data.title,
                duration: new Date().getTime() - this.dataStore.startTime,
            }
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        addActionLog(this, {
            type: 49,
            detail: {
                name: this.data.title,
                duration: new Date().getTime() - this.dataStore.startTime,
            }
        })
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const shareData = {
            title: this.data.content,
            path: `/shortVideo/shortvideoDetail/shortvideoDetail?cardId=${app.globalData.cardId}&id=${this.data.id}&fromUser=${app.globalData.uid}`,
            imageUrl: this.data.imageUrl + "?imageView2/1/w/710/h/400"
        }
        if (this.data.beid) {
            shareData.path = `/shortVideo/shortvideoDetail/shortvideoDetail?cardId=${app.globalData.cardId}&id=${this.data.id}&fromUser=${app.globalData.uid}&mCardId=${this.data.cardId}&beid=${this.data.beid}`;
        }
        this.setData({
            showShare: false
        });
        this.share();
        return shareData;
    }
})