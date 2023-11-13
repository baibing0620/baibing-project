const app = getApp();
import { fetchApi, getGlobalConfig,getPhoneNumber } from '../../api/api';
import { showLoading, getYMD, showToast, nav, trim, makePhoneCall, showTips} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
      arriveDate:'',
      array: ['0:00~24:00'],
      appointmentItemid:'',
      tmplIds: [],
      name: '',
      phone: ''
  },
  dataStore: {
    goodsId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
    });
    this.init();
  },

  init() {
    const {options} = this.data;
    getInitData(this, options.appointmentItemid)
    this.data.appointmentItemid = options.appointmentItemid||0
    this.dataStore.goodsId = options.goodsId||0
    if (app.globalData.currentLoginUserCardInfo.mobile) {
        this.setData({
            hasBindPhone: true
        });
    }
    this.setData({
      arriveDate: app.globalData.chooseDay.replace(/\//g,'-'),
      toChat: app.globalData.cardUid && app.globalData.cardUid != app.globalData.uid
    })
    if (app.globalConfig != null && app.globalConfig != '') {
      this.setData({
        phone: app.globalConfig.service_phone,
        customService: app.globalConfig.funcList.open_custom_service
      })
    } else {
      getGlobalConfig(this).then(res => {
        this.setData({
          phone: app.globalConfig.service_phone,
          customService: app.globalConfig.funcList.open_custom_service
        })
      })
    }
    this.getSubscriptionMessageTplIds()
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
  
  },

  call() {
    makePhoneCall(this.data.phone)
  },
  bindPickerChange(e){
    this.setData({
      index: e.detail.value
    })
  },
  getSubscriptionMessageTplIds() {
    let params = {
      url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
      data: {
          tpl_msg_type: '8'
      }
    }
    let that = this
    fetchApi(that, params).then(_res => {
      if (_res.data.data.length > 0) {
        let setList = []
        wx.getSetting({
            withSubscriptions:true,
            success (setRes) {
                if (setRes.subscriptionsSetting) {
                    setList = Object.keys(setRes.subscriptionsSetting)
                }
                let tmplIds = []
                _res.data.data.forEach(element => {
                    if (setList.indexOf(element) == -1) {
                        tmplIds.push(element)
                    }
                });
                that.setData({
                  tmplIds: tmplIds
                })
            },
            fail() {
            }
        })
      } else {
      }
    }).catch((e) => {
    })
  },
  formSubmit(e){
    let name = e.detail.value.userName
    let phone = e.detail.value.phone
    let remark = e.detail.value.remark
    let regx = /^1[3-9]\d{9}$/;
    if (trim(name) == ''){
      showTips('请输入姓名',this)
      return;
    }
    else if (trim(phone) == ''){
      showTips('请输入手机号', this)
      return;
    } else if (!regx.test(phone)) {
      showTips("手机号验证失败", this);
      return;
    } 
    else if (this.data.index == '' || this.data.index == undefined){
      showTips('请选择到点时间', this)
      return;
    }
    let param = {
      url: `${app.API_HOST}appointment/createOrder`,
      data: {
        appointmentGoodsId: this.dataStore.goodsId,
        appointmentItemId: this.data.appointmentItemid,
        name: name,
        mobile: phone,
        time: this.data.array[this.data.index],
        date: this.data.arriveDate,
        remark: remark,
        formId: e.detail.formId
      }
    }
    fetchApi(this, param).then((res) => {
        let data = res.data.data
        if (data.status == 0){
          let param = {
            url: `${app.API_HOST}appointment/wxPay`,
            data: {
              orderId: data.id
            }
          }
          fetchApi(this, param).then((res) => {
            let data =res.data.data
            //showTips('预约成功','success')
            wx.requestPayment({
              'timeStamp': data.timeStamp,
              'nonceStr': data.nonceStr,
              'package': data.package,
              'signType': data.signType,
              'paySign': data.paySign,
              'success': function (res) {
                showToast('预约成功', 'success')
                // 模板消息
                let params = {
                  url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
                  data: {
                      tpl_msg_type: '8'
                  }
                }
                fetchApi(this, params).then(_res => {
                  console.log(_res)
                  wx.requestSubscribeMessage({
                      tmplIds: _res.data.data,
                      success (_res) { },
                      complete(_res) {
                        let setTimeoutClick = setTimeout(function () {
                          clearTimeout(setTimeoutClick);
                          nav({
                            url: '/pages/myAppointment/myAppointment'
                          })
                        }, 1500)
                      }
                  })
                }).catch((e) => {
                  let setTimeoutClick = setTimeout(function () {
                    clearTimeout(setTimeoutClick);
                    nav({
                      url: '/pages/myAppointment/myAppointment'
                    })
                  }, 1500)
                })
              },
              'fail': function (res) {
                  showTips("预约失败");
              }
            })
          }).catch((e) => { 
            console.log(e) 
            showTips('预约失败')
          });
        }else{
          showToast('预约成功', 'success')
        }
    }).catch((e) => {
       console.log(e) 
       showTips('预约失败')
    });
  },
  getNameValue(e){
    console.log(e.detail)// {value: "ff", cursor: 2}  
    this.setData({
      name: e.detail.value
    })
  },
  getPhoneValue(e){
    console.log(e.detail)// {value: "ff", cursor: 2}
    this.setData({
      phone: e.detail.value
    })
  },
  pullSubscription() {
    let name = this.data.name
    let phone = this.data.phone
    let regx = /^1[3-9]\d{9}$/;
    if (trim(name) == ''){
      return;
    }
    else if (trim(phone) == ''){
      return;
    } else if (!regx.test(phone)) {
      return;
    } 
    else if (this.data.index == '' || this.data.index == undefined){
      return;
    }
    let tmplIds = this.data.tmplIds
    console.log(tmplIds)
    if (tmplIds.length > 0){
      if(wx.requestSubscribeMessage) {
        wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success (_res) {
            let setTimeoutClick = setTimeout(function () {
              clearTimeout(setTimeoutClick);
              nav({
                url: '/pages/myAppointment/myAppointment'
              })
            }, 1500)
          },
          complete(_res) {}
        })
      }
    }
  },
    getPhoneNumber(e) {
        getPhoneNumber(e).then(phoneNumber => {
          if (phoneNumber!='') {
            this.setData({
                hasBindPhone: true
            })
            this.toChat();
          } else {
            this.toChat();
          }
        }).catch(err => {
          showTips('手机号获取失败', this)
        })

    },
    toChat() {
        if (this.data.toChat) {
            nav({
                url: '/pages/chat/chat',
                data: {
                    toUid: app.globalData.cardUid,
                }
            })
        }
    },
})

function getInitData(self, id) {
  let param = {
    url: `${app.API_HOST}appointment/getAppointmentGoodsItemById`,
    data: {
      id: id
    }
  }
  fetchApi(self, param).then((res) => {

    let data = res.data.data
    let time = hideGoodItem(data.time, self.data.arriveDate)
    let date = []
    for(let i=0;i<time.length;i++){
        if(time[i] != undefined){
          date.push(time[i])
        }
    }
    let _time = date.map(function (item, index, arry) {
      return item.startTime + '~' + item.endTime
    })
    self.setData({
      AppointmentGoodsItemList: data,
      array: _time
    })

  }).catch((e) => { console.log(e) });
}

var hideGoodItem = function (time, chooseday) {
  var date = new Date();
  var month = date.getMonth() + 1
  var day = date.getDate();
  var _date = [month, day].map(formatNumber).join("-")
  console.log(chooseday.replace(/2018-/g,''))
  if (chooseday != undefined && _date == chooseday.replace(/2018-/g, '')) {
    let _time=time.map(function(item,index,array){
      if ((date.getHours()+':'+date.getMinutes).toString() < item.endTime.toString()){
          return item
      }
    })
    return _time
  } else {
    return time
  }

}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
