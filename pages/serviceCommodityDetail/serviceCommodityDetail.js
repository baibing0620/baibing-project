const app = getApp();
import { fetchApi, getToken, addActionLog } from '../../api/api.js';
import { nav, shareParam } from '../../utils/util.js';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        id: 0,
        data: {},
        currentTabIndex: 0,
        hasBindPhone: false,
        loadAnimationWithPageLoad: true,
        showStyle: 0,
        loadStyle: 'loading',
        service_share_language: '',
        share_words:''
    },

    store: {
        pageIndex: 1,
        pageSize: 10,
        likeRequesting: false
    },

    handleNav(e) {
        const { url } = e.currentTarget.dataset;
        nav({ url });
    },

    handleNavToForm() {
        nav({ url: 'pages/serviceCommodityForm/serviceCommodityForm' });
    },

    handleNavToCardApply() {
        nav({ url: '/centerControl/cardApplication/cardApplication' });
    },

    handleGetPhoneNumber(e) {
        return new Promise((resolve, reject) => {
            const param = {
                url: app.API_HOST + 'vip/getPhoneNumberNew',
                data: {
                    code:e.detail.code
                }
            }
            fetchApi(self, param, 'POST').then((res) => {
                const { phoneNumber } = res.data.data.phone_info
                if (phoneNumber) {
                    app.globalData.currentLoginUserCardInfo.mobile = phoneNumber;
                    this.setData({ hasBindPhone: true });
                }
            }).catch(err => {
                console.log(err);
                wx.showToast({
                    title: err,
                    icon: 'none',
                    mask: true,
                    duration: 1500
                });
                setTimeout(() => {
                    this.handleNavToChat();
                }, 1500);
                reject(err)
            })
        })

    },

    handleNavToChat() {
        nav({ url: '/pages/chat/chat' });
    },

    handlePhoneCall() {
        const { phone } = this.data.data;
        wx.makePhoneCall({
            phoneNumber: phone
        });
    },

    handleLikeClick() {
        const { likeRequesting } = this.store;
        if (likeRequesting) {
            return;
        } else {
            this.likeRequest();
        }
    },

    likeRequest() {
        const { id, description } = this.data     
        const params = {
            url: 'ServiceGoods/setGoodsLike',
            data: {
                goodsId: id
            }
        }
        fetchApi(this, params).then(res => {
            const { like_number } = this.data.data;
            const { data: like_status } = res.data;
            let num = parseInt(like_number || 0);
            if (like_status == 1) {
                num++;
            } else {
                num--;
            }
            this.setData({
                loadAnimationWithPageLoad: false,
                'data.like_status': like_status,
                'data.like_number': num > 0 ? num : 0
            });
            //  事件上报
            addActionLog(this, {
                type: 44, 
                detail: {
                    id,
                    name: `${description || '服务'}`,
                }
            })
        }).catch(err => {
            console.log('error: ', err);
        });
    },

    handleTabClick(e) {
        const { index } = e.currentTarget.dataset;
        const { currentTabIndex } = this.data;
        if (index == currentTabIndex) return;
        this.setData({
            currentTabIndex: index
        });
    },

    handleNavToDetail(e) {
        const { id } = e.currentTarget.dataset;
        nav({
            url: '/pages/serviceCommodityDetail/serviceCommodityDetail',
            data: {
                id
            }
        });
    },

    getDetail() {
        const { id } = this.data;
        const params = {
            url: 'ServiceGoods/getGoodsOne',
            data: {
                goodsId: id
            }
        }
        fetchApi(this, params).then(res => {
            const { data } = res.data;
            const { id } = data;
            const { service_name } = data;
            if (!id) {
                wx.showModal({
                    title: '提示',
                    content: '当前商品不存在或已下架',
                    confirmColor: '#1f94fd',
                    success: _ => {
                        wx.navigateBack({
                            delta:1
                        });
                    }
                })
                return;
            }
            wx.setNavigationBarTitle({
                title: service_name
            });
            this.setData({
                data,
                showStyle: 1,
                service_share_language: data.service_share_language,
                share_words: data.share_words
            });
        }).catch(err => {
            console.log('error: ', err);
            this.setData({
                showStyle: 3
            });
        })
    },

    handleSubmit() {
        const { id: service_id, data: { link_reserve: id, service_name} } = this.data;
        nav({
            url: '/pages/serviceCommodityForm/serviceCommodityForm',
            data: { id, service_id, service_name }
        });
    },

    init() {
        this.getDetail();
        this.getCardInfo()
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const { cardId, fromUser, id } = options;
        const { mobile } = app.globalData.currentLoginUserCardInfo;
        id && (this.setData({ id }));
        cardId && (app.globalData.cardId = cardId);
        fromUser && (app.globalData.fromUser = fromUser);
        const {currentLoginUserCardInfo, cardId: globalCardId} = app.globalData
        this.setData({
            hasBindPhone: mobile ? true : false,
            showChat: currentLoginUserCardInfo && globalCardId && globalCardId != 0 && currentLoginUserCardInfo.cardId != globalCardId
        });
        cardId && (this.setData({
            isFromShare: true
        }));
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
        this.setData({
            startTime: new Date().getTime()
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        const { id, data: { description, service_name} } = this.data;
        const { startTime } = this.data
        // 事件上报
        addActionLog(this, {
            type: 41, 
            detail: {
                id,
                name: `${service_name || '服务'}`,
                duration: new Date().getTime() - startTime,
            }
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        const { id, data: { description, service_name } } = this.data;
        const { startTime } = this.data
        // 事件上报
        addActionLog(this, {
            type: 41, 
            detail: {
                id,
                name: `${service_name || '服务'}`,
                duration: new Date().getTime() - startTime,
            }
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.init();
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
        const { cardId, uid } = app.globalData;
        const { id, data: { description } } = this.data;
        const shareData = {
            title: this.data.share_words || this.data.service_share_language || description || '服务',
            path: `/pages/serviceCommodityDetail/serviceCommodityDetail?cardId=${cardId}&fromUser=${uid}&id=${id}`,
        }
        // 事件上报
        addActionLog(this, {
            type: 42, 
            detail: {
                id,
                name: `${description || '服务'}`,
            }
        })
        return shareData;
    },
    previewQRCode() {
        this.setData({
            showCover: true,
            painting: this.palette()
        })
        // this.getImageInfo(`${app.API_HOST}serviceGoods/genServiceGoodsPoster?id=${this.data.id}&${shareParam()}&_t=${qrCodeTime}`)

    },
    // 海报json配置
    palette() {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
            path = encodeURIComponent(`/pages/serviceCommodityDetail/serviceCommodityDetail?id=${this.data.id}&${shareParam()}`),
            qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}`
        const { service_name, description, img_url: { 0: { url}} } = this.data.data
        const { name, position, company, mobile, avatar_url} = this.data.cardInfo
        return{
            "width": "750px",
            "height": "1040px",
            "background": "#ffffff",
            "views": [
                {
                    "type": "image",
                    "url": `${avatar_url}?imageView2/1/w/200/h/200`,    //头像
                    "css": {
                        "width": "120px",
                        "height": "120px",
                        "top": "34px",
                        "left": "34px",
                        "rotate": "0",
                        "borderRadius": "250px",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "aspectFill"
                    }
                },
                {
                    "type": "image",
                    "url": `${url}?imageView2/1/w/750/h/522`,
                    "css": {
                        "width": "690px",
                        "height": "480px",
                        "top": "184px",
                        "left": "30px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "aspectFill"
                    }
                },
                {
                    "type": "text",
                    "text": service_name,
                    "css": {
                        "color": "#1D2023",
                        "background": "rgba(0,0,0,0)",
                        "width": "400px",
                        "height": "57.19999999999999px",
                        "top": "716.26px",
                        "left": "39px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#fffffff",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "40px",
                        "fontWeight": "bold",
                        "maxLines": "2",
                        "lineHeight": "57.72000000000001px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": description,
                    "css": {
                        "color": "#919599",
                        "background": "rgba(0,0,0,0)",
                        "width": "389px",
                        "height": "40.04px",
                        "top": "788.26px",
                        "left": "39px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "28px",
                        "fontWeight": "normal",
                        "maxLines": "2",
                        "lineHeight": "40.40400000000001px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "image",
                    "url": qrcode,
                    "css": {
                        "width": "227px",
                        "height": "227px",
                        "top": "689.26px",
                        "left": "454px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "text",
                    "text": name,
                    "css": {
                        "color": "#1D2023",
                        "background": "rgba(0,0,0,0)",
                        "width": "320px",
                        "height": "57.19999999999999px",
                        "top": "46px",
                        "left": "184px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "40px",
                        "fontWeight": "bold",
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
                    "text": position,
                    "css": {
                        "color": "#919599",
                        "background": "rgba(0,0,0,0)",
                        "width": "500px",
                        "height": "40.04px",
                        "top": "110.26px",
                        "left": "184px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "28px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "40.40400000000001px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": mobile,
                    "css": {
                        "color": "#F29C4B",
                        "background": "rgba(0,0,0,0)",
                        "width": "200px",
                        "height": "25.740000000000002px",
                        "top": "53px",
                        "left": "516px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "30px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "25.974000000000004px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200413/6bce772cb5ddeb61.png",
                    "css": {
                        "width": "678px",
                        "height": "69px",
                        "top": "941px",
                        "left": "33px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                }
            ]
        }

    },
    getCardInfo(){
        let param = {
            url: 'card/getCardInfo',
            data: {
                cardId: app.globalData.cardId
            }
        }
        fetchApi(this, param).then(res => {
           this.setData({
               cardInfo:res.data.data
           })
        }).catch(res => {
        });
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
})