// pages/winningRecord/winningRecord.js

const app = getApp()

import { fetchApi, checkAvatar, getGlobalConfig } from '../../api/api.js'
import { showModal, getHomePage, nav} from '../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showStyle: 0,
    loadStyle: '',
    activeStatus: '-1',
        tabBar: [{ title: '全部', status: -1 }, { title: '未兑换', status: 0 }, { title: '已兑换', status: 1 }, { title: '已过期', status: -2 }],
    recordList:[]
  },
  dataStore: {
    pageIndex:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPrizeList();
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
    showLoading();
    this.dataStore.pageIndex = 1;
    this.getPrizeList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadStyle == 'loadOver') {
      return;
    }
    this.setData({
      loadStyle: ''
    })
    this.getPrizeList(true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  updateList(){
    this.dataStore.pageIndex  = 1;
    this.getPrizeList()
  },
  navToCode(e){
    console.log(e,'99999')
    app.globalData.pagesInfo.winningRecord = {
      name: 'winningRecord',
      page: this
    }
    const { id, qrcode, url } = e.currentTarget.dataset;
    nav({
      url: '/pages/recordConsumptionCode/recordConsumptionCode',
      data: {
       qrcode: qrcode,
       id: id,
       url
      }
    })
  },
  tabChange(e) {
    const { status }  = e.currentTarget.dataset;
    this.setData({
      activeStatus : status
    })
    this.dataStore.pageIndex = 1;
    this.getPrizeList()
  },
  getPrizeList(isGetMore = false) { 
    let param = {
      url: app.API_HOST + 'activity/getPrizeList',
      data: {
        pageSize: 8,
        pageIndex: isGetMore ? this.dataStore.pageIndex + 1 : this.dataStore.pageIndex,
        isUsed: this.data.activeStatus
      }
    }
    fetchApi(this, param).then((res) => {
      if (isGetMore) {
        this.dataStore.pageIndex++
      }
      let data = res.data.data.data;
      this.setData({
        loadStyle: data.length < 8 ? 'loadOver' : 'loadMore',
        recordList: isGetMore ? this.data.recordList.concat(data) : data,
      })
      this.setData({
        showStyle: this.data.recordList.length == 0 ? 2 : 1
      })
    }).catch((err) => {
      this.setData({
        showStyle: 3
      })
    });
  }
})