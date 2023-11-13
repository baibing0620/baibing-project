
const app = getApp();
import { fetchApi } from '../../api/api';
import { showToast, showTips, nav, showModal } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponInfo: {},
    qrcode: '',
    id: ''

  },
  dataStore: {
    timeClock: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.hideShareMenu({})
    console.log(options, 'options')
    this.setData({
      qrcode: options.qrcode || '',
      id: options.id,
      url:options.url || ''
    })

    this.dataStore.timeClock = setInterval(this.checkStatus, 3000);
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
    clearInterval(this.dataStore.timeClock);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.dataStore.timeClock);
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

  },
  showPayCode() {
    this.setData({
      showQRCode: true
    })
  },
  checkStatus() {

    let param = {
      url: app.API_HOST + 'activity/checkActivityPrizeIsUsed',
      data: {
        activityPrizeId: this.data.id
      }
    }
    fetchApi(this, param).then(res => {
      const { hasUsed } = res.data.data;
      console.log(hasUsed, 'res hasUsed')
      if(hasUsed == 1) {
        clearInterval(this.dataStore.timeClock);
        showModal({
          title: '提示',
          content: '扫码成功',
        }).then(_ => {
          var winningRecord = app.globalData.pagesInfo.winningRecord;
          if (winningRecord && winningRecord.page) {
            winningRecord.page.updateList();
            wx.navigateBack();
            return
          }
          wx.navigateBack()
        })
      } 
    })

  }
})