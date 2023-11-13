const app = getApp()
import { fetchApi, addActionLog, getUserInfo, getCardInfo, openLocation, addPhoneContact, getPhoneNumber, getEffectiveCardId } from '../../api/api'
import { showLoading, previewImageList, nav, makePhoneCall, showToast, showTips, compareVersion, hideLoading } from '../../utils/util'
import { cardShare } from '../../utils/posterTemplate'
import { subscribe, disSubscribe } from './../../utils/publisher' 
import {
    eventType
} from '../../map.js';

let time;
Page({
    data: {
        shop_Name:'',
        // 分销banner
        banner_status: 0,
        cardId: "",
        showShareModal: false,
        hasBindPhone: false,
        showStyle: 0,
        baseInfo: {

        },
        mediaInfo: {},
        tag: [],
        noCard: false,
        likeInfo: {
            hasLike: 0,
            likeList: [],
            likeNum: 0,
            viewNum: 0,
            hasClick: false
        },
        showInfo: false,
        diyConfig: app.extConfig,
        isCurrentCardManage: 0,
        newMsgCount: 0,
        openTechSupport: 0,
        techSupportText: '',
        autoReplay: {},
        showCover: false,
        later: false,
        message: "",
        messageSending: false,
        showZanToast: false,
        bgimg: 'https://facing-1256908372.file.myqcloud.com/image/20180907/2bbc63fb3ca382e5.jpg',
        ready: false,
        controlPanel: [],
        distributionInfo: [],
        menuSetting: {
            "留言": {
                dontNeedToGetTotal: true
            },
            "个人中心": {},
            "管理中心": {}
        },
        videoShowStyle: 1,
        pageRefresh: 0,
        pageSize: 10,
        pageIndex: 1,
        showBless: false,
        recommendList: [],
        openRecommend: 0,
        openGoodsRecommend: 0,
        openInfoRecommend: 0,
        recommendTitle: '',
        indicatorDots: '#f24c3c',
        globalData: app.globalData,
        home_page_contact_open: false,
        has_add_wechat: false,
        painting: {},
        postPath: '',
        shortpageSize: 10,
        shortpageIndex: 1,
        shortVideoList: [],
        tmplIds: [],
        allowSubscribe: false,
        swiperContent: [],
        swiperShow: false,
        pf_id:0,
    },

    dataStore: {
        startTime: 0,
        fromName: '',
        bless: ''
    },

    onLoad: async function (options) {
      console.log('options==',options);
      // 20220913 优先判断携带cardId 方式
      if (options.cardId) {
              app.globalData.cardId = options.cardId || 0;
              app.globalData.fromUser = options.fromUser || 0;
              options.credit && this.receivePosterCredit(options.credit)
          } else if (!~~app.globalData.cardId) {
              try {
                  const { cardId, myCardId } = await getEffectiveCardId()
                  app.globalData.cardId = myCardId || cardId || ''
                  if (!~~app.globalData.cardId) throw Error('无可用名片')
              } catch (error) {
                  console.error(error)
                  wx.reLaunch({
                      url: '/pages/cardList/cardList'
                  })
                  return
              }
         }
        this.setData({
            cardId: options.cardId || app.globalData.cardId
        })
       
        subscribe('cardInfo', val => {
            this.formatCardInfo(this)
        }, this)

        this.data.ready = true;
        app.globalData.refresh = true;
        this.pageInit()

        const version = wx.getSystemInfoSync().SDKVersion
        // 自定义导航栏低版本兼容处理
        if (compareVersion(version, '2.5.2') < 0) {
            wx.showModal({
                title: '提示',
                content: '您的微信版本过低，无法正常查看导航栏，请升级到最新微信版本后重试哦~~'
            })
        }

        this.getSwiperContent()
    },

    onReady: function () {

    },
    // getUserProfile(){
    //     wx.getUserProfile({
    //         desc: '用于完善用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //         success: (res) => {
    //             const { userInfo } = res
    //             console.log(userInfo)
    //             if (userInfo) {
    //                 getUserInfo(this, userInfo).then(e => {
    //                     // this.navPersonal()
    //                     this.setData({
    //                         showAuthorizationUserInfo: false
    //                     })
    //                 })
    //             } else {
    //                 showTips('授权失败')
    //             }
    //         }
    //     })
    // },
    onShow() {
        this.autoReplay()
        this.pageInit();
        // getCardInfo(this)
        this.getShortVideoList();
        app.showRemind(this);
        this.setData({
            showBless: app.globalData.showBless,
            globalData: app.globalData
        });
        if (app.globalData.refreshVideoList && app.globalData.videoIfOpen) {
            app.globalData.refreshVideoList = "";
            this.data.pageIndex = 1;
            this.getVideoList();
        } else if (app.globalData.transToVideoList) {
            let set = new Set(app.globalData.transToVideoList);
            this.getRefreshData([...set]);
            app.globalData.transToVideoList = "";
        }
        if (this.data.videoShowStyle != app.globalData.videoShowStyle && app.globalData.videoIfOpen) {
            this.setData({
                videoShowStyle: app.globalData.videoShowStyle
            });
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

        addActionLog(this, {
            type: 1,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime,
                name: this.dataStore.fromName
            }
        })
    },

    onUnload: function () {
        clearTimeout(time)
        addActionLog(this, {
            type: 1,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime,
                name: this.dataStore.fromName
            }
        })
        disSubscribe(this)
    },

    onPullDownRefresh: function () {
        app.globalData.refresh = true
        getCardInfo(this)
        this.pageInit()
        this.getShortVideoList()
        this.getSwiperContent()
        this.setData({
            pageRefresh: new Date().getTime()
        });
    },

    networkFaildRealod: function () {
        this.setData({
            showStyle: 0
        });
        this.pageInit();
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
        this.setData({
            showShareModal: false
        })
        var cardInfo = this.data.baseInfo;
        addActionLog(this, {
            type: 7,
            detail: {
                name: app.globalData.userInfo ? (app.globalData.userInfo.nickName || '--') : '--'
            }
        });
        return {
            title: cardInfo.card_share_desc ? cardInfo.card_share_desc : `您好，我是${cardInfo.company}的${cardInfo.position}——${cardInfo.name}。请多指教！`,
            imageUrl: cardInfo.cardSharePath,
            path: `/pages/home/home?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
        }

    },
    // 为了兼容消息推送，用户在名片内浏览不低于30s，弹出该订阅框
    getSubscribe() {
        let param = {
            url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
            data: {
                tpl_msg_type: '13'
            }
        }
        let that = this
        fetchApi(that, param).then(_res => {
            if (_res.data.data.length > 0) {
                let setList = []
                wx.getSetting({
                    withSubscriptions: true,
                    success(res) {
                        if (res.subscriptionsSetting) {
                            setList = Object.keys(res.subscriptionsSetting)
                        }
                        let tmplIds = []
                        _res.data.data.forEach(element => {
                            if (setList.indexOf(element) == -1) {
                                tmplIds.push(element)
                            }
                        });
                        that.setData({
                            tmplIds: tmplIds
                        })
                        // if (wx.requestSubscribeMessage){
                        //     if (tmplIds.length > 0 ) {
                        //         wx.showModal({
                        //             title: '提示',
                        //             content: '请允许我们发送订阅消息',
                        //             success (__res) {
                        //               if (__res.confirm) {
                        //                 console.log('用户点击确定')
                        //                 wx.requestSubscribeMessage({
                        //                     tmplIds: tmplIds,
                        //                     success (_res) { },
                        //                     complete(_res) { }
                        //                 })
                        //               } else if (__res.cancel) {
                        //                 console.log('用户点击取消')
                        //               }
                        //             }
                        //         })
                        //     }
                        // } else {
                        //     wx.showModal({
                        //         title: '提示',
                        //         content: '当前微信版本过低，无法使用订阅消息功能，请升级到最新微信版本后体验。'
                        //     })
                        // }
                    },
                    fail() {
                        wx.showModal({
                            title: '提示',
                            content: '当前微信版本过低，请升级到最新微信版本后体验。'
                        })
                    }
                })
            }
        }).catch((e) => console.log(e))
    },
    autoReplay() {
        this.toGetAutoReplay();
    },
    toGetAutoReplay() {
        if (app.globalData.cardId != 0) {
            this.getAutoReplyMsg();
        }
    },
    getBannerStatus() {
        let params = {
            url: app.API_HOST + "config/getStaffFuncManageSetting",
            data: {}
        }
        fetchApi(this, params).then(res => {
            let { home_page_contact_open_main, staff_func_control } = this.data;
            this.setData({
                banner_status: parseInt(res.data.data.banner_status),
                open_self_card: parseInt(res.data.data.open_self_card),
                has_running_activity: parseInt(res.data.data.has_running_activity),
                home_page_contact_open: staff_func_control == 1 ? res.data.data.home_page_contact_open : home_page_contact_open_main,
                has_add_wechat: res.data.data.has_add_wechat == 1 ? true : false
            });
        }).catch(res => {
            console.log('error: ', res);
        })
    },

    pageInit: function () {

        this.dataStore.startTime = new Date().getTime();

        if (app.globalData.refresh) {
            app.globalData.refresh = false;
            if (app.globalData.cardId == 0) {
                this.setData({
                    noCard: true
                });
            } else {
                this.getVideoShowStyleSetting()
                getServiceSetting(this)
                this.getHomeGoodsInfo()
                this.getGoodsRecommend()
                this.getInfoRecommend()
            }
        }
        this.getDistributionInfo();
    },

    getRefreshData(ids) {
        let params = {
            url: app.API_HOST + "card/getCardVideoInfoByVidArr",
            data: {
                vids: JSON.stringify(ids)
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            data.map(i => {
                let index = this.data.videoList.findIndex((item) => {
                    return parseInt(item.id) === parseInt(i.id);
                });
                this.data.videoList[index] = i;
            });
            this.setData({
                videoList: this.data.videoList
            });
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    getVideoShowStyleSetting() {
        let params = {
            url: app.API_HOST + "card/getCardVideoConfig",
            data: {}
        }
        fetchApi(this, params).then(res => {
            let style = parseInt(res.data.data.video_style);
            let open = parseInt(res.data.data.videoIfOpen);
            this.setData({
                videoShowStyle: style,
                videoIfOpen: open
            });
            app.globalData.videoShowStyle = style;
            app.globalData.videoIfOpen = open;
            if (open) {
                this.getVideoList();
            }
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    pullSubscribe() {
        if (app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId) {
            const tmplIds = this.data.tmplIds
            const that = this
            if (tmplIds.length > 0 && !this.data.allowSubscribe) {
                if (wx.requestSubscribeMessage) {
                    wx.requestSubscribeMessage({
                        tmplIds: tmplIds,
                        success(res) {
                            let keys = Object.keys(res)
                            let values = Object.values(res)
                            let allowSubscribe = values.indexOf('reject') == -1
                            that.setData({
                                allowSubscribe: allowSubscribe
                            })
                            let templateIds = ''
                            values.forEach((element, index) => {
                                if (element == 'accept') {
                                    templateIds += index == 0 ? keys[index] : ',' + keys[index]
                                }
                            });
                            if (templateIds != '') {
                                that.addUserTplMsg(templateIds)
                            }
                        },
                        complete(res) {
                            that.getSubscribe(that)
                        }
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '当前微信版本过低，无法使用订阅消息功能，请升级到最新微信版本后体验。'
                    })
                }
            }
        }
    },

    addUserTplMsg(templateIds) {
        let param = {
            url: app.API_HOST + 'TemplateMsg/addUserTplMsg',
            data: {
                template_id: templateIds
            }
        }
        fetchApi(self, param).then(res => {
            console.log(res)
        }).catch((e) => console.log(e))
    },

    likeTag(e) {
        var index = parseInt(e.currentTarget.dataset.index);
        var tag = this.data.tag;
        var param = {
            url: 'card/tagLike',
            data: {
                tag_name: tag[index].tagName
            }
        };

        fetchApi(this, param).then(res => {
            if (res.data.code != 2) {
                tag[index].likeNum += 1;
                tag[index].isLike = 1;
                this.setData({
                    tag
                })
                addActionLog(this, {
                    type: 11,
                    detail: {
                        name: tag[index].tagName
                    }
                });
            } else {
                this.setData({
                    showZanToast: true
                })

                var expressTime = setTimeout(() => {
                    clearTimeout(expressTime);
                    this.setData({
                        showZanToast: false,
                    });
                }, 1500);
            }
        }).catch(err => { })
    },

    changeLike() {
        var param = {
            url: 'card/like',
            data: {
                card_id: app.globalData.cardId
            }
        }
        if (this.data.likeInfo.hasLike == 1) {
            param.url = 'card/unLike';
        } else {
            addActionLog(this, {
                type: 9
            });
        }
        fetchApi(this, param).then(res => {
            this.setData({
                'likeInfo.hasLike': this.data.likeInfo.hasLike ? 0 : 1,
                'likeInfo.likeNum': !this.data.likeInfo.hasLike ? this.data.likeInfo.likeNum + 1 : this.data.likeInfo.likeNum - 1,
                'likeInfo.hasClick': true
            })
        }).catch(err => { })

    },

    previewImag(e) {
        let url = e.currentTarget.dataset.previewUrl;
        previewImageList(this.data.mediaInfo.imageList, '', url);
    },

    makePhoneCall() {
        makePhoneCall(this.data.baseInfo.mobile, () => {
            addActionLog(this, {
                type: 6,
            })
        })
    },

    toDraw() {
        nav({
            url: '/pages/marketingActivities/marketingActivities'
        })
    },

    toChat() {
        nav({
            url: '/pages/chat/chat',
            data: {
                toUid: this.data.baseInfo.uid,
                toUserName: this.data.baseInfo.name,
            }
        })

        this.setData({
            showCover: false,
            later: false
        })

    },

    addPhoneContact() {
        const { baseInfo } = this.data
        addActionLog(this, {
            type: 8,
        })
        wx.addPhoneContact({
            firstName: baseInfo.name,
            lastName: '',
            mobilePhoneNumber: baseInfo.mobile,
            weChatNumber: baseInfo.wechat,
            organization: baseInfo.company,
            email: baseInfo.email,
            success: () => {
            },
            fail: (err) => {
                console.error(err)
            }
        });
    },

    copyAddress(e) {
        const { type, index } = e.currentTarget.dataset
        const { baseInfo } = this.data
        if (!baseInfo[type][index]) {
            showTips('复制内容为空')
            return
        }
        wx.setClipboardData({
            data: baseInfo[type][index],
            success: _ => {
                showToast('复制成功', 'success')
                addActionLog(this, {
                    type: eventType[type],
                })
            }
        })
    },

    toControl() {
        nav({
            url: "/pages/centralControl/centralControl"
        })
    },

    bindInput(e) {
        this.setData({
            message: e.detail.value
        })
    },

    hideCover() {
        this.setData({
            showCover: false,
            later: false
        })
    },

    later() {
        this.setData({
            showCover: false,
            later: true
        })
    },

    shareCard(e) {
        this.setData({
            upShareModal: true,
            showShareModal: true
        })
    },

    closeShareModal() {
        this.setData({
            upShareModal: false,
        })
        setTimeout(() => {
            this.setData({
                showShareModal: false
            })
        }, 180)
    },

    getPageQRCode() {
        var param = {
            url: app.API_HOST+'card/getCardInfo',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(this,param).then(res=>{
            this.setData({
                pf_id: parseInt(res.data.data.pf_id)
            })
        }).catch(err=>{
            console.log(err)
        })
        this.setData({
            showShareModal: false    //关闭弹框
        })
        // console.log(app.globalData._imgPath)
        app.globalData._imgPath != '' ? console.log('The poster is on display ...') : console.log('The poster is being drawn ...')
        //若海报存在临时文件，则直接previewImage，不再重新绘图，提升加载速度
        if (app.globalData._imgPath != '') {  
            wx.previewImage({
                urls: [this.data.postPath]
            });
            return;
        }
        this.setData({
            painting: this.palette()
        })
        showLoading();
    },
    // 海报json配置
    palette() {
        const { avatarUrl, mobile, wechat, company, position, name } = this.data.baseInfo
        let QRcodeStyle = [
            {
                id: 1,
                style:{
                    views: [
                        // {
                        //     "type": "image",
                        //     "url": "https://facing-1256908372.file.myqcloud.com/image/20200908/style.png", // 大背景图
                        //     "css": {
                        //         "width": "700px",
                        //         "height": "926px",
                        //         "top": "0px",
                        //         "left": "0px",
                        //         "rotate": "0",
                        //         "borderRadius": "",
                        //         "borderWidth": "",
                        //         "borderColor": "#ff9b1f",
                        //         "shadow": "",
                        //         "mode": "scaleToFill"
                        //     }
                        // },
                        {
                            "type": "image",
                            "url": avatarUrl,//app.globalData.avatarUrlPath,
                            "css": {
                                "width": "200px",
                                "height": "200px",
                                "top": "602.38px",
                                "left": "440px",
                                "rotate": "0",
                                "borderRadius": "20px",
                                "borderWidth": "2px",
                                "borderColor": "#ffffff",
                                "shadow": "",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "text",
                            "text": name,
                            "css": {
                                "color": "#ffffff",
                                "background": "rgba(0,0,0,0)",
                                "width": "385px",
                                "height": "51.480000000000004px",
                                "top": "602.38px",
                                "left": "53.69999999999999px",
                                "rotate": "0",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#C87756",
                                "shadow": "",
                                "padding": "0px",
                                "fontSize": "36px",
                                "fontWeight": "bold",
                                "maxLines": "1",
                                "lineHeight": "51.94800000000001px",
                                "textStyle": "fill",
                                "textDecoration": "none",
                                "fontFamily": "webfontzk",
                                "textAlign": "left"
                            }
                        },
                        {
                            "type": "text",
                            "text": position,
                            "css": {
                                "color": "#ffffff",
                                "background": "rgba(0,0,0,0)",
                                "width": "400px",
                                "height": "37.18000000000001px",
                                "top": "659.38px",
                                "left": "100.849999999999994px",
                                "rotate": "0",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "padding": "0px",
                                "fontSize": "24px",
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
                            "text": company||'--',
                            "css": {
                                "color": "#ffffff",
                                "background": "rgba(0,0,0,0)",
                                "width": "536px",
                                "height": "42.839999999999996px",
                                "top": "710.12px",
                                "left": "53.51999999999998px",
                                "rotate": "0",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "padding": "0px",
                                "fontSize": "28px",
                                "fontWeight": "normal",
                                "maxLines": "6",
                                "lineHeight": "43.512px",
                                "textStyle": "fill",
                                "textDecoration": "none",
                                "fontFamily": "",
                                "textAlign": "left"
                            }
                        },
                        {
                            "type": "text",
                            "text": mobile||'--',
                            "css": {
                                "color": "#ffffff",
                                "background": "rgba(0,0,0,0)",
                                "width": "333px",
                                "height": "42.89999999999999px",
                                "top": "790px",
                                "left": "92.68px",
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
                        },
                        {
                            "type": "text",
                            "text": wechat||'--',
                            "css": {
                                "color": "#ffffff",
                                "background": "rgba(0,0,0,0)",
                                "width": "400px",
                                "height": "42.89999999999999px",
                                "top": "850px",
                                "left": "95.67000000000002px",
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
                                "textDecoration": "",
                                "fontFamily": "",
                                "textAlign": "left"
                            }
                        },
                        {
                            "type": "image",
                            "url": "../../imgs/fffwx.png",  //微信
                            "css": {
                                "width": "28px",
                                "height": "28px",
                                "top": "855px",
                                "left": "53.51999999999998px",
                                "rotate": "6.14",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "image",
                            "url": "../../imgs/fffP.png", //手机号
                            "css": {
                                "width": "28px",
                                "height": "28px",
                                "top": "795px",
                                "left": "53.51999999999998px",
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
                            "url": `../../imgs/modleBg9.png`,
                            "css": {
                                "width": "600px",
                                "height": "500px",
                                "top": "30px",
                                "left": "50.04999991280692px",
                                "rotate": "0.4472326507772311",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "zIndex": "-9999",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "image",
                            "url": `${app.API_HOST}card/genQRCode/beid/${app.globalData.beid}/cardId/${app.globalData.cardId}/token/${app.globalData.token}`,
                            "css": {
                                "width": "300px",
                                "height": "300px",
                                "top": "150px",
                                "left": "200.04999991280692px",
                                "rotate": "0.4472326507772311",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "text",
                            "text": `微信扫一扫或长按小程序码查看详情`,
                            "css": {
                                "color": "#000000",
                                "background": "rgba(0,0,0,0)",
                                "width": "600px",
                                "height": "42.89999999999999px",
                                "top": "80px",
                                "left": "100.67000000000002px",
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
                        },
                    ]
                }
            },
            {
                id: 2,
                style:{
                    views: [
                        {
                            "type": "image",
                            "url": "https://facing-1256908372.file.myqcloud.com/image/20200908/style1.png", // 大背景图
                            "css": {
                                "width": "700px",
                                "height": "926px",
                                "top": "0px",
                                "left": "0px",
                                "rotate": "0",
                                "borderRadius": "0px",
                                "borderWidth": "",
                                "borderColor": "#ff9b1f",
                                "shadow": "",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "image",
                            "url": `../../imgs/modleBg9.png`,
                            "css": {
                                "width": "612px",
                                "height": "850px",
                                "top": "30px",
                                "left": "43px",
                                "rotate": "0.4472326507772311",
                                "borderRadius": "20px",
                                "borderWidth": "2px",
                                "borderColor": "#eeeeee",
                                "shadow": "",
                                "zIndex": "-9999",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "image",
                            "url": avatarUrl,//app.globalData.avatarUrlPath,
                            "css": {
                                "width": "200px",
                                "height": "200px",
                                "top": "80.38px",
                                "left": "400px",
                                "rotate": "0",
                                "borderRadius": "20px",
                                "borderWidth": "2px",
                                "borderColor": "#6E9EFF",
                                "shadow": "",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "image",
                            "url": `../../imgs/nameBg.png`,
                            "css": {
                                "width": "300px",
                                "height": "100px",
                                "top": "120.38px",
                                "left": "42.5px",
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
                                "color": "#ffffff",
                                "background": "rgba(0,0,0,0)",
                                "width": "385px",
                                "height": "51.480000000000004px",
                                "top": "145px",
                                "left": "60px",
                                "rotate": "0",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#C87756",
                                "shadow": "",
                                "padding": "0px",
                                "fontSize": "35px",
                                "fontWeight": "bold",
                                "maxLines": "1",
                                "lineHeight": "51.94800000000001px",
                                "textStyle": "fill",
                                "textDecoration": "none",
                                "fontFamily": "webfontzk",
                                "textAlign": "left"
                            }
                        },
                        {
                            "type": "text",
                            "text": position,
                            "css": {
                                "color": "#B5B5B5",
                                "background": "rgba(0,0,0,0)",
                                "width": "400px",
                                "height": "37.18000000000001px",
                                "top": "240px",
                                "left": "90.69999999999999px",
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
                            "text": company||'--',
                            "css": {
                                "color": "#000000",
                                "background": "rgba(0,0,0,0)",
                                "width": "536px",
                                "height": "42.839999999999996px",
                                "top": "560px",
                                "left": "90px",
                                "rotate": "0",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "padding": "0px",
                                "fontSize": "32px",
                                "fontWeight": "normal",
                                "maxLines": "6",
                                "lineHeight": "43.512px",
                                "textStyle": "fill",
                                "textDecoration": "none",
                                "fontFamily": "",
                                "textAlign": "left"
                            }
                        },
                        {
                            "type": "text",
                            "text": mobile||'--',
                            "css": {
                                "color": "#575757",
                                "background": "rgba(0,0,0,0)",
                                "width": "333px",
                                "height": "42.89999999999999px",
                                "top": "380px",
                                "left": "140.69999999999999px",
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
                        },
                        {
                            "type": "text",
                            "text": wechat||'--',
                            "css": {
                                "color": "#575757",
                                "background": "rgba(0,0,0,0)",
                                "width": "400px",
                                "height": "42.89999999999999px",
                                "top": "460px",
                                "left": "140.69999999999999px",
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
                                "textDecoration": "",
                                "fontFamily": "",
                                "textAlign": "left"
                            }
                        },
                        {
                            "type": "image",
                            "url": "../../imgs/bluewx.png",  //微信
                            "css": {
                                "width": "40px",
                                "height": "40px",
                                "top": "460px",
                                "left": "90.69999999999999px",
                                "rotate": "6.14",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "image",
                            "url": "../../imgs/blueP.png", //手机号
                            "css": {
                                "width": "40px",
                                "height": "40px",
                                "top": "380px",
                                "left": "90.69999999999999px",
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
                            "url": `${app.API_HOST}card/genQRCode/beid/${app.globalData.beid}/cardId/${app.globalData.cardId}/token/${app.globalData.token}`,
                            "css": {
                                "width": "150px",
                                "height": "150px",
                                "top": "660px",
                                "left": "80.04999991280692px",
                                "rotate": "0.4472326507772311",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "mode": "scaleToFill"
                            }
                        },
                        {
                            "type": "text",
                            "text": `长按识别小程序码查看详情`,
                            "css": {
                                "color": "#000000",
                                "background": "rgba(0,0,0,0)",
                                "width": "600px",
                                "height": "42.89999999999999px",
                                "top": "700px",
                                "left": "280.67000000000002px",
                                "rotate": "0",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "padding": "0px",
                                "fontSize": "28px",
                                "fontWeight": "700",
                                "maxLines": "1",
                                "lineHeight": "43.290000000000006px",
                                "textStyle": "fill",
                                "textDecoration": "none",
                                "fontFamily": "",
                                "textAlign": "left"
                            }
                        },
                        {
                            "type": "text",
                            "text": "分享自 ["+this.data.shop_Name+"]",
                            "css": {
                                "color": "#C0C0C0",
                                "background": "rgba(0,0,0,0)",
                                "width": "600px",
                                "height": "42.89999999999999px",
                                "top": "750px",
                                "left": "280.67000000000002px",
                                "rotate": "0",
                                "borderRadius": "",
                                "borderWidth": "",
                                "borderColor": "#000000",
                                "shadow": "",
                                "padding": "0px",
                                "fontSize": "26px",
                                "fontWeight": "normal",
                                "maxLines": "1",
                                "lineHeight": "43.290000000000006px",
                                "textStyle": "fill",
                                "textDecoration": "none",
                                "fontFamily": "",
                                "textAlign": "left"
                            }
                        },
                    ]
                }
            }
        ]
        let background = ''
        if(this.data.pf_id == 1){
            background = "rgba(0,0,0,0.2)"
        }else if(this.data.pf_id == 0){
            background = "linear-gradient(to bottom, #3574FA 100%,#3F9AFB 50%)"
        }
        return {
            "width": "700px",
            "height": "926px",
            "background": background,
            "borderRadius": "",
            "views": QRcodeStyle[parseInt(this.data.pf_id)].style.views
        }
    },
    eventGetImage(e) {
        hideLoading()
        wx.previewImage({
            urls: [e.detail.path]
        });
        this.data.postPath = e.detail.path
        app.globalData._imgPath = e.detail.path
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
            cancelAuth: true
        })
    },
    _cancelAuth() {
        this.setData({
          cancelAuth: false
        })
    },
    getAutoReplyMsg() {
        let params = {
            url: app.API_HOST + "Chat/getAutoReplyMsg",
            data: {
                cardId: app.globalData.cardId
            }
        }
        fetchApi(this, params).then(res => {

            let total, showCover, data = res.data.data;

            data.notReadTotal ? total = parseInt(data.notReadTotal) : total = 0;
            this.data.menuSetting["留言"].notReadTotal = total;
            if (data) {
                let oldMsg = app.globalData.oldMsg[app.globalData.cardId];
                if (!oldMsg) {
                    oldMsg = {
                        id: -100,
                        time: 0
                    }
                }

                let bool = !this.data.ready&&parseInt(data.id) !== parseInt(oldMsg.id);
                this.data.ready = false
                let msg = "";
                try {
                    let newData = JSON.parse(data.auto_reply_desc);
                    if (newData.type === "text") {
                        msg = newData.content;
                    } else if (newData.type === "image") {
                        msg = "[图片]";
                    } else if (newData.type === "official") {
                        msg = `[官网]${newData.title}`;
                    } else if (newData.type === "shop") {
                        msg = `[商品]${newData.title}`;
                    } else if (newData.type === "info") {
                        msg = `[资讯]${newData.title}`;
                    }
                } catch (e) {
                    msg = data.auto_reply_desc;
                }


                this.setData({
                    "autoReplay.id": parseInt(data.id) || '',
                    "autoReplay.avatar": data.avatar || '',
                    "autoReplay.nickname": data.name || '',
                    "autoReplay.msg": msg || '',
                    "autoReplay.total": total,
                    menuSetting: this.data.menuSetting,
                    showCover: app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId && (bool),
                    later: false
                });
               
                if (bool) {

                    app.globalData.oldMsg[app.globalData.cardId] = {
                        id: parseInt(res.data.data.id),
                        time: Number(new Date()) + 10 * 60 * 1000
                    }

                }

            } else {
                this.setData({
                    "autoReplay.total": 0,
                    menuSetting: this.data.menuSetting
                })
            }

        }).catch(res => {
            console.log(res, "error");
        })
    },

    reply(e) {
        if (this.data.hasBindPhone) {
            this.realReply()
        } else {
            getPhoneNumber(e).then(res => {
                res && this.setData({ hasBindPhone: true })
                this.realReply()
            }).catch(err=>{
                this.realReply()
            })
        }
    },

    realReply() {

        let params = {
            url: app.API_HOST + "Chat/send",
            data: {
                uid: app.globalData.uid,
                toUser: this.data.baseInfo.uid,
                cardId: app.globalData.cardId,
                content: this.data.message
            }
        }
        if (!this.data.messageSending) {
            this.setData({
                messageSending: true,
            })

            fetchApi(this, params).then(res => {
                this.setData({
                    messageSending: false,
                    message: "",
                    showCover: false,
                    later: false
                })
            }).catch(res => {
                console.log(res, "error");
            })
        }
    },

    toOrderList() {
        nav({
            url: '/pages/personal/personal'
        })
    },

    toCardList() {
        wx.reLaunch({
            url: '/pages/cardList/cardList',
        })
    },

    toDistribution() {
        nav({
            url: '/distribution/distributionCenter/distributionCenter'
        })
    },

    toOpenCard() {
        nav({
            url: '/centerControl/cardApplication/cardApplication'
        })
    },

    navCustomerList() {
        if (this.data.isCurrentCardManage) {
            nav({
                url: '/centerControl/customerList/customerList'
            })
        }
    },

    getVideoList() {
        this.data.loading = true;
        let params = {
            url: app.API_HOST + "card/getCardVideoInfoByCardId",
            data: {
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data.list;
            let total = res.data.data.total
            this.setData({
                videoList: this.data.pageIndex === 1 ? data : this.data.videoList.concat(data),
                hasMore: data.length >= this.data.pageSize,
                showStyle: 1
            });
            this.data.loading = false;
        }).catch(res => {
            console.log(res);
            this.setData({
                showStyle: 1
            })
            this.data.loading = false;
        });
    },

    getMoreVideo() {
        if (!this.data.loading) {
            this.data.pageIndex++;
            this.getVideoList();
        }
    },

    getShortVideoList() {
        this.data.shortloading = true;
        let params = {
            url: app.API_HOST + "ShortVideo/getShortVideoList",
            data: {
                pageSize: this.data.shortpageSize,
                pageIndex: this.data.shortpageIndex,
                type: -1
            }
        }
        fetchApi(this, params).then(res => {
            // console.log(res)
            let data = res.data.data.shortVideoList;
            let total = res.data.data.total
            this.setData({
                shortVideoList: this.data.shortpageIndex === 1 ? data : this.data.shortVideoList.concat(data)
            });
            this.data.shortloading = false;
        }).catch(res => {
            console.log(res);
            this.data.shortloading = false;
        });
    },

    getMoreShortVideo() {
        if (!this.data.shortloading) {
            this.data.shortpageIndex++;
            this.getShortVideoList();
        }
    },

    toVideoDetail(e) {
        let params = {
            url: "/pages/videoDetail/videoDetail",
            data: {
                id: e.currentTarget.dataset.id
            }
        }
        nav(params);
    },

    toshortVideoDetail(e) {
        let params = {
            url: "/shortVideo/shortvideoDetail/shortvideoDetail",
            data: {
                id: e.currentTarget.dataset.id
            }
        }
        nav(params);
    },

    navService(e) {
        let page = e.currentTarget.dataset.page,
            id = e.currentTarget.dataset.id
        let params = {
            url: `/pages/${page}/${page}`
        }
        if (page === "bbs") {
            params.data = {
                weNeedToShowBBS: true
            }
        }
        if (['marketWheel', 'marketScratch', 'marketSlotMachine', 'marketShake', 'marketFruitMachine', 'marketEgg'].indexOf(page) > 0) {
            params.data = {
                id: id
            }
        }
        nav(params);
    },

    getDistributionInfo() {
        this.getShopConfig().then(res => {
            let open = parseInt(res.open_distribution || 0)
            this.setData({
                staff_func_control: res.staff_func_control || 0,
                home_page_contact_open_main: res.home_page_contact_open == 1 ? true : false,
            })
            if (open) {
                let params = {
                    url: app.API_HOST + "distribution/getShopDistributionList",
                    data: {
                        pageSize: 10
                    }
                }
                fetchApi(this, params).then(res => {
                    this.setData({
                        distributionInfo: (res.data.data || []).sort(),
                        open_distribution: open
                    });
                }).catch(res => {
                    console.log("error: ", res);
                })
            }
            // 新增获取分销baner 开关 + 添加联系我开关
            this.getBannerStatus();
        });
    },

    getShopConfig() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "config/get",
                data: {}
            }
            fetchApi(this, params).then(res => {
                let data = res.data.data;
                resolve(data);
            }).catch(res => {
                reject(res);
            });
        })
    },

    getPhoneChat() {
        if (!this.data.baseInfo.toChat) {
            showTips('很遗憾，不能获取自己的手机号哦~~', this)
            return;
        }
        if (app.globalData.cardUid && app.globalData.cardUid != app.globalData.uid) {
            let data = {
                content: {
                    type: "text",
                    msg_type: 4,
                    message: '您好，看了您的名片想要和您沟通方便透露您的手机号吗?'
                }
            }
            nav({
                url: '/pages/chat/chat',
                data: {
                    toUid: app.globalData.cardUid,
                    phoneToSend: JSON.stringify(data)
                }
            })
        } else if (!app.globalData.cardUid) {
            this.getInfoBeforeToChat();
        }
    },

    getInfoBeforeToChat() {
        this.toGetCardInfo().then(res => {
            app.globalData.cardUid = res.data.data.admin_uid;
            this.toChat();
        }).catch(res => {
            console.log(res);
        })
    },

    toGetCardInfo() {
        return new Promise((resolve, reject) => {
            let param = {
                url: 'card/getCardInfo',
                data: {
                    cardId: app.globalData.cardId
                }
            }
            fetchApi(this, param).then(res => {
                resolve(res);
            }).catch(res => {
                reject(res);
            });
        })
    },
    getHomeGoodsInfo() {
        let param = {
            url: 'card/getHomeGoodsInfo',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data
            let _data = data.info.map(item => {
                item.label = item.label ? JSON.parse(item.label) : item.label
                return item
            })
            let len = _data.length;
            let n = 2; //假设每行显示4个
            let lineNum = len % n === 0 ? len / n : Math.floor((len / n) + 1);
            let info = [];
            for (let i = 0; i < lineNum; i++) {
                let temp = _data.slice(i * n, i * n + n);
                info.push(JSON.parse(JSON.stringify(temp)));
            }

            this.setData({
                recommendList: info,
                openRecommend: parseInt(data.is_open),
                recommendTitle: data.title
            })
        }).catch(err => {
            console.log(err)
        });
    },

    getGoodsRecommend() {
        let param = {
            url: 'Card/getCardRecommendGoodsList',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            let _data = res.data.data.goodsInfo
            let len = _data.length;
            let n = 2; //假设每行显示4个
            let lineNum = len % n === 0 ? len / n : Math.floor((len / n) + 1);
            let info = [];
            for (let i = 0; i < lineNum; i++) {
                let temp = _data.slice(i * n, i * n + n);
                info.push(JSON.parse(JSON.stringify(temp)));
            }

            this.setData({
                goodsrecommendList: info,
                openGoodsRecommend: Number(res.data.data.is_open),
                goodsrecommendTitle: res.data.data.model_name
            })
        })
    },

    getInfoRecommend() {
        let param = {
            url: 'Card/getCardRecommendInformationList',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            let _data = res.data.data.goodsInfo
            let len = _data.length;
            let n = 2; //假设每行显示4个
            let lineNum = len % n === 0 ? len / n : Math.floor((len / n) + 1);
            let info = [];
            for (let i = 0; i < lineNum; i++) {
                let temp = _data.slice(i * n, i * n + n);
                info.push(JSON.parse(JSON.stringify(temp)));
            }

            this.setData({
                inforecommendList: info,
                openInfoRecommend: Number(res.data.data.is_open),
                inforecommendTitle: res.data.data.model_name
            })
        })
    },

    navServiceMore() {
        nav({
            url: '/pages/serviceCommodityList/serviceCommodityList'
        })
    },
  navGoodsMore () {
    nav({
      url: '/pages/goodsList/goodsList'
    })
  },
  navInfoMore () {
    nav({
      url: '/pages/news/news'
    })
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

    handleNavToGoodsDetail(e) {
        const { id } = e.currentTarget.dataset;
        nav({
            url: '/pages/goodsdetail/goodsdetail',
            data: {
                id
            }
        });
    },

    handleNavToInfoDetail(e) {
        const { id } = e.currentTarget.dataset;
        nav({
            url: '/pages/contentDetail/contentDetail',
            data: {
                id
            }
        });
    },

    getUseAuthorize(e) {
        const { userInfo } = e.detail
        if (userInfo) {
            getUserInfo(this, userInfo).then(e => {
                this.navPersonal()
            })
        } else {
            showTips('授权失败')
        }
    },

    getSwiperContent() {
        const params = {
            url: 'CarouselImage/getCarouselImage',
            data: {
                status: 1
            }
        }
        fetchApi(this, params).then(res => {
            const { info } = res.data.data;
            let list = info.filter(i => i.link_live_type.indexOf('1') != -1)
            let swiperContent = list.filter(ele => {
                if (ele.link_type == 0) {
                    return ele.shopGoods && ele.shopGoods.status == 1
                } else if (ele.link_type == 3) {
                    return ele.live_name != ''
                } else if (ele.link_type == 4) {
                    return ele.shopPage
                } else {
                    return ele.event_param
                }
            })
            this.setData({
                swiperContent: swiperContent,
                swiperShow: false
            });
            setTimeout(() => {
                this.setData({
                    swiperShow: swiperContent.length > 0
                });
            }, 300)
        }).catch(err => {
            console.log('error: ', err);
        });
    },
    
    handleSwiperClick(e) {
        const {linkType,roomId,url, eventparam} = e.currentTarget.dataset
        switch (parseInt(linkType) ) {
            case 3:
                wx.navigateTo({
                    url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}`
                })
                break
            case 5:
                this.navigateToMiniProgram(eventparam)
                break
            case 6:
                let latitude = Number(eventparam.lnglat.split(',')[1]),
                    longitude = Number(eventparam.lnglat.split(',')[0]),
                    address = eventparam.address || '';
                openLocation(latitude, longitude, address);
                break
            case 7:
                nav({
                    url: '/pages/contentDetail/contentDetail',
                    data: { id: eventparam.id }
                })
                break
            case 8:
                this.navigateToWebView(eventparam)
                break
            case 9:
                nav({
                    url: `/pages/${eventparam.eventType}/${eventparam.eventType}`,
                    data: { id: eventparam.id }
                })
                break
            case 10:
                makePhoneCall(eventparam.phone)
                break
            case 11:
                nav({
                    url: '/pages/couponDetail/couponDetail',
                    data: { id: eventparam.id }
                })
                break
            case 12:
                nav({
                    url: '/pages/goodsList/goodsList',
                    data: eventparam
                })
                break
            default:
                nav({ url })
        }
    },
    
    navigateToWebView(eventParam) {
        let url = eventParam.url
        var urlArr = url.split('?')
        if (urlArr[1]) {
            let newArr = [];
            let parameter = urlArr[1].split('&')
            parameter.forEach(item => {
                newArr.push(item.split('=')[0], item.split('=')[1])
            })
            eventParam.url = urlArr[0]
            eventParam.parameter = JSON.stringify(newArr)
        }
        nav({
            url: '/pages/webView/webView',
            data: eventParam
        });
    },

    navigateToMiniProgram(param) {
        wx.navigateToMiniProgram({
            appId: param.id,
            path: param.path || '',
            fail: err => {
                showModal({
                    title: "打开错误"
                })
            }
        })
    },

    navPersonal() {
        nav({
            url: '/pages/personal/personal'
        })
    },

    receivePosterCredit(credit) {
        let param = {
            url: app.API_HOST + 'userCredit/receivePosterCredit',
            data: {
                fromCardId: app.globalData.cardId,
                credit: credit
            }
        }
        fetchApi(this, param).then(res => {
            showToast('领取积分成功', 'success')
        }).catch(err => {
            console.log(err, 'err')
        })
    },
    
    navAddWechat() {
        const { name, avatarUrl, qyStaffDetail: { corp_name } } = this.data.baseInfo
        nav({
            url: '/centerControl/addentErpriseWechat/addentErpriseWechat',
            data: {
                status: 1,
                name,
                avatarUrl,
                corp_name
            }
        })
    },

    formatCardInfo(self) {
        var param = {
            url: 'card/getCardInfo',
            data: {
                cardId: app.globalData.cardId
            }
        }
        fetchApi(self, param).then(res => {
            self.setData({
                pf_id: res.data.data.pf_id
            })
            var data = res.data.data;
            if (!parseInt(data.mobile_is_show)) {
                data.mobile = data.mobile.replace(data.mobile.substring(3, 7), "****")
            }
            // https头像地址转为本地临时文件
            wx.downloadFile({
                url: data.avatar_url,
                success: res => {
                    app.globalData.avatarUrlPath = res.tempFilePath
                }
            })
            var baseInfo = {
                company_jc: data.company_jc,
                company_bm: data.company_bm,
                company_logo: data.company_logo,
                avatarUrl: data.avatar_url,
                company: data.company,
                record_is_show: data.record_is_show,
                address: JSON.parse(data.addresses),
                lnglat: data.lnglats,
                email: data.email, 
                mobile: data.mobile,
                mobile_is_show: parseInt(data.mobile_is_show),
                toChat: app.globalData.cardId != 0 && app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId,
                name: data.name,
                position: data.position,
                wechat: data.wechat,
                uid: data.uid,
                pf_id: data.pf_id,
                shareUrl: data.sharePath,
                openShopCard: data.open_shop_card,
                card_share_desc: data.card_share_desc,
                cardSharePath: data.cardSharePath,
                card_ext_info: data.card_ext_info,
                qyStaffDetail: data.qyStaffDetail
            }
            var mediaInfo = {
                description: data.description,
                descriptionArr: data.description.split('\n'),
                hasVoice: parseInt(data.has_voice),
                voiceUrl: data.voice_url,
                voicePlayCount: data.voicePlayCount.voice_play_count,
                imageList: data.image_list,
            }
            // 特殊办法，占空行处理
            for (var i = 0; i < mediaInfo.descriptionArr.length; i++) {
                if (mediaInfo.descriptionArr[i] == '') {
                    mediaInfo.descriptionArr[i] = '　　'
                }
            }
    
            app.globalData.cardUid = data.admin_uid;
            if (app.globalData.currentLoginUserCardInfo.mobile) {
                self.setData({
                    hasBindPhone: true
                });
            }
            let ThemeColor = '';
            switch (data.style_id) {
                case "2":
                    ThemeColor = '#d33939'
                    break;
                case "3":
                    ThemeColor = '#1f94fd'
                    break;
                default:
                    ThemeColor = '#fd9a33'
                    break;
            };
            self.data.menuSetting["留言"].toUid = baseInfo.uid;
            //const titleFromTabbar = getTitleFromTabbar(self)
            let titleFromTabbar;
            self.setData({
                baseInfo: baseInfo,
                mediaInfo: mediaInfo,
                tag: data.tag || [],
                isCurrentCardManage: app.globalData.cardId == app.globalData.currentLoginUserCardInfo.cardId ? 1 : 0,
                newMsgCount: data.newMsgCount || 0,
                openTechSupport: data.open_tech_support,
                techSupportText: data.tech_support_text,
                menuSetting: self.data.menuSetting,
                'diyConfig.themeColor': ThemeColor,
                'diyConfig.isWhiteBC': data.style_id == '2' ? false : true,
                styleId: data.style_id || 0,
                imageShowStyle: data.image_show_style ? parseInt(data.image_show_style) : 2,
                //titleFromTabbar
                showStyle: 1
            })
    
            // Bill 动态标题
            if (titleFromTabbar) {
                wx.setNavigationBarTitle({
                    title: titleFromTabbar
                })
            } else if (app.globalData.cardId == app.globalData.currentLoginUserCardInfo.cardId){
                wx.setNavigationBarTitle({
                    title: '我的名片'
                })
            } else {
                wx.setNavigationBarTitle({
                    title: self.data.baseInfo.name+'的名片'
                })
            }
    
            if (data.style_id == '2') {
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: '#1a1a1a',
                    animation: {
                        duration: 400,
                        timingFunc: 'easeIn'
                    }
                })
                if (wx.canIUse('setBackgroundColor')) {
                    wx.setBackgroundColor({
                        backgroundColor: '#1a1a1a',
                    })
                }
            } else if (data.style_id == '1' || data.style_id == '3') {
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: '#f7f7f7',
                    animation: {
                        duration: 400,
                        timingFunc: 'easeIn'
                    }
                })
                if (wx.canIUse('setBackgroundColor')) {
                    wx.setBackgroundColor({
                        backgroundColor: '#f7f7f7',
                    })
                }
            } else {
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: '#2b3541',
                    animation: {
                        duration: 400,
                        timingFunc: 'easeIn'
                    }
                })
    
                if (wx.canIUse('setBackgroundColor')) {
                    wx.setBackgroundColor({
                       backgroundColor: '#2b3541',
                    })
                }
            }
            this.getLikeInfo();
            const { cdk_card_expire } = data
            if (cdk_card_expire == 1) {
                const { isCurrentCardManage, diyConfig } = self.data
                isCurrentCardManage ? wx.showModal({
                    title: '提示',
                    content: '您的名片已过期，请重新绑定CDKey',
                    showCancel: false,
                    confirmText: '去绑定',
                    confirmColor: diyConfig.themeColor,
                    success: res => {
                        if (!res.confirm) return
                        nav({
                            url: '/centerControl/extendByCDKey/extendByCDKey',
                            data: {
                                hasBind: true
                            }
                        })
                    }
                }) : wx.showModal({
                    title: '提示',
                    content: '您进入的名片已过期',
                    showCancel: false,
                    confirmText: '返回列表',
                    confirmColor: diyConfig.themeColor,
                    success: res => {
                        if (!res.confirm) return
                        wx.reLaunch({
                            url: '/pages/cardList/cardList'
                        })
                    }
                })
            }
        }).catch(err => {
            console.log(err);
            self.setData({
                showStyle: 3
            })
        })
    },

    getLikeInfo() {
        fetchApi(this, {
            url: 'card/getLikeInfo',
            data: {
                card_id: app.globalData.cardId
            }
        }).then(res => {
            this.setData({
                likeInfo: res.data.data,
            })
        }).catch(_ => {
            this.setData({
                showStyle: 3
            })
        })
    },

    getPhoneNumber(e) {
        const { baseInfo } = this.data
        getPhoneNumber(e).then(_ => {
            addPhoneContact(baseInfo)
            this.setData({
                hasPhoneNumber: true
            })
        }).catch(err => {
            wx.showModal({
                title: '提示',
                content: err,
                showCancel: false
            })
            baseInfo.mobile_is_show && addPhoneContact(baseInfo)
        })
    },

    copyText(e) {
        const { type } = e.currentTarget.dataset
        const { baseInfo } = this.data
        if (!baseInfo[type]) {
            showTips('复制内容为空')
            return;
        }
        wx.setClipboardData({
            data: baseInfo[type],
            success: _ => {
                showToast('复制成功', 'success');
                addActionLog(this, {
                    type: eventType[type],
                })
            }
        })
    },

    copyExtension(e) {
        const { value, title } = e.currentTarget.dataset
        if (!value) {
            showTips('复制内容为空');
            return;
        }
        wx.setClipboardData({
            data: value,
            success: _ => {
                showToast('复制成功', 'success');
                addActionLog(this, {
                    type: 47,
                    title
                })
            }
        })
    },

    openLocation(e) {
        const { index } = e.currentTarget.dataset
        const lnglat = this.data.baseInfo.lnglat[index]
        wx.openLocation({
            latitude: lnglat[1],
            longitude: lnglat[0],
            name: this.data.baseInfo.address[index],
            success: _ => _,
            fail: _ => _,
            complete: _ => _
        })
    }
})

function selectBless(that) {
    if (that.dataStore.bless) {
        that.dataStore.bless.getOnLineActivity()
    } else {
        that.dataStore.bless = that.selectComponent('#bless')
        if (that.dataStore.bless) {
            that.dataStore.bless.getOnLineActivity()
        }
    }

}

function getServiceSetting(self) {
    var param = {
        url: 'config/getServiceSetting',
        data: {
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data
        //判断服务入口
        let count = 0
        data.forEach(item => {
            if (item.is_open == true) {
                count += 1
            }
        })
        self.setData({
            count: count,
            controlPanel: data
        })
    }).catch(err => {

    })
}

