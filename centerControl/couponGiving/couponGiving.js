import { fetchApi, getCardInfo, addActionLog } from './../../api/api'
import { nav, query } from '../../utils/util'

const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        list: [],
        pageIndex: 1,
        pageSize: 10,
        loadStyle: 'loadMore',
        isShowShareBar: false,
        isShowPoster: false,
        spreadIndex: -1,
        cardName: '',
        shareId: '',
        shareImagePath: '',
        isShareImageDrawing: false,
        template: {},
        shareTemplate: {}
    },

     getList() {
        try {
            this.setData({
                loadStyle: 'loading'
            })
            const { pageIndex, pageSize, list: oldList } = this.data
             fetchApi(this, {
                 url: 'coupon/getPromoteCouponList',
                data: {
                    pageIndex,
                    pageSize
                }
            }).then(res => {
                const newList= res.data.data;
                const list = (pageIndex == 1 ? [] : oldList).concat(newList.map(e => {
                    if (typeof e.scope === 'string') e.scope = JSON.parse(e.scope)
                    return e
                }))
                this.setData({
                    list,
                    loadStyle: newList.length < pageSize ? 'loadOver' : 'loadMore',
                    showStyle: list.length ? 1 : 2
                })
            })
           
        } catch (error) {
            console.error(error)
            this.setData({
                showStyle: 3
            })
        }
    },

    handleSpread(e) {
        const { index } = e.currentTarget.dataset
        const { spreadIndex } = this.data
        this.setData({
            spreadIndex: spreadIndex == index ? -1 : ~~index
        })
    },
    handleNav(e) {
        const { id: couponId } = e.currentTarget.dataset
        nav({
            url: '/pages/goodsList/goodsList',
            data: { couponId }
        })
    },


    init() {
        this.data.pageIndex = 1
        this.getList()
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.cardId) app.globalData.cardId = options.cardId
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle === 'loadOver') return
        this.data.pageIndex++
        this.getList()
    },

    /**
     * 用户点击右上角分享
     */

    onShareAppMessage: function (res) {
        console.log(res,'ressss')
        if (res.from === 'button') {
            const { id, share_img, share_text } = res.target.dataset;
            return {
                title: share_text || `送你一张优惠券，请查收！`,
                path: `/pages/couponReceive/couponReceive${query({ id })}`,
                imageUrl: share_img || ''
            }
        } else {
            return {
                title: '',
                path: `/pages/home/home${query()}`
            }
        }
    }
})