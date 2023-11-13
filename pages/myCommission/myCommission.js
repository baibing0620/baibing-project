const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    extConfig: app.extConfig,
    list: [],
    count: 0,
    pageIndex: 1,
    pageSize: 20,
    hasMore: true,
    loadStyle: ""
  },

  getList() {
    this.setData({
      loadStyle: ""
    })
    let params = {
      url: app.API_HOST + "distribution/distributionOrderList",
      data: {
        pageIndex: this.data.pageIndex,
        pageSize: this.data.pageSize
      }
    }
    fetchApi(this, params).then(res => {
      this.setData({
        list: this.data.list.concat(res.data.data),
        hasMore: res.data.data.length >= this.data.pageSize,
        loadStyle: res.data.data.length >= this.data.pageSize ? "loadMore" : "loadOver"
      })
    }).catch(res => {
      console.log(res, "error")
    })
  },

  getCount() {
    let params = {
      url: app.API_HOST + "distribution/userDistributionPriceCount",
      data: {}
    }
    fetchApi(this, params).then(res => {
      this.setData({
        count: res.data.data
      })
    }).catch(res => {
      console.log(res, "error")
    })
  },

  init() {
    this.setData({
      list: [],
      count: 0
    })
    this.getList();
    this.getCount();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
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
    app.showRemind(this);
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
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.pageIndex++;
    this.getList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})