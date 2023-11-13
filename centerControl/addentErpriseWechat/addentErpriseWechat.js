const app = getApp(); // world
import { fetchApi } from '../../api/api.js';
import {
  showLoading,
  previewImage,
  hideLoading
} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode:'https://facing-1256908372.file.myqcloud.com/image/20200319/8fd13a02c97b228a.png',
    status: 1,
    globalData: app.globalData,
    height: app.globalData.statusBarHeight + app.globalData.getMenuButtonBoundingClientRect,
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      showLoading()
      this.data.options = options
      this.setData({
        palette: this.palette(),
        // qrcode: this.palette()
      })
   
  },
  eventGetImage(e) {
    this.setData({
      qrcode: e.detail.path,
      load: 'over'
    })
    hideLoading()
    //通知外部绘制完成，重置isCanDraw为false
    this.triggerEvent('initData')
  },
  palette(){
    const { name, avatarUrl, corp_name ,status } = this.data.options, { cardId, beid, token } = app.globalData
    let url = `${app.API_HOST}card/genWeChatQrCode?state=${status}&cardId=${cardId}&beid=${beid}&token=${token}`
    return {
      "width": "672px",
      "height": "1024px",
      "background": "rgba(255, 255, 255, 0)",   //画布背景透明
      "views": [
        {
          "type": "image",
          "url": "https://facing-1256908372.file.myqcloud.com/image/20200319/8fd13a02c97b228a.png",
          "css": {
            "width": "672px",
            "height": "1024px",
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
          "type": "image",
          "url": `${avatarUrl}?imageView2/1/w/200/h/200`,    //头像
          "css": {
            "width": "95px",
            "height": "95px",
            "top": "74px",
            "left": "289px",
            "rotate": "0",
            "borderRadius": "20px",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",
          "url": url,
          "css": {
            "width": "268px",
            "height": "268px",
            "top": "456px",
            "left": "202px",
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
          "text": corp_name,
          "css": {
            "color": "#F29B30",
            "background": "rgba(0,0,0,0)",
            "width": "672px",
            "height": "28.599999999999994px",
            "top": "244.99999326462978px",
            "left": "0px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "20px",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "28.860000000000007px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "center"
          }
        },
        {
          "type": "text",
          "text": name,
          "css": {
            "color": "#000000",
            "background": "rgba(0,0,0,0)",
            "width": "672px",
            "height": "42.89999999999999px",
            "top": "193.99990570481685px",
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
        }
      ]
    }
  },
  navigate(){
      wx.navigateBack({
          delta:1
      })
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