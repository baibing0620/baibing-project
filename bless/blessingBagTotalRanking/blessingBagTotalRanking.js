const app = getApp();
import {
  fetchApi
} from "./../../api/api.js";
import {
  showTips,
  nav,
  makePhoneCall
} from "../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabBar: [{
      name: '福袋收益',
      orderBy: 'all_money ',
      orderType: 'asc',
    }, {
      name: '福袋个数',
        orderBy: 'total',
        orderType: 'asc',
    }, {
      name: '参与时间',
        orderBy: 'create_time',
        orderType: 'asc',
      }], 
    activeTabBarIndex: 0,
    loadStyle: 'loadMore',
    showStyle: 0,
    rankingList: []
  },
  dataStore: {
    pageIndex: 1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getPacketUserRankingList(this)
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
    getPacketUserRankingList(this)
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
    getPacketUserRankingList(this, true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  tabBarClick(e) {
    this.dataStore.pageIndex = 1;
    let index = parseInt(e.currentTarget.dataset.index);
    let tabBar = this.data.tabBar;
    if (index == this.data.activeTabBarIndex) {
      tabBar[index].orderType = tabBar[index].orderType == 'desc' ? 'asc' : 'desc';
      tabBar[index].typeText = tabBar[index].typeText == '↓' ? '↑' : '↓';
    }
    this.setData({
      tabBar: tabBar,
      activeTabBarIndex: index
    });
    getPacketUserRankingList(this)
  },
  navCustomDetail(e){
    var index = parseInt(e.currentTarget.dataset.index);
    var customer = this.data.rankingList[index];
    nav({
      url: '/pages/clueDetail/clueDetail',
      data: {
        crmId: customer.crmId,
        crmUid: customer.uid
      }
    })
  },
  navMyReceiveLog(e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var customer = this.data.rankingList[index];
    nav({
      url: '/bless/blessingBagRecord/blessingBagRecord',
      data: {
        uid: customer.uid,
        member: JSON.stringify(customer.member) 
      }
    })
  },
})
function getPacketUserRankingList(self, isGetMore = false) {
  let index = parseInt(self.data.activeTabBarIndex),
    tabBar = self.data.tabBar;
  let param = {
    url: app.API_HOST + "Packet/getPacketUserRankingList",
    data: {
      orderBy: tabBar[index].orderBy,
      orderType: tabBar[index].orderType,
      pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
      pageSize:10
    }
  }
  fetchApi(self, param).then(res => {
    let data = res.data.data.list;
    if (isGetMore) { self.dataStore.pageIndex++ };
    self.setData({
      rankingList: isGetMore ? self.data.rankingList.concat(data) : data,
      loadStyle: data.length < 10 ? 'loadOver' : 'loadMore',
    })
    self.setData({
      showStyle: self.data.rankingList.length == 0 ? 2 : 1,
      role: res.data.data.if_has_priv
    })

  }).catch((err) => {
    self.setData({
      showStyle: 3,
    })
  });
}