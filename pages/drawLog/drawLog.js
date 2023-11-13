const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav, showTips, showLoading, hideLoading, showModal } from '../../utils/util';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    pageSize: 15,
    pageIndex: 1,
    servicePhone: false,
    hasMore: true,
    loading: false
  },

  // 获取提现记录
  getTransLog() {
    this.setData({
      loading: true,
      hasMore: true
    })
    let params = {
      url: app.API_HOST + "UserWallet/getWithdraws",
      data: {
        pageSize: this.data.pageSize,
        pageIndex: this.data.pageIndex
      }
    }
    fetchApi(this, params).then(res => {
      this.data.pageIndex = this.data.pageIndex + 1;
      if (res.data.data.data.length < this.data.pageSize) {
        this.data.hasMore = false
      }
      this.setData({
        list: this.data.list.concat(res.data.data.data),
        loading: false
      })
    }).catch(err => { console.log("err") });
  },
  // 打电话打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.servicePhone,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTransLog();
    let servicePhone = app.globalConfig.service_phone;
    servicePhone && servicePhone !== "" ? this.data.servicePhone = servicePhone : this.data.servicePhone = false;
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
    this.data.pageIndex = 1;
    this.data.list = [];
    this.getTransLog();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.getTransLog();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})