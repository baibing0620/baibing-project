const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
import {
  nav, showLoading, hideLoading, showToast, getHomePage, shareParam
} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabIndex: 0,
    switchTab: {
      tabs: [
        "领取记录",
        "福袋数排行"
      ],
      themeColor: "#ff3d3d",
      currentIndex: 0,
      top: 0,
      position: "relative",
    },
    ready: false,
    showCover: false,
    tmplIds: []
  },
  dataStore: {
    activityId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.cardId) {
      app.globalData.cardId = options.cardId || 0;
      app.globalData.fromUser = options.fromUser || 0;
      this.setData({
        fromShare: true
      })
    }
    this.dataStore.activityId = options.activity
    getMyReceiveCount(this)
    getOnLineActivity(this)
    getActivityHasGrantInfo(this)
    this.getSubscribe()
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
    getMyReceiveCount(this)
    getOnLineActivity(this)
    getActivityHasGrantInfo(this)
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
    this.setData({
      showShareModal: false
    })
    return {
      title: `邀您一起领名片福袋，快快来拆`,
      imageUrl:'https://facing-1256908372.file.myqcloud.com//image/20180921/ccd09cdc7220c895.jpg',
      path: `/pages/home/home?cardId=${app.globalData.cardId}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}`
    }
  },
  onTabClick(e) {
    this.setData({
      tabIndex: e.detail.currentIndex
    });
     if(this.data.tabIndex == 1&&!this.data.loadOverTeam){
      
  }
  },
  navMyReceiveLog(){
    nav({
      url:'/bless/blessingBagRecord/blessingBagRecord',
      data:{
        activityId: this.dataStore.activityId
      }
    })
  },
  goToWithdrawal() {
    nav({
      url: '/pages/withdrawal/withdrawal',
      data: {
        balance: this.data.recevieData.money
      }
    });
  },
  getPageQRCode() {
    this.setData({
        showCover: true,
        showShareModal: false,
        palette: this.palette()
    })
  },

  palette(){
    let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
      path = encodeURIComponent(`/pages/home/home?${shareParam()}`),
      qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}`
    const { recevieData: { type }, cardInfoData: { card: { name, position, company, avatar_url} } } = this.data    // type   1金额奖励   2积分奖励
    return  {
        "width": "750px",
        "height": "974px",
        "background": "#fafafa",
        "views": [
          {
            "type": "image",
            "url": `${avatar_url}?imageView2/1/w/200/h/200`,   //头像
            "css": {
              "width": "144px",
              "height": "144px",
              "top": "248px",
              "left": "302px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "image",
            "url": "https://facing-1256908372.file.myqcloud.com//image/20200326/fb019a4a073aae7e.png",   //圆环   
            "css": {
              "width": "180px",
              "height": "180px",
              "top": "230px",
              "left": "284px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "image",
            "url": "https://facing-1256908372.file.myqcloud.com//image/20200326/9f9a94db2ebe4ae5.png",   //红包背景
            "css": {
              "width": "750px",
              "height": "750px",
              "top": "0px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "text",
            "text": `【${name}】`,   //名片主名字
            "css": {
              "color": "#f9ff63",
              "background": "rgba(0,0,0,0)",
              "width": "750px",
              "height": "42.89999999999999px",
              "top": "59.99999999999999px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "30px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "43.290000000000006px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "center"
            }
          },
          {
            "type": "text",
            "text": `通过我给大家赠送${type == 1 ?'金额':'积分'}福袋`,
            "css": {
              "color": "#f9ff63",
              "background": "rgba(0,0,0,0)",
              "width": "750px",
              "height": "45.76px",
              "top": "126px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "32px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "46.17600000000001px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "center"
            }
          },
          {
            "type": "text",
            "text": name,   //名片主名字
            "css": {
              "color": "#f9ff63",
              "background": "rgba(0,0,0,0)",
              "width": "750px",
              "height": "54.34px",
              "top": "430px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "38px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "54.83400000000001px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "center"
            }
          },
          {
            "type": "text",
            "text": `${position}/${company}`,  //职位/公司名
            "css": {
              "color": "#ffffff",
              "background": "rgba(0,0,0,0)",
              "width": "750px",
              "height": "37.18000000000001px",
              "top": "490px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "26px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "37.51800000000001px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "center"
            }
          },
          {
            "type": "text",
            "text": "恭喜发财 大吉大利",
            "css": {
              "color": "#f9ff63",
              "background": "rgba(0,0,0,0)",
              "width": "750px",
              "height": "91.52px",
              "top": "566px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "64px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "92.35200000000002px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "center"
            }
          },
          {
            "type": "text",
            "text": `${type == 1 ? '可提现至微信零钱中使用' : '可领取至我的积分中使用'}`,
            "css": {
              "color": "#ffffff",
              "background": "rgba(0,0,0,0)",
              "width": "750px",
              "height": "34.32px",
              "top": "670px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "24px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "34.632000000000005px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "center"
            }
          },
          {
            "type": "image",
            "url": qrcode,
            "css": {
              "width": "176px",
              "height": "176px",
              "top": "770.0000920547017px",
              "left": "555.9999994303386px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "text",
            "text": `这里正在发放${type == 1 ?'金额':'积分'}福袋\n快来跟我一起领取吧`,
            "css": {
              "color": "#4d4d4d",
              "background": "rgba(0,0,0,0)",
              "width": "500px",
              "height": "126.35px",
              "top": "800.9999929188691px",
              "left": "22.000000325520887px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "38px",
              "fontWeight": "normal",
              "maxLines": "2",
              "lineHeight": "63.27px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          }
        ]
      }



  },
  coverHide() {
    this.setData({
      showCover: false
    })
  },
  // 模板消息
  getSubscribe() {
    let param = {
      url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
      data: {
          tpl_msg_type: '12'
      }
    }
    let that = this
    fetchApi(that, param).then(_res => {
      console.log(_res)
      if (_res.data.data.length > 0) {
        let setList = []
        wx.getSetting({
          withSubscriptions:true,
          success (res) {
            if (res.subscriptionsSetting) {
              setList = Object.keys(res.subscriptionsSetting)
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
          }
        })
      }
    }).catch((e) => console.log(e))
  },
  pullSubscribe(that) {
    let tmplIds = this.data.tmplIds
    if (tmplIds.length > 0){
      if (wx.requestSubscribeMessage) {
        wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success (_res) { },
          complete(_res) {
            that.setData({
              showShareModal: true,
              upShareModal: true,
            })
          }
        })
      } else {
        that.setData({
          showShareModal:true,
          upShareModal: true,
        })
      }
    } else {
      that.setData({
        showShareModal:true,
        upShareModal: true,
      })
    }
  },
  cancelSetting() {
    this.setData({
      showopenSetting: false
    })
  },
  navHomePage() {
    nav({
      url: getHomePage()
    })
  },
  showShareModal(){
    // 模板消息
    let that = this
    this.pullSubscribe(that)
  },
  closeShareModal(){
    this.setData({
      upShareModal: false,
    })
    setTimeout(() => {
      this.setData({
        showShareModal: false
      })
    }, 180)
  },
  ready(e) {
    this.setData({
      ready: true
    })
  },
  navBlessBagTotal(){
    nav({
      url: '/bless/blessingBagTotalRanking/blessingBagTotalRanking'
    })
  },
  goToIntegral(){
    nav({
      url: '/pages/personal/personal'
    })
  }
})

function getMyReceiveCount(self){
  let param = {
    url: app.API_HOST + "packet/getMyReceiveCount",
    data: {
      activityId: self.dataStore.activityId
    }
  }
  fetchApi(self, param).then(res => {
    let data = res.data.data
    self.setData({
      recevieData:data
    })
  }).catch((err) => {

  });
}
function getOnLineActivity(self) {
  let param = {
    url: app.API_HOST + "packet/getOnLineActivity",
    data: {
      
    }
  }
  fetchApi(self, param).then(res => {
    let data = res.data.data
    self.setData({
      cardInfoData: data
    })
    wx.setNavigationBarTitle({
      title: data.card.name+'的福袋',
    })
  }).catch((err) => {

  });
}
function getActivityHasGrantInfo(self){
  let param = {
    url: app.API_HOST + "packet/getActivityHasGrantInfo",
    data: {
      activityId: self.dataStore.activityId
    }
  }
  fetchApi(self, param).then(res => {
    let data = res.data.data
    self.setData({
      blessInfoData:data
    })
  }).catch((err) => {

  });
}