const app = getApp();
import {
    fetchApi,
} from '../../api/api.js';
import {
    nav,
    showLoading,
    showModal,
    showTips,
    makePhoneCall
} from '../../utils/util';

Page({
 
    data: {
        showStyle: 0, 
        loadStyle: 'loadMore'
    },
    dataStore: {
        pageIndex: 1,
        pageSize: 10,
       
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getCardRemindList();
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
        this.dataStore.pageIndex = 1;
        this.getCardRemindList()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
        this.getCardRemindList(true);
    },
    getCardRemindList(isGetMore) {
        let param = {
            url: app.API_HOST + 'CrmUser/getCardRemindList',
            data: {
                pageSize: 6,
                pageIndex: isGetMore ? this.dataStore.pageIndex + 1 : this.dataStore.pageIndex
            }
        }
        fetchApi(this, param).then(res => {
            if (isGetMore) {
                this.dataStore.pageIndex++
            }
            console.log(res.data.data, 'resss')
            var data = res.data.data.list
            this.setData({
                loadStyle: data.length < 6 ? 'loadOver' : 'loadMore',
                remindList: isGetMore ? this.data.remindList.concat(data) : data,
            })
            this.setData({
                showStyle: this.data.remindList.length == 0 ? 2 : 1
            })
        })
    },
    navToUserDetail(e) {
        console.log(e, 'eee')
        const { id, uid, admin_uid, remind_type, cooperrate } = e.currentTarget.dataset;
        if (remind_type == 3) return;
        nav({
            url: '/pages/clueDetail/clueDetail',
            data: {
                crmId: id,
                crmUid: uid,
                admin_uid: admin_uid,
                percent: cooperrate
            }
        })
    },
    callUser(e) {
        const { mobile } = e.currentTarget.dataset;
        mobile && makePhoneCall(mobile)
    }
})