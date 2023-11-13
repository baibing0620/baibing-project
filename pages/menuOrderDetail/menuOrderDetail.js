const app = getApp();
import {
    fetchApi,
    wxpay
} from '../../api/api';
import {
    showLoading,
    showToast,
    getSum,
    nav,
    showTips,
    shareParam,
    makePhoneCall,
    showModal,
    showActionSheet
} from '../../utils/util';
Page({
    data: {
        extConfig: app.extConfig,
        payOver: 1,
        redPacketUrl: 'https://facing-1256908372.file.myqcloud.com//image/20180124/538937801e7b14e2.png',
        createTime: '---',
        totalPrice: '',
        coupon: {
            couponId: 0,
            couponMoney: 0
        },
        status: 1,
        hasRedPack:0,
        ordersn: '--',
        fulladdress: '',
        mobile: '',
        realname: '',
        orderType: 2,
        deliveryPrice: 0,
        boxPrice: 0,
        paytype: 0,
        consumeCodeInfo: '',
        showStyle: 0,
        dataDelivery: {
            result:{
                thridCode:0
            }
        },
        refund:0,
        rsreson:'',
        delivery_type:0,
        redPacketInfo:{
            title:'领取红包'
        },
        checkReceiptTimeStart: '0000-00-00 00:00:00',
        checkReceiptTimeEnd: '0000-00-00 00:00:00',
    },
    dataStore: {
        orderId: 0,
        isFrom: '',
        canUseVIP:false
    },
    
    onLoad: function (options) {
        getVipInfo(this)
        if(options.beid&&app.isMultiShop == 1){
            app.globalData.beid = options.beid
        }
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            this.setData({
                isFromShare: true
            });
        }
        this.dataStore.isFrom = options.isFrom || '';
        this.dataStore.orderId = options.id;
        getInitData(this);
        this.setData({
            payOver: options.payOver || 0
        })
    },
    onReady: function() {
        wx.hideShareMenu();
    },

    onShow: function() {

    },
    onHide: function() {

    },
    onUnload: function() {

    },
    onShareAppMessage: function(res) {
        return {
            title: this.data.redPacketInfo.title||'领取红包',
            path: `/pages/snatchRedEnvelope/snatchRedEnvelope?orderId=${this.dataStore.orderId}&${shareParam()}`,
            imageUrl: this.data.redPacketInfo.img_url ? this.data.redPacketInfo.img_url + '?imageView2/1/w/300/h/240' : 'https://facing-1256908372.file.myqcloud.com//image/20180126/642165d4d0fc6315.jpg?imageView2/1/w/300/h/240',
        }
    },

    onPullDownRefresh: function() {
        getVipInfo(this);
        getInitData(this);
    },

    goConsumptionCode(e) {
        if (this.dataStore.isFrom == 'myConsumptionCode') {
            wx.navigateBack();
            return;
        }
        nav({
            url: '/pages/myConsumptionCode/myConsumptionCode',
            data: {
                consumeCode: e.currentTarget.dataset.consumecode
            }
        })
    },
    payOrder(e) {
        var func_wxpay = ()=>{
            wxpay(this, e.detail.formId, this.dataStore.orderId).then(res => {
                app.globalData.menuOrderNeedRefresh = 1;
                showToast('支付成功', 'success', 1500);
                this.setData({
                  payOver: 1
                })
                getInitData(this);
            }).catch(err => {});
        } 
        var func_vipPay = ()=>{
            let paramPay = {
                url: app.API_HOST + 'order/vipCardPay',
                data: {
                    orderId: this.dataStore.orderId,
                    formId: e.detail.formId
                }
            }
            fetchApi(this, paramPay).then(resN => {
                app.globalData.menuOrderNeedRefresh = 1;
                showToast('支付成功', 'success', 1500);
                this.setData({
                  payOver: 1
                })
                getInitData(this);
            }).catch(err => {});
        }
       
        let formId = e.detail.formId;
        if (this.dataStore.canUseVIP) {
            showActionSheet({
                itemList: ['微信支付', '会员卡余额支付'],
                itemColor: '#ff9300'
              }).then(resN=>{
                if (resN.tapIndex == 1) {
                    func_vipPay();
                  } else {
                    func_wxpay();
                  }
              }).catch(err => console.log('err',err))
        } else {
            func_wxpay();
        }
      
        
    },
    colseRedPacket() {
        this.setData({
            payOver: 0
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
    makePhone(e) {
        makePhoneCall(`${e.currentTarget.dataset.phone}`)
    },
    navTakeAway() {
        nav({
            url: "pages/takeAwayMenu/takeAwayMenu",
            data: {}
        })
    }
});
// 获取数据
function getInitData(self) {
    showLoading();
    let param1 = {
        url: app.API_HOST + 'order/getOrderDetail',
        data: {
            orderId: self.dataStore.orderId

        }
    };

    let param2 = {
        url: app.API_HOST + 'delivery/getOrderDetail',
        data: {
            order_id: self.dataStore.orderId
        }
    };

    fetchApi(self, param1).then((res) => {
        let data = res.data.data;
        var deliveryPrice = data.dispatchprice;
        let refund = data.refund;
        let rsreson = data.rsreson;
        let delivery_type = data.delivery_type;
        var goodsList = data.goods,
            orderType = data.order_type,
            fulladdress = data.address_province + ' ' + data.address_city + ' ' + data.address_area + ' ' + data.address_address,
            realname = data.address_realname,
            mobile = data.address_mobile,
            totalPrice = data.price,
            paytype = data.paytype;
        var coupon = {
            couponId: data.coupon_id,
            couponMoney: data.coupon_money
        }
        if (orderType == 2 || orderType == 4) {

            self.setData({
                desk_num: data.desk_num
            })
        }
        if (orderType == 3) {
            totalPrice = parseFloat(totalPrice) + parseFloat(deliveryPrice);
            self.setData({
                boxPrice: data.box_total_money || 0,
                deliveryPrice: deliveryPrice
            })
        }
        self.setData({
            goodsList: goodsList,
            totalPrice: data.price,
            createTime: data.createtime,
            status: data.status,
            ordersn: data.ordersn,
            fulladdress: fulladdress,
            realname: realname,
            mobile: mobile,
            orderType: orderType,
            coupon: coupon,
            paytype: paytype,
            consumeCodeInfo: data.consume_code || '',
            showStyle: 1,
            refund:refund,
            rsreson:rsreson,
            hasRedPack:data.hasRedPack,
            delivery_type:delivery_type,
            checkReceiptTimeStart: data.check_receipt_time_start,
            checkReceiptTimeEnd: data.check_receipt_time_end
        })
        if(data.status>0){
            getRedPacket(self);
        }
        if (orderType == 3&&(data.status == 1 || data.status == 2)  ) {
            fetchApi(self, param2).then((res) => {
                let dataDelivery = res.data.data
                self.setData({
                    dataDelivery: dataDelivery
                })
            }).catch((err) => {
                console.log(err)
            })
        }
    }).catch((res) => {
        console.log('获取订单详情失败',res)
        self.setData({
            showStyle: 3
        })
    })

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