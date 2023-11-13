const app = getApp();
import { fetchApi, getCardInfo } from '../../api/api';
import { showToast, nav } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
      cardStyleUrl: [
        'https://facing-1256908372.file.myqcloud.com//image/20201106/b38b8b09e5ce570c.jpg',
        'https://facing-1256908372.file.myqcloud.com//image/20201106/3cde326338ee296c.jpg',
        'https://facing-1256908372.file.myqcloud.com//image/20201106/ad1a40dac7fc48e3.jpg',
        'https://facing-1256908372.file.myqcloud.com//image/20201106/039ac37d577a7597.jpg'
      ],
      chooseIndex:0,
      cardName:["经典版",'商务版','时尚版', '专业版'],
      display: [false, false, false, false],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getCardStyle(this)
    this.getCardStyleConfig()
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
    app.showRemind(this);
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
    getCardStyle(this)
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

  },
  getCardStyleConfig() {
    fetchApi(this, {
      url: 'Card/getCardStyleConfig',
      data: {}
    }).then(res => {
      const { data } = res.data
      this.setData({
        display: data.sort((a, b) => Number(a.style_id) - Number(b.style_id)).map(i => i.display == 1)
      })
    })
  },
  chooseCard(e){
      this.setData({
        chooseIndex:e.currentTarget.dataset.index
      })
  },
  saveChoose(){
     let param = {
      url: 'card/setCardStyle',
      data: {
        cardId: app.globalData.cardId,
        styleId:this.data.chooseIndex
      }
    }

    fetchApi(this, param).then(res => {
      getCardInfo()
      showToast('设置样式成功', 'success')
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
  previewImg(e){
  let index = e.currentTarget.dataset.index
    if(this.data.cardStyleUrl){
      wx.previewImage({
        urls: [this.data.cardStyleUrl[index]]
      })
    }
  },
})

function getCardStyle(self){
  let param = {
      url: 'card/getCardInfo',
      data: {
        cardId: app.globalData.cardId,
      }
    }

    fetchApi(self, param).then(res => {
     self.setData({
      chooseIndex :res.data.data.style_id
     })
    }).catch(er => {
      console.log(er)
    })
}