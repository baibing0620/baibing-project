// centerControl/verificationList/verificationList.js


const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
    showToast,
    showTips,
    nav,
    showModal,
    shareParam
} from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 1,
        privilege: '',
        giveModel: false,
        is_open_credit: false,
        extConfig: app.extConfig,
        showCover: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.hideShareMenu()
        this.init()
    },
    init(){
        this.getRootSetting();
        this.getShopCreditSetting()
        this.getCardCreditGiftActivity()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.getRootSetting()
        this.getShopCreditSetting()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    handleToNavigate(e) {
        const { dataset } = e.currentTarget
        const { page } = dataset
        nav({
            url: `/centerControl/${page}/${page}`,
            data: dataset
        })
    },
    getShopCreditSetting() {
        fetchApi(this, {
            url: "config/get",
            data: {}
        }).then(res => this.setData({
            is_open_credit: res.data.data.is_open_credit == 1
        }))
    },

    handleConfirm(result, type, data = {}) {
        nav({
            url: '/centerControl/verificationConfirm/verificationConfirm',
            data: { result, type, data:JSON.stringify(data) }
        })
    },

    scanToUseCoupon() {
        wx.scanCode({
            scanType: ['qrCode'],
            success: e => this.handleConfirm(e.result, '优惠券')
        })
    },

    scanToUsePrize() {
        wx.scanCode({
            scanType: ['qrCode'],
            success: e => this.handleConfirm(e.result, '活动奖品')
        })
    },
    getRootSetting() {
        let param = {
            url: app.API_HOST + 'card/getCardInfo',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            const { name, position, avatar_url, privilege } = res.data.data
            this.setData({
                name,
                position,
                avatar_url,
                privilege: privilege || ''
            })
        })
    },
    integralGive() {
        this.setData({
            giveModel: true,
            type: 'verification',
            ...{
                title: '积分核销',
                placeholder: '请输入要核销的积分数量',
                btnVal: '立即核销',
                tip: ''
            }
        })
    },
    closeModel() {
        this.setData({
            giveModel: false
        })
    },
    onGetvalue(e) {
        let value = e.detail
        if (this.data.type == 'verification') {
            this.verification(value)
        } else {
            this.giftCode(value)
        }
    },
    coverHide() {
        this.setData({
            showCover: false
        })
    },
    bonusCodeModel() {
        this.setData({
            giveModel: true,
            type: 'giftCode',
            ...{
                title: '赠送积分',
                placeholder: '输入需要赠送的积分数量',
                btnVal: '生成积分海报',
                tip: '生成海报后，若需要修改积分数量，请重新操作并再次生成积分海报'
            }
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
    verification(value) {
        if (value.trim() == '') {
            showTips('请输入需要核销积分', this)
            return;
        }
        wx.scanCode({
            success: res => this.handleConfirm(res.result, '积分', {credit: value})
        })
    },
    giftCode(value) {
        if (value.trim() == '') {
            showTips('请输入需要赠送积分', this)
            return;
        }
        this.closeModel()
        // let bonusCode = `${app.API_HOST}userCredit/getCardCreditGiftPoster?credit=${value}&token=${app.globalData.token}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}`
        this.setData({
            showCover: true,
            palette: this.palette(value)
        })
    },
    getCardCreditGiftActivity(){
       let param = {
           url: app.API_HOST + 'UserCredit/getCardCreditGiftActivity',
            data: {
               
            }
        }
        fetchApi(this, param).then(res => {
            const { data: prize } = res.data
            this.setData({
                prize:prize.join("、")
            })
        }) 
    },
    palette(value){
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
            path = encodeURIComponent(`/pages/home/home?credit=${value}&${shareParam()}`),
            qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}&is_hyaline=true `
        const { name, position, avatar_url, prize } = this.data
        let line = Math.ceil(prize.length / 35) 
        const lineHeight = {0:650,1:650,2:620,3:590}
        return {
            "width": "750px",
            "height": "999px",
            "background": "#f8f8f8",
            "views": [
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200327/b0d735bb8a9238ba.png",  //背景图
                    "css": {
                        "width": "750px",
                        "height": "999px",
                        "top": "0px",
                        "left": "0px",
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
                    "url": `${avatar_url}?imageView2/1/w/67/h/67`,  //头像
                    "css": {
                        "width": "67px",
                        "height": "67px",
                        "top": "50px",
                        "left": "43px",
                        "rotate": "0",
                        "borderRadius": "250px",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "aspectFill"
                    }
                },
                {
                    "type": "text",
                    "text": name,   //名片主名称
                    "css": {
                        "color": "#ffffff",
                        "background": "rgba(0,0,0,0)",
                        "width": "210px",
                        "height": "37.18000000000001px",
                        "top": "54px",
                        "left": "117px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "26px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "37.51800000000001px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": position,     //"职位名称"
                    "css": {
                        "color": "#ffffff",
                        "background": "rgba(0,0,0,0)",
                        "width": "200px",
                        "height": "22.88px",
                        "top": "90px",
                        "left": "120px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "16px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "23.088000000000005px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200330/a2af8f6aa6f89018.png",   //圆环图
                    "css": {
                        "width": "238px",
                        "height": "238px",
                        "top": "737.0000138078484px",
                        "left": "267.99999723307315px",
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
                    "url": qrcode,    //小程序码
                    "css": {
                        "width": "175px",
                        "height": "175px",
                        "top": "769.0000069039243px",
                        "left": "299.9999972330731px",
                        "rotate": "0",
                        "borderRadius": "0",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200330/15c956292acf4d7e.png",   //线条
                    "css": {
                        "width": "477px",
                        "height": "21px",
                        "top": "706.0001311745597px",
                        "left": "145.99999723307315px",
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
                    "text": `抽${prize}等多重大礼`,    //奖品信息
                    "css": {
                        "color": "#f8fa55",
                        "background": "rgba(0,0,0,0)",
                        "width": "600px",
                        "height": "96.096px",
                        "top": `${lineHeight[line]}px`,
                        "left": "85.99999983723961px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "22px",
                        "fontWeight": "normal",
                        "maxLines": "3",
                        "lineHeight": "31.746000000000006px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "center"
                    }
                }
            ]
        }
    }
    
})