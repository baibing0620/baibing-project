// pages/getCoupon/getCoupon.js
const app = getApp();
import { fetchApi } from '../../api/api';
import { showExpried, showLoading, showTips, nav, showToast } from '../../utils/util';
Page({

  data: {
    couponList: [],
    showStyle: 0

  },
  dataStore: {
    isFrom: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.from) {
      this.dataStore.isFrom = options.from;
    }
    showLoading();
    getCouponList(this);

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onPullDownRefresh: function () {
    getCouponList(this);
  },
  navBack() {
    var param = {
      url: app.API_HOST + 'coupon/receiveAllCoupons',
      data: {}
    }
    fetchApi(this, param).then((res) => {
      if (this.dataStore.isFrom = 'menu') {
        app.globalData.meunNeedRefresh = 1;
      }
      showToast('领取成功', 'sucess', 1000);
      setTimeout(function () { wx.navigateBack(); }, 1500);
    }).catch((e) => {
      if (e.data && e.data.msg) {
        setTimeout(function () { wx.navigateBack(); }, 1500);
      }

    })
  },
  navCouponDetail(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id)
    let param = {
      url: '/pages/couponDetail/couponDetail?id=' + id
    }
    nav(param);
  }
});

function getCouponList(self) {
  let param = {
    url: app.API_HOST + 'coupon/couponsOfShop',
    data: {
      received: 0
    }

  }
  fetchApi(self, param).then((res) => {
    self.setData({
      showStyle: res.data.data.length == 0 ? 2 : 1,
      couponList: res.data.data
    })

  }).catch((e) => {
    self.setData({
      showStyle: 3,
    })
  })
}