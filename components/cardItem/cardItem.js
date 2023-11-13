// compnents/card1/card1.js
const app = getApp();
import {
  addActionLog
} from '../../api/api';
Component({
  /**
   * 组件的属性列表
   */
    properties: {
      // 这里定义了innerText属性，属性值可以在组件使用时指定
      userInfo:{
        type:null,
        value:{}
      },
      isStart:{
        type:null,
        value:0
      },
      index: {
        type: null,
        value: 0
      },
    },
  /**
   * 组件的初始数据
   */
  data: {
    themeColor: app.extConfig.themeColor,
    // showStar: false
  },
  /**
   * 组件的方法列表
   */
  methods: {
    previewImg(){
      if(this.data.userInfo.avatarUrl){
        wx.previewImage({
          urls: [this.data.userInfo.avatarUrl]
        })
      }
    },
    startTop(){
      this.triggerEvent('startEvent', {index:this.data.index}) 
    },
    // 名片列表页直接电话
    callPhone(){
      wx.makePhoneCall({
        phoneNumber: this.data.userInfo.mobile
    })
    },
    stopP(){

    }
  }
})
