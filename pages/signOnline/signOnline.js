// pages/signOnline/signOnline.js
const app = getApp();
import { fetchApi, addActionLog, getEffectiveCardId } from '../../api/api.js';
import { nav, getTitleFromTabbar, showTips, showToast, showLoading} from '../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    signOnlineTitle: [
      {name: '全部', type: -1, id: 0},
      {name: '已完成', type: 2, id: 1},
      {name: '签署中', type: 1, id: 2},
      {name: '已撤回', type: 3, id: 3},
      {name: '已过期', type: 5, id: 4},
      {name: '待经办', type: -2, id: 5},
    ],
    signOnlineList: [],
    actvieIndex: 0,
    startX: 0, //开始坐标
    startY: 0,
  },
  store: {
    pageIndex: 1,
    pageSize: 10,
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    const { state, record } = e.currentTarget.dataset
    if(state==5||state==1||state==2||state==-2||state==-1){
      //开始触摸时 重置所有删除
      this.data.signOnlineList.map((v, i)=>{
        if (v.isTouchMove)//只操作为true的
          v.isTouchMove = false;
      })
      this.setData({
        startX: e.changedTouches[0].clientX,
        startY: e.changedTouches[0].clientY,
        signOnlineList: this.data.signOnlineList
      })
    }
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      state = e.currentTarget.dataset.state,//当前状态
      id = e.currentTarget.dataset.id,
      record = e.currentTarget.dataset.record,
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
      if(state==5||state==1||state==2||state==-2||state==-1){
        that.data.signOnlineList.map((v, i)=>{
          v.isTouchMove = false
          //滑动超过30度角 return
          if (Math.abs(angle) > 30) return;
          if (i == index) {
            if (touchMoveX > startX) //右滑
              v.isTouchMove = false
            else //左滑
              v.isTouchMove = true
          }
        })
      }
    //更新数据
    that.setData({
      signOnlineList: that.data.signOnlineList
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var dX = end.X - start.X,
      dY = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(dY / dX) / (2 * Math.PI);
  },
  // 一键发起
  Launch(e){
    const { id } = e.currentTarget.dataset
    let params = {
      url: 'ElectronicContractInitiateSign/waitInitiateSign',
      data: {
        id: id,
        user_id: app.globalData.cardId
      }
    }
    fetchApi(this,params).then(res=>{
      if(res.data.code==200){
        showToast('发起成功', 'success');
        this.getShowContract(this.data.actvieType)
      }
    }).catch(err=>{
      console.log(err)
    })
  },
  //删除事件
  del: function (e) {
    const { state ,index, flowid, name, num, id, record } = e.currentTarget.dataset
    if(state == -1||state == -2){
      let params = {
        url: 'ElectronicContractInitiateSign/delWaitInitiateSign',
        data: {
          id: id,
          card_id: app.globalData.cardId
        }
      }
      fetchApi(this,params).then(res=>{
        if(res.data.code==200){
          this.data.signOnlineList.splice(index, 1)
          this.setData({
            signOnlineList: this.data.signOnlineList
          })
          showToast('删除成功', 'success');
        }
      }).catch(err=>{
        console.log(err)
      })
    }
    if(state == 1){
      let params = {
        url: 'ElectronicContractInitiateSign/revokeFlowFile',
        data: {
          flowId: flowid,
          card_id: app.globalData.cardId
        }
      }
      fetchApi(this,params).then(res=>{
        this.setData({
          signOnlineList: this.data.signOnlineList
        })
        if(res.data.code==200){
          showToast('撤回成功', 'success');
          this.getShowContract(this.data.actvieType);
        }
      }).catch(err=>{
        console.log(err)
      })
    }
    if(state == 5){
      let params = {
        url: 'ElectronicContractInitiateSign/deleteFlowFile',
        data: {
          flowId: flowid,
          card_id: app.globalData.cardId
        }
      }
      fetchApi(this,params).then(res=>{
        if(res.data.code==200){
          this.data.signOnlineList.splice(index, 1)
          this.setData({
            signOnlineList: this.data.signOnlineList
          })
          showToast('删除成功', 'success');
        }
      }).catch(err=>{
        console.log(err)
      })
    }
    if(state == 2){
      wx.setClipboardData({
        data: app.API_HOST + `ElectronicContractInitiateSign/downloadContractZip?token=${app.globalData.token}&cardId=${app.globalData.cardId}&card_id=${app.globalData.cardId}&beid=${app.globalData.beid}&flowId=${flowid}`,
        success: function (res) {
          wx.showToast({
            title: '复制下载地址成功',
            mask: false,
            icon: 'none',
            duration: 1500
          });
        }
      })
      // let params = {
      //   url: app.API_HOST + 'ElectronicContractInitiateSign/downloadContractZip',
      //   data: {
      //     flowId: '159712104d3f433c83b3526d2c274654',
      //     // type: 1,
      //     // card_id: app.globalData.cardId
      //   }
      // }
      // wx.showToast({
      //   title: '正在打开预览下载',
      //   mask: false,
      //   icon: 'none',
      //   duration: 1500
      // });
      // fetchApi(this,params).then(res=>{
      //   if(res.data.code==200){
      //     wx.downloadFile({
      //       url: app.API_HOST + `ElectronicContractInitiateSign/downloadPdf?token=${app.globalData.token}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&url=${res.data.data}&name=${name+num}.pdf`,
      //       success(_res){
      //         console.log(_res)
      //         if (_res.statusCode === 200) {
      //           const filePath = _res.tempFilePath
      //           console.log(filePath)
      //           wx.openDocument({
      //             filePath: filePath,
      //             success: function (_res) {
      //               console.log(_res)
      //             }
      //           })
      //         }
      //       }
      //     })
      //   }
      // })
    }
  },



  handleInput (e) {
    const { value } = e.detail;
    this.setData({
      searchValue: value
    });
  },
  handleDelete () {
    this.setData({
        searchValue: ''
    });
  },
  handleSearch () {
    const { searchValue } = this.data;
    this.setData({actvieIndex: 0})
    this.getShowContract( -1, searchValue )
  },
  activeTopTap(e) {
    let {type,index} = e.currentTarget.dataset;
    this.setData({
      actvieIndex: index,
      actvieType: type,
      signOnlineList: [],
      loadStyle: '',
      'dataStore.pageIndex': 1,
    })
    this.getShowContract(type)
  },
  // contractView
  goContract(e){
    const {pdf} = e.currentTarget.dataset
    this.getcontractView(pdf)
  },
  getcontractView(pdf){
    showToast('正在打开预览', 'success');
    let that = this
    wx.downloadFile({
      url: pdf, //仅为示例，并非真实的资源
      success (res) {
        if (res.statusCode === 200) {
          var filePath = res.tempFilePath;
          wx.openDocument({
            filePath: filePath,
            fileType: 'pdf',
            success: function(res) {
                console.log(res);
            },
            fail: function(res) {
                console.log(res);
            },
            complete: function(res) {
                console.log(res);
            }
          })
        }
      }
    })
  },
  signbtn(){
    nav({
      url: '/sign/signOnline/signOnline',
      data: {}
    })
  },
  getAccountInfo(){
    let params = {
      url: 'ElectronicContractInitiateSign/showPersonalAccountInfo',
      data: {
        bbeid: app.globalData.beid
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res.data.data)
    }).catch(err=>{
      console.log(err)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if (options.cardId) {
      app.globalData.cardId = options.cardId || 0;
      app.globalData.fromUser = options.cardId || 0;
      if (app.tabBarPath.indexOf("/pages/signOnline/signOnline") == -1) {
        this.setData({
          isFromShare: true
        })
      }
    }
    if (!~~app.globalData.cardId) {
      try {
        const { cardId, myCardId } = await getEffectiveCardId()
        app.globalData.cardId = myCardId || cardId || ''
        if (!~~app.globalData.cardId) throw Error('无可用名片')
        if (app.tabBarPath.indexOf("/pages/signOnline/signOnline") == -1) {
          this.setData({
            isFromShare: true
          })
        }
      } catch (error) {
        console.error(error)
        wx.reLaunch({
          url: '/pages/cardList/cardList'
        })
        return
      }
    }
    this.getAccountInfo()
    this.getShowContract()
  },
  getShowContract(state,name){
    this.setData({
      loadStyle: 'loading'
    });
    const {pageIndex, pageSize} = this.store;
    let data = {}
    if(name){
      data = {
        state: state?state:'-1',
        pre: pageSize,
        page: pageIndex,
        card_id: app.globalData.cardId,
        name: name
      }
    }else{
      data = {
        state: state?state:'-1',
        pre: pageSize,
        page: pageIndex,
        card_id: app.globalData.cardId,
      }
    }
    if(state!=-2){
      let params = {
        url: app.API_HOST + "ElectronicContractInitiateSign/showContract",
        data: data
      }
      fetchApi(this,params).then(res=>{
        const { data } = res.data
        if(res.data.code==200){
          this.setData({
            signOnlineList: (pageIndex == 1 ? [] : this.data.signOnlineList).concat(data.list),
            loadStyle: data.total < pageSize ? 'loadOver' : 'loadMore'
          })
        }
      })
    }else{
      let params = {
        url: app.API_HOST + "ElectronicContractInitiateSign/showCommittedContract",
        data: {
          pre: pageSize,
          page: pageIndex,
          card_id: app.globalData.cardId,
        }
      }
      fetchApi(this,params).then(res=>{
        const { data } = res.data
        if(res.data.code==200){
          this.setData({
            signOnlineList: (pageIndex == 1 ? [] : this.data.signOnlineList).concat(data.list),
            loadStyle: data.total < pageSize ? 'loadOver' : 'loadMore'
          })
        }
      })
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
      loadStyle: 'loading',
      actvieIndex: 0
    });
    this.store.pageIndex = 1;
    this.getShowContract()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { loadStyle } = this.data;
    if (loadStyle != 'loadMore') return;
    this.store.pageIndex ++;
    this.getShowContract(this.data.actvieType);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})