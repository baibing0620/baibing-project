const app = getApp();

import { nav } from "../../utils/util";
import { fetchApi, getPhoneNumber, getGlobalConfig, checkAvatar, getUserProfile } from '../../api/api.js'
import { disSubscribe, subscribe } from './../../utils/publisher'

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        color: {
            type: String,
            value: '#1F94FD'
        },
        setting: {
            type: Object,
            observer: 'bindSettingChange'
        },
        showShareModal: {
            type: Boolean,
            value: false
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        extConfig: app.extConfig,
        avatar_url: '',
        isAvatarReady: false,
        showCover: false,
        linkOpen: false,
        linkUrl: '',
        home_page_chat_model_change: false,
        has_add_wechat: false,
        notReadTotal: 0,
        map: [
            { name: "购物车", title: "", iconfont: "icon-gouwuche2" },
            { name: "留言", title: "", notReadTotal: 0 },
            { name: "个人中心", title: "", iconfont: "icon-gerenzhongxin" },
            { name: "管理中心", title: "", iconfont: "icon-shezhi" },
            { name: "分享", title: "", iconfont: "icon-share" }
        ],
        tmplIds: [],
        homeTmplIds: [],
        userProfileAble: app.globalData.userProfileAble
    },
    interval: null,
    value: {},

    /**
     * 组件的方法列表
     */
    methods: {
        bindSettingChange(newVal) {
            if (this.interval) clearInterval(this.interval);
            if (this.timeout) clearTimeout(this.timeout);
            let lock = false;
            if (!(app.globalData.currentLoginUserCardInfo && app.globalData.currentLoginUserCardInfo.cardId) || app.globalData.cardId == 0) {
                // 等一手 currentLoginUserCardInfo.cardId 如果压根没有，就没法判断拿没拿到，所以就等30s （令人窒息的操作
                this.timeout = setTimeout(() => {
                    clearInterval(this.interval);
                }, 30000);
                this.interval = setInterval(() => {
                    let haslogin = app.globalData.currentLoginUserCardInfo && parseInt(app.globalData.currentLoginUserCardInfo.cardId || 0);
                    let hasCard = parseInt(app.globalData.cardId);
                    if (hasCard || haslogin) {
                        if (!haslogin && lock) return;
                        lock = true;
                        this.check(newVal);
                    } else {
                        return;
                    }
                    if (hasCard && haslogin) {
                        clearTimeout(this.timeout);
                        clearInterval(this.interval);
                    }
                }, 300);
            };
            this.check(newVal);
        },

        check(newVal) {
            this.data.value = newVal;
            let map = this.data.map.concat([]);
            for (let i in newVal) {
                let index = map.findIndex(value => { return i === value.name });
                let rule = true
                //针对基础版本库为2.0.9以下做兼容
                if (index == 1) {
                    rule = app.globalData.currentLoginUserCardInfo && app.globalData.cardId && app.globalData.cardId != 0 && app.globalData.currentLoginUserCardInfo.cardId != app.globalData.cardId
                }
                else if (index == 3) {
                    rule = app.globalData.currentLoginUserCardInfo && app.globalData.cardId && app.globalData.currentLoginUserCardInfo.cardId != 0 && app.globalData.currentLoginUserCardInfo.cardId == app.globalData.cardId
                }
                map[index].show = rule || false;
            }

            // TODO 留言数量
            // <-- 留言 特殊处理 -->
            if (newVal["留言"]) {
                this.data.notReadTotal = newVal["留言"].notReadTotal || 0;
                !newVal["留言"].dontNeedToGetTotal && this.getAutoReplyMsg();
            }
            // <-- end -->

            this.setData({
                map: map,
                hasBindPhone: app.globalData.currentLoginUserCardInfo.mobile ? true : false,
                notReadTotal: this.data.notReadTotal
            });
        },

        actions(e) {
            let name = e.currentTarget.dataset.name; 
            let data = this.data.setting[name];
            switch (name) {
                case "购物车":
                    nav({ url: "/pages/myCart/myCart" });
                    break;
                case "留言":
                    this.pullSubscribe()
                    this.bindChat(e, data);
                    break;
                case "个人中心":
                    this.pullHomeSubscribe()
                    nav({ url: "/pages/personal/personal" });
                    break;
                case "管理中心":
                    nav({ url: "/pages/centralControl/centralControl" });
                    break;
                case "分享":
                    this.showShareModel(e, data);
                    break;
                default:
                    return;
            }
        },

        bindChat(e, data) {
            if (data.from) {
                this.triggerEvent('nav')
            }

            nav({
                url: '/pages/chat/chat',
                data: {
                    toUid: data.toUid || app.globalData.cardUid,
                }
            });
        },

        showOpenSetting(e){
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
        
        showShareModel() {
            this.setData({
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
          console.log(this.data.setting,'data.setting')
            let imageUrl = this.data.setting["分享"].image;
          console.log(imageUrl,'imageUrl')
            let url = `${imageUrl.indexOf(`${app.API_HOST}`) < 0 ? app.API_HOST : ''}${imageUrl}${imageUrl.indexOf("?") < 0 ? '?' : '&'}`;        
            console.log(url,'url')
            let query = {
                token: app.globalData.token,
                beid: app.globalData.beid,
                cardId: app.globalData.cardId
            }
            this.setData({
                showCover: true,
                showShareModal: false
            });
            console.log(`${url}${this.jsonToQuery(query)}`,888888888)
            this.getImageInfo(`${url}${this.jsonToQuery(query)}`)
        },

        getImageInfo(url) {
            wx.getImageInfo({
                src: url,
                success: (res) => {
                    this.setData({
                        shareImageUrl: res.path
                    })
                },
                fail: (err) => {
                    this.getImageInfo(url)
                    console.log(err)
                }
            })
        },

        jsonToQuery(json) {
            let arr = [];
            for (let key in json) {
                arr.push(`${key}=${json[key]}`);
            }
            return arr.join("&");
        },

        coverHide() {
            this.setData({
                showCover: false
            });
        },

        handleAvatarisReady() {
            this.setData({
                isAvatarReady: true
            })
        },

        getPhoneNumber(e) {
            getPhoneNumber(e).then(res => {
                res && this.setData({ hasBindPhone: true });
                this.bindChat(e, this.data.setting["留言"]);
            }).catch(err => {
                wx.showToast({
                    title: err,
                    icon: 'none',
                    mask: true,
                    duration: 1500
                })
                setTimeout(() => {
                    this.bindChat(e, this.data.setting["留言"]);
                }, 1500)
            })
        },

        getAutoReplyMsg() {
            const params = {
                url: app.API_HOST + "Chat/getAutoReplyMsg",
                data: {
                    cardId: app.globalData.cardId
                }
            }
            fetchApi(this, params).then(res => {
                let total, data = res.data.data;
                data.notReadTotal ? total = parseInt(data.notReadTotal) : total = 0;
                this.setData({
                    notReadTotal: total
                });
            }).catch(res => {
                console.log(res, "error");
            })
        },

        getCardAvatar(data) {
            const params = {
                url: app.API_HOST + "card/getCardInfo",
                data: {
                }
            }
            fetchApi(this, params).then(res => {
                const { data } = res.data;
                const { avatar_url } = data;
                this.setData({ avatar_url });
            }).catch(res => {
                console.log(res, "error");
            })
        },
        getUserInfo(e) {
            console.log(e,123456)
            this.triggerEvent('getUserInfo', e.detail)
        },
        getUserProfile() {

            getUserProfile().then(res => {
                // this.triggerEvent('getUserInfo', res)
                nav({ url: "/pages/personal/personal" });
            }).catch(err => {
                console.log(err ,'err')
            })
        },
        getStaffFuncManageSetting() {
          
          let params = {
            url: app.API_HOST + "config/getStaffFuncManageSetting",
            data: {}
          }
          fetchApi(this, params).then(res => {
            let { home_page_chat_model_change_main, staff_func_control } = this.data;
            this.setData({
              home_page_chat_model_change: staff_func_control == 1 ? res.data.data.home_page_chat_model_change : home_page_chat_model_change_main,
              has_add_wechat: res.data.data.has_add_wechat == 1 ? true : false
            });
          }).catch(res => {
            console.log('error: ', res);
          })
        },
        navAddWechat() {
            // this.pullSubscribe()
          nav({
            url: '/centerControl/addentErpriseWechat/addentErpriseWechat',
            data: {
              status: 2
            }
          })
        },
        getSubscribe() {
            fetchApi(this, {
                url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
                data: {
                    tpl_msg_type: '11, 14'
                }
            }).then(_res => {
                const self = this
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
                        self.setData({
                            tmplIds: tmplIds
                        })
                    }
                })
            }).catch(e => console.log(e))
        },
        getHomeSubscribe() {
            let param = {
                url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
                data: {
                    tpl_msg_type: '13'
                }
            }
            let that = this
            fetchApi(that, param).then(_res => {
                console.log(_res)      
                if (_res.data.data.length > 0) {
                    let setList = []
                    wx.getSetting({
                        withSubscriptions:true,
                        success (res) {
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
                                homeTmplIds: tmplIds
                            })
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
        pullSubscribe() {
            if (app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId) {
                // 非自己的订阅
                const tmplIds = this.data.tmplIds
                const that = this
                if (tmplIds.length > 0){
                    if (wx.requestSubscribeMessage){
                        wx.requestSubscribeMessage({
                            tmplIds: tmplIds,
                            success (res) {
                            },
                            fail(err) {
                                console.log(err)
                            },
                            complete(res) {
                                that.getSubscribe()
                            }
                        })
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '当前微信版本过低，无法使用订阅消息功能，请升级到最新微信版本后体验。'
                        })
                    }
                }
                return
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
        pullHomeSubscribe() {
            if (app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId) {
                const tmplIds = this.data.homeTmplIds
                const that = this
                if (tmplIds.length > 0 ){
                    if (wx.requestSubscribeMessage){
                        wx.requestSubscribeMessage({
                            tmplIds: tmplIds,
                            success (res) {
                                let keys = Object.keys(res)
                                let values = Object.values(res)
                                let templateIds = ''
                                values.forEach((element,index) => {
                                    if (element == 'accept') {
                                        templateIds += index == 0 ? keys[index] : ',' + keys[index]
                                    }
                                });
                                if (templateIds != '') {
                                    that.addUserTplMsg(templateIds)
                                }
                            },
                            complete(res) {
                                that.getHomeSubscribe(that)
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
    },

    lifetimes: {
        attached() {
            subscribe('cardInfo', val => {
                const { avatar_url } = val
                this.setData({ avatar_url })
            }, `menu_${this['__wxExparserNodeId__']}`)

            this.setData({
                getAuthorInfo: !checkAvatar(app.globalData.userInfo.avatar)  ,
                showPersonal: app.tabBarPath.indexOf('/pages/personal/personal') == -1
            })
          
            getGlobalConfig().then(res => {
              this.setData({
                home_page_chat_model_change_main: app.globalConfig.home_page_chat_model_change,
                staff_func_control: app.globalConfig.staff_func_control
              })
              this.getStaffFuncManageSetting();
            })
            this.getSubscribe()
            this.getHomeSubscribe()
        },

        detached() {
            disSubscribe(`menu_${this['__wxExparserNodeId__']}`)
        }
    },

    pageLifetimes: {
        show() {
          getGlobalConfig().then(res => {
            this.setData({
              home_page_chat_model_change_main: app.globalConfig.home_page_chat_model_change,
              staff_func_control: app.globalConfig.staff_func_control
            })
            this.getStaffFuncManageSetting();
          })
            this.setData({
                getAuthorInfo: !checkAvatar(app.globalData.userInfo.avatar),
                showPersonal: app.tabBarPath.indexOf('/pages/personal/personal') == -1
            });
            this.data.value["留言"] && !this.data.value["留言"].dontNeedToGetTotal && this.getAutoReplyMsg();
        }
    }
})
