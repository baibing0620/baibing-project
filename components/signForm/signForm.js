// components/signForm/signForm.js
const app = getApp();
import { fetchApi, addActionLog, getEffectiveCardId } from '../../api/api.js';
import { nav, getTitleFromTabbar, showToast, showTips , showLoading} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    signFormData: [],
    inputValue: [],
    fileComponents: {}, //上个页面模板参数
    FlowComponentsInfo: {}, //下个页面发起参数
  },
  bindFormInput(e){
    let { index, key } = e.currentTarget.dataset;
    let value = e.detail.value;
    this.data.inputValue[index] = {
      value,
      key
    }
    this.setData({
      inputValue: this.data.inputValue
    })
  },
  signbtn(){
    let _that = []
    if(this.data.inputValue.length==0){
      wx.showToast({
        title: '请完善主键信息',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    this.data.inputValue.map(item=>{
      item.value==''?_that.push(1):_that.push(2)
    })
    if(_that.indexOf(1)!=-1){
      wx.showToast({
        title: '请完善主键信息',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    nav({
      url: '/components/signFormContent/signFormContent',
      data: {
        fileComponents: JSON.stringify(this.data.fileComponents),
        FlowComponentsInfo: JSON.stringify(this.data.FlowComponentsInfo),
        inputValue: JSON.stringify(this.data.inputValue)
      }
    })
  },
  showTempFileComponents(data){
    let params = {
      url: 'ElectronicContractInitiateSign/getFlowComponentsInfo',
      data: {
        flowId: data.id
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      this.setData({
        FlowComponentsInfo: res.data.data,
        signFormData: JSON.parse(res.data.data.componentsInfo[0].components)
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { fileComponents } = options
    this.setData({
      fileComponents: JSON.parse(fileComponents),
    })
    this.showTempFileComponents(this.data.fileComponents)
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