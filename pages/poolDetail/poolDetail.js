// pages/poolDetail/poolDetail.js
const app = getApp();
import {
  nav,
  makePhoneCall,
  showToast,
  showTips
} from '../../utils/util';
import {
  fetchApi,
  getEffectiveCardId,
  getGlobalConfig,
  addActionLog
} from '../../api/api.js';
import {
  eventType
} from '../../map'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentList: [
      {name: "客户记录",id: 0},
      {name: "客户详情",id: 1},
    ],
    actvieIndex: 1,
    pageIndex: 1,
    pageSize: 10,
    type: '',
    detail: {},
    label: [],
    tag_id: [],
    customerRecord: [],
    url:['https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/up.png','https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/edit.png','https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/c_o.png','https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/back.png'],
    footerBtn:[
      {type: 0, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/up.png',name: '添加跟进'},
      {type: 1, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/edit.png',name: '编辑信息'},
      {type: 2, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/c_o.png',name: '转交客户'},
      {type: 3, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/back.png',name: '退回客户'},
    ],
    newFooterBtn:[
      {type: 0, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/up1.png',name: '添加跟进'},
      {type: 1, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/edit1.png',name: '编辑信息'},
      {type: 2, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/c_o1.png',name: '转交客户'},
      {type: 3, url: 'https://facing-1256908372.cos.ap-chengdu.myqcloud.com/web/back1.png',name: '退回客户'},
    ],
    content: '',
    addUpInput: false,
    backCrmUserMsg: '',
  },
  copyText() {
    var baseInfo = this.data.detail_msg;
    console.log(baseInfo.wx)

    if (!baseInfo.wx) {
      showTips('复制内容为空',this);
      return;
    }
    var self = this;
    wx.setClipboardData({
      data: baseInfo.wx,
      success: function (res) {
        // showTips('复制成功',this,1500,'success');
        showToast('复制成功', 'success');
        addActionLog(self, {
          type: eventType[wx],
        })
      }
    })
  },
  activeTap(e){
    let type = e.currentTarget.dataset.index;
    this.setData({
      actvieIndex: type,
    })
    type=='0'?this.getShowFollowMsg():this.getCardUserInfo()
  },
  active(e){
    let {index,type} = e.currentTarget.dataset
    this.data.footerBtn.map((item,i)=>{
      item.url=this.data.url[i]
    })
    this.setData({footerBtn: this.data.footerBtn})
    if(index==type){
      this.data.footerBtn[index].url=this.data.newFooterBtn[index].url
      this.setData({footerBtn: this.data.footerBtn})
    }
    if(type=='0'){this.setData({
        addUpInput: true,
        editMsg: false,
        c_oPool: false,
        backPool: false,
      })}
    if(type=='1'){ 
      this.setData({
        addUpInput: false,
        editMsg: true,
        c_oPool: false,
        backPool: false,
      })
      if(this.data.editMsg){
        nav({
          url: "/pages/editPoolDetail/editPoolDetail",
          data: {
            t_uid: this.data.detail.id
          }
        })
      }
    }
    if(type=='2'){
      this.setData({
        addUpInput: false,
        editMsg: false,
        c_oPool: true,
        backPool: false,
      })
      if(this.data.c_oPool){
        nav({
          url: "/pages/customerList1/customerList1",
          data: {
            t_uid: this.data.detail.id
          }
        })
      }
    }
    if(type=='3'){this.setData({
        addUpInput: false,
        editMsg: false,
        c_oPool: false,
        backPool: true,
      })}
  },
  bindPoolChange(e){
    console.log(e.detail.value)
  },
  contentInput(e) {
    let value = e.detail.value;
    let content = value.content;
    this.setData({
        contentLength: e.detail.value.replace(/\s+/g, "").length,
        backCrmUserMsg: value
    });
  }, 
  addCrmUserFollowList(e){
    let value = e.detail.value;
    let content = value.content;
    let params={
      url: 'ExternalCustom/addFollowMsg',
      data: {
        t_uid: this.data.detail.id,
        msg: content,
        card_id: app.globalData.cardId
      }
    }
    fetchApi(this,params).then(res=>{
      showToast('跟进成功', 'success')
    }).catch(err=>{
      console.log(err)
    })
    this.setData({addUpInput: false})
  },
  backCrmUser(e){
    let value = e.detail.value;
    let content = value.content;
    this.setData({
      backCrmUserMsg: content
    })
  },
  close(){
    this.setData({
      addUpInput: false,
      editMsg: false,
      c_oPool: false,
      backPool: false,
    })
  },
  save(){
    let params={
      url: 'ExternalCustom/returnUser',
      data: {
        t_uids: this.data.detail.id,
        msg: this.data.backCrmUserMsg,
        card_id: app.globalData.cardId
      }
    }
    fetchApi(this,params).then(res=>{
      showToast('退回成功', 'success')
      // wx.navigateBack({
      //   delta: 1,
      // })
      nav({
        url: '/pages/customerPool/customerPool'
      })
    }).catch(err=>{
      console.log(err)
    })
    this.setData({backPool: false})
  },
  allClaims(){
    let params={
      url: 'ExternalCustom/acquireCustomers',
      data: {
        t_uids: this.data.detail.id,
        card_id: app.globalData.cardId
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      wx.navigateBack({
        delta: 1
      });
    }).catch(err=>{
      console.log(err)
    })
  },
  goToLabel(){
    console.log(this.data.tag_id)
    var stringResult=null
    if(this.data.tag_id){
      var stringResult = this.data.tag_id.split(',');
    }
    nav({
      url: "/pages/addPoolLabel/addPoolLabel",
      data: {
        crmId: this.data.detail_msg.t_uid,
        tag_id: JSON.stringify(stringResult)
      }
    })
  },
  makePhoneCall() {
    makePhoneCall(this.data.detail.tel, () => {})
  },
  getCardUserInfo(){
    let params={
      url: 'ExternalCustom/showUserInfo',
      data: {
        card_id: app.globalData.cardId,
        t_uid: this.data.detail.id,
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      let detail_msg = res.data.data
      if(this.data.type==0){
        var reg = /^(\d{3})\d{4}(\d{4})$/;
        detail_msg.tel = detail_msg.tel.replace(reg, "$1****$2");
      }
      this.setData({
        detail_msg,
        label: detail_msg.tag,
        tag_id: detail_msg.tag_id
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  getShowFollowMsg(){
    let params = {
      url: 'ExternalCustom/showFollowMsg',
      data: {
        t_uid: this.data.detail.id,
        page: this.data.pageIndex,
        pre: this.data.pageSize
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      this.setData({
        // customerRecord: res.data.data.list,
        loadStyle: res.data.data.list.length < 6 ? 'loadOver' : 'loadMore',
        customerRecord: this.data.pageIndex!=1 ? this.data.customerRecord.concat(res.data.data.list) : res.data.data.list
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // {"name":"test2","id":"29","telphone":"17828158789","address":null,"tag_id":null,"c_name":"","c_time":"2021-03-01 14:58:49","tag_name":[]}
    let {detail,type} = options
    this.setData({
      detail: JSON.parse(detail),
      type,
      len: this.data.customerRecord.length-1
    })
    this.getCardUserInfo()
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
      loadStyle: '',
      pageIndex: 1,
    })
    this.data.actvieIndex==0?this.getShowFollowMsg():this.getCardUserInfo()
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
      loadStyle: '',
      pageIndex: 1,
    })
    this.data.actvieIndex==0?this.getShowFollowMsg():this.getCardUserInfo()
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
    this.data.actvieIndex=='0'?this.getShowFollowMsg():this.getCardUserInfo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})