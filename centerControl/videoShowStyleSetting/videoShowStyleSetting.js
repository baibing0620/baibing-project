const app = getApp();
import {
    fetchApi,
} from '../../api/api.js';
import {
    nav,
    showTips
} from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        style: 1,
    },

    changeStyle(e) {
        let style = parseInt(e.currentTarget.dataset.style);
        this.setData({
            style: style
        });
    },

    setCardVideoConfig() {
        if (app.globalData.videoShowStyle == this.data.style) {
            wx.showToast({
                title: '设置成功',
            });
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                });
            }, 1500);
        } else {
            wx.showModal({
                title: '提醒',
                content: '切换视频展示样式可能会导致视频封面被裁剪或变形，是否继续切换？',
                confirmColor: "#ff9b1f",
                success: (res) => {
                    if (res.confirm) {
                        let params = {
                            url: app.API_HOST + "card/setCardVideoConfig",
                            data: {
                                style: this.data.style || 1
                            }
                        }
                        fetchApi(this, params).then(res => {
                            app.globalData.videoShowStyle = this.data.style;
                        });
                        wx.showToast({
                            title: '设置成功',
                        });
                        setTimeout(() => {
                            wx.navigateBack({
                                delta: 1,
                            });
                        }, 1500);
                    }
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            style: app.globalData.videoShowStyle
        });
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