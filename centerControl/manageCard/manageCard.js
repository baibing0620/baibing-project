const app = getApp()
import { fetchApi, getCardInfo } from '../../api/api'
import { nav } from '../../utils/util'
import { subscribe, disSubscribe } from './../../utils/publisher'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    diyConfig: app.extConfig,
    showStyle: 0,
    cardInfo:{},
    control: {},
    videoIfOpen: 0,
    switchL: false
  },

  refreshCardInfo: false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const centralControl = app.pageData.getPage("centralControl") || {}
    this.setData({
      control: centralControl.data || {}
    })
    this.getStaffInfoAndOtherData()
    subscribe('cardInfo', cardInfo => {
      try {
        const { record_is_show } = cardInfo
        this.setData({
          cardInfo,
          switchL: record_is_show == 1
        })
      } catch (error) {
        console.error(error)
        this.setData({
          showStyle: 3
        })
      }
    }, this)
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
    if ( app.globalData.videoIfOpen != this.data.videoIfOpen ) {
      this.setData({
        videoIfOpen: app.globalData.videoIfOpen
      })
    }
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
    disSubscribe(this)
    this.refreshCardInfo && getCardInfo(this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getStaffInfoAndOtherData()
    getCardInfo(this)
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
    var cardInfo = this.data.cardInfo;
    return {
      title: `您好，我是${cardInfo.name},${cardInfo.company}的${cardInfo.position}`,
      path: `/page/home/home?cardId=${app.globalData.cardId}`
    }
  },
  toNewPage(e){
    var page = e.currentTarget.dataset.page;
    nav({
      url: `/centerControl/${page}/${page}`
    });
  },
  browseSwitch(e){
    let param = {
      url: 'Card/setCardDisplayRecord',
      data: {
        cardId: app.globalData.cardId,
        display: e.detail.value ? 1 : 0
      }
    }
    fetchApi(this, param).then(res => {
      this.refreshCardInfo = true
    }).catch(err => {
      console.error(err)
    })
  },
  getStaffInfoAndOtherData() {
    fetchApi(this, {
      url: 'Card/getStaffInfoAndOtherData',
      data: {}
    }).then(res => {
      const { cdk_end_days, card_open_way } = res.data.data
      this.setData({
        cdk_end_days,
        card_open_way
      })
    }).catch(err => {
      console.log('error: ', err)
    })
  }
})