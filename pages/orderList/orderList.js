const app = getApp();
import {
    fetchApi,
    wxpay
} from '../../api/api.js';
import {
    nav,
    showLoading,
    getSum,
    showModal,
    showTips,
    showToast,
    showActionSheet
} from '../../utils/util';

Page({
    data: {
        extConfig: app.extConfig,
        activeStatus: 0,
        selfPickUp: 0,
        tabBar: [{
                title: '全部',
                status: 0,
            }, {
                title: '待付款',
                status: 1,
            }, {
                title: '待发货',
                status: 2,
            },
            {
                title: '待取货',
                status: 5,
            },
            {
                title: '待收货',
                status: 3,
            }, {
                title: '待评论',
                status: 4,
            }
        ],
        showStyle: 0,
        loadStyle: 'loadMore',
        orderList: [],
        isOpenComment: 0,
        payLock: false
    },
    dataStore: {
        pageIndex: 1,
        canUseVIP:false
    },

    onLoad: function (options) {
        this.setData({
            activeStatus: options.status ? options.status : 0
        })
        getConfig(this);
        showLoading();
        getData(this);
        getVipInfo(this)

    },
    onReady: function () {

    },
    onShow: function () {
        app.showRemind(this);
        if (app.globalData.transDataToOrderList) {
            let data = app.globalData.transDataToOrderList;
            let index = this.data.orderList.findIndex((item) => {
                return parseInt(item.id) === parseInt(data.id);
            });
            if (index >= 0) {
                this.data.orderList[index] = data;
                this.setData({
                    orderList: this.data.orderList
                });
            }
            app.globalData.transDataToOrderList = "";
        }
    },
    onHide: function () {

    },
    onUnload: function () {

    },
    toOrderDetail(e) {
        nav({
            url: '/pages/orderDetail/orderDetail',
            data: {
                id: e.currentTarget.dataset.id
            }
        })
    },
    onPullDownRefresh: function () {
        showLoading();
        this.dataStore.pageIndex = 1;
        getData(this);

    },
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
        getData(this, true);

    },
    tabChange: function (e) {
        let status = e.currentTarget.dataset.status;
        if (status == this.data.activeStatus) {
            return;
        }

        this.dataStore.pageIndex = 1;
        this.setData({
            activeStatus: status,
            loadStyle: 'loadMore',
        });
        getData(this);
    },
    toComment(e) {
        nav({
            url: "/pages/orderEvaluate/orderEvaluate",
            data: {
                id: e.target.dataset.id
            }
        })
    },
    // 取消订单
    orderCancel(e) {
        let param = {
            url: app.API_HOST + 'orderState/cancel',
            data: {
                id: e.target.dataset.id
            }

        };
        showModal({
            title: '是否取消订单',
            showCancel: true
        }).then(res => {
            fetchApi(this, param).then(res => {
                this.dataStore.pageIndex = 1;
                this.setData({
                    loadStyle: 'loadMore',
                });
                getData(this);
            }).catch(err => {})
        })
    },
    //确认收货
    confirmReceive(e) {
        let param = {
            url: app.API_HOST + 'orderState/confirmGoodsReceipt',
            data: {
                token: app.globalData.token,
                id: e.target.dataset.id,
                formId: e.detail.formId
            }
        };
        showModal({
            title: '是否确认订单',
            showCancel: true
        }).then(res => {
            fetchApi(this, param).then(res => {
                this.dataStore.pageIndex = 1;
                this.setData({
                    loadStyle: 'loadMore',
                });
                getData(this);
            }).catch(err => {})
        })
    },
    //发起支付
    orderPay(e) {
        if (this.data.payLock) {
            return
        }
        this.setData({
            payLock: true
        })
        const { price_credit, id } = e.currentTarget.dataset
        var func_vipPay = ()=>{
            let paramPay = {
                url: app.API_HOST + 'order/vipCardPay',
                data: {
                    orderId: e.currentTarget.dataset.id,
                    formId: e.detail.formId
                }
            }
            fetchApi(this, paramPay).then(resN => {
                showToast('支付成功', 'success', 1500);
                this.dataStore.pageIndex = 1;
                this.setData({
                    loadStyle: 'loadMore',
                    payLock: false
                });
                getData(this);
            }).catch(err => {
                this.setData({
                    payLock: false
                })
            });
        }
        var func_wxpay = ()=>{
            wxpay(this, e.detail.formId, e.currentTarget.dataset.id).then(res => {
                this.dataStore.pageIndex = 1;
                this.setData({
                    loadStyle: 'loadMore',
                    payLock: false
                });
                getData(this);
            }).catch(err => {
                this.setData({
                    payLock: false
                })
            });
        } 
        
        if (e.currentTarget.dataset.paytype == 4) {
            let paramPay = {
                url: app.API_HOST + 'order/creditPay',
                data: {
                    orderId: e.currentTarget.dataset.id,
                    formId: e.detail.formId
                }
            }
            let paramWx = {
                url: app.API_HOST + 'order/creditWxPay',
                data: {
                    orderId: e.currentTarget.dataset.id,
                    formId: e.detail.formId
                }
            }
            if (price_credit != 0) {
                fetchApi(this, paramWx).then(resN => {
                    let data = resN.data;
                    wx.requestPayment({
                        'timeStamp': data.data.timeStamp,
                        'nonceStr': data.data.nonceStr,
                        'package': data.data.package,
                        'signType': data.data.signType,
                        'paySign': data.data.paySign,
                        'success': (res => {
                            fetchApi(this, paramPay).then(resN => {
                                showToast('支付成功', 'success', 1500);
                                this.setData({
                                    loadStyle: 'loadMore',
                                    payLock: false
                                })
                                this.dataStore.pageIndex = 1;
                                getData(this);
                                wx.navigateTo({
                                    url: "/pages/orderDetail/orderDetail?id=" + id + "&payOver=1"
                                })
                            }).catch(err => {
                                console.log(err);
                                showModal({
                                    title: '错误',
                                    content: err.data && err.data.msg ? err.data.msg : '支付失败',
                                })
                                this.setData({
                                    payLock: false
                                })
                            });
                        }),
                        'fail': (res => {
                            console.log(res);
                            this.setData({
                                payLock: false
                            })
                        })
                    })
                }).catch(err => {
                    console.log(err);
                    showModal({
                        title: '错误',
                        content: err.data && err.data.msg ? err.data.msg : '兑换失败',
                    })
                    this.setData({
                        payLock: false
                    })
                });

            } else {
                fetchApi(this, paramPay).then(resN => {
                    showToast('支付成功', 'success', 1500);
                    this.setData({
                        loadStyle: 'loadMore',
                        payLock: false
                    })
                    this.dataStore.pageIndex = 1;
                    getData(this);
                    wx.navigateTo({
                        url: "/pages/orderDetail/orderDetail?id=" + id + "&payOver=1"
                    })
                }).catch(err => {
                    console.log(err)
                    this.setData({
                        payLock: false
                    })
                });
            }
            return;
        } 
        //支付转换
        else if(this.dataStore.canUseVIP){
            showActionSheet({
                itemList: ['微信支付', '会员卡余额支付'],
                itemColor: '#ff9300'
              }).then(resN=>{
                if (resN.tapIndex == 1) {
                    func_vipPay();
                  } else {
                    func_wxpay();
                  }
              }).catch(err => {
                  console.log(err, 'err')
                  this.setData({
                      payLock: false
                  })
              })
        }
        else{
            func_wxpay();
        }
    }
});

function getConfig(self) {
    shopSelfLift(self);
    if (app.globalConfig) {
        self.setData({
            isOpenComment: app.globalConfig.comments_config.isComment
        })
        return
    }
    
    getGlobalConfig(self).then(res => {
        self.setData({
            isOpenComment: app.globalConfig.comments_config.isComment
        })
    }).catch(_ => {})
}
function getVipInfo(self){
    let param = {
        url: app.API_HOST + 'order/getVipInfo',
    };
    fetchApi(self,param).then(res=>{
        var  vipInfo = res.data.data;
        self.dataStore.canUseVIP = (vipInfo.open_vip == 1 && vipInfo.open_online_pay == 1 && vipInfo.open_vip_card == 1);
    }).catch(err=>{})
};

function shopSelfLift(self) {
    let param = {
        url: app.API_HOST + 'shopSelfLift/get',
    };
    fetchApi(self, param).then((res) => {
        let data = res.data.data;
        if (data.is_open == 1) {
            self.setData({
                selfPickUp: data.is_open
            })
        }
    }).catch(err => {})
}

function getData(self, isGetMore = false) {
    let param = {
        url: app.API_HOST + 'order/getOrderList',
        data: {
            ordersType: 1,
            type: self.data.activeStatus,
            pageSize: 6,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }
    };
    fetchApi(self, param).then((res) => {
        if (isGetMore) {
            self.dataStore.pageIndex++
        }
        const data = res.data.data.map(i => {
            i.goodsTotal = parseInt(getSum(i.goods, 'total')) || i.goods.length
            return i
        })
        self.setData({
            loadStyle: data.length < 6 ? 'loadOver' : 'loadMore',
            orderList: isGetMore ? self.data.orderList.concat(data) : data,
        })
        self.setData({
            showStyle: self.data.orderList.length == 0 ? 2 : 1
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });
};