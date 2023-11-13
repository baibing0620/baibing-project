const app = getApp(); // w
import { fetchApi, wxpay,getGlobalConfig } from '../../api/api.js';
import { nav, showLoading, showModal, showTips, showToast, getSum ,shareParam, makePhoneCall,showActionSheet} from '../../utils/util';

Page({ 
    data: { 
        extConfig: app.extConfig,
        payOver:0,
        redPacketUrl: 'https://facing-1256908372.file.myqcloud.com//image/20180124/538937801e7b14e2.png',
        orderDetail: {
            id: 0,
            statusName:''
        },
        dataDelivery:null,
        servicePhone: '',
        redPacketInfo:{
            title:'领取红包'
        },
        creditBoxShowIf: false,
        mainColor: app.extConfig.mainColor,
        payLock: false

    },
    onLoad: function(options) {
        if(options.beid&&app.isMultiShop == 1){
            app.globalData.beid = options.beid;
        }
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            this.setData({
                isFromShare: true
            });
        }
        this.dataStore.orderId = options.id;
        this.dataStore.isFrom = options.isFrom||''
        getInitData(this);
        getConfig(this);
        getVipInfo(this);
        this.setData({
            payOver:options.payOver||0
        })
    },
    dataStore: {
        orderId: 0,
        isFrom:'',
        canUseVIP:false
    },
    onReady: function() {
        wx.hideShareMenu();
    },
    onShow: function() {
        if (app.globalData.orderDetailNeedRefresh==1) {
            getInitData(this);
            app.globalData.orderDetailNeedRefresh==0;
        }
        app.showRemind(this);
    },
    onHide: function() {

    },
    onUnload: function() {

    },
    onPullDownRefresh: function() {
        getInitData(this);
        getConfig(this);
        getVipInfo(this);
    },
    onShareAppMessage: function (res) {
        return {
            title: this.data.redPacketInfo.title||'领取红包',
            path: `/pages/snatchRedEnvelope/snatchRedEnvelope?orderId=${this.dataStore.orderId}&${shareParam()}`,
            imageUrl: this.data.redPacketInfo.img_url ? this.data.redPacketInfo.img_url +'?imageView2/1/w/300/h/240':'https://facing-1256908372.file.myqcloud.com//image/20180126/642165d4d0fc6315.jpg?imageView2/1/w/300/h/240',
        }
    },
    goConsumptionCode (e) {
        if (!e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.consumecode) {
            return
        }
        if(this.dataStore.isFrom=='myConsumptionCode'){
            getInitData(this);
            return;
        }
        nav({
            url: '/pages/myConsumptionCode/myConsumptionCode',
            data: {
                consumeCode: e.currentTarget.dataset.consumecode
            }
        })
    },
    toGoods(e){
      nav({
        url: '/pages/goodsdetail/goodsdetail',
        data: {
            id: e.currentTarget.dataset.id
        }
      })
    },
    payOrder(e) {
        if (this.data.payLock) {
            return
        }
        this.setData({
            payLock: true
        })

        
        var func_vipPay = ()=>{
            let paramPay = {
                url: app.API_HOST + 'order/vipCardPay',
                data: {
                    orderId: this.dataStore.orderId,
                    formId: e.detail.formId
                }
            }
            fetchApi(this, paramPay).then(resN => {
                showToast('支付成功', 'success', 1500);
                this.setData({
                    payOver: 1,
                    payLock: false
                })
                getInitData(this);
            }).catch(err => {
                this.setData({
                    payLock: false
                })
            });
        }
        var func_wxpay = ()=>{
            const param1 = {
                url: app.API_HOST + 'order/wxpay',
                data: {
                    orderId: this.dataStore.orderId,
                    formId: e.detail.formId,
                    selectedOrderId: 0
                }
            };
            fetchApi(this, param1).then((res) => {
                const that = this
                const payParam = res.data.data;
                wx.requestPayment({
                    'timeStamp': payParam.timeStamp,
                    'nonceStr': payParam.nonceStr,
                    'package': payParam.package,
                    'signType': payParam.signType,
                    'paySign': payParam.paySign,
                    success: function (_res) {
                        showToast('支付成功', 'success', 1500);
                        that.setData({
                            payOver: 1,
                            payLock: false
                        })
                        getInitData(that);
                        let params = {
                            url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
                            data: {
                                tpl_msg_type: '1,2,3'
                            }
                        }
                        fetchApi(that, params).then(__res => {
                            console.log(__res)
                            wx.requestSubscribeMessage({
                                tmplIds: __res.data.data,
                                success (__res) { },
                                fail(__res) { },
                                complete(__res) { }
                            })
                        }).catch(err => {
                        })
                    },
                    fail: function (error) {
                        console.log('支付失败', error)
                        this.setData({
                            payLock: false
                        })
                    }
                });
            }).catch((e) => {});
        } 
        if (this.data.orderDetail.paytype == 4) {
            let paramPay = {
                url: app.API_HOST + 'order/creditPay',
                data: {
                    orderId: this.dataStore.orderId,
                    formId: e.detail.formId
                }
            }
            let paramWx = {
                url: app.API_HOST + 'order/creditWxPay',
                data: {
                    orderId: this.dataStore.orderId,
                    formId: e.detail.formId
                }
            }   
            if (this.data.orderDetail.price_credit != 0) {
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
                                showToast('兑换成功', 'success', 1500);
                                this.setData({
                                    payLock: false,
                                    payOver: 1,
                                })
                                getInitData(this);
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
                    showToast('兑换成功', 'success', 1500);
                    this.setData({
                        payOver: 1,
                        payLock: false
                    })
                    getInitData(this);
                }).catch(err => {
                    console.log(err)
                    this.setData({
                        payLock: false
                    })
                    getInitData(this);
                });
            }
        }
        else if (this.dataStore.canUseVIP) {
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
                  console.log('err', err)
                  this.setData({
                      payLock: false
                  })
              })
        } else {
            func_wxpay();
        }
    },
    //确认收货
    confirmReceive: function(e) {
        let param = {
            url: app.API_HOST + 'orderState/confirmGoodsReceipt',
            data: {
                id: this.dataStore.orderId,
                formId: e.detail.formId
            }

        };
        showModal({ title: '是否确认订单', showCancel: true }).then(res => {
            fetchApi(this, param).then(res => {
                getInitData(this);
            }).catch(err => {})
        })
    },
    toExpressInfo() {
        nav({
            url: '/pages/expressInfo/expressInfo',
            data: {
                id: this.dataStore.orderId,
                isfrom:'orderDetail'
            }
        })
    },
    toComment(){
        nav({
            url:'/pages/orderEvaluate/orderEvaluate',
            data:{
                id:this.dataStore.orderId
            }
        })
    },
    colseRedPacket(){
        this.setData({
            payOver:0
        })
    },
    openLocation() {
        if(this.data.delivery_type==0){
           return;
        }
        nav({
            url: '/pages/menuOrderDetailMap/menuOrderDetailMap',
            data: {
                orderId: this.dataStore.orderId,
                deliveryStatus:this.data.dataDelivery.result.status
            }
        })
    },
    makePhone(e){
        makePhoneCall(`${e.currentTarget.dataset.phone}`)
    },
    closeCreditBox() {
        this.setData({
            creditBoxShowIf: false,
            payOver: 0
        })
    },
    navIntegralMall() {
        this.setData({
            creditBoxShowIf: false,
            payOver: 0
        })
        nav({
            url: '/pages/integralMall/integralMall'
        })
    }


});
// 获取数据
function getInitData(self) {
    showLoading();
    let param = {
        url: app.API_HOST + 'order/getOrderDetail',
        data: {
            orderId: self.dataStore.orderId
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data;
            data.address = '';
        app.globalData.transDataToOrderList = data;
        if(data.delivery_type == 4 && data.shopSelfList){ 
            let shopSelfList = data.shopSelfList;
					data.address = (shopSelfList.address_province + shopSelfList.address_city + shopSelfList.address_area + shopSelfList.address_detail).replace(/-/g,'');
        }
        else{
            data.address = data.address_province + ' ' + data.address_city + ' ' + data.address_area + ' ' + data.address_address;
        }
        if (data.status == 2 || data.status == 3) {
            data.logisticalStaute = '已发货'
        } else if (data.status == -1) {
            data.logisticalStaute = '无物流信息'
        } else if (data.status == 0 || data.status == 1) {
            data.logisticalStaute = '未发货'
        } else {
            data.logisticalStaute = '未处理'
        }
        var isCityExpress =  ['_self_delivery','__dada','__fengniao'].indexOf(data.dispatchexpress);
        data.delivery_type = isCityExpress;
        data.goodsTotal = parseInt(getSum(data.goods, 'total')) || data.goods.length
        self.setData({
            orderDetail: data
        });
        if (self.data.payOver == 1 && data.payOrderGetCredit && data.payOrderGetCredit.handle_credit !=0) {
            self.setData({
                creditBoxShowIf: true
            })
        }
        if(data.status>0){
            getRedPacket(self);
        }
      
        if(isCityExpress>=0){
            
            if(data.status==1){
                var dataDelivery = {
                     result:{
                        statusMsg:'等待骑手接单'
                     }
                }
                getDelivery(self,self.dataStore.orderId);
                self.setData({
                    dataDelivery
                });
            }
            if(data.status==2){
                getDelivery(self,self.dataStore.orderId);
            }else{
                self.setData({
                    dataDelivery:null
                });
            }
            
        }

        
    }).catch(_ =>{});
};

function getConfig(self) {
    if (app.globalConfig) {
        self.setData({
            isOpenComment: app.globalConfig.comments_config.isComment
        })
        return
    }
    getGlobalConfig(self).then(res=>{
        self.setData({
            isOpenComment:app.globalConfig.comments_config.isComment
        })
    }).catch(_=>{})
};
function getRedPacket(self){
    let param = {
        url: app.API_HOST + 'redPacket/getSetting',
        data: {            
        }
    };
    fetchApi(self,param).then(res=>{
        self.setData({
            redPacketInfo:res.data.data
        })
    }).catch(err=>{})
};
function getDelivery(self,orderId){
    let param = {
        url: app.API_HOST + 'delivery/getOrderDetail',
        data: {
            order_id:orderId
        }
    };
    fetchApi(self,param).then(res=>{
       
        self.setData({
            dataDelivery:res.data.data
        });
    }).catch(err=>{})
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


