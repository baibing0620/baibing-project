const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { nav } from "../../utils/util";

Page({
    /**
     * 页面的初始数据 
     */
    data: {
        cdk_end_days: '',
        help_mobile: '',
        staff_id: '',
        name: '',
        mobile: '',
        isBgLoaded: false
    },

    /**
     * 页面的方法
     */

    handleBgLoaded() {
        this.setData({
            isBgLoaded: true
        })
    },

    handleToBind() {
        nav({ 
            url: '/centerControl/extendByCDKey/extendByCDKey',
            data: {}
        })
    },

    init() {
        fetchApi(this, {
            url: 'Card/getStaffInfoAndOtherData',
            data: {}
        }).then(res => {
            const {data} = res.data
            this.setData({
                ...data
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init()
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
        this.init()
    },
})