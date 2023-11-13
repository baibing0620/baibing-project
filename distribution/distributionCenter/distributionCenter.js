const app = getApp();
import { fetchApi, getGlobalConfig } from "./../../api/api.js";
import { nav, shareParam } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        showStyle: 0,
        moneyCount: 0,
        creditCount: 0,
        distribution_reward_type: 1,
        showCover: false
    },

    init() {
        Promise.all([this.getDetail(), getGlobalConfig()]).then(res => {
            const [detail, globalConfig] = res
            const { creditCount, moneyCount } = detail.data.data
            const { distribution_reward_type, is_open_consumption_shopping } = globalConfig.data.data
            this.setData({
                creditCount,
                moneyCount,
                distribution_reward_type,
                is_open_consumption_shopping,
                showStyle: 1
            })
        }).catch(_ => {
            console.error(_)
            this.setData({
                showStyle: 3
            })
        })
    },

    getDetail() {
        return fetchApi(this, {
            url: 'distribution/userDistributionIncomeCount'
        })
    },

    formatDistributionInfo(data) {
        let self = {
            isMySelf: 1,
            level: data.level,
            distribution_money: data.distribution_money,
            formula: data.formula
        };
        let info = data.other;
        info.map((i, index) => {
            if (parseInt(i.level) > parseInt(self.level)) {
                info.splice(index, 0, self);
            } else if (index >= info.length - 1) {
                info.push(info);
            }
        });
        return info;
    },

    previewImage() {
        // qrcode = `${app.API_HOST}distribution/getShareImage?token=${app.globalData.token}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&_t${t}`
        this.setData({
            showCover: true,
            palette: this.palette()
        })

    },

    coverHide() {
        this.setData({
            showCover: false
        })
    },

    palette() {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
            path = encodeURIComponent(`/pages/home/home?${shareParam()}`),
            qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}`,
            rate = '',
            level = { 1: '一级返佣', 2: '二级返佣', 3: '三级返佣' },
            config = {
                "width": "750px",
                "height": "1000px",
                "background": "#ffffff",
                "views": [
                    {
                        "type": "image",
                        "url": "https://facing-1256908372.file.myqcloud.com/image/20200917/da4r6h49095d8320a.png",
                        "css": {
                            "width": "750px",
                            "height": "1000px",
                            "top": "0px",
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
                            "width": "190px",
                            "height": "190px",
                            "top": "767.9999999389648px",
                            "left": "506.00000016276033px",
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
                        "text": "微信扫码进入该小程序后\n转发小程序给好友并促进好友\n在商城内消费即可获得高额奖励",
                        "css": {
                            "color": "#fff990",
                            "background": "rgba(0,0,0,0)",
                            "width": "465.9999284668027px",
                            "height": "140px",
                            "top": "834px",
                            "left": "37.99999999999997px",
                            "rotate": "0",
                            "borderRadius": "",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "padding": "0px",
                            "fontSize": "28px",
                            "fontWeight": "normal",
                            "maxLines": "3",
                            "lineHeight": "46px",
                            "textStyle": "fill",
                            "textDecoration": "none",
                            "fontFamily": "",
                            "textAlign": "left"
                        }
                    }
                ]
            },
            { open_single_distribution, distribution_setting, chain_distribution_level } = app.globalConfig
        distribution_setting.forEach(item => {
            if (item.level > app.globalConfig.chain_distribution_level) {
                return false
            }
            let obj = [{
                "type": "text",
                "text": "50%",
                "css": {
                    "color": "#fffd53",
                    "background": "rgba(0,0,0,0)",
                    "width": "200px",
                    "height": "42.89999999999999px",
                    "top": "780px",
                    "left": "173.000000406901px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "30px",
                    "fontWeight": "normal",
                    "maxLines": "2",
                    "lineHeight": "43.290000000000006px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "",
                    "textAlign": "left"
                }
            },
            {
                "type": "text",
                "text": "一级返佣",
                "css": {
                    "color": "#ffffff",
                    "background": "rgba(0,0,0,0)",
                    "width": "130px",
                    "height": "42.89999999999999px",
                    "top": "780px",
                    "left": "44px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "30px",
                    "fontWeight": "normal",
                    "maxLines": "3",
                    "lineHeight": "43.290000000000006px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "",
                    "textAlign": "left"
                }
            }]
            let rateFontYPx = 780;
            if (open_single_distribution == 2) {
                obj[0].text = item.rate + '元/件'
                rateFontYPx -= 54 * (chain_distribution_level - 1)
                obj[0].css.top = obj[1].css.top = rateFontYPx + 'px'
            } else {
                obj[0].text = item.rate + '%'
                rateFontYPx -= 54 * (chain_distribution_level - 1)
                obj[0].css.top = obj[1].css.top = rateFontYPx + 'px'
            }
            obj[1].text = level[item.level]
            chain_distribution_level -= 1;
            config.views = config.views.concat(obj)
        })
        return config
    },

    getCardInfo() {
        let param = {
            url: 'card/getCardInfo',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            this.setData({
                cardInfo: {
                    avatar: res.data.data.avatar_url,
                    name: res.data.data.name,
                    position: res.data.data.position,
                },
                fromShare: true
            })
        }).catch(res => {
            console.log(res);
        });
    },

    navigate(e) {
        const { pack, page } = e.currentTarget.dataset
        nav({
            url: `/${pack || 'distribution'}/${page}/${page}`
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.cardId) {
            app.globalData.cardId = options.cardId
            options.fromUser ? app.globalData.fromUser = options.fromUser : ""
            this.setData({
                isFromShare: true
            })
        }
        this.setData({
            isAdmin: ~~app.globalData.cardId && app.globalData.cardId == app.globalData.currentLoginUserCardInfo.cardId
        })
        this.init()
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
        return {
            path: `/distribution/distributionCenter/distributionCenter?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
        }
    }
})