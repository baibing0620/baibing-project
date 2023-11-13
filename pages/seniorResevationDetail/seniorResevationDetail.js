const app = getApp();
import { fetchApi, getGlobalConfig} from '../../api/api';
import { showLoading, getYMD, showToast, nav, makePhoneCall, previewImageList} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    AppointmentGoodsItemList:{
      detail:""
    },
    phone:'',
    customService:''

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
    this.dataStore.goodsId = options.goodsId||0
    getInitData(this, options.appointmentItemid)
    if (app.globalConfig != null && app.globalConfig !=''){
      this.setData({
        phone: app.globalConfig.service_phone,
        customService: app.globalConfig.funcList.open_custom_service
      })
    }else{
      getGlobalConfig(this).then(res=>{
        this.setData({
          phone: app.globalConfig.service_phone,
          customService: app.globalConfig.funcList.open_custom_service
        })
      })
    }
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

  resevation(e) {
    nav({
      url: '/pages/confirmSeniorResevationOrder/confirmSeniorResevationOrder',
      data: {
        appointmentItemid: e.currentTarget.dataset.id,
        goodsId:this.dataStore.goodsId
      }
    })
  },
  call(){
    makePhoneCall(this.data.phone)
  },
  previewImage(e) {
    let url = e.currentTarget.dataset.url
    previewImageList(this.data.AppointmentGoodsItemList.banner, 'imgUrl', url)
  }
})
function getInitData(self,id){
  let param = {
    url: `${app.API_HOST}appointment/getAppointmentGoodsItemById`,
    data: {
      id: id
    }
  }
  fetchApi(self, param).then((res) => {

    let data = res.data.data
    wx.setNavigationBarTitle({
      title: data.title,
    })
    self.setData({
      AppointmentGoodsItemList:data
    })

  }).catch((e) => { console.log(e) });
}