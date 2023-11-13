// pages/addCustomerPool/addCustomerPool.js
const app = getApp();
import {
  nav,
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
    pool:{
      name: '',
      tpl: '',
      source: '',
      grade: '',
      compony: '',
      wxchat: '',
      age: '',
      sex: '',
      job: ''
    },
    poolSource:['搜索引擎','网站','广告','电话','客户介绍','膜拜','地推','其他'],
    gradeIndex: null,
    poolGrade: ['普通客户','重要客户'],
    sourceIndex: null,
    poolAge: ['未知','18岁以下','18~30岁','31~50岁','51~70岁','70岁以上'],
    ageIndex: null,
    poolSex: ['保密','男','女'],
    sexIndex: null,
    poolJob: ['自雇','受雇'],
    jobIndex: null,
    
  },
  inputNameValue(e){
    this.setData({
      'pool.name': e.detail.value
    })
  },
  inputTplValue(e){
    this.setData({
      'pool.tpl': e.detail.value
    })
  },
  inputComponyValue(e){
    this.setData({
      'pool.compony': e.detail.value
    })
  },
  inputWxchatValue(e){
    this.setData({
      'pool.wxchat': e.detail.value
    })
  },
  bindSourceChange: function(e) {
    this.setData({
      sourceIndex: e.detail.value
    })
  },
  bindGradeChange: function(e) {
    this.setData({
      gradeIndex: e.detail.value
    })
  },
  bindAgeChange: function(e) {
    this.setData({
      ageIndex: e.detail.value
    })
  },
  bindSexChange: function(e) {
    this.setData({
      sexIndex: e.detail.value
    })
  },
  bindJobChange: function(e) {
    this.setData({
      jobIndex: e.detail.value
    })
  },
  save(){
    if(this.data.pool.name==''){
      showTips('姓名不能为空',this)
      return false;
    }
    if(!(/^(13[0-9]|14[01456879]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/.test(this.data.pool.tpl))){
      if(!(/^([0-9]{3,4}-)?[0-9]{7,8}$/).test(this.data.pool.tpl)){
        showTips('联系电话格式不正确',this)
        return false;
      }
    }
    if(!this.data.sourceIndex){
      showTips('请选择客户来源',this)
      return false;
    }
    if(!this.data.gradeIndex){
      showTips('请选择客户等级',this)
      return false;
    }
    let params={
      url: 'ExternalCustom/addNewUser',
      data: {
        card_id: app.globalData.cardId,
        name: this.data.pool.name,
        tel: this.data.pool.tpl,
        come_from: this.data.poolSource[this.data.sourceIndex]||'',
        user_lv: this.data.poolGrade[this.data.gradeIndex]||'',
        company_name: this.data.pool.compony,
        wx_number: this.data.pool.wxchat,
        age: this.data.poolAge[this.data.ageIndex]||'',
        sex: this.data.poolSex[this.data.sexIndex]||'',
        job: this.data.poolJob[this.data.jobIndex]||'',
      }
    }
    fetchApi(this,params).then(res=>{
      if(res.data.code==200){
        showToast('添加成功', 'success')
        setTimeout(() => {
          wx.navigateBack({
              delta: 1,
          })
        }, 1500)
      }
    }).catch(err=>{
      console.log(err)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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