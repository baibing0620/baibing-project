// compnents/card1/card1.js

import {
  showLoading,
  previewImageList,
  nav,
  makePhoneCall,
  showToast,
  showTips,
  setCurrentLoginUserCardInfo,
} from '../../utils/util';

import {
  eventType
} from '../../map'
Component({
  /**
   * 组件的属性列表
   */
    properties: {
      // 这里定义了innerText属性，属性值可以在组件使用时指定
      diyConfig: {
        type: Object,
        value: {},
      },
      userInfo:{
        type:null,
        value:{}
      },
      baseInfo:{
        type: null,
        value: {}
      }
    },
  /**
   * 组件的初始数据
   */
  data: {
    showInfo: false,
    showAdress: false
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
    makePhoneCall() {
      makePhoneCall(this.data.userInfo.mobile, () => {})
    },
    hideInfoBox() {
      this.setData({
        showInfo: false
      })
    },
    showInfoBox() {
      this.setData({
        showInfo: true
      })
    },
    toCardList() {
      wx.reLaunch({
        url: '/pages/cardList/cardList'
      })
    },
    copyText(e) {
      var type = e.currentTarget.dataset.text;
      var baseInfo = this.data.baseInfo;

      if (!baseInfo[type]) {
        showTips('复制内容为空');
        return;
      }
      var self = this;
      wx.setClipboardData({
        data: baseInfo[type],
        success: function (res) {
          showToast('复制成功', 'success');
        }
      })
    },
    copyAddress(e) {
        var type = e.currentTarget.dataset.text;
        var index = e.currentTarget.dataset.index;
        var baseInfo = this.data.baseInfo;
        if (!baseInfo[type][index]) {
            showTips('复制内容为空');
            return;
        }
        var self = this;
        wx.setClipboardData({
            data: baseInfo[type][index],
            success: function (res) {
                showToast('复制成功', 'success');
            }
        })
    },
    addPhoneContact() {
      var baseInfo = this.data.baseInfo;
      var self = this;
      wx.addPhoneContact({
        firstName: baseInfo.name,
        lastName: '',
        mobilePhoneNumber: baseInfo.mobile,
        weChatNumber: baseInfo.wechat,
        organization: baseInfo.company,
        email: baseInfo.email,
        success: () => {
        },
        fail: (err) => {
          console.log('error: ', err)
        }
      });
    },
    shareCard() {
      this.setData({
        upShareModal: true,
        showShareModal: true
      })
    },
    closeShareModal() {
      this.setData({
        upShareModal: false,
      })
      setTimeout(() => {
        this.setData({
          showShareModal: false
        })
      }, 180)
    },
    getPageQRCode() {
      this.setData({
        showShareModal: false
      })
      wx.previewImage({
        urls: [this.data.baseInfo.shareUrl]
      });
    },
    openLocation(e) {
      let index = e.currentTarget.dataset.index
      let lnglat = this.data.baseInfo.lnglats[index];
      wx.openLocation({
        latitude: lnglat[1],
        longitude: lnglat[0],
        name:this.data.baseInfo.addresses[index],
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    },
    showMordeAddress() {
        this.setData({
            showAdress: !this.data.showAdress
        })
    }
  }
})
