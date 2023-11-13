const app = getApp();
import {
    fetchApi,
    getGlobalConfig
} from '../../api/api.js';
import {
    nav,
    showLoading,
    chooseAddress,
    deleteWhite,
    showTips
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        url:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (!wx.canIUse('web-view')) {
            showModal({
                title: '提示',
                content: '您的微信版本过低，暂不支持网页组件',
                confirmText: '返回'
            }).then(() => {
                wx.navigateTo()
            });
            return;
        }
        var url = options.src
        delete options.src
        for(let key in options){
            url += `&${key}=${options[key]}`
        }
        url = url.replace(/&/, '?');
        this.setData({
            url: url
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
        let url = this.data.url.replace(/\?/g, '&')
        return{
            path: `/pages/webH5/webH5?src=${url}`,
        }
    }
})