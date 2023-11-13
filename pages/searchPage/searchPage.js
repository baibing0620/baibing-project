const app = getApp();
import {
  addActionLog
} from '../../api/api';
import { showLoading, hideLoading,showModal} from '../../utils/util';
Page({

  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dataStore.searchType = options.searchType||1
  
  },
  dataStore:{
    searchType:1,
    searchText:''
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
  onPullDownRefresh: function () {
  
  },

  onReachBottom: function () {
  
  },
  cancelSearch() {
    wx.navigateBack();
  },
  getKeyWord(e){
    this.dataStore.searchText = e.detail.value;
  },
  searchGoods() {
    let searchText = this.dataStore.searchText;
    if (searchText) {
      addActionLog(this,{
        type:13,
        detail:{
          name:searchText
        }
      })
      wx.redirectTo({
        url: `/pages/goodsList/goodsList?id=0&searchText=${searchText}&searchType=${this.dataStore.searchType}`,
      })

    } else {
      showModal({
        title: '提示',
        content: '请您输入要搜索的商品',
      })
    }
  }
})