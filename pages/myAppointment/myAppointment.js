const app = getApp();
import {
    fetchApi
} from '../../api/api.js';
import {
    nav,
    showLoading,
    makePhoneCall,
    showModal,
    showTips
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        myAppointList: [],
        status: 5,
    },
    dataStore: {
        pageIndex: 1
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        showLoading();
        myAppointmentList(this);
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            this.setData({
                isFromShare: true
            });
        }
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
        showLoading();
        this.dataStore.pageIndex = 1;
        this.data.loadStyle = "loadMore";
        myAppointmentList(this);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        myAppointmentList(this, true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '我的预约',
            path: `/pages/myAppointment/myAppointment?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
        }
    }
})
function myAppointmentList(self, isGetMore = false) {
    let param = {
        url: app.API_HOST + 'appointment/getAppointmentOrderList',
        data: {
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
            pageSize: 8
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        self.setData({
            loadStyle: data.length < 8 ? 'loadOver' : 'loadMore',
            myAppointList: isGetMore ? self.data.myAppointList.concat(data) : data,
        });
        self.setData({
            showStyle: self.data.myAppointList.length == 0 ? 2 : 1
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    })
}