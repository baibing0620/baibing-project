const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    extConfig: app.extConfig,
    postList: [],
    showStyle: 0,
    pageIndex: 1,
    pageSize: 20,
    listRequestOver: false,
    settingRequestOver: false,
    hasMore: true,
  },

  getPostList( title = "" ) {
    if (!this.data.loading) {
      this.data.loading = true;
      this.data.hasMore = false;
      this.setData({
        loadStyle: "loading"
      })
      let params = {
        url: app.API_HOST + "XLFCommunity/getMyPostList",
        data: {
          pageIndex: this.data.pageIndex,
          pageSize: this.data.pageSize
        }
      }

      if (title) {
        params.data.title = title.replace(/(^\s*)|(\s*$)/g, "");
      }

      fetchApi(this, params).then(res => {
        this.data.pageIndex ++;
        this.data.hasMore = res.data.data.length >= this.data.pageSize;
        this.data.listRequestOver = true;
        if (this.data.settingRequestOver) {
          this.data.showStyle = 1;
        }
        this.setData({
          postList: this.data.postList.concat(res.data.data),
          loadStyle: this.data.hasMore ? "loadMore" : "loadOver",
          showStyle: this.data.showStyle
        })
        this.data.loading = false;
      }).catch(res => {
        this.setData({
          showStyle: 3
        })
      })
    }
  },

  bindInput(e) {
    this.setData({
      posterName: e.detail.value
    })
  },

  search(e) {
    this.setData({
      postList: []
    })
    if (this.data.posterName) {
      this.data.search = true;
    } else {
      this.data.search = false;
    }
    this.data.pageIndex = 1;
    this.getPostList(this.data.posterName);
  },

  deletePost(e) {
    wx.showModal({
      title: '提醒',
      content: '确认删除？',
      showCancel: true,
      cancelColor: this.data.extConfig.themeColor,
      confirmColor: this.data.extConfig.themeColor,
      success: (res) => {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let id = e.currentTarget.dataset.id;
          let videoId = e.currentTarget.dataset.video_id || 0;
          this.data.postList.splice(index, 1);
          this.setData({
            postList: this.data.postList
          });
          this.toDelete(id);
          if (parseInt(videoId) > 0) {
            this.deleteVideo(videoId);
          }
        }
      },
    })
  },

  toDelete(id) {
    let params = {
      url: app.API_HOST + "XLFCommunity/delCommunityPost",
      data: {
        postId: id
      }
    }
    fetchApi(this, params).then(res => {
    }).catch(res => {
      console.log(res);
    })
  },

  getTokenAndDomain() {
    return new Promise((resolve, reject) => {
      let params = {
        url: app.API_HOST + "videoApp/getToken",
        data: {}
      }
      fetchApi(this, params).then(res => {
        this.data.token = res.data.data.token;
        this.data.domain = res.data.data.domain;
        resolve(res.data.data);
      }).catch(res => {
        reject(res);
      })
    })
  },

  request(params) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: params.url,
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: params.data,
        success: (res) => {
          if (res.data.code >= 0) {
            resolve(res);
          } else if (res.data.code == -10) {
            wx.showModal({
              title: '提示',
              content: res.data && res.data.msg ? res.data.msg : 'error',
              success: function (res) {
                if (res.confirm) {
                  page.setData({
                    showGetUserInfo: true
                  })
                  page.getUserInfo = function (e) {
                    page.setData({
                      showGetUserInfo: false
                    })
                    if (!e.detail.userInfo) {
                      showTips('授权失败');
                      return
                    }
                    let userInfo = e.detail.userInfo;
                    login(userInfo).then(res => {
                      wx.navigateBack({
                        delta: 5
                      })
                    })
                  }
                } else if (res.cancel) {
                  reject('用户点击取消')
                }
              }
            });
          } else if (res.data.code == -100) {
            wx.showModal({
              title: '提示',
              content: res.data && res.data.msg ? res.data.msg : 'error',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  reject('code=100');
                }
              }
            })
            reject('code=-100');
          } else if (res.statusCode == 500 || res.statusCode == 404) {
            reject('服务器开小差了');
          } else {
            reject(res);
          }
        },
        fail: (res) => {
          reject(res);
        }
      })
    })
  },

  deleteOnlineVideo(id) {
    let params = {
      url: this.data.domain + "/video/video/delete",
      data: {
        video_id: id,
        token: this.data.token
      }
    }
    this.request(params).then(res => {
    }).catch(res => {
      console.log(res);
    })
  },

  deleteVideo(id) {
    // if (this.data.token) {
      this.deleteOnlineVideo(id);
    // } else {
    //   this.getTokenAndDomain().then(res => {
    //     this.deleteOnlineVideo(id);
    //   }).catch(res => {
    //     console.log(res);
    //   })
    // }
  },

  toEditor() {
    if (this.data.canPost) {
      nav({ url: "/pages/bbsEditor/bbsEditor" });
    } else {
      wx.showModal({
        title: '提示',
        content: '企业未设置发贴类型',
        confirmColor: '#fd9a33',
      })
    }
  },

  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index
    nav({
      url: "/pages/bbsDetail/bbsDetail",
      data: {
        id: id,
        index: index
      }
    });
  },

  getTypeSetting() {
    let params = {
      url: app.API_HOST + "XLFCommunity/getGroupSettingWithPostType",
      data: {}
    }
    fetchApi(this, params).then(res => {
      let arr = res.data.data;
      this.data.settingRequestOver = true;
      if (this.data.listRequestOver) {
        this.data.showStyle = 1;
      }
      this.setData({
        canPost: arr.length > 0,
        showStyle: this.data.showStyle
      })
    }).catch(res => {
      console.log(res);
    })
  },

  getRefreshData() {
    if (app.globalData.refreshData) {
      let refreshData = app.globalData.refreshData;
      let id = refreshData.id;
      let list = this.data.postList;
      let index = list.findIndex((item) => {
        return parseInt(item.id) === parseInt(id);
      })
      if (index >= 0) {
        list[index].comment_num = refreshData.comment_num || 0;
        list[index].relay_num = refreshData.relay_num || 0;
        list[index].like_num = refreshData.like_num || 0;
        list[index].has_self = refreshData.hasLiked || 0;
        this.setData({
          postList: list
        })
      }
      app.globalData.refreshData = "";
    }
  },

  init() {
    this.setData({
      postList: [],
      posterName: ""
    })
    this.data.search = false;
    this.data.pageIndex = 1;
    this.getPostList();
    this.getTypeSetting();
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
    if (app.globalData.refresh) {
      app.globalData.refresh = "";
      this.init();
    } else {
      this.getRefreshData();
    }
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
      if (this.data.search) {
        this.getPostList(this.data.posterName);
      } else {
        this.getPostList();
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})