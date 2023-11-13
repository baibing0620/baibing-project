const app = getApp()
import {
    fetchApi,
    getUserInfo
} from '../../api/api.js';
import {
    nav, showTips
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userProfileAble: app.globalData.userProfileAble
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

    },
    getUserInfo(e)  {
        const { userInfo } = e.detail
        if (userInfo) {
            getUserInfo(this, userInfo).then(_ => {
                wx.navigateBack({
                    delta: 1
                })
            })
        } else {
            showTips('请允许授权')
        }
    },
    getUserProfile (e) {    //新版本兼容
        wx.getUserProfile({
            desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                const { userInfo } = res
                getUserInfo(this, userInfo).then(_ => {
                    wx.navigateBack({
                        delta: 1
                    })
                })
            },
            fail: (err) => {
                showTips('请允许授权')
            }
        })
    },
    noLogin(){
        wx.navigateBack({
            delta:1
        })
    }
})