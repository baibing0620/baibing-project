const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
    showLoading,
    nav,
    showToast,
    showTips
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isOpen:false,
        total:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
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
        this.getCustomerServiceConfig()
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
        this.getCustomerServiceConfig();
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
    serviceChange(){
        this.setData({
            isOpen:!this.data.isOpen
        })
        let params = {
            url: app.API_HOST + "Chat/setCustomerServiceConfig",
            data: {
                service_if_open:this.data.isOpen?1:0
            }
        }
        fetchApi(this, params).then(res => {
         
        }).catch(res => {
            console.log("error: ", res);
        })
    },
    navAutoRecovery(){
        nav({
            url:'/centerControl/automaticRecoveryRule/automaticRecoveryRule'
        })
    },
    getCustomerServiceConfig(){
        let params = {
            url: app.API_HOST + "Chat/getCustomerServiceConfig",
            data: {}
        }
        fetchApi(this, params).then(res => {
          let data = res.data.data
          this.setData({
              isOpen: data.service_if_open == 1?true:false,
              total: data.total
          })
        }).catch(res => {
            console.log("error: ", res);
        })
    }
})