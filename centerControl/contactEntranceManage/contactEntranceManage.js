// centerControl/contactEntranceManage/contactEntranceManage.js 
const app = getApp();
import {
  fetchApi,
  getPhoneNumber,
  addActionLog,
  getUserInfo
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
    staff_func_control: '',
    home_page_contact_open: false,
    home_page_chat_model_change: false,
    goods_chat_model_change: false,
    news_contact_open: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalConfig) {
      this.setData({
        staff_func_control: app.globalConfig.staff_func_control,
        home_page_contact_open: app.globalConfig.home_page_contact_open == 1 ? true : false,
        home_page_chat_model_change: app.globalConfig.home_page_chat_model_change == 1 ? true : false,
        goods_chat_model_change: app.globalConfig.goods_chat_model_change == 1 ? true : false,
        news_contact_open: app.globalConfig.news_contact_open == 1 ? true : false,
      })
      if(this.data.staff_func_control == 1) {
        this.getSetting();
      }
    } else {
      getGlobalConfig().then(() => {
        this.setData({
          staff_func_control: app.globalConfig.staff_func_control,
          home_page_contact_open: app.globalConfig.home_page_contact_open == 1 ? true : false,
          home_page_chat_model_change: app.globalConfig.home_page_chat_model_change == 1 ? true : false,
          goods_chat_model_change: app.globalConfig.goods_chat_model_change == 1 ? true : false,
          news_contact_open: app.globalConfig.news_contact_open == 1 ? true : false,
        })
        if (this.data.staff_func_control == 1) {
          this.getSetting();
        }
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  getSetting() {
    let param = {
      url: 'Config/getStaffFuncManageSetting',
      data: {}
    }
    fetchApi(this, param).then(res => {
      let data = res.data.data;
      this.setData({
        home_page_contact_open: data.home_page_contact_open == 1 ? true : false,
        home_page_chat_model_change: data.home_page_chat_model_change == 1 ? true : false,
        goods_chat_model_change: data.goods_chat_model_change == 1 ? true : false,
        news_contact_open: data.news_contact_open == 1 ? true : false,
      })
    })
  },
  changeDeduction(e) {
    console.log(e,'qwer')
    const { type } = e.currentTarget.dataset;
    if (type == 'home_page_contact_open') {
      this.setData({
        home_page_contact_open: !this.data.home_page_contact_open
      })
    } else if (type == 'home_page_chat_model_change'){
      this.setData({
        home_page_chat_model_change: !this.data.home_page_chat_model_change
      })
    } else if (type == 'goods_chat_model_change') {
      this.setData({
        goods_chat_model_change: !this.data.goods_chat_model_change
      })
    } else if (type == 'news_contact_open') {
      this.setData({
        news_contact_open: !this.data.news_contact_open
      })
    }
    let param = {
      url: 'Card/setCardConfig',
      data: {
        home_page_contact_open: this.data.home_page_contact_open ? 1 : 0,
        home_page_chat_model_change: this.data.home_page_chat_model_change ? 1 : 0,
        goods_chat_model_change: this.data.goods_chat_model_change ? 1 : 0,
        news_contact_open: this.data.news_contact_open ? 1 : 0
      }
    }
    fetchApi(this,param).then(res => {
      console.log(res,'res')
    }).catch(err => {
      if (type == 'home_page_contact_open') {
        this.setData({
          home_page_contact_open: false
        })
      } else if (type == 'home_page_chat_model_change') {
        this.setData({
          home_page_chat_model_change: false
        })
      } else if (type == 'goods_chat_model_change') {
        this.setData({
          goods_chat_model_change: false
        })
      } else if (type == 'news_contact_open') {
        this.setData({
          news_contact_open: false
        })
      }
    })
  },


})