const app = getApp();
import {
  fetchApi,
  getPhoneNumber,
  addActionLog,
  getUserInfo,
  getGlobalConfig
} from '../../api/api';
import {
  showLoading,
  previewImageList,
  nav,
  makePhoneCall,
  showToast,
  showTips,
} from '../../utils/util';



Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    getMenuButtonBoundingClientRect: app.globalData.getMenuButtonBoundingClientRect,
    staff_func_control: '',
    is_allow_staff_set_welcomes: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '',
    })
    if (app.globalConfig) {
      this.setData({
        staff_func_control: app.globalConfig.staff_func_control,
        is_allow_staff_set_welcomes: app.globalConfig.is_allow_staff_set_welcomes
      })
    } else {
      getGlobalConfig().then(() => {
        this.setData({
          staff_func_control: app.globalConfig.staff_func_control,
          is_allow_staff_set_welcomes: app.globalConfig.is_allow_staff_set_welcomes
        })
      })
    }
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
  navBack() {
    wx.navigateBack()
  },
  navto(e) {
    let type = e.currentTarget.dataset.type;
    nav({
      url: `../${type}/${type}`,
      data: {
       
      }
    })
  } 
})