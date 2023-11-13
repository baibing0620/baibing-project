// components/signFormContent/signFormContent.js
const app = getApp();
import { fetchApi, addActionLog, getEffectiveCardId } from '../../api/api.js';
import { nav, getTitleFromTabbar, showTips, showToast, showLoading} from '../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    signFormContent: {
      sign: [],
      CC_party: [],
      subjectContract: '',
      Deadline: '',
      newStatus: [],
      _setIndex: 0
    },
    signFormContent1: {
      sign: [],
      CC_party: [],
      subjectContract: '',
      Deadline: '',
      newStatus: [],
      _setIndex: 0
    },
    newStatus: [],
    newStatus1: [],
    _setIndex: -1,
    _setIndex1: -1,
    radiogr: '',
    radiogrIndex: -1,
    radiogrList: ['个人1','个人2','个人3'],
    radiogrLists: [],
    radioqy: '',
    radioqyIndex: -1,
    radioqyList: ['企业1','企业2','企业3'],
    radioqyLists: [],
    MainSignValue: '',
    MainSignArr: ['企业','个人'],
    MainSignIndex: 0,
    radiogrFlag: false,
  },
  getradiogr(){},
  getradioqy(){
    let params = {
      url: 'ElectronicContractInitiateSign/showOrgAccountList',
      data: {
        card_id: app.globalData.cardId,
        page: 1,
        pre: 9999999999,
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      let arr = []
      if(res.data.code==200){
        res.data.data.list.map(item=>{
          arr.push(item.orgName)
        })
        this.setData({
          radiogrLists: res.data.data.list,
          radiogrList: arr,
        })
        if(res.data.data.user_account_id==''){
          this.data.MainSignArr = ['企业']
          this.setData({
            radiogrFlag: true,
            MainSignArr: this.data.MainSignArr
          })
        }else{
          this.data.MainSignArr = ['企业','个人']
          this.setData({
            radiogrFlag: false,
            user_account_id: res.data.data.user_account_id,
            MainSignArr: this.data.MainSignArr
          })
        }
      }
    }).catch(err=>{
      console.log(err)
    })
  },
  bindMainSignChange(e){
    this.setData({
      MainSignIndex: parseInt(e.detail.value)
    })
  },
  bindradiogrChange(e){
    this.setData({
      radiogrIndex: parseInt(e.detail.value),
      radioqyIndex: -1
    })
  },
  bindradioqyChange(e){
    this.setData({
      radioqyIndex: parseInt(e.detail.value),
      radiogrIndex: -1
    })
  },
  partyValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent.sign[index].party = value
  },
  ComponyNameValue1(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent1.sign[index].ComponyName = value
  },
  SHCodeValue1(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent1.sign[index].SHCode = value
  },
  idNumberValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent.sign[index].idNumber = value
  },
  AgentNameValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent.sign[index].AgentName = value
  },
  AgentTplValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent.sign[index].AgentTpl = value
  },

  idNumberValue1(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent1.sign[index].idNumber = value
  },
  AgentNameValue1(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent1.sign[index].AgentName = value
  },
  AgentTplValue1(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent1.sign[index].AgentTpl = value
  },

  subjectValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
  },
  signingRequireValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
  },

  subjectContractValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent.subjectContract = value
  },
  DeadlineValue(e){
    const {value} = e.detail
    const {index} = e.currentTarget.dataset
    this.data.signFormContent.Deadline = value
  },

  bindDateChange: function(e) {
    this.setData({
      'signFormContent.Deadline': e.detail.value
    })
  },

  add_enterprise(){
    let maxNum = 0
    this.data.FlowComponentsInfo.accountInfo.map(item=>{
      if(item.accountCategory==1&&item.accountType!=0){
        maxNum+=1
      }
    })
    if(maxNum>this.data.signFormContent.sign.length){
      this.data.signFormContent.sign.push({
        party: '', 
        idNumber: '',
        AgentName: '', 
        AgentTpl: '', 
        statusIds: [],
        statusIdss: []
      })
      this.setData({
        'signFormContent.sign': this.data.signFormContent.sign
      })
    }else{
      wx.showToast({
        title: '最多添加'+maxNum+'个参与人',
        mask: false,
        icon: 'none',
        duration: 1000
      });
    }
  },
  add_enterprise1(){
    let maxNum = 0
    this.data.FlowComponentsInfo1.accountInfo.map(item=>{
      if(item.accountCategory==0&&item.accountType!=0){
        maxNum+=1
      }
    })
    if(maxNum>this.data.signFormContent1.sign.length){
      this.data.signFormContent1.sign.push({
        party: '', 
        idNumber: '',
        AgentName: '', 
        AgentTpl: '', 
        statusIds: [],
        statusIdss: []
      })
      this.setData({
        'signFormContent1.sign': this.data.signFormContent1.sign
      })
    }else{
      wx.showToast({
        title: '最多添加'+maxNum+'个参与人',
        mask: false,
        icon: 'none',
        duration: 1000
      });
    }
  },
  active_id(e){
    const {index, cindex, item} = e.currentTarget.dataset
    if( (this.data.newStatus[cindex].flag&&!this.data.newStatus[cindex]._flag) ){
        this.data.newStatus[cindex].flag = !this.data.newStatus[cindex].flag
        this.data.newStatus[cindex]._flag = false 

        this.data.signFormContent.sign[this.data._setIndex].statusIds[cindex]=''
        this.data.signFormContent.sign[this.data._setIndex].statusIdss[cindex]=''

    }else if( (this.data.newStatus[cindex].flag&&this.data.newStatus[cindex]._flag) ){

    }else if(!this.data.newStatus[cindex].flag&&!this.data.newStatus[cindex]._flag){

      this.data.newStatus[cindex].flag = true
      
      this.data.signFormContent.sign[this.data._setIndex].statusIds[cindex]=item.status
      this.data.signFormContent.sign[this.data._setIndex].statusIdss[cindex]=item.title
    }

    this.setData({
      newStatus: this.data.newStatus,
      active_id: index,
      'signFormContent.sign': this.data.signFormContent.sign
    })
  },
  active_id1(e){
    const {index, cindex, item} = e.currentTarget.dataset
    if( (this.data.newStatus1[cindex].flag&&!this.data.newStatus1[cindex]._flag) ){
        this.data.newStatus1[cindex].flag = !this.data.newStatus1[cindex].flag
        this.data.newStatus1[cindex]._flag = false 

        this.data.signFormContent1.sign[this.data._setIndex1].statusIds[cindex]=''
        this.data.signFormContent1.sign[this.data._setIndex1].statusIdss[cindex]=''

    }else if( (this.data.newStatus1[cindex].flag&&this.data.newStatus1[cindex]._flag) ){

    }else if(!this.data.newStatus1[cindex].flag&&!this.data.newStatus1[cindex]._flag){

      this.data.newStatus1[cindex].flag = true
      
      this.data.signFormContent1.sign[this.data._setIndex1].statusIds[cindex]=item.status
      this.data.signFormContent1.sign[this.data._setIndex1].statusIdss[cindex]=item.title
    }

    this.setData({
      newStatus1: this.data.newStatus1,
      active_id1: index,
      'signFormContent1.sign': this.data.signFormContent1.sign
    })
  },
  setIndex(e){
    const {index} = e.currentTarget.dataset
    this.setData({
      _setIndex: index,
      _setflag: true
    })
  },
  setIndex1(e){
    const {index} = e.currentTarget.dataset
    this.setData({
      _setIndex1: index,
      _setflag1: true
    })
  },
  colseIndex(){
    this.data.newStatus.map(item=>{
      if(item.flag) item._flag = true
    })
    this.setData({
      _setflag: false,
      newStatus: this.data.newStatus
    })
  },
  colseIndex1(){
    this.data.newStatus1.map(item=>{
      if(item.flag) item._flag = true
    })
    this.setData({
      _setflag1: false,
      newStatus1: this.data.newStatus1
    })
  },
  delbtn(e){
    const {index} = e.currentTarget.dataset
    this.data.signFormContent.sign[index].statusIds.map(item=>{
      this.data.newStatus.map(_item=>{
        if(item == _item.status){
          _item.flag = false
          _item._flag = false
        }
      })
    })
    this.data.signFormContent.sign.splice(index,1)
    this.setData({
      'signFormContent.sign': this.data.signFormContent.sign,
      newStatus: this.data.newStatus
    })
  },
  delbtn1(e){
    const {index} = e.currentTarget.dataset
    this.data.signFormContent1.sign[index].statusIds.map(item=>{
      this.data.newStatus1.map(_item=>{
        if(item == _item.status){
          _item.flag = false
          _item._flag = false
        }
      })
    })
    this.data.signFormContent1.sign.splice(index,1)
    this.setData({
      'signFormContent1.sign': this.data.signFormContent1.sign,
      newStatus1: this.data.newStatus1
    })
  },
  formatDateTime(obj) {
    if (obj == null) {
        return null
    }
    let date = new Date(obj);
    let y = 1900 + date.getYear();
    let m = "0" + (date.getMonth() + 1);
    let d = "0" + date.getDate();
    return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
  },
  signbtn(){
    let FieldsInfo = ''
    let participateUserInfo = []
    let _that = []
    let _that1 = []
    let __that = []
    let __that1 = []
    if(this.data.signFormContent.sign.length==0&&this.data.signFormContent1.sign.length==0){
      wx.showToast({
        title: '请添加参与人信息',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    this.data.signFormContent.sign.map((item,index)=>{
      if(item.AgentName==''){
        wx.showToast({ title: '经办人姓名不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.AgentTpl==''){
        wx.showToast({ title: item.AgentName+'手机号码不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.AgentTpl!=''){
        if(!(/^(13[0-9]|14[01456879]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/.test(item.AgentTpl))){
          wx.showToast({ title: item.AgentName+'手机号码格式不正确', mask: false, icon: 'none', duration: 1000 });
          return false;
        }
      }
      if(item.idNumber==''){
        wx.showToast({ title: item.AgentName+'身份证号码不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.idNumber!=''){
        if(!(/^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(item.idNumber))){
          wx.showToast({ title: item.AgentName+'身份证号码格式不正确', mask: false, icon: 'none', duration: 1000 });
          return false;
        }
      }
      item.AgentName==''||item.AgentTpl==''||item.idNumber==''? _that.push(1) : _that.push(0)
    })
    this.data.signFormContent1.sign.map((item,index)=>{
      if(item.ComponyName==''){
        wx.showToast({ title: '公司名称不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.SHCode==''){
        wx.showToast({ title: '企业社会信用代码不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.AgentName==''){
        wx.showToast({ title: '法人姓名不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.AgentTpl==''){
        wx.showToast({ title: item.AgentName+'手机号码不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.AgentTpl!=''){
        if(!(/^(13[0-9]|14[01456879]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/.test(item.AgentTpl))){
          wx.showToast({ title: item.AgentName+'手机号码格式不正确', mask: false, icon: 'none', duration: 1000 });
          return false;
        }
      }
      if(item.idNumber==''){
        wx.showToast({ title: item.AgentName+'身份证号码不能为空', mask: false, icon: 'none', duration: 1000 });
        return false;
      }
      if(item.idNumber!=''){
        if(!(/^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(item.idNumber))){
          wx.showToast({ title: item.AgentName+'身份证号码格式不正确', mask: false, icon: 'none', duration: 1000 });
          return false;
        }
      }
      item.AgentName==''||item.AgentTpl==''||item.idNumber==''? _that1.push(1) : _that1.push(0)
    })
    if(_that.indexOf(1)!=-1){
      wx.showToast({
        title: '请完善个人信息',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    if(_that1.indexOf(1)!=-1){
      wx.showToast({
        title: '请完善企业法人信息',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    if(this.data.signFormContent.Deadline==''){
      wx.showToast({
        title: '请填写签署截至时间',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    this.data.inputValue.map((item,index)=>{
      FieldsInfo +=`"${item.key}":"${item.value}${index==this.data.inputValue.length-1?'"':'",'}`
    })
    let simpleFormFieldsInfo = `{"${JSON.parse(this.data.fileComponents.docs)[0].templateId}":{"name":"${this.data.fileComponents.title}","simpleFormFields":{${FieldsInfo}}}}`
    this.data.FlowComponentsInfo.accountInfo.map(item=>{
      if(item.accountType=='0') participateUserInfo.push(item)
    })
    // this.data.FlowComponentsInfo1.accountInfo.map(item=>{
    //   if(item.accountType=='0') participateUserInfo.push(item)
    // })
    this.data.signFormContent.sign.map(item=>{
      let statusIds = []
      item.statusIds.map(_item=>{
        if(_item!=''){
          statusIds.push(_item)
        }
      })
      participateUserInfo.push({
        "accountId":"",
        "type":1,
        "idNumber": item.idNumber,
        "mobile": item.AgentTpl,
        "name": item.AgentName,
        "statusIds": statusIds.join(','),
      })
    })
    this.data.signFormContent1.sign.map(item=>{
      let statusIds1 = []
      item.statusIds.map(_item=>{
        if(_item!=''){
          statusIds1.push(_item)
        }
      })
      participateUserInfo.push({
        "accountId":"",
        "type":0,
        "idNumber": item.idNumber,
        "mobile": item.AgentTpl,
        "name": item.AgentName,
        "orgName": item.ComponyName,
        "idOrgNumber": item.SHCode,
        "statusIds": statusIds1.join(','),
      })
    })
    console.log(participateUserInfo)
    if(this.data.radiogrFlag&&this.data.radiogrIndex==-1){
      wx.showToast({
        title: '请先选择签署主体',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    if(!this.data.radiogrFlag&&this.data.MainSignIndex==0&&this.data.radiogrIndex==-1){
      wx.showToast({
        title: '请先选择签署主体',
        mask: false,
        icon: 'none',
        duration: 1000
      });
      return false
    }
    console.log(participateUserInfo)
    if(this.formatDateTime(new Date())==this.data.signFormContent.Deadline){
      this.setData({
        'signFormContent.Deadline': ''
      })
      wx.showToast({ title: '不能填写当天时间为截止时间', mask: false, icon: 'none', duration: 1000 });
      return false
    }
    wx.showToast({ title: '正在发起，请等待', mask: false, icon: 'none', duration: 1000 });
    let params = {
      url: 'ElectronicContractInitiateSign/initiateSign',
      data: {
        flowId: this.data.fileComponents.id,
        simpleFormFieldsInfo,
        participateUserInfo,
        user_id: app.globalData.cardId,
        signValidity: Date.parse(new Date(this.data.signFormContent.Deadline)),
        initiatorAccountId: this.data.MainSignIndex==0?this.data.radiogrLists[this.data.radiogrIndex].accountId:this.data.user_account_id
      }
    }
    fetchApi(this,params).then(res=>{
      console.log(res)
      if(res.data.code==200){
        showToast('发起成功', 'success')
        nav({
          url: '/components/signFormSuccess/signFormSuccess',
          data: {}
        })
      }else{
        wx.showToast({ title: res.data.msg, mask: false, icon: 'none', duration: 1000 });
      }
    }).catch(err=>{
      console.log(err)
      wx.showToast({ title: err.data.msg, mask: false, icon: 'none', duration: 1000 });
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { fileComponents, FlowComponentsInfo, inputValue } = options
    let newStatus = [],newStatus1 = []
    JSON.parse(FlowComponentsInfo).accountInfo.map((item,index)=>{
      if(item.title!=''&&item.accountCategory==1){
        newStatus.push({
          status: item.status,
          title: item.title,
          flag: false,
          _flag: false,
        })
      }
      if(item.title!=''&&item.accountCategory==0){
        newStatus1.push({
          status: item.status,
          title: item.title,
          flag: false,
          _flag: false,
        })
      }
    })
    this.setData({
      fileComponents: JSON.parse(fileComponents),
      FlowComponentsInfo: JSON.parse(FlowComponentsInfo),
      FlowComponentsInfo1: JSON.parse(FlowComponentsInfo),
      inputValue: JSON.parse(inputValue),
      newStatus: newStatus,
      newStatus1: newStatus1,
      'signFormContent.Deadline': this.formatDateTime(new Date())
    })
    this.getradiogr()
    this.getradioqy()

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

  }
})