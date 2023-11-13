// pages/calendar/calendar.js
const app = getApp();
import { showLoading, getYMD, showToast, nav } from '../../utils/util';
let dayscount = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseDay: '',
    festivaltag: {
      "2017/1/1": "元旦",
      "2017/2/14": "情人节",
      "2017/3/8": "妇女节",
      "2017/5/1": "劳动节",
      "2017/6/1": "儿童节",
      "2017/10/1": "国庆节",
      "2017/12/24": "平安夜",
      "2017/12/25": "圣诞"
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      dates: JSON.parse(options.dateCalendar),
      startDay: options.startDay,
      endDay: options.endDay,
      time: JSON.parse(options.reservableTime)
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
  chooseDay(e) {
    let checkDay = e.currentTarget.dataset.checkDay;
    let chooseDay = this.data.checkInDay
      chooseDay = checkDay;
      this.setData({
        chooseDay
      })
    var times = setTimeout(function () {
      app.globalData.chooseDay = chooseDay;
      wx.navigateBack();
      clearTimeout(times);   
    }, 300);
    
  },
  showTip(){
    showToast('该日期不可预约，请选择其他日期',this)
  }
});

