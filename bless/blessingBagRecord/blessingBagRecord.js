const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
import { showLoading } from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadStyle: 'loadMore',
    showStyle: 0,
    recevieData:[]
  },
  dataStore: {
    pageIndex: 1,
    activityId:'',
    uid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      showLoading();
      if (options.uid){
          let member = JSON.parse(options.member)
          wx.setNavigationBarTitle({
              title: member.nickname+'的福袋记录',
          })
          this.setData({
              user: member
          });
      }else{
          userInfo(this)
      }
    this.dataStore.activityId= options.activityId || ''
    this.dataStore.uid = options.uid||''
    getMyReceiveLog(this)
    getMyReceiveCount(this)
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
    this.dataStore.pageIndex = 1
    getMyReceiveLog(this)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadStyle == 'loadOver') {
      return
    }
    this.setData({
      loadStyle: 'showLoading'
    })
    getMyReceiveLog(this, true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

function getMyReceiveLog(self,isGetMore = false){
  let param = {
    url: app.API_HOST + "packet/getMyReceiveLog",
    data: {
      activityId: self.dataStore.activityId,
      uid: self.dataStore.uid,
      pageSize: 9,
      pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
    }
  }
  fetchApi(self, param).then(res => {
    if (isGetMore) { self.dataStore.pageIndex++ };
    let data = res.data.data.list
    self.setData({
      recevieData: isGetMore ? self.data.recevieData.concat(data) : data,
      loadStyle: data.length < 9 ? 'loadOver' : 'loadMore'
    })
    self.setData({
      showStyle: self.data.recevieData.length == 0 ? 2 : 1
    })
  }).catch((err) => {
    self.setData({
      showStyle: 3
    })
  });
}
function getMyReceiveCount(self) {
  let param = {
    url: app.API_HOST + "packet/getMyReceiveCount",
    data: {
      activityId: self.dataStore.activityId,
      uid: self.dataStore.uid,
    }
  }
  fetchApi(self, param).then(res => {
    let data = res.data.data
    self.setData({
      countData: data
    })
  }).catch((err) => {

  });
}

function userInfo(self) {
  let param = {
    url: app.API_HOST + 'user/userInfo',
    data: {}
  };
  fetchApi(self, param).then(res => {
    self.setData({
      user: res.data.data.user
    });
  }).catch((err) => {
   
  });

};