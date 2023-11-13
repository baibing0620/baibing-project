const app = getApp()
import { fetchApi } from '../../api/api.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 1,
        activityId: '',
        credit_left: 0,
        transfer_need_credit: 0,
        transferTotalNeed: 0,
        times: 1
    },
    dataStore:{
        lock:false
    },
    handleInput(e) {
        const { value: times } = e.detail,
              { transfer_need_credit} = this.data
        this.setData({
            times,
            transferTotalNeed: transfer_need_credit * times
        })
    },

    handleTransfer() {
        if (this.dataStore.lock) return;
        this.dataStore.lock = true
        const { activityId, times } = this.data
        fetchApi(this, {
            url: 'Activity/transferCreditToGetPartInChance',
            data: {
                activityId,
                times
            }
        }).then(res => {
            wx.showToast({
                title: '兑换成功',
                icon: 'none'
            })
            setTimeout(_=>{
                wx.navigateBack()
                this.dataStore.lock = false
            },1000)
            this.syncData({
                'activity.activity_times_left': res.data.data.activity_times_left
            })
        }).catch(_=>{
            this.dataStore.lock = false
        })
    },

    getActivityInfo() {
        const { activityId } = this.data
        fetchApi(this, {
            url: 'Activity/get',
            data: { activityId }
        }).then(res => {
            const { credit_left, transfer_need_credit } = res.data.data
            const { times } = this.data
            this.setData({
                credit_left,
                transfer_need_credit,
                transferTotalNeed: Math.round(transfer_need_credit * times),
                showStyle: 1
            })
        }).catch(_ => this.setData({
            showStyle: 3,
        }))
    },

    syncData(params = {}) {
        const pages = [
            app.pageData.getPage('marketEgg'),
            app.pageData.getPage('marketFruitMachine'),
            app.pageData.getPage('marketScratch'),
            app.pageData.getPage('marketShake'),
            app.pageData.getPage('marketSlotMachine'),
            app.pageData.getPage('marketShake'),
            app.pageData.getPage('marketWheel')
        ].filter(e => e && e.setData)
        pages.forEach(e => e.setData( params ))
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const activityId = options.id || options.activityId
        this.setData({
            activityId
        })
        this.getActivityInfo()
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
        this.getActivityInfo()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }
})