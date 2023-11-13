// sign/signFormSuccess/signFormSuccess.js
const app = getApp();
import { fetchApi, addActionLog, getEffectiveCardId } from '../../api/api.js';
import { nav, getTitleFromTabbar, showTips, showToast, showLoading} from '../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  successBtn(){
    nav({
      url: '/pages/signOnline/signOnline',
      data: {}
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      authType: options.authType
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})