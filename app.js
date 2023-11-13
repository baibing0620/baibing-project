import extConfig from './extConfig'
import { WSManager } from './api/webSocket'
import { pageData } from './utils/pageData'
import store from './utils/store'
import { publish } from './utils/publisher'

const updateManager = wx.getUpdateManager ? wx.getUpdateManager() : null

App({
    API_HOST: extConfig['apiHost'],
    name: extConfig['name'],
    wsAPIHost: extConfig['wsAPIHost'],
    HOMEPAGE_URL: '/pages/home/home',
    pageId: extConfig['pageId'],
    tplId: extConfig['tplId'],
    activityId: extConfig['activityId'],
    link: extConfig['link'] || {},
    WSManager: new WSManager(),     // webSocket
    pageData: new pageData(),       // pageData
    globalData: store({
        _imgPath: '',
        showNoMsg_ai:'',
        avatarUrlPath:'', // canvas 头像
        beid: extConfig['beid'],
        appName: extConfig['name'],
        shopImg: extConfig['shopImg'],
        token: '',
        cardId: {
            Value: '',
            AfterChange: (val, oldVal) => val !== oldVal && publish('cardId', val)
        },
        cardInfo: {
            Value: {},
            AfterChange: val => publish('cardInfo', val)
        },
        userInfo: {
            Value: {},
            AfterChange: val => publish('userInfo', val)
        },
        systemInfo: {
            Value: {},
            AfterChange: val => publish('systemInfo', val)
        },
        menuButtonClientRect: {
            Value: {},
            AfterChange: val => publish('menuButtonClientRect', val)
        },
        cardUid: 0,
        uid: 0,
        userInfo: {},
        pagesInfo:{},
        fromUser: 0,
        currentLoginUserCardInfo: {
            cardId: 0,
            mobile: ''
        },
        coupon: null,
        deliveryPrice: null,
        orderDetailNeedRefresh: 0,
        goodsList: [], //为选着优惠券做的全局变量
        formIdList: [],
        actionLogs: [],
        hasCouponSocket: [], //websocket优惠券
        isPosting: false,
        distributorId: 0,
        channelId: 0,
        windowWidth: 0,
        getCardInfo: null,
        permission: [],
        refresh: false,
        needToShowRemind: false,
        eventCount: 0,
        oldMsg: {}, //主页消息弹窗用,
        showBless:false, //立即提现跳转到home页面，自动打开福袋
        messagePushTag:[],//消息推送选择标签
        cartList: [],
        saveGoodsData:{},
        isIphoneX:false,
        authorizationUserInfo: false, // 是否授权了用户信息
        authorizationMobile: false, // 是否授权了手机号
        userProfileAble: false,        //是否有新授权的能力
        pageOption: ''  //链接跳转底部栏 参数存放
    }),
    tabBarPath: [],
    globalConfig: null,
    extConfig: {
        topBC: 'url(https://facing-1256908372.file.myqcloud.com/image/20180815/8750984891391f22.jpg?imageView2/1/w/750/h/360)',
        'themeColor': extConfig['mainColor'],
        'version': extConfig['version'],
        'navigationBarBC': extConfig['navigationBarBackgroundColor'],
        'navigationBarColor': extConfig['navigationBarTextStyle'],
        'isWhiteBC': true
    },

    isUsingApp: {
        onOpen: false,
        onShow: false,
        status: 0
    },

    store: store({
        isOpenCardList: {
            Value: 0,
            AfterChange: val => publish('isOpenCardList', val)
        }
    }),

    showRemind(page) {
        if (this.globalData.eventCount >= 5 && this.globalData.needToShowRemind !== page.data.showRemind) {
            page.setData({
                showRemind: this.globalData.needToShowRemind
            })
        }
    },

    eventCount(_this) {

        if (this.globalData.eventCount < 5) {
            this.globalData.eventCount++;
            if (this.globalData.eventCount >= 5) {
                this.getNeedToShowRemind().then(res => {
                    if (res) {
                        this.globalData.needToShowRemind = res;
                        _this.setData({
                            showRemind: true
                        })
                    }
                })
            }
        }
    },

    getNeedToShowRemind() {
        return new Promise((resolve, reject) => {
            let params = {
                url: this.API_HOST + "card/isTipShow",
                data: {
                    uid: this.globalData.uid,
                    beid: this.globalData.beid,
                    token: this.globalData.token
                }
            }
            wx.request({
                url: params.url,
                data: params.data,
                method: 'GET',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: (res) => {
                    resolve(parseInt(res.data.data) === 1);
                },
                fail: (res) => {
                    console.log(res);
                }
            })
        })
    },

    setConnetStatuc(status) {
        try {
            if (parseInt(this.isUsingApp.status) === parseInt(status)) {
                return
            } else {
                this.isUsingApp.status = parseInt(status);
            }
            this.WSManager.send({
                action: "WS/user/setConnectStatus",
                data: {
                    status: this.isUsingApp.status
                }
            })
        } catch (err) {
            console.log("[setConnetStatuc] error: ", error);
        }
    },

    WSRequest() {
        return {
            onOpen: () => {
                this.isUsingApp.onOpen = true;
                if (this.isUsingApp.onShow) {
                    this.setConnetStatuc(1);
                } else {
                    this.setConnetStatuc(0);
                }
            },
            onClose: () => {
                this.isUsingApp.onOpen = false;
                this.isUsingApp.status = 0;
            },
            onError: () => {
                this.isUsingApp.onOpen = false;
                this.isUsingApp.status = 0;
            }
        }
    },

    getSystemInfoTimer: null,

    getSystemInfo() {
        try {
            this.getSystemInfoTimer && clearTimeout(this.getSystemInfoTimer)
            const { windowWidth, model, statusBarHeight } = this.globalData.systemInfo = wx.getSystemInfoSync()
            const { top, bottom, left, right, height, width } = wx.getMenuButtonBoundingClientRect()
            const ratio = 750 / windowWidth
            this.globalData.menuButtonClientRect = {
                top: top * ratio,
                bottom: bottom * ratio,
                left: left * ratio,
                right: right * ratio,
                height: height * ratio,
                width: width * ratio
            }
            this.globalData.isIphoneX = !!~model.search('iPhone X')
            this.globalData.windowWidth = windowWidth

            // TODO !自适应导航栏 准备废弃
            this.globalData.statusBarHeight = statusBarHeight;
            this.globalData.getMenuButtonBoundingClientRect = bottom + top - (statusBarHeight * 2); //基本都为44，但还是自适应一下
            
            if (top <= 0) throw Error('高度异常')
        } catch (error) {
            console.error('getSystemInfo_Error: ', error)
            this.getSystemInfoTimer = setTimeout(_ => this.getSystemInfo(), 1000)
        }
    },

    shareAddVipLog() {
        let params = {
            url: this.API_HOST + "VipNew/shareAddVipGrowLog",
            data: {
                uid: this.globalData.uid,
                beid: this.globalData.beid,
                token: this.globalData.token
            }
        }
        wx.request({
            url: params.url,
            data: params.data,
            method: 'GET',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
            },
            fail: (res) => {
            }
        })
    },

    onLaunch: function() {
        this.getSystemInfo()
        wx.onWindowResize && wx.onWindowResize(_ => {
            this.getSystemInfo()
        })

        let tabBarPath = []
        
        Object.keys(extConfig['tabBarSetting']).sort((a, b)=>{
            let _a = a.split("index")[1]
            let _b = b.split("index")[1]
            return _a - _b
        }).map(key => {
            let item = extConfig['tabBarSetting'][key];
            tabBarPath.push('/' + item.pagePath);
            this.tabBarPath = tabBarPath;
        })
        if (updateManager) {
            updateManager.onCheckForUpdate(function(res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function() {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function(res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                }
            })
        }

        try {
            this.WSManager.initGlobleResHandle(this.WSRequest());
            let loginInfo = wx.getStorageSync('loginInfo' + this.globalData.beid);
            if ( loginInfo ) {
                this.WSManager.init({
                    host: this.wsAPIHost,
                    token: loginInfo.token
                });
            }
        } catch (error) {
            console.log("error: ", error);
        }

        try {
            let that = this
            wx.onAppRouteDone(function (data) {
                // 当前页面
                let view = getCurrentPages()[getCurrentPages().length - 1];
                if (view) {
                    if (!view.onShareAppMessage) {
                        return;
                    } else {
                        const oldShare = view.onShareAppMessage
                        view.oldShare = oldShare
                        if (oldShare.toString().indexOf('shareAddVipLog') != -1) {
                            return
                        }
                        view.onShareAppMessage = function (res) {
                            that.shareAddVipLog()
                            return oldShare(res)
                        }
                    }
                }
            })
        } catch (error) {
            console.log("error: ", error);
        }
        this.globalData.userProfileAble = wx.canIUse('getUserProfile')
    },

    onShow() {
        this.isUsingApp.onShow = true;
        if (this.isUsingApp.onOpen) {
            this.setConnetStatuc(1);
        }
    },

    onHide() {
        this.isUsingApp.onShow = false;
        if (this.isUsingApp.onOpen) {
            this.setConnetStatuc(0);
        }
    },
})