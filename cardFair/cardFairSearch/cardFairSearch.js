const app = getApp()
import { nav } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        inputValue: "",
        quickSearch: ["互联网", "金融业", "信息技术", "物流仓储"]
    },

    bindInput (e) {
        this.data.inputValue = e.detail.value;
    },

    navigate(e) {
        nav({
            url: "/cardFair/cardFairSearchResult/cardFairSearchResult",
            data: {
                searchValue: e.currentTarget.dataset.value || this.data.inputValue
            }
        });
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

    }
})