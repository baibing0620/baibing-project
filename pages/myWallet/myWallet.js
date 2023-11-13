const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav, showLoading } from '../../utils/util';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: 0,
    withdrawing: 0,
    withdrawed: 0
  },
  
  getWallet () {
    showLoading();
    let params = { url: app.API_HOST + "UserWallet/getWallet" }
  
    fetchApi(this, params).then(res => {
      let balance = parseFloat(res.data.data.balance.card_remaining).toFixed(2);
      let withdrawing = parseFloat(res.data.data.balance.freeze).toFixed(2);
      let withdrawed = parseFloat(res.data.data.alreadyWithdraw.price).toFixed(2);
      if (isNaN(balance)) { balance = parseFloat(0).toFixed(2) };
      if (isNaN(withdrawing)) { withdrawing = parseFloat(0).toFixed(2) };
      if (isNaN(withdrawed)) { withdrawed = parseFloat(0).toFixed(2) };
      this.setData({
        balance: balance,
        withdrawing: withdrawing,
        withdrawed: withdrawed,
          is_card_staff: res.data.data.is_card_staff
      })
    }).catch(err => { console.log("err") });
  },

  goToBlessBagRecord() {
    nav({ url: '/bless/blessingBagRecord/blessingBagRecord' });
  },

  goToDrawLog() {
    nav({ url: '/pages/drawLog/drawLog' });
  },
  goToWithdrawal() {
    nav({
      url: '/pages/withdrawal/withdrawal',
      data: {
        balance: this.data.balance
      }
    });
  },
  goToCommission(){
    nav({
      url: '/pages/myCommission/myCommission',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      balance: options.balance||0,
      withdrawing: options.withdrawing||0,
      withdrawed: options.withdrawed||0
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
      this.getWallet();
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
    this.getWallet();
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