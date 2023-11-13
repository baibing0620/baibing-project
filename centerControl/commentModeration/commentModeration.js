const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    extConfig: app.extConfig,
    commentList: [],
    showStyle: 0,
    pageIndex: 1,
    pageSize: 20,
    hasMore: true,
  },

  getCommentList() {
    if (!this.data.loading) {
      this.data.loading = true;
      this.data.hasMore = false;
      let params = {
        url: app.API_HOST + "XLFCommunity/getCommentNeedAudit",
        data: {
          pageIndex: this.data.pageIndex,
          pageSize: this.data.pageSize
        }
      }

      fetchApi(this, params).then(res => {
        this.data.pageIndex++;
        this.data.hasMore = res.data.data.length >= this.data.pageSize;
        this.setData({
          commentList: this.data.commentList.concat(res.data.data),
          loadStyle: this.data.hasMore ? "loadMore" : "loadOver",
          showStyle: 1
        })
        this.data.loading = false;
      })
    }
  },

  comfirm(e) {
    let ifAudit = parseInt(e.currentTarget.dataset.audit);

    wx.showModal({
      title: "提醒",
      content: ifAudit === 1 ? "确认通过？" : "确认拒绝？",
      showCancel: true,
      cancelColor: this.data.extConfig.themeColor,
      confirmColor: this.data.extConfig.themeColor,
      success: (res) => {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let id = e.currentTarget.dataset.id;

          this.data.commentList.splice(index, 1);
          this.setData({
            commentList: this.data.commentList
          });
          this.audit(id, ifAudit);
        }
      },
    })
  },

  audit(id, ifAudit) {
    let params = {
      url: app.API_HOST + "XLFCommunity/auditComment",
      data: {
        commentId: id,
        ifAudit: ifAudit
      }
    }
    fetchApi(this, params).then(res => {
    }).catch(res => {
      console.log(res);
    })
  },

  init() {
    this.setData({
      commentList: []
    })
    this.data.pageIndex = 1;
    this.getCommentList();
  },

  networkFaildRealod() {
    this.setData({
      showStyle: 0
    })
    this.init();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
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
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.getCommentList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})