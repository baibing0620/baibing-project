import { fetchApi } from '../../api/api'
import { showTips } from '../../utils/util'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        code: '',
        type: '',
        data: {},
        description: '',
        remark: ''
    },

    getConfirmApi() {
        const { type } = this.data 
        const map = {
            '优惠券': 'coupon/scanToUseCoupon',
            '积分': 'UserCredit/writeOffUserCreditByQRCode',
            '活动奖品': 'activity/scanToUsePrize',
        }
        return map[type]
    },

    getInfoApi() {
        const { type } = this.data
        const map = {
            '优惠券': 'Coupon/getCouponInfo',
            '活动奖品': 'Activity/getPrizeInfo'
        }
        return map[type]
    },

    init() {
        const { type } = this.data 
        type === '积分' ? this.getCreditInfo() : this.getInfo()
    },

    getCreditInfo() {
        const { credit } = this.data.data
        this.setData({
            description: `核销积分数量：${ credit }`,
            showStyle: 1
        })
    },

    handleInput(e) {
        const { value: remark } = e.detail
        this.setData({
            remark
        })
    },

    handleConfirm() {
        const { type, code, data, remark } = this.data
        fetchApi(this, {
            url: this.getConfirmApi(),
            data: {
                code,
                ...data,
                remark
            }
        }).then(_ => wx.showToast({
            mask: true,
            title: `${type}核销成功`,
            icon: 'success',
            duration: 1500
        }), setTimeout(_ => wx.navigateBack(), 1500)).catch(_ => showTips(err ? err.data.msg : '核销失败', this))
    },

    getInfo() {
        const {code} = this.data
        fetchApi(this, {
            url: this.getInfoApi(),
            data: {
                code
            }
        }).then(res => {
            const { description } = res.data.data
            this.setData({
                description,
                showStyle: 1
            })
        }).catch(_ => this.setData({
            showStyle: 3
        }))
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            code: options.result,
            type: options.type,
            data: JSON.parse(options.data) 
        })
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