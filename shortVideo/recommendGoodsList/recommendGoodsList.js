const app = getApp();
import {
    fetchApi,
} from '../../api/api.js';
import {
    nav,
    showTips
} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    diyConfig: app.extConfig,
    type: 0,
    extConfig: app.extConfig,
    scrollHeight: 0,
    total: 0,
    list: [],
    pageSize: 20,
    pageIndex: 1,
    goods: {
      link_goods_id: 0,
      goodsName: "请选择商品"
    },
    loading: false,
    goodsList: [],
    search: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const {type} = options
    this.setData({
      type: type
    })
    wx.getSystemInfo({
      success: (res) => {
          this.setData({
            scrollHeight: res.windowHeight - 88
          })
      },
      fail: (res) => {
      }
    })
    this.getGoodsList()
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

  },

  getGoodsList() {
    this.data.loading = true;
    this.setData({
        loadStyle: "loading"
    })
    let params = {
        url: app.API_HOST + "editor/goodsList",
        data: {
          cardId: '',
          name: this.data.search,
          cid: 0,
          promoteType: 0,
          pageSize: this.data.pageSize,
          pageIndex: this.data.pageIndex
      }
    }
    if (this.data.type == 1) params.data.cardId = app.globalData.cardId;
    fetchApi(this, params).then(res => {
        let data = res.data.data.data;
        this.setData({
            goodsList: this.data.pageIndex === 1 ? data : this.data.goodsList.concat(data),
            total:  parseInt(res.data.data.total),
            loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver",
            showStyle: 1
        });
        this.data.loading = false;
    }).catch(res => {
        console.log(res);
        this.setData({
            showStyle: 1
        })
        this.data.loading = false;
    });
  },

  lower() {
    if (this.data.goodsList.length < this.data.total) {
      let pageIndex = this.data.pageIndex + 1
      this.setData({
        pageIndex: pageIndex
      })
      this.getGoodsList()
    }
  },
  bindKeywords(e) {
    this.setData({
      search : e.detail.value
    })
    if (e.detail.value == '') {
      this.selectResult()
    }
  },
  selectResult() {
    this.setData({
      pageIndex : 1
    })
    this.getGoodsList()
  },
  radioChange(e) {
    console.log(e.detail.value)
    let goods = {
      link_goods_id: e.detail.value,
      goodsName: ""
    }
    let list = this.data.goodsList
    list.forEach(element => {
      if (element.id == e.detail.value) {
        goods.goodsName = element.title
      }
    });
    this.setData({
      goods: goods
    })
  },
  submit() {
    var pages = getCurrentPages();   //当前页面
    var prevPage = pages[pages.length - 2];   //上个页面
    // 直接给上一个页面赋值
    prevPage.setData({
      goods: this.data.goods
    });
    wx.navigateBack({
      delta: 1
    })
  }
})