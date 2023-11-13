const app = getApp();
import {
  fetchApi
} from "./../../api/api.js";
import {
  showTips,
  nav
} from "../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    extConfig: app.extConfig,
    customerList: [],
    diyConfig: app.extConfig,
    keywords: '',
    statusList: [{
      title: '全部',
      status: 0
    }, {
      title: '意向客户',
      status: 1
    }, {
      title: '目标客户',
      status: 2
    }, {
      title: '已成交客户',
      status: 3
    }],
    statusIndex: 0,
    typeIndex: 0,
    typeList: [{ title: '最新互动', status: 0 }, { title: '最多互动', status: 1 }],
    showStyle: 0,
    loadStyle: 'loadMore',
  },
  dataStore: {
    pageSize: 10,
    pageIndex: 1
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
    getData(this);
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    getData(this);
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
    getData(this, true);
  },
  search(e) {
    getData(this);
  },
  bindKeywords(e) {
    this.data.keywords = e.detail.value;
  },
  changeType() {
    var itemList = this.data.typeList.map(item => {
      return item.title
    })
    var self = this;
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        self.dataStore.pageIndex = 1;
        self.setData({
          typeIndex: parseInt(res.tapIndex)
        });
        getData(self);
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  changeStatus() {
    var itemList = this.data.statusList.map(item => {
      return item.title
    })
    var self = this;
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        self.setData({
          statusIndex: parseInt(res.tapIndex)
        });
        getData(self);
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  toDetail(e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var customer = this.data.customerList[index];
    nav({
      url: '/pages/chat/chat',
      data: {
        cardId: app.globalData.cardId,
        toUid: customer.uid
      }
    })
  }
})

function getData(self, isGetMore = false) {
  var customerList = self.data.customerList,
    statusIndex = parseInt(self.data.statusIndex),
    typeIndex = parseInt(self.data.typeIndex);
  if (!isGetMore) {
    self.dataStore.pageIndex = 1;
  }
  let param = {
    url: 'CrmUser/getUserMsgNotRead',
    data: {
      pageSize: self.dataStore.pageSize,
      nickname: self.data.keywords,
      pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
    }
  };
  fetchApi(self, param).then((res) => {
    if (isGetMore) {
      self.dataStore.pageIndex++
    }
    let data = res.data.data;
    data.map(i => {
      if (i.content) {
        let newData = i.content;
        try {
          newData = JSON.parse(newData);
          if (newData.type === "text") {
            i.content = newData.content;
          } else if (newData.type === "image") {
            i.content = "[图片]";
          } else if (newData.type === "official") {
            i.content = `[官网]${newData.title}`;
          } else if (newData.type === "shop") {
            i.content = `[商品]${newData.title}`;
          } else if (newData.type === "info") {
            i.content = `[资讯]${newData.title}`;
          } else if (newData.type === "service") {
            i.content = `[服务]${newData.title}`;
          } else {
            i.content = "[暂不支持消息类型]"
          }
        } catch (e) { }
      }
    })
    self.setData({
      loadStyle: data.length < self.dataStore.pageSize ? 'loadOver' : 'loadMore',
      customerList: isGetMore ? self.data.customerList.concat(data) : data,
    })
    self.setData({
      showStyle: self.data.customerList.length == 0 ? 2 : 1
    })
  }).catch((err) => {
    self.setData({
      showStyle: 3
    })
  });
};