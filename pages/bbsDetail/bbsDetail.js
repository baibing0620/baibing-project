const app = getApp();
import { fetchApi, getToken ,addActionLog} from '../../api/api.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    extConfig: app.extConfig,
    showStyle: 0,
    switchTab: {
      tabs: [
        "评论",
        "转发",
        "赞"
      ],
      themeColor: app.extConfig.themeColor,
      currentIndex: 0,
      position: "relative",
      top: 0,
    },
    showMenuCurrentIndex: -1,
    showCommentReplyIndex: -1,
    commentRelayValue: '',
    commentRelayFocus: false,
    comment: "",
    detail: {},
    commentList: [],
    likeList: [],
    relayList: [],
    commentToast: "评论成功~",
    commentToastShow: false,
    pageIndex: 1,
    pageSize: 10,
    hasLiked: 0,
    liking: false,
    hasMore: false,
    startTime: 0
  },

  relayCommentTimer: null,
  replyTextareaShowing: false,

  handleDeleteCommentReply(e) {
    const {id, index , replyindex} = e.currentTarget.dataset;
    const {commentList, isMyPost, detail , ifPermission} = this.data;
    const {reply} = commentList[index];
    if (isMyPost != 1 && ifPermission != 1) return;
    wx.showModal({
      title: '提醒',
      content: '确认删除回复？',
      showCancel: true,
      confirmColor: '#fd9a33',
      success: (res) => {
        if (res.confirm) {
          const params = {
            url: 'XLFCommunity/delReply',
            data: {
              postId: detail.id,
              replyId: id
            }
          }
          fetchApi(this, params).then(() => {
            (reply || []).splice(replyindex, 1);
            this.setData({ commentList });
          }).catch(err => {
            console.log('error: ', err);
          });
        }
      },
      fail: (res) => {},
      complete: (res) => {},
    })
  },

  handleCommentReplyComfirm(e) {
    const value = e.detail.value;
    const {dataset} = e.currentTarget;
    const commentIndex = dataset.index;
    const replyIndex = dataset.replyindex;
    const {commentList, detail: {id}, isMyPost} = this.data;
    const replyComplate = commentList[commentIndex].reply[replyIndex];
    if (isMyPost != 1) return;
    replyComplate.editStatus = 1;
    commentList[commentIndex].reply[replyIndex] = replyComplate;
    const params = {
      url: 'XLFCommunity/replyPostComment',
      data: {
        postId: id,
        commentId: commentList[commentIndex].id,
        reply: value
      }
    }

    this.setData({
      commentList
    });

    fetchApi(this, params).then(res => {
      const {data} = res.data;
      replyComplate.editStatus = 0;
      replyComplate.id = data;
      let {reply} = commentList[commentIndex];
      reply = [...reply.filter(i => i.editStatus == -1), ...reply.filter(i => i.editStatus == 1) , replyComplate, ...reply.filter(i => !i.editStatus)]
      this.setData({ commentList });
    });
  },

  getRelayNotSend(reply = []) {
    /* 
    *   editStatus: -1 //未发送  0 //已发送  1 //正在发送   
    */
    const replys = (reply || []).filter(i => i.editStatus == -1);
    return replys && replys[0] ? replys[0] : {
      editStatus: -1,
      relay_comment: '',
      create_time: '刚刚'
    }
  },

  handleCommentReplyInput(e) {
    const {showCommentReplyIndex} = this.data;
    if (showCommentReplyIndex < 0) return;
    const {value} = e.detail;
    const {commentList} = this.data;
    const {reply} = commentList[showCommentReplyIndex];
    const replyNotSend = this.getRelayNotSend(reply);
    replyNotSend.relay_comment = value;
    commentList[showCommentReplyIndex].reply = [replyNotSend, ...(reply || []).filter(i => !i.editStatus)];
    this.setData({ commentList });
  },
  
  handleShowReplyComment(e) {
    this.replyTextareaShowing = true;
    const {index} = e.currentTarget.dataset;
    const {commentList, isMyPost} = this.data; 
    const {reply} = commentList[index];
    if (this.replyCommentTimer) clearTimeout(this.replyCommentTimer);
    const replyNotSend = this.getRelayNotSend(reply);
    if (isMyPost != 1) return;
    commentList[index].reply = [replyNotSend, ...(reply || []).filter(i => !i.editStatus)];
    this.setData({
      commentList,
      commentRelayValue: replyNotSend.relay_comment,
      showCommentReplyIndex: parseInt(index || 0)
    });
    this.relayCommentTimer = setTimeout(() => {
      this.setData({
        commentRelayFocus: true,
      });
      this.replyTextareaShowing = false;
    }, 100);
  },

  handleHideReplyComment() {
    if (this.replyTextareaShowing) return;
    this.setData({
      commentRelayValue: '',
      showCommentReplyIndex: -1,
      commentRelayFocus: false
    });
  },

  handleMenuStatusChange(e) {
    const {index} = e.currentTarget.dataset;
    const {showMenuCurrentIndex} = this.data;
    this.menuStatusChange(showMenuCurrentIndex == index ? -1 : index);
  },

  handlePageClick() {
    this.menuStatusChange();
  },

  menuStatusChange(showMenuCurrentIndex = -1) {
    this.setData({ showMenuCurrentIndex });
  },

  onTabClick(e) {
    this.menuStatusChange();
    if (e.detail.currentIndex !== this.data.switchTab.currentIndex) {
      this.setData({
        "switchTab.currentIndex": e.detail.currentIndex,
        commentList: [],
        likeList: [],
        relayList: [],
        pageIndex: 1,
        hasMore: false
      })
      this.getPostDetailRefresh();
      this.getList();
    }
  },

  getPostDetail() {
    let params = {
      url: app.API_HOST + "XLFCommunity/getPostDetail",
      data: {
        postId: this.data.id,
      }
    }
    fetchApi(this, params).then(res => {

      const {data} = res.data;
      const {switchTab} = this.data;
      const {card, card: {label}, ifPermission} = data;

      switchTab.tabs = [
        `评论${data.comment_num || 0}`,
        `转发${data.relay_num || 0}`,
        `赞${data.like_num || 0}`
      ]

      try {
        card.label = JSON.parse(label || '[]').filter(i => i);
      } catch (err) {
        console.log('处理对外标签错误：', err);
      }
      
      this.setData({
        showStyle: 1,
        detail: data,
        switchTab,
        userInfo: app.globalData.userInfo,
        ifPermission: parseInt(ifPermission || 0)
      })
      this.setRefreshData();
    }).catch(res => {
      console.log(res);
      this.setData({
        showStyle: 3
      })
    })
  },

  getPostDetailRefresh() {
    let params = {
      url: app.API_HOST + "XLFCommunity/getPostDetail",
      data: {
        postId: this.data.id,
      }
    }
    fetchApi(this, params).then(res => {

      this.data.switchTab.tabs = [
        `评论${res.data.data.comment_num || 0}`,
        `转发${res.data.data.relay_num || 0}`,
        `赞${res.data.data.like_num || 0}`
      ]

      this.setData({
        switchTab: this.data.switchTab,
        "detail.comment_num": res.data.data.comment_num,
        "detail.relay_num": res.data.data.relay_num,
        "detail.like_num": res.data.data.like_num,
      })
      this.setRefreshData();
    }).catch(res => {
      console.log(res);
      this.setData({
        showStyle: 3
      })
    })
  },

  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.detail.image_list,
    })
  },

  clickLike() {
    if (!this.data.liking) {
      this.data.liking = true;
      let id = this.data.detail.id;
      let hasSelf = parseInt(this.data.hasLiked);
      if (hasSelf) {
        this.dontLike(id);
      } else {
        addActionLog(this, {
            type: 28,
            detail: {
                name: this.data.detail.title
            }
        });
        this.like(id)
      }
    }
  },

  like(id) {
    let params = {
      url: app.API_HOST + "XLFCommunity/addPostLikeAndRelayCount",
      data: {
        postId: id,
        type: 1
      }
    }

    fetchApi(this, params).then(res => {
      this.data.liking = false;
      this.data.detail.like_num ? this.data.detail.like_num = parseInt(this.data.detail.like_num) + 1 : this.data.detail.like_num = 1;
      this.data.switchTab.tabs[2] = `赞${this.data.detail.like_num}`;
      this.data.likeList.unshift({
        id: -1,
        like_relay_time: "刚刚",
        member: {
          nickname: this.data.userInfo.nickName,
          avatar: this.data.userInfo.avatarUrl
        }
      })
      this.setData({
        detail: this.data.detail,
        switchTab: this.data.switchTab,
        likeList: this.data.likeList,
        hasLiked: 1
      })
      this.setRefreshData();
    }).catch(res => {
      console.log(res);
    })
  },

  dontLike(id) {
    let params = {
      url: app.API_HOST + "XLFCommunity/cancelLikePost",
      data: {
        postId: id,
      }
    }

    fetchApi(this, params).then(res => {
      this.data.liking = false;
      this.data.detail.like_num = parseInt(this.data.detail.like_num) - 1;
      this.data.detail.like_num < 0 ? this.data.detail.like_num = 0 : "";
      this.data.switchTab.tabs[2] = `赞${this.data.detail.like_num}`;

      let index = this.data.likeList.findIndex((value, index, arr) => {
        return value.member.nickname === this.data.userInfo.nickName && value.member.avatar === this.data.userInfo.avatarUrl;
      })

      if (index >= 0) {
        this.data.likeList.splice( index, 1 );
      }

      this.setData({
        detail: this.data.detail,
        switchTab: this.data.switchTab,
        likeList: this.data.likeList,
        hasLiked: 0
      })
      this.setRefreshData();
    }).catch(res => {
      console.log(res);
    })
  },

  commentInput(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  sendComment() {
    let comment = this.data.comment.replace(/(^\s*)|(\s*$)/g, "");
    if (comment) {
      this.toSendComment(comment);
      setTimeout(() => {
        this.setData({
          comment: ""
        })
      }, 300);
    }
  },

  toSendComment(content) {
    let params = {
      url: app.API_HOST + "XLFCommunity/addPostComment",
      data: {
        postId: this.data.detail.id,
        content: content
      }
    }
    fetchApi(this, params).then(res => {
      
      let id = parseInt(res.data.data.commentId);
      let ifAudit = parseInt(res.data.data.ifAudit);
      if (ifAudit) {
        this.data.commentList.unshift({
          id: id,
          content: content,
          createtime: "刚刚",
          has_self: 1,
          member: {
            nickname: this.data.userInfo.nickName,
            avatar: this.data.userInfo.avatarUrl, 
          }
        });

        this.data.detail.comment_num ? this.data.detail.comment_num = parseInt(this.data.detail.comment_num) + 1 : this.data.detail.comment_num = 1;
        this.data.switchTab.tabs[0] = `评论${this.data.detail.comment_num}`;

        this.setData({
          commentList: this.data.commentList,
          switchTab: this.data.switchTab,
        })
        this.showCommentToast("评论成功~");
        this.setRefreshData();
      } else {
        this.showCommentToast("您的评论已提交审核~");
      }
    })

  },

  showCommentToast(msg) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.setData({
      commentToast: msg,
      commentToastShow: true,
    })
    this.timeout = setTimeout(() => {
      this.setData({
        commentToastShow: false,
      })
    }, 1500)
  },

  getCommentList() {
    let params = {
      url: app.API_HOST + "XLFCommunity/getPostCommentInfo",
      data: {
        postId: this.data.id,
        pageSize: this.data.pageSize,
        pageIndex: this.data.pageIndex
      }
    }
    fetchApi(this, params).then(res => {
      const {list, isMyPost} = res.data.data;
      this.data.hasMore = this.data.pageSize <= list.length;
      this.setData({
        commentList: this.data.commentList.concat(list),
        isMyPost: isMyPost ? parseInt(isMyPost) : 0,
        loadStyle: this.data.hasMore ? "loadMore" : "loadOver",
      })
    }).catch(res => {
      console.log(res);
    })
  },

  getLikeList() {
    let params = {
      url: app.API_HOST + "XLFCommunity/getPostLikeInfo",
      data: {
        postId: this.data.id,
        pageSize: this.data.pageSize,
        pageIndex: this.data.pageIndex
      }
    }
    fetchApi(this, params).then(res => {
      let hasLiked = parseInt(res.data.data.has_self);
      let list = res.data.data.likeList;
      if (this.data.switchTab.currentIndex === 2) {
        this.data.hasMore = this.data.pageSize <= list.length;
      }
      this.setData({
        likeList: this.data.likeList.concat(list),
        loadStyle: this.data.hasMore ? "loadMore" : "loadOver",
        hasLiked: hasLiked
      })
    }).catch(res => {
      console.log(res);
    })
  },

  getRelayList() {
    let params = {
      url: app.API_HOST + "XLFCommunity/getPostRelayInfo",
      data: {
        postId: this.data.id,
        pageSize: this.data.pageSize,
        pageIndex: this.data.pageIndex
      }
    }
    fetchApi(this, params).then(res => {
      let list = res.data.data;
      this.data.hasMore = this.data.pageSize <= list.length;
      this.setData({
        relayList: this.data.relayList.concat(list),
        loadStyle: this.data.hasMore ? "loadMore" : "loadOver",
      })
    }).catch(res => {
      console.log(res);
    })
  },

  getList() {

    this.setData({
      loadStyle: "loading"
    })
    if (this.data.switchTab.currentIndex === 0) {
      this.getCommentList();
    } else if (this.data.switchTab.currentIndex === 1) {
      this.getRelayList();
    } 
    else if (this.data.switchTab.currentIndex === 2) {
      this.getLikeList();
    }
    
  },

  playVideo() {
    this.data.detail.video_play_count = parseInt(this.data.detail.video_play_count) + 1;
    addActionLog(this, {
        type: 30,
        detail: {
            name: this.data.detail.title
        }
    });
    this.setData({
      videoPlay: true,
      detail: this.data.detail
    })
    this.analysisVideoPlayCount();
    this.setRefreshData();
  },

  playEnd() {
    this.setData({
      videoPlay: false
    })
  },

  analysisVideoPlayCount() {
    let params = {
      url: app.API_HOST + "XLFCommunity/analysisVideoPlayCount",
      data: {
        postId: this.data.id
      }
    }
    fetchApi(this, params).then(res => {
      console.log(res);
    }).catch(res => {
      console.log(res);
    })
  },

  deleteComment(e) {
    let data = e.currentTarget.dataset;
    wx.showModal({
      title: '提醒',
      content: '确认删除评论？',
      showCancel: true,
      confirmColor: '#fd9a33',
      success: (res) => {
        if (res.confirm) {
          const id = parseInt(data.id);
          const index = parseInt(data.index);
          const hasSelf = parseInt(data.hasself);
          const {isMyPost, ifPermission} = this.data;
          if (hasSelf) {
            this.delPostCommentMyself(id, index)
          } else if (isMyPost == 1 || ifPermission == 1) {
            this.delComment(id, index);
          }
        }
      },
      fail: (res) => {},
      complete: (res) => {},
    })
  },

  delComment(id, index) {
    let params = {
      url: app.API_HOST + "XLFCommunity/delComment",
      data: {
        commentId: id
      }
    }
    fetchApi(this, params).then(res => {
      this.deleteCommentView(index);
    }).catch(res => {
      console.log(res);
    })
  },

  delPostCommentMyself(id, index) {
    let params = {
      url: app.API_HOST + "XLFCommunity/delPostCommentMyself",
      data: {
        commentId: id
      }
    }
    fetchApi(this, params).then(res => {
      this.deleteCommentView(index);
    }).catch(res => {
      console.log(res);
    })
  },

  deleteCommentView(index) {
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 1500,
      mask: false,
    })
    this.data.commentList.splice(index, 1);
    this.data.detail.comment_num = parseInt(this.data.detail.comment_num) - 1;
    this.data.detail.comment_num < 0 ? this.data.detail.comment_num = 0 : "";
    this.data.switchTab.tabs[0] = `评论${this.data.detail.comment_num}`;
    this.setData({
      commentList: this.data.commentList,
      switchTab: this.data.switchTab
    })
    this.setRefreshData();
  },

  share() {
    let params = {
      url: app.API_HOST + "XLFCommunity/addPostLikeAndRelayCount",
      data: {
        postId: this.data.detail.id,
        type: 2
      }
    }
    fetchApi(this, params).then(res => {
      
      this.data.detail.relay_num ? this.data.detail.relay_num = parseInt(this.data.detail.relay_num) + 1 : this.data.detail.relay_num = 1;
      this.data.switchTab.tabs[1] = `转发${this.data.detail.relay_num}`;
      this.data.relayList.unshift({
        id: -1,
        like_relay_time: "刚刚",
        member: {
          nickname: this.data.userInfo.nickName,
          avatar: this.data.userInfo.avatarUrl
        }
      })
      this.setData({
        detail: this.data.detail,
        switchTab: this.data.switchTab,
        relayList: this.data.relayList,
      })
      this.setRefreshData();
    }).catch(res => {
      console.log(res);
    })
  },

  toBBS() {
    wx.switchTab({
      url: '/pages/bbs/bbs'
    })
  },

  init() {
    this.setData({
      commentList: [],
      likeList: [],
      relayList: [],
      pageIndex: 1,
      liking: false,
      hasMore: false,
    })
    this.getPostDetail();
    this.getList();
    if(this.data.switchTab.currentIndex !== 2) {
      this.getLikeList();
    }
  },

  setRefreshData() {
    if (!this.data.fromShare) {
      this.data.detail.has_self = this.data.hasLiked;
      app.globalData.refreshData = [this.data.detail];
    }
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
    if (options.id) {
      this.setData({
        id: parseInt(options.id)
      })
    }
    if (options.index) {
      this.setData({
        index: parseInt(options.index)
      })
    }
    if (options.cardId) {
      app.globalData.cardId = options.cardId;
      options.fromUser ? app.globalData.fromUser = options.fromUser : "";
      this.data.fromShare = true;
      this.init();
      this.setData({
        isFromShare: true
      });
    } else {
      this.init();
    }
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
    this.setData({
      startTime: new Date().getTime()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    const { startTime, id, detail: { title }} = this.data
    addActionLog(this, {
      type: 27,
      detail: {
        name: title,
        id,
        duration: new Date().getTime() - startTime,
      }
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    const { startTime, id, detail: { title }} = this.data
    addActionLog(this, {
      type: 27,
      detail: {
        name: title,
        id,
        duration: new Date().getTime() - startTime,
      }
    });
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
      this.data.pageIndex ++;
      this.getList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let data = this.data.detail;
    let img;
    parseInt(data.type) === 1 ? img = data.image_list[0] : img = data.video_cover_image;
      addActionLog(this, {
          type: 29,
          detail: {
              name: data.title
          }
      });
    let shareData = {
      title: data.title,
      path: `/pages/bbsDetail/bbsDetail?cardId=${app.globalData.cardId}&id=${this.data.id}&fromUser=${app.globalData.uid}`,
    }
    img ? shareData.imageUrl = img + "?imageView2/1/w/710/h/400" : "";
    this.share();
    return shareData;
  }
})