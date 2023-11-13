const app = getApp();
import {
    fetchApi
} from '../../api/api';
import { nav } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        diyConfig: app.extConfig,
        onlineRetailersOrderIsOpen: false,
        foodOrderIsOpen: false,
        appointmentOpen: false
    },

    toNewPage(e) {
        let page = e.currentTarget.dataset.page;
        let type = e.currentTarget.dataset.type;
        nav({
            url: `/centerControl/${page}/${page}`,
            data: {
                type: type
            }
        })
    },

    getFunOrderFuncConfig() {
        fetchApi(this, {
            url: 'Config/getFunOrderFuncConfig',
            data: {}
        }).then(res => {
            const {
                onlineRetailersOrderIsOpen,
                foodOrderIsOpen,
                appointmentOpen
            } = res.data.data
            this.setData({
                onlineRetailersOrderIsOpen: onlineRetailersOrderIsOpen == 1,
                foodOrderIsOpen: foodOrderIsOpen == 1,
                appointmentOpen: appointmentOpen == 1
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getFunOrderFuncConfig()
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
