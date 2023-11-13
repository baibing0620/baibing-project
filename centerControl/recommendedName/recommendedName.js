const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { showToast, nav } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
       
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            name:options.name
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

    },
    formSubmit(e){
        let params = {
            url: app.API_HOST + "card/setHomeModuleName",
            data: {
                home_module: e.detail.value.mouldName
            }
        }
        fetchApi(this, params).then(res => {
            showToast('保存名称成功', 'success')
            app.globalData.refresh = true;
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
        }).catch(res => {

        })
    }
})