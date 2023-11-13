// pages/customerPool/customerPool.js
const app = getApp();
import {
  nav,
  showToast,
  showTips
} from '../../utils/util';
import {
  fetchApi,
  getEffectiveCardId,
  getGlobalConfig
} from '../../api/api.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showStyle: 1,
    claimName: '',
    contentList: [
      {name: "企业客户",id: 0},
      {name: "我的客户",id: 1},
    ],
    actvieIndex: 0,
    posterName: '',
    customerNum: 0,
    checkdColor: '#fff',
    checkdAll: 'all',
    checkdAllflag: false,
    allClaim: false,
    OneID: '',
    OneIndex: '',
    checkdAllList: [],
    list:[],
    showOne: false,
    claimOff_Ok: false,
    pageIndex: 1,
    pageSize: 10,
    loadStyle: '',
  },
  activeTap(e){
    let type = e.currentTarget.dataset.index;
    this.setData({
      list: [],
      checkdAllList: [],
      checkdAllflag: false,
      actvieIndex: type,
      loadStyle: '',
      pageIndex: 1
    })
    type=='0'?this.getShowPublicPoolUserList():this.getShowCardPoolUser()
  },
  getShowPublicPoolUserList(){
    let params={
      url: 'ExternalCustom/showPublicPoolUserList',
      data: {
        card_id: app.globalData.cardId,
        page: this.data.pageIndex,
        pre: this.data.pageSize
      }
    }
    fetchApi(this,params).then(res=>{
      this.setData({
        loadStyle: res.data.data.length < 6 ? 'loadOver' : 'loadMore',
        list: this.data.pageIndex!=1 ? this.data.list.concat(res.data.data.list) : res.data.data.list,
        customerNum: res.data.data.total
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  getShowCardPoolUser(){
    let params={
      url: 'ExternalCustom/showCardPoolUser',
      data: {
        card_id: app.globalData.cardId,
        page: this.data.pageIndex,
        pre: this.data.pageSize
      }
    }
    fetchApi(this,params).then(res=>{
      this.setData({
        loadStyle: res.data.data.length < 6 ? 'loadOver' : 'loadMore',
        list: this.data.pageIndex!=1 ? this.data.list.concat(res.data.data.list) : res.data.data.list,
        customerNum: res.data.data.total
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  bindInput(e){
    this.setData({
      claimName: e.detail.value
    })
  },
  search(){
    let params = {}
    this.setData({
      list: [],
      pageIndex: 1
    })
    if (this.data.claimName) {
        this.data.search = true;
    } else {
        this.data.search = false;
    }
    if(this.data.actvieIndex==0){
      params={
        url: 'ExternalCustom/showPublicPoolUserList',
        data: {
          name: this.data.claimName,
          page: this.data.pageIndex,
          pre: this.data.pageSize
        }
      }
    }else{
      params={
        url: 'ExternalCustom/showCardPoolUser',
        data: {
          name: this.data.claimName,
          card_id: app.globalData.cardId,
          page: this.data.pageIndex,
          pre: this.data.pageSize
        }
      }
    }
    fetchApi(this,params).then(res=>{
      this.setData({
        loadStyle: res.data.data.list.length < 6 ? 'loadOver' : 'loadMore',
        list: this.data.pageIndex!=1 ? this.data.list.concat(res.data.data.list) : res.data.data.list,
        customerNum: res.data.data.total
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  goTomsg(e){
    nav({
      url: "/pages/poolDetail/poolDetail",
      data: {
        detail: JSON.stringify(e.currentTarget.dataset.detail),
        type: this.data.actvieIndex
      }
    })
  },
  claim(e){
    this.setData({one_allClaim: false})
    let {id,name,index} = e.currentTarget.dataset
    this.setData({
      checkdName: name,
      claimOff_Ok: true,
      OneID: id,
      OneIndex: index
    })
  },
  one_Claim(id){
    let t_uids = ''
    let params={
      url: 'ExternalCustom/acquireCustomers',
      data: {
        t_uids: id?id:this.data.checkdAllList.toString(),
        card_id: app.globalData.cardId
      }
    }
    fetchApi(this,params).then(res=>{
      showToast('认领成功','success')
      if(this.data.OneIndex){
        this.data.list.splice(parseInt(this.data.OneIndex),1)
        this.setData({
          list: this.data.list
        })
      }else{
        this.setData({
          list: []
        })
        this.getShowPublicPoolUserList()
      }
    }).catch(err=>{
      console.log(err)
    })
  },
  one_Return(id){
    let params={
      url: 'ExternalCustom/returnUser',
      data: {
        t_uids: id?id:this.data.checkdAllList.toString(),
        card_id: app.globalData.cardId
      }
    }
    fetchApi(this,params).then(res=>{
      showToast('退回成功','success')
      if(this.data.OneIndex){
        this.data.list.splice(parseInt(this.data.OneIndex),1)
        this.setData({
          list: this.data.list
        })
      }else{
        this.setData({
          list: []
        })
        this.getShowCardPoolUser()
      }
    }).catch(err=>{
      console.log(err)
    })
  },
  allClaims(){
    this.setData({
      one_allClaim: true,
      claimOff_Ok: true
    })
  },
  checkboxAllChange(e){
    this.setData({
      checkdAllList: []
    })
    if(e.detail.value[0]=='all'){
      this.data.list.map((item,index)=>{
        item.checked=true
        this.data.checkdAllList.push(item.id)
      })
      this.setData({
        allClaim: true,
        checkdAllList: this.data.checkdAllList
      })
    }else{
      this.setData({
        allClaim: false,
        checkdAllList: []
      })
      this.data.list.map((item,index)=>{
        item.checked=false
      })
    }
    this.setData({
      list: this.data.list,
      checkdAllLen:this.data.checkdAllList.length
    })
  },
  checkboxOneChange(e){
    let {id} = e.currentTarget.dataset
    if(e.detail.value[0]&&this.data.checkdAllList.indexOf(e.detail.value[0]) == -1){
      this.data.checkdAllList.push(e.detail.value[0])
    }
    if(!e.detail.value[0]){
      this.data.checkdAllList.map((item,index)=>{
        if(id==item){
          this.data.checkdAllList.splice(index,1)
        }
      })
    }
    this.setData({
      checkdAllList: this.data.checkdAllList,
      checkdAllLen:this.data.checkdAllList.length
    })
    this.data.checkdAllList.length==this.data.list.length?this.setData({checkdAllflag: true}):this.setData({checkdAllflag: false})
    this.data.checkdAllList.length==0?this.setData({ allClaim: false }):this.setData({ allClaim: true })
  },
  addGoTo(){
    nav({
      url: "/pages/addCustomerPool/addCustomerPool",
      data:{}
    })
  },
  claimOff(){
    this.setData({
      claimOff_Ok: false
    })
  },
  claimOk(){
    this.data.one_allClaim?
      (this.data.actvieIndex==0?this.one_Claim():this.one_Return()):
      (this.data.actvieIndex==0?this.one_Claim(this.data.OneID):this.one_Return(this.data.OneID))
    this.setData({
      claimOff_Ok: false,
      allClaim: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if (!~~app.globalData.cardId || app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId) {
      try {
        const { cardId, myCardId } = await getEffectiveCardId()
        app.globalData.cardId = myCardId || cardId || ''
        if (!~~app.globalData.cardId) throw Error('无可用名片')
        if (!~~myCardId) {
          nav({
            url: app.tabBarPath[0]
          })
          return
        }
      } catch (error) {
        console.error(error)
        wx.reLaunch({
          url: '/pages/cardList/cardList'
        })
        return
      }
    }
    this.getShowPublicPoolUserList()
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
      list: [],
      loadStyle: '',
      pageIndex: 1,
    })
    this.data.actvieIndex=='0'?this.getShowPublicPoolUserList():this.getShowCardPoolUser()
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
      list: [],
      loadStyle: '',
      pageIndex: 1,
    })
    this.data.actvieIndex=='0'?this.getShowPublicPoolUserList():this.getShowCardPoolUser()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadStyle == 'loadOver') {
        return
    }
    this.setData({
        loadStyle: 'showLoading',
        pageIndex: this.data.pageIndex+1,
    })
    this.data.actvieIndex=='0'?this.getShowPublicPoolUserList():this.getShowCardPoolUser()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})