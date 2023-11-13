const app = getApp();
import {
    fetchApi,
    getGlobalConfig
} from '../../api/api.js';
import {
    nav,
    showLoading,
    showModal,
    showTips,
    showActionSheet,
    getYMD
} from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        type: 0,
        couponId: 0,
        userCouponId: 0,
        errcode: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.couponId = options.id || 0
        this.data.userCouponId = options.usercouponid || 0
        app.globalData.cardId = options.cardId || ''
        app.globalData.fromUser = options.fromUser || ''
        this.receiveCoupon()
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

    toMall() {
        nav({
            url: '/pages/mall/mall'
        })
    },
    toCouponList() {
        nav({
            url: '/pages/myCoupon/myCoupon'
        })
    },
    receiveCoupon() {
        let params = {
            url: app.API_HOST + 'coupon/receiveCardCoupon',
            data: {
                couponId: this.data.couponId,
                userCouponId: this.data.userCouponId,
            }
        }
        fetchApi(this, params).then((res) => {
            let data = res.data.data;
            const { time_type, end_time, start_time, expire_at } = data;
            let endTime = '', startTime = '';
            if (time_type == 1) {
                endTime = getYMD(new Date(end_time * 1000), '.')
                startTime = getYMD(new Date(start_time * 1000), '.')
            } else if (time_type == 2) {
                endTime = data.userCoupon.end_date
            }
            this.setData({
                errcode: res.data.code || '',
                sale_to: data.sale_to,
                cutdown: data.cutdown,
                name: data.name,
                time_type: time_type,
                startTime: startTime,
                endTime: endTime,
                type: data.type,
                exchange_goods: data.exchange_goods,
                is_new_user_coupon: data.is_new_user_coupon,
                showStyle: 1,
            })
        }).catch((err) => {
            console.log(err, 'err')
            this.setData({
                showStyle: 3
            })
        });
    }
})