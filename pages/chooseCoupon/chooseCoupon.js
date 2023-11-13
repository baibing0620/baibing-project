const app = getApp();
import {
  fetchApi,
  wxpay
} from '../../api/api.js';
import {
  nav,
  showLoading,
  showModal
} from '../../utils/util';
Page({


  data: {
    couponList: [],
      statueDes: ['可用', '已使用', '已过期', '金额未满', '类别限定金额未满', '类别限定不符合', '商品限定金额未满', '商品限定不符合', '优惠券使用时间未开始', '不满足用户条件','抵扣商品不匹配'],
    homepage: app.HOMEPAGE_URL,
    showStyle: 0,
  },
  dataStore: {
    couponId: 0,
    isHave: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dataStore.couponId = options.couponId || 0;
    let orderMoney = parseFloat(options.totalMoney);
    getInitData(this, orderMoney);
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  chooseCoupon(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    let couponList = this.data.couponList;
    if (couponList[index].filterType == 0) {
      app.globalData.coupon = {
        type: couponList[index].type,
        exchange_goods: couponList[index].couponInfo.exchange_goods,
        scope: couponList[index].couponInfo.scope,
        num: couponList[index].cutdown,
        des: couponList[index].type == 3 ? '抵扣券【' + couponList[index].couponInfo.exchange_goods[0].goodsName + '】' : couponList[index].cutdown + '元',
        couponId: couponList[index].id,
        statue: 'have' //none,无优惠券可用，have 有优惠券二用
      }
      wx.navigateBack();
    } 

  },
  noUseCoupon() {

    app.globalData.coupon = {
        type: 1,
        scope: '',
        exchange_goods: '',
        num: 0,
        des: this.dataStore.isHave ? '请选择优惠券' : '无优惠券可用',
        couponId: 0,
        statue: 'have' //none,无优惠券可用，have 有优惠券二用
    }
    wx.navigateBack();
  }
})

function getInitData(self, orderMoney = 0) {
  var goodsInfo = '';
  if (!app.globalData.goodsList || app.globalData.goodsList.length == 0) {
    goodsInfo = JSON.stringify([{ "id": "0", "total": "1", "optionId": "0" }]);
  } else {
    goodsInfo = JSON.stringify(app.globalData.goodsList);
  }
  let param = {
    url: app.API_HOST + 'coupon/orderCoupons',
    data: {
      goodsInfo: goodsInfo,
      orderMoney: orderMoney,
      filterType: '0#3#4#5#6#7#8#9#10',
    }
  };
  fetchApi(self, param, 'POST').then(res => {
    let data = res.data.data;

    data = data.map((item, index, input) => {
      if (item.filterType == 0) {
        self.dataStore.isHave = true
      }
      if (item.id == self.dataStore.couponId) {
        item.isCheck = true;
      } else {
        item.isCheck = false;
      }
      return item
    })
    self.setData({
      couponList: data
    });
    self.setData({
      showStyle: self.data.couponList.length == 0 ? 2 : 1
    });
  }).catch((err) => {
    self.setData({
      showStyle: 3
    })
  });
}