const app = getApp();
import {
  fetchApi
} from '../../api/api';
import {
  showLoading,
  hideLoading,
  nav,
  makePhoneCall,
  showToast,
  showTips
} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    themeColor: app.extConfig.themeColor,
    cardInfo: {},
    cardStyleUrl: ['https://facing-1256908372.file.myqcloud.com/image/20200921/a70a0a5691517cc.png', 'https://facing-1256908372.file.myqcloud.com/image/20200921/a62aa7ff02b446193.png', ],
    chooseIndex:1,
    previewImgUrl: ['https://facing-1256908372.file.myqcloud.com/image/20200921/a70a0a5691517cc.png' ,'https://facing-1256908372.file.myqcloud.com/image/20200921/a62aa7ff02b446193.png', ],
    cardName:["经典版",'商务版','时尚版', '专业版'],
    display: [true, true, true, true],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    getCardInfo(this);
    var param = {
      url: 'card/getCardInfo',
      data: {
          cardId: app.globalData.cardId,
      }
    }
    fetchApi(this,param).then(res=>{
        this.setData({
          chooseIndex: res.data.data.pf_id
        })
    }).catch(err=>{
        console.log(err)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.cancelSetting();
    app.showRemind(this);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    getCardInfo(this);
  },

  cancelSetting() {
    this.setData({
      //showopenSetting: false
      cancelAuth: true
    })
  },
  _cancelAuth() {
    this.setData({
      cancelAuth: false
    })
  },
  chooseCard(e){
    this.setData({
      chooseIndex:e.currentTarget.dataset.index
    })
},
  previewImg(e){
    let index = e.currentTarget.dataset.index
    if(this.data.cardStyleUrl){
      wx.previewImage({
        urls: [this.data.previewImgUrl[index]]
      })
    }
  },
  saveChoose(){
    let param = {
      url: 'card/setCardPFStyle',
      data: {
        cardId: app.globalData.cardId,
        pf_id:this.data.chooseIndex
      }
    }
    fetchApi(this, param).then(res => {
      showToast('设置样式成功', 'success')
      app.globalData._imgPath=''
        setTimeout(() => {
        nav({
            url: '/pages/home/home'
        })
      }, 1500)
      app.globalData.refresh = true
    }).catch(er => {
      console.log(er)
    })
 },

  // saveQRCode() {
  //   let self = this;
  //   let qrShareCardUrl = `${app.API_HOST}Card/genSharedCardImage?token=${app.globalData.token}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}`
  //   if (!qrShareCardUrl) {
  //     showTips('无下载链接');
  //     return;
  //   }
  //   showLoading({
  //     title: '下载中'
  //   });
  //   wx.downloadFile({
  //     url: qrShareCardUrl,
  //     success: function(res) {
  //       hideLoading();
  //       if (res.statusCode === 200) {
  //         wx.saveImageToPhotosAlbum({
  //           filePath: res.tempFilePath,
  //           success(res) {
  //             showToast('保存成功', 'success')
  //           },
  //           fail(err) {
  //             console.log('error: ', err)
  //             wx.getSetting({
  //               success(resSetting) {
  //                 if (!resSetting.authSetting['scope.writePhotosAlbum']) {
  //                   self.setData({ 
  //                     showopenSetting:true,
  //                     setttingContent:'需要您的授权才可以保存图片'
  //                     })
  //                 }
  //               },
  //               fail(err){
  //                 console.log('error: ', err)
  //               }
  //             })

  //           }
  //         })
  //       }
  //     },
  //     fail:(err)=>{
  //       console.log('error: ', err)
  //     }
  //   })
  // }
})

function getCardInfo(self) {
  
  var param = {
    url: 'card/getShareCardInfo',
    data: {
      cardId: app.globalData.cardId,
    }
  }
  fetchApi(self, param).then(res => {
    var data = res.data.data;
    if (!parseInt(data.mobile_is_show)) {
        data.mobile = data.mobile.replace(data.mobile.substring(3, 7), "****")
    }
    var cardInfo = {
      avatar_url: data.avatar_url,
      company: data.company,
      address: data.address,
      email: data.email,
      mobile: data.mobile,
      name: data.name,
      position: data.position,
      wechat: data.wechat,
      qrCodeURL: data.qrCodeURL,
      qrShareCardUrl: data.qrShareCardUrl

    }
    app.globalData.cardInfo = cardInfo;
    self.setData({
      cardInfo: cardInfo,

    })

  }).catch(err => {
    self.setData({
      showStyle: 3
    })
  })
}