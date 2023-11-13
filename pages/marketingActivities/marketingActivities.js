
const app = getApp();
import {
  fetchApi
} from '../../api/api';
import { nav} from '../../utils/util';
Page({

  data: {
    pageSize: 6,
    pageIndex: 1,
    loadStyle: '',
    type: '',
    id: '',
    isSHOW: false,
    dataList1:[]
  },

  onLoad: function (options) {
    this.getList()
  },

  onReady: function () {

  },


  onShow: function () {

  },


  onHide: function () {

  },


  onUnload: function () {

  },


  onPullDownRefresh: function () {
    this.data.pageIndex = 1;
    this.getList()
  },

  onReachBottom: function () {
    if (this.data.loadStyle == 'loadOver') {
      return;
    }
    this.setData({
      loadStyle: ''
    })
    this.getList(true)
  },

 
  onShareAppMessage: function () {
    return {
        title: '营销活动',
        path: `/pages/marketingActivities/marketingActivities?beid=${app.globalData.beid}&fromUser=${app.globalData.uid}&cardId=${app.globalData.cardId}`,
        success: function (res) {
            // 转发成功
        },
        fail: function (res) {
            // 转发失败
        }
    }
  },
  
  getList(isGetMore = false){
    let param = {
      url:'activity/getList',
      data: {
        pageSize: this.data.pageSize,
        pageIndex: isGetMore ? this.data.pageIndex + 1 : this.data.pageIndex,
      }
    }
    fetchApi(this,param).then(res => { 
      if (isGetMore) {
        this.data.pageIndex++
      }
      console.log('resqr',res.data.data.data)
      let data = res.data.data.data;
      this.setData({
        loadStyle: data.length < 6 ? 'loadOver' : 'loadMore',
        dataList1: isGetMore ? this.data.dataList1.concat(data) : data,
      })
    })
  },

  toDetail(e){
    console.log(e)
    let type = e.currentTarget.dataset.type,
        id = e.currentTarget.dataset.id;
        console.log('type',type)
        this.setData({
         type: type,
         id: id
        })
    let url = this.data.type == '1' ? 'marketWheel' : this.data.type == '2' ? 'marketScratch' : this.data.type == '3' ? 'marketSlotMachine' : this.data.type == '4' ? 'marketShake' : this.data.type == '5' ? 'marketFruitMachine' : this.data.type == '6' ? 'marketEgg' : ''
    nav({
      url: `/pages/${url}/${url}`,
      data:{
        id: this.data.id
      }
    })
  }
})