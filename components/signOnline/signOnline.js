// components/signOnline/signOnline.js
const app = getApp();
import { fetchApi, addActionLog, getEffectiveCardId } from '../../api/api.js';
import { nav, getTitleFromTabbar, showTips, showToast, showLoading} from '../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    signOnlineList: [],
    actvieIndex: null,
  },
  store: {
    pageIndex: 1,
    pageSize: 10,
  },
  handleDelete () {
    this.setData({
        searchValue: ''
    });
  },
  goContract(e){
    let {index,item} = e.currentTarget.dataset;
    this.setData({
      actvieIndex: index,
    })
    nav({
      url: '/components/signForm/signForm',
      data: {
        fileComponents: JSON.stringify(item)
      }
    })
  },
  handleInput (e) {
    const { value } = e.detail;
    this.setData({
      searchValue: value
    });
  },
  handleSearch () {
    const { searchValue } = this.data;
    this.getShowTempFile(searchValue)
  },
  getShowTempFile(name){
    const {pageIndex, pageSize} = this.store;
    this.setData({
      loadStyle: 'loading'
    });
    let data = {}
    if(name){
      data = {
        pre: pageSize,
        page: pageIndex,
        name: name
      }
    }else{
      data = {
        pre: pageSize,
        page: pageIndex,
      }
    }
    let params = {
      url: app.API_HOST + "ElectronicContractInitiateSign/showFileFlowList",
      data: data
    }
    fetchApi(this,params).then(res=>{
      const { data } = res.data
      console.log(data)
      if(res.data.code==200){
        this.setData({
          signOnlineList: (pageIndex == 1 ? [] : this.data.signOnlineList).concat(data.list),
          loadStyle: data.total < pageSize ? 'loadOver' : 'loadMore'
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getShowTempFile()
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
      loadStyle: 'loading'
    });
    this.store.pageIndex = 1;
    this.getShowTempFile()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { loadStyle } = this.data;
    if (loadStyle != 'loadMore') return;
    this.store.pageIndex ++;
    this.getShowTempFile();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})