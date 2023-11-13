// pages/customerList/customerList.js
const app = getApp();
import {
  nav,
  makePhoneCall,
  showToast,
  showTips
} from '../../utils/util';
import {
  fetchApi,
  getEffectiveCardId,
  getGlobalConfig
} from '../../api/api.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerList:[],
    pageIndex: 1,
    pageSize: 10,
    claimName: '',
    t_uid: '',
    to_card_id: '',
  },
  bindInput(e){
    this.setData({
      claimName: e.detail.value
    })
  },
  search(){
    this.setData({
      customerList: []
    })
    if (this.data.claimName) {
        this.data.search = true;
    } else {
        this.data.search = false;
    }
    this.data.pageIndex = 1;
  },
  radioChange(e){
    console.log(e.detail.value)
    this.setData({to_card_id: e.detail.value})
  },
  save(){
    let params = {
      url: 'ExternalCustom/transferUser',
      data: {
        t_uids: this.data.t_uid,
        to_card_id: this.data.to_card_id,
        card_id: app.globalData.cardId,
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      showToast('转交成功', 'success')
      setTimeout(()=>{
        // wx.navigateBack({
        //   delta: 1,
        // })
        nav({
          url: '/pages/customerPool/customerPool'
        })
      },1000)
    }).catch(err=>{
      console.log(err)
    })
  },
  getCardList(){
    let params = {
      url: 'ExternalCustom/showCardList',
      data: {
        page: this.data.pageIndex,
        pre: this.data.pageSize,
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      this.setData({
        loadStyle: res.data.data.length < 6 ? 'loadOver' : 'loadMore',
        customerList: this.data.pageIndex!=1 ? this.data.customerList.concat(res.data.data.list) : res.data.data.list,
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      t_uid: options.t_uid,
      len: this.data.customerList.length-1
    })
    this.getCardList()
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
    this.setData({
      list: [],
      loadStyle: '',
      pageIndex: 1,
    })
    this.getCardList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadStyle == 'loadOver') {
      return
  }
  this.setData({
      loadStyle: 'showLoading',
      pageIndex: this.data.pageIndex+1,
  })
  this.getCardList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})