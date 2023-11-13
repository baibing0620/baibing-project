const app = getApp();
import {
    nav,
} from '../../utils/util';
import {
    fetchApi,
} from '../../api/api.js';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        showStyle: 0
    },

    getConfigWithRelayIfNeedAudit() {
        this.setData({
            showStyle: 0
        })
        let params = {
            url: app.API_HOST + "XLFCommunity/getConfigWithRelayIfNeedAudit",
            data: {}
        }
        fetchApi(this, params).then(res => {
            app.globalData.needAudit = parseInt(res.data.data.need_audit);
            this.setData({
                needAudit: app.globalData.needAudit,
                showStyle: 1
            })
        }).catch(res => {
            console.log(res);
            this.setData({
                showStyle: 3
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getConfigWithRelayIfNeedAudit();
        this.getTypeSetting();
    },

    toNewPage(e) {

        var page = e.currentTarget.dataset.page;
        nav({
            url: `/centerControl/${page}/${page}`
        })
    },
    toEditor() {
        if (this.data.canPost) {
            nav({ url: "/centerControl/bbsEditor/bbsEditor" });
        } else {
            wx.showModal({
                title: '提示',
                content: '企业未设置发贴类型',
                confirmColor: '#fd9a33',
            })
        }
    },
    getTypeSetting() {
        let params = {
            url: app.API_HOST + "XLFCommunity/getGroupSettingWithPostType",
            data: {}
        }
        fetchApi(this, params).then(res => {
            let arr = res.data.data;
            this.setData({
                canPost: arr.length > 0,
            })
        }).catch(res => {
            console.log(res);
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
        this.getConfigWithRelayIfNeedAudit();
        this.getTypeSetting();
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