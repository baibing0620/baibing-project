import { nav } from "../../utils/util";
import { fetchApi, setCurrentLoginUserCardInfo,getPhoneNumber } from '../../api/api.js'; 
import {
    couponBoxHide
} from '../../map.js';
const app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        toUser: String || Number,
    },

    /**
     * 组件的初始数据
     */
    data: {
        show: false,
        avatar: "",
        nickname: "",
        message: "",
        hasBindPhone: false,
        couponBoxShowIf: false,
        couponList: [],
        hideCoupon: 0
    },

    /**
     * 组件的方法列表
     */
    methods: {
        toChat(e) {
            if (this.data.hasBindPhone) {
                this.navToChat();
            } else {
                getPhoneNumber(e).then(phoneNumber => {
                    if (phoneNumber!='') {
                      this.setData({
                          hasBindPhone: true
                      })
                      this.navToChat();
                    } else {
                      this.navToChat();
                    }
                  }).catch(err => {
                    showTips('手机号获取失败', this)
                  })
            }
        },
        navToChat() {
            nav({
                url: "/pages/chat/chat",
                data: {
                    toUid: this.data.fromUser,
                    cardId: this.data.cardId
                }
            })
        },

        receiveNewMsg(val) {
            let value = Array.isArray(val) ? val[val.length - 1] : val;
            if (!value) return;
            if ((parseInt(value.from_user) === parseInt(this.data.toUser || -1) && parseInt(value.card_id) === parseInt(app.globalData.cardId)) || parseInt(value.from_user) === parseInt(app.globalData.uid || -1)) return;
            clearTimeout(this.timer);
            try {
                let content = JSON.parse(value.content);
                if (content.type === "text") {
                    this.data.message = content.content;
                } else if (content.type === "image") {
                    this.data.message = "[图片]";
                } else if (content.type === "info") {
                    this.data.message = "[资讯]";
                } else if (content.type === "shop") {
                    this.data.message = "[商品]";
                } else if (content.type === "service") {
                    this.data.message = "[服务]";
                } else if (content.type === "official") {
                    this.data.message = "[官网]";
                }
            } catch (err) {
                this.data.message = value.content || "";
            }
            this.data.fromUser = value.fromUser.id;
            this.data.cardId = value.card.id;
            this.setData({
                avatar: value.avatar_url || "",
                nickname: value.name  || "",
                message: this.data.message || "",
                show: true
            });
            this.timer = setTimeout(() => {
                this.setData({
                    show: false
                });
            }, 3000);
        },

        navToMall() {
            this.closeCouponBox()
            nav({
                url: '/pages/mall/mall'
            })
        },
        closeCouponBox() {
            this.setData({
                couponBoxShowIf: false,
                couponList: []
            })
            app.globalData.hasCouponSocket = []
        },

        getObtainCoupon(val) {
            console.log(val,'vallll')
            if (!val) return;
            val.total = 1
            if (this.data.hideCoupon) {
                var couponArr = app.globalData.hasCouponSocket
                if (!couponArr.length) {
                    app.globalData.hasCouponSocket.push(val)
                } else {
                    let ans = false
                    couponArr.forEach(item => {
                        if (item.id == val.id) {
                            item.total++
                            ans = true
                        }
                    })
                    if(!ans) {
                        couponArr.push(val)
                    }
                    app.globalData.hasCouponSocket = couponArr
                }
                return
            }
            this.data.couponList.push(val);
            console.log(app.globalData.hasCouponSocket,'app.globalData.hasCouponSocket')
            this.setData({
                couponBoxShowIf: true,
                couponList: this.data.couponList
            })
            console.log(this.data.couponList, 'couponList')
            
        },
        getComerPackCoupon (val) {
            console.log(val, 'getComerPackCoupon val')
            if (!val) return;
            if (this.data.hideCoupon) {
                var couponArr = app.globalData.hasCouponSocket
                if (!couponArr.length) {
                    app.globalData.hasCouponSocket = app.globalData.hasCouponSocket.concat(val)
                } else {
                    var newArr = []
                    val.forEach(i => {
                        let ans = false;
                        couponArr.forEach(j => {
                            if (j.id == i.id) {
                                j.total++;
                                ans = true;
                            }
                        })
                        if (!ans) {
                            newArr.push(i)
                        }
                    })
                    app.globalData.hasCouponSocket = couponArr.concat(newArr)
                }
                return
            }
            let coupon = this.data.couponList.concat(val);
            this.setData({
                couponBoxShowIf: true,
                couponList: coupon
            })
        },

        WSRequest() {
            return {
                receiveNewMsg: (res) => {
                    this.receiveNewMsg(res);
                },
                obtainNewcomerPackCoupon: (res) => {
                    this.getComerPackCoupon(res)  
                },
                obtainCoupon: (res) => {
                    this.getObtainCoupon(res);
                } 
                
            }
        }
    },

    pageLifetimes: {
        show() {
            app.WSManager.initGlobleMessageResHandle(this.WSRequest());
            if (app.globalData.currentLoginUserCardInfo.mobile && !this.data.hasBindPhone) {
                this.setData({
                    hasBindPhone: true
                });
            } else if (!app.globalData.currentLoginUserCardInfo.mobile && this.data.hasBindPhone) {
                this.setData({
                    hasBindPhone: false
                });
            }
            
            const currentPages = getCurrentPages()
            if (couponBoxHide.includes(currentPages[0].route) ) {
                this.setData({
                    hideCoupon: 1
                })
            }

            if (app.globalData.hasCouponSocket.length && this.data.hideCoupon != 1) {
                
                this.setData({
                    couponList: app.globalData.hasCouponSocket,
                    couponBoxShowIf: true,
                })
                //既然展示了 就把数据释放掉 防止在其他页面触发
                app.globalData.hasCouponSocket = []
            }
        },
        hide() {
            app.WSManager.initGlobleMessageResHandle();
        }
    }
})