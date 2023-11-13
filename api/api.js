import { showTips, showToast, hideLoading, setCurrentLoginUserCardInfo, nav} from '../utils/util'
import RequestPool from './requestPool'
import globalInit from '../utils/global'

const app = getApp()
globalInit()
const { API_HOST, WSManager } = app
const postLen = 1
const noNeedLoginURLs = ['user/wxLogin', 'config/get', 'index/getTimeLimitGoods', 'foodIndex/foodList', 'content/contentList', 'content/detail', 'shopIndex/shopIndex', 'category/categoryList', 'category/goodsList', 'goods/getQRcode', 'coupon/couponsOfShop', 'businessIndex/index', 'holiday/getholidaylist', 'hotel/hotelDetail', 'hotel/getRoomWithTime', 'branch/getBranchListNew', 'groupBuy/groupBuyGoodsList', 'editor/getTplPageSimple', 'notice/getShopNoticeInfo', 'bbs/getArticleList', 'bbs/getIndex', 'branch/getCategoryList', 'address/getCityName', 'card/genWeChatQrCode', 'XLFCommunity/getCommunityGroup', 'card/getCardInfo', 'config/getServiceSetting', 'card/getCardVideoConfig', 'distribution/getShopDistributionList', 'card/getLikeInfo', 'card/getCardVideoInfoByCardId', 'card/getHomeGoodsInfo'];

const requestPool = new RequestPool({
    LOGIN_URL: `${API_HOST}User/login`,
    LOGIN_PARAMS: { beid: app.globalData.beid },
    TOKEN_KEY: `loginInfo${app.globalData.beid}`,
    DONT_NEED_TOKEN_URLS: noNeedLoginURLs,      // @TODO 免登录目前并没有用
    ERR_CODE_CONFIG: {
        'TOKEN_EXPIRED': -10,
        'SESSION_KEY_EXPIRED': -20,
    },
    // CALLBACK
    loginSuccess: res => {
        const { cardId, token, userInfo, hasAuthorized } = res
        app.globalData.token = token
        setCurrentLoginUserCardInfo({
            cardId,
            hasAuthorized,
            ...userInfo
        }, true)
        WSManager.updateToken(token)
        if (WSManager.status === "close" || WSManager.status === "error") {
            WSManager.init({
                host: app.wsAPIHost,
                token: token
            })
        }
    },
    loginFail: err => {
        hideLoading();
        const { msg, errMsg } = err
        wx.showModal({
            title: '提示',
            content: `${msg || '登录失败'}`,
            showCancel: false
        })
        console.log('err: ', err)
    }
})

export  const { request } = requestPool

export function fetchApi(page, params = { url, data: {} }, method = 'POST', isHideToast = true) {
    return new Promise((resolve, reject) => {
        const { beid, cardId, fromUser } = app.globalData
        const { url, data } = params
        try { 
            for (let key in data) {
                const value = data[key]
                typeof (value) === 'object' && (data[key] = JSON.stringify(value))
            }
        } catch (err) {
            console.log('error: ', err)
        }
        request(`${API_HOST}${url.replace(API_HOST, '')}`, {
            beid,
            cardId,
            fromUser,
            ...data,
            '_t': new Date().getTime()
        }, method).then(data => {
            wx.stopPullDownRefresh()
            resolve({ data })
            checkUserInfo(page)
            if (!isHideToast) return
            hideLoading()
            wx.hideToast()
        }).catch(err => {
            wx.stopPullDownRefresh()
            reject({data: err})
            console.log('请求出错: ', err)
            const { code, msg, errMsg } = (err || { code: '', msg: '网络错误' })
            switch (code) {
                case -10:
                    break
                case -20:
                    break
                case -100:
                    wx.showModal({
                        title: '提示',
                        content: msg || '网络错误',
                        showCancel: false
                    })
                    break
                default:
                    errMsg ? showError(page) : showTips(msg || '网络错误', page) 
                    return
            }
        })
    })
}

function showError (page) { 
    page.setData({
        showStyle: 3
    })
    wx.showToast({
        mask: false,
        title: '网络错误',
        icon: 'none',
        duration: 1500
    });
}

const avatarHostsMap = [ 'https://wx.qlogo.cn', 'https://thirdwx.qlogo.cn', 'https://facing-1256908372.file.myqcloud.com' ] 

export function checkAvatar (url = '') {
    const { userInfo } = app.globalData
    return userInfo.hasAuthorized == 1
}

let checkUserInfoTime = 0
let isGettingUserInfo = false
function checkUserInfo(page) {
    if (isGettingUserInfo) return
    isGettingUserInfo = true
    const { userInfo } = app.globalData
    if (!page
        || !page.setData
        || !page.route
        || checkUserInfoTime > new Date().getTime()
        || (
            userInfo
            && userInfo.avatar
            && checkAvatar(userInfo.avatar)
    )) {
        if (userInfo && userInfo.avatar && checkAvatar(userInfo.avatar)) {
            app.globalData.authorizationUserInfo = true
        }  else {
            app.globalData.authorizationUserInfo = false
        }
        // 强制授权手机号判断
        wx.getStorage({
            key: `userInfo${app.globalData.beid}`,
            success: res => {
                const { data } = res
                if (data && data.mobile) {
                    app.globalData.authorizationMobile=true
                } else {
                    app.globalData.authorizationMobile=false
                }
                if(page && page.route && !(app.globalData.authorizationUserInfo && app.globalData.authorizationMobile)) {
                    compulsoryAuthorization(page,false)
                }
            },
            fail: _ => {
                app.globalData.authorizationMobile = false
                if(page && page.route && !(app.globalData.authorizationUserInfo && app.globalData.authorizationMobile)) {
                    compulsoryAuthorization(page,false)
                }
            }
        })
        isGettingUserInfo = false
        return
    }
    // 第一次进入不弹授权
    if (checkUserInfoTime == 0){
        checkUserInfoTime = new Date().getTime() + 0.1 * 60 * 1000
        isGettingUserInfo = false
        return
    }
    
    // 如果需要获取用户信息
    wx.getStorage({
        key: `userInfo${app.globalData.beid}`,
        success: res => {
            const { data } = res
            if (data && data.mobile) {
                app.globalData.authorizationMobile=true
            } else {
                app.globalData.authorizationMobile=false
                isGettingUserInfo = false
            }
            if (data && data.avatar && checkAvatar(data.avatar)) {
                app.globalData.userInfo = data
                app.globalData.authorizationUserInfo = true
                setCurrentLoginUserCardInfo(data)
                // return
            } else {
                app.globalData.authorizationUserInfo = false
                isGettingUserInfo = false
            }
            if(page && page.route) {
                compulsoryAuthorization(page, !app.globalData.authorizationUserInfo)
            }
            // showGetUserInfo(page)
        },
        fail: _ => {
            app.globalData.authorizationUserInfo = false
            app.globalData.authorizationMobile = false
            isGettingUserInfo = false
            if(page && page.route) {
                compulsoryAuthorization(page,true)
            }
            // showGetUserInfo(page)
        }
    })
}
let authorizationPage = ''
function compulsoryAuthorization(page, authorization) {
    const config = app.globalConfig
    // console.log(config)
    if (config){
        if (authorizationPage != '' && authorizationPage == page.route ) {
            return
        } else {
            authorizationPage = page.route
        }
        page.setData({
          shopImg: config.thumb_url || app.globalData.shopImg,
          openAuthorization: config.open_authorization=='1'?true:false,
          openAuthorizationType: config.open_authorization_type,
          userProfileAble: app.globalData.userProfileAble
        })
        if (config.open_authorization=='1') {
            // 开了强制授权
            if (!app.globalData.authorizationUserInfo && config.open_authorization_type.indexOf('1') != -1) {
                wx.hideTabBar()
                page.setData({
                    showAuthorizationUserInfo: true,
                    showAuthorizationUserPhone: false
                })
            } else if (!app.globalData.authorizationMobile && config.open_authorization_type.indexOf('2') != -1) {
                wx.hideTabBar()
                page.setData({
                    showAuthorizationUserInfo: false,
                    showAuthorizationUserPhone: true
                })
            }

            page.setAuthorzieUserProfile = e => {  //强制授权用户昵称 getUserProfile兼容
                wx.getUserProfile({
                    desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                    success: (res) => {
                        const { userInfo } = res
                        getUserInfo(null, userInfo).then(res => {
                            if (!app.globalData.authorizationMobile && page.data.openAuthorizationType.indexOf('2') != -1) {
                                page.setData({
                                    showAuthorizationUserInfo: false,
                                    showAuthorizationUserPhone: true
                                })
                            } else {
                                authorizationPage = ''
                                wx.showTabBar()
                                page.setData({
                                    showAuthorizationUserInfo: false,
                                    showAuthorizationUserPhone: false
                                })
                            }
                        })
                    },
                    fail: (err) => {
                        showToast('请允许授权,否则无法使用小程序!', 'none')
                    }
                })
            }
            page.setAuthorizationUserInfo = e => {
                const { userInfo } = e.detail
                if (userInfo) {
                    getUserInfo(null,userInfo).then(res => {
                        // 继续手机号授权
                        if (!app.globalData.authorizationMobile && page.data.openAuthorizationType.indexOf('2') != -1) {
                            page.setData({
                                showAuthorizationUserInfo: false,
                                showAuthorizationUserPhone: true
                            })
                        } else {
                            authorizationPage = ''
                            wx.showTabBar()
                            page.setData({
                                showAuthorizationUserInfo: false,
                                showAuthorizationUserPhone: false
                            })
                        }
                    })
                } else {
                    showToast('请允许授权,否则无法使用小程序!', 'none')
                }
            }
            page.setAuthorizationUserPhoneNumber = e => {
                console.log(e)
                getPhoneNumber(e).then(_ => {
                    authorizationPage = ''
                    wx.showTabBar()
                    page.setData({
                        showAuthorizationUserInfo: false,
                        showAuthorizationUserPhone: false
                    })
                })
            }
        } else if(authorization) {
            authorizationPage = ''
            showGetUserInfo(page)
        }
    } else {
        getGlobalConfig(page)
    }
}

export function getUserProfile(desc) {
    return new Promise((resolve, reject) => {
        const { userInfo } = app.globalData
        if (userInfo && userInfo.avatar && checkAvatar(userInfo.avatar)) {
            resolve(userInfo)
        } else {
            wx.getUserProfile({
                desc: desc || '用于完善用户资料',  // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                success: (res) => {
                    const { userInfo } = res
                    getUserInfo(null, userInfo).then(res => {
                        resolve(userInfo)
                    })
                },
                fail: (err) => {
                    console.log(err)
                    reject()
                }
            })
        }
    })
}


function showGetUserInfo(page) {

    page.setData({
        showGetUserInfo: true,
        shopImg: app.globalData.shopImg,
        userProfileAble: app.globalData.userProfileAble
    })
    page.getUserProfile = e => {    //新版本兼容
        wx.getUserProfile({
            desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                const { userInfo } = res
                getUserInfo(page, userInfo).then(res => {
                    page.setData({
                        globalData: app.globalData
                    })
                })
            },
            fail: (err) => {
                showTips('授权失败')
                isGettingUserInfo = false
            },
            complete: _ => {
                page.setData({
                    showGetUserInfo: false
                })
                checkUserInfoTime = new Date().getTime() + 0.1 * 60 * 1000
            }
        })
    }
    page.getUserInfo = e => {
        page.setData({
            showGetUserInfo: false
        })
        checkUserInfoTime = new Date().getTime() + 0.1 * 60 * 1000
        const { userInfo } = e.detail
        if (userInfo) {
            getUserInfo(page, userInfo).then(res=>{
              page.setData({
                globalData: app.globalData
              })
            })
         
        } else {
            showTips('授权失败')
            isGettingUserInfo = false
        }
    },
    page.noLogin = res => {
        page.setData({
            showGetUserInfo: false
        })
        checkUserInfoTime = new Date().getTime() + 0.1 * 60 * 1000
        isGettingUserInfo = false
        nav({
            url: '/centerControl/loginAgreement/loginAgreement'
        })
    }
}

export function getUserInfo(page, userInfo) {
    return new Promise((resolve, reject) => {
        isGettingUserInfo = true
        userInfo.avatarUrl.charAt(4) == "s" ? 
            console.log('头像地址是https: ',userInfo.avatarUrl) :
            userInfo.avatarUrl = "https:"+userInfo.avatarUrl.split(":")[1]
        const data = {
            avatar: userInfo.avatarUrl || '',
            nickname: userInfo.nickName || '',
            country: userInfo.country || '',
            province: userInfo.province || '',
            city: userInfo.city || '',
            gender: userInfo.gender || ''
        }
        fetchApi(page, {
            url: 'User/userInfoAuthorize',
            data,
        }).then(res => {
            const { data } = res.data
            app.globalData.userInfo = data
            setCurrentLoginUserCardInfo(data, true)
            isGettingUserInfo = false
            resolve()
        }).catch(res => {
            isGettingUserInfo = false
            reject()
            console.log('error: ', res)
        })
    })
}
// selectedOrderId 购物车多选的第二个 orderid
export function wxpay(page, formId = null, orderId,selectedOrderId = 0) {
    const param = {
        url: app.API_HOST + 'order/wxpay',
        data: {
            orderId: orderId,
            formId: formId,
            selectedOrderId: selectedOrderId
        }
    };
    const wxpayPromise = new Promise(function (resolve, reject) {
        fetchApi(page, param).then((res) => {
            const payParam = res.data.data;
            wx.requestPayment({
                'timeStamp': payParam.timeStamp,
                'nonceStr': payParam.nonceStr,
                'package': payParam.package,
                'signType': payParam.signType,
                'paySign': payParam.paySign,
                success: function (_res) {
                    wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 1000,
                        success: function (_res) {
                            resolve(res);
                        }
                    });
                },
                fail: function (error) {
                    console.log('支付失败', error)
                    reject(error)
                }
            });
        }).catch((e) => {
            console.log('获取支付信息失败', e)
            reject(e)
        });
    });
    return wxpayPromise;
}

export function getGlobalConfig(page) {
    const params = {
        url: app.API_HOST + 'config/get',
        data: {}
    };
    return new Promise(function (resolve, reject) {
        fetchApi(page, params).then(res => {
            app.globalConfig = res.data.data;
            resolve(res);
        }).catch(err => {
            reject(err)
        });
    })
}

export function addActionLog(page, obj) {
    obj.cardId = app.globalData.cardId;
    if ((app.globalData.currentLoginUserCardInfo &&
        app.globalData.currentLoginUserCardInfo.cardId == obj.cardId) || obj.cardId <= 0) {
        console.log('不需要发送事件');
        return;
    }

    obj.time = parseInt((new Date().getTime()) / 1000);
    if (!obj.detail) {
        obj.detail = {};
    }
    if (obj.detail.duration == undefined) {
        obj.detail.duration = 0;
    }
    app.globalData.actionLogs.push(obj);
    if (app.globalData.actionLogs.length >= postLen && !app.globalData.isPosting) {
        postActionLog(page);
    }
}

export function postActionLog(page) {
    const { length: len } = app.globalData.actionLogs;
    const param = {
        url: 'CardEvent/addEvent',
        data: {
            cardId: app.globalData.cardId,
            detail: JSON.stringify(app.globalData.actionLogs)
        }
    }
    app.globalData.isPosting = true;
    fetchApi(page, param, 'POST', false).then(res => {
        app.globalData.actionLogs.splice(0, len);
        app.globalData.isPosting = false;
    }).catch(err => {
        app.globalData.isPosting = false;
        console.log('事件上报失败：', err)
    })
    // 本地统计下事件，弹出“添加小程序”的提醒用
    app.eventCount(page);
}

export function getCardInfo(_this = 'app') {
    return new Promise((resolve, reject) => {
        const params = {
            url: 'card/getCardInfo',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(_this, params).then(res => {
            resolve(res.data.data)
            app.globalData.cardInfo = res.data.data
        }).catch(res => {
            console.error(res)
            reject(res)
        });
    });
}

export function getPhoneNumber(e) {
    return new Promise((resolve, reject) => {
        const { code } = e.detail
        console.log(code,"code")
        if (!code) {
            reject('授权手机号失败')
        }
        const param = {
            url: app.API_HOST + 'vip/getPhoneNumberNew',
            data: {
                code:code
            }
        }
        fetchApi(self, param, 'POST').then((res) => {
            const { phoneNumber } = res.data.data.phone_info
            if (!phoneNumber) {
                reject('获取手机号失败')
                return
            }
            resolve(phoneNumber)
            setCurrentLoginUserCardInfo({
                mobile: phoneNumber
            }, true)
        }).catch(err => {
            console.log('err');
            reject(err)
        })
    })
}

export function addPhoneContact(data) {
    addActionLog('app', {
        type: 8,
    })
    wx.addPhoneContact({
        firstName: data.name,
        lastName: '',
        mobilePhoneNumber: data.mobile,
        weChatNumber: data.wechat,
        organization: data.company,
        email: data.email,
        success: () => { },
        fail: err => {
            console.log('err: ', err)
            wx.showToast({
                title: err.msg || '存入通讯录失败',
                icon: 'none',
                duration: 1500
            });
        }
    })
}


export function getEffectiveCardIdByOriginal() {
    return new Promise((resolve, reject) => {
        fetchApi(this, {
            url: 'Card/getMyTraceCard',
            data: {}
        }).then(res => {
            const cardId = res.data.data
            app.globalData.isCloseCardList = Boolean(cardId)
            resolve({
                cardId
            })
        }).catch(res => {
            console.error(res)
            reject(res)
        })
    }) 
}

export function getEffectiveCardId() {
    return new Promise((resolve, reject) => {
        fetchApi(this, {
            url: 'Card/getJumpCardId',
            data: {}
        }).then(res => {
            const { cardId, is_open_cardlist } = res.data.data
            app.store.isOpenCardList = !!~~is_open_cardlist
            app.globalData.isCloseCardList = !Boolean(is_open_cardlist)
            const { cardId : myCardId } = app.globalData.currentLoginUserCardInfo
            resolve({
                is_open_cardlist: !Boolean(is_open_cardlist),//app.store.isOpenCardList,
                cardId,
                myCardId
            })
        }).catch(res => {
            console.error(res)
            reject(res)
        })
    }) 
}