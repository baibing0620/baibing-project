const app = getApp();
import { fetchApi } from '../../api/api.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        switchTab: {
            tabs: [
                '奖品',
                '优惠券',
                '积分'
            ],
            themeColor: '#1F94FD', 
            currentIndex: 0,
            top: 0,
            position: 'relative'
        },
        switchTabData: {
            '奖品': 1,
            '优惠券': 2,
            '积分': 3
        },
        list: [],
        pageIndex: 1,
        pageSize: 10,
        loadStyle: 'loading'
    },

    onTabClick(e) {
        this.setData({
            'switchTab.currentIndex': e.detail.currentIndex,
        })
        this.init()
    },

    init() {
        this.data.pageIndex = 1
        this.getList()  
    },

    getList() {
        this.setData({
            loadStyle: 'loading'
        })
        const { pageIndex, pageSize, switchTab: { tabs, currentIndex }, switchTabData} = this.data
        fetchApi(this, {
            url: 'Activity/getShopWriteOffRecord',
            data: {
                type: switchTabData[tabs[currentIndex]],
                pageIndex,
                pageSize
            }
        }).then(res => {
            const { list: oldData } = this.data
            const { info: data } = res.data.data
            const list = pageIndex == 1 ? data : oldData.concat(data)
            this.setData({
                list,
                loadStyle: data.length < pageSize ? 'loadOver' : 'loadMore',
                showStyle: 1
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle !== 'loadMore') return
        this.data.pageIndex ++
        this.getList()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})