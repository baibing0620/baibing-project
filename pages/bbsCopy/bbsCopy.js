const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog} from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    extConfig: app.extConfig,
    posterName: "",
    search: false,
    groups: [],
    postList: [],
    showStyle: 0,
    pageIndex: 1,
    pageSize: 20,
    videoPlayIndex: -1,
    liking: false,
    hasMore: true,
  },

  dataStore: {
    startTime: 0
  },

  getPostList(title = "") {
    if (!this.data.loading) {
      this.data.loading = true;
      this.data.hasMore = false;
      this.setData({
        loadStyle: "loading"
      })
      let params = {
        url: app.API_HOST + "XLFCommunity/getPostList",
        data: {
          pageIndex: this.data.pageIndex,
          pageSize: this.data.pageSize,
          groupId: this.data.groupId
        }
      }

      if (title) {
        params.data.title = title.replace(/(^\s*)|(\s*$)/g, "");
      }

      fetchApi(this, params).then(res => {
        const {list} = res.data.data;
        this.data.pageIndex ++;
        this.data.hasMore = list.length >= this.data.pageSize;
        list.map(i => {
          const {card, card: {label}} = i;
          try {
            card.label = JSON.parse(label || '[]').filter(i => i);
          } catch (err) {
            console.log('处理对外标签错误：', err);
          }
        });
        this.setData({
          postList: this.data.postList.concat(list),
          loadStyle: this.data.hasMore ? "loadMore" : "loadOver",
          showStyle: 1,
        })
        this.setRefreshData();
        this.data.loading = false;
      }).catch(res => {
        this.data.loading = false;
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

  previewImage(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.postList[index].image_list,
    })
  },
  
  networkFaildRealod() {
    this.setData({
      showStyle: 0
    })
    this.init();
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
          this.data.postList.splice(index, 1);
          this.setData({
            postList: this.data.postList
          });
          this.toDelete(id);
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
      console.log(res);
    }).catch(res => {
      console.log(res);
    })
  },

  toEditor() {
    nav({ url: "/pages/bbsEditor/bbsEditor" });
  },

  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    nav({
      url: "/pages/bbsDetail/bbsDetail",
      data: {
        id: id,
        index: index
      }
    });
  },

  share(id, index) {
    let params = {
      url: app.API_HOST + "XLFCommunity/addPostLikeAndRelayCount",
      data: {
        postId: id,
        type: 2
      }
    }
    fetchApi(this, params).then(res => {

      this.data.postList[index].relay_num = parseInt(this.data.postList[index].relay_num) + 1;
      this.setData({
        postList: this.data.postList,
      })
      this.setRefreshData();
    }).catch(res => {
      console.log(res);
    })
  },

  clickLike(e) {
    if (!this.data.liking) {
      this.data.liking = true;
      let id = e.currentTarget.dataset.id;
      let index = parseInt(e.currentTarget.dataset.index);
      let hasSelf = parseInt(e.currentTarget.dataset.hasself);
      console.log(e);
      console.log(id, index, hasSelf);
      if (hasSelf) {
        this.dontLike(id, index);
      } else {
        addActionLog(this, {
            type: 28,
            detail: {
                name: this.data.postList[index].title
            }
        });
        this.like(id, index)
      }
    }
  },

  like(id, index) {
    let params = {
      url: app.API_HOST + "XLFCommunity/addPostLikeAndRelayCount",
      data: {
        postId: id,
        type: 1
      }
    }

    fetchApi(this, params).then(res => {
      this.data.liking = false;
      this.data.postList[index].has_self = 1;
      this.data.postList[index].like_num = parseInt(this.data.postList[index].like_num) + 1;
      this.setData({
        postList: this.data.postList
      })
      this.setRefreshData();
    }).catch(res => {
      console.log(res);
    })
  },

  dontLike(id, index) {
    let params = {
      url: app.API_HOST + "XLFCommunity/cancelLikePost",
      data: {
        postId: id,
      }
    }

    fetchApi(this, params).then(res => {
      this.data.liking = false;
      this.data.postList[index].has_self = 0;
      this.data.postList[index].like_num = parseInt(this.data.postList[index].like_num) - 1;
      this.data.postList[index].like_num < 0 ? this.data.postList[index].like_num = 0 : "";
      this.setData({
        postList: this.data.postList
      })
    }).catch(res => {
      console.log(res);
    })
  },

  playVideo(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    let id = parseInt(e.currentTarget.dataset.id);
    addActionLog(this, {
        type: 30,
        detail: {
            name: this.data.postList[index].title
        }
    });
    this.data.postList[index].video_play_count = parseInt(this.data.postList[index].video_play_count) + 1;
    this.setData({
      videoPlayIndex: index,
      postList: this.data.postList
    })
    this.analysisVideoPlayCount(id);
    this.setRefreshData();
  },

  playEnd() {
    this.setData({
      videoPlayIndex: -1
    })
  },

  analysisVideoPlayCount(id) {
    let params = {
      url: app.API_HOST + "XLFCommunity/analysisVideoPlayCount",
      data: {
        postId: id
      }
    }
    fetchApi(this, params).then(res => {
      console.log(res);
    }).catch(res => {
      console.log(res);
    })
  },

  toGroup(e) {
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name
    nav({
      url: "/pages/bbsCopy/bbsCopy",
      data: {
        id: id,
        name: name
      }
    })
  },

  init() {
    this.setData({
      postList: [],
      posterName: "",
      videoPlayIndex: -1
    })
    this.data.search = false;
    this.data.pageIndex = 1;
    this.getPostList();
  },

  tapNull() {

  },

  setRefreshData() {
    app.globalData.refreshData = this.data.postList;
  },

  getRefreshData() {
    if (app.globalData.refreshData) {
      console.log(app.globalData.refreshData, "refreshData");
      let refreshData = app.globalData.refreshData;
      let list = this.data.postList;
      refreshData.map(i => {
        let index = list.findIndex((item) => {
          return parseInt(item.id) === parseInt(i.id);
        })
        if (index >= 0) {
          list[index] = i;
        }
      })
      this.setData({
        postList: list
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.cardId) {
      app.globalData.cardId = options.cardId;
      options.fromUser ? app.globalData.fromUser = options.fromUser : "";
      this.setData({
        isFromShare: true
      });
    }

    if (options.id) {
      this.setData({
        groupId: parseInt(options.id)
      })
    }

    if (options.name) {
      this.data.name = decodeURI(options.name);
      wx.setNavigationBarTitle({
        title: this.data.name
      })
    }
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
    this.getRefreshData();
    this.dataStore.startTime = new Date().getTime();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    const {name} = this.data
    const {startTime} = this.dataStore
    addActionLog(this, {
      type: 26,
      detail: {
        name,
        duration: new Date().getTime() - startTime,
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    const {name} = this.data
    const {startTime} = this.dataStore
    addActionLog(this, {
      type: 26,
      detail: {
        name,
        duration: new Date().getTime() - startTime,
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.loading = false;
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      let data = res.target.dataset;
        addActionLog(this, {
            type: 29,
            detail: {
                name: this.data.postList[data.index].title
            }
        });
      this.share(data.id, data.index);
      let shareData = {
        title: data.title,
        path: `/pages/bbsDetail/bbsDetail?cardId=${app.globalData.cardId}&id=${data.id}&fromUser=${app.globalData.uid}`
      };
      data.img ? shareData.imageUrl = data.img + "?imageView2/1/w/710/h/400" : "";
      return shareData;
    } else {
        addActionLog(this, {
            type: 37,
            detail: {
                name: '动态'
            }
        });
      return {
        path: `/pages/bbsCopy/bbsCopy?id=${this.data.groupId}&name=${this.data.name}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
      }
    }
  }
})