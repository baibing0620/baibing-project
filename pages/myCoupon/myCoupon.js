const app = getApp();
import {
    fetchApi,
    wxpay
} from '../../api/api.js';
import {
    nav,
    showLoading,
    showModal,
    query 
} from '../../utils/util';
Page({
    data: {
        couponList: [],
        statueDes: ['可用', '已使用', '已过期', '金额未满'],
        showStyle: 0,
    },
    onLoad: function (options) {
        getInitData(this);
    },
    onReady: function () {

    },
    onShow: function () {

    },
    onHide: function () {

    },
    onUnload: function () {

    },
    onPullDownRefresh: function () {
        getInitData(this);
    },
    exchangeCoupons(){
        nav({
        url: '/pages/webH5/webH5',
        data: {
            action: 'exchangeCoupons'
        }
        })
    },
    toCouponDetail(e) {
        console.log(e,9999)
        if (e.currentTarget.dataset.status == 0) {
            nav({
                url: '/pages/couponDetail/couponDetail', 
                data: {
                    id: e.currentTarget.dataset.id,
                    couponUserId: e.currentTarget.dataset.couponuserid
                }
            })
        }

    },
    toMall() {
        nav({
            url: '/pages/mall/mall'
        })
    },

    onShareAppMessage: function (res) {
        console.log(res,'resss')
        if (res.from === 'button') {
            const { usercouponid, share_img } = res.target.dataset; 
            console.log(`/pages/couponReceive/couponReceive${query({ usercouponid })}`,'???')
            return {
                title: `送你一张优惠券，请查收！`,
                path: `/pages/couponReceive/couponReceive${query({ usercouponid })}`,
                imageUrl: share_img || ''
            }
        } else {
            return {
                title: '',
                path: `/pages/home/home${query()}`
            }
        }
    }
});
// 返回的数据 status 获取优惠券的状态   0  可用  1 已经被使用了  2  已经过期了   3 未到使用金额
function getInitData(self) {
  showLoading();
  let param = {
    url: app.API_HOST + 'coupon/myCoupons',
    data: {
      optional: 0,
      orderMoney: 0
    }
  };
  fetchApi(self, param).then(res => {
    let data = res.data.data;
    self.setData({
      couponList: data,
      showStyle: data.length == 0 ? 2 : 1
    });
  }).catch((err) => {
    console.log(err)
    self.setData({
      showStyle: 3
    })
  });
}