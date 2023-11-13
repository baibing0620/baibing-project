const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    nav,
    makePhoneCall
} from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        messageList: [],
        status: 1,
        loadStyle: 'showLoading',
        isIphoneX: app.globalData.isIphoneX
    },
    dataStore: {
        pageSize: 6,
        pageIndex: 1
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getMessageList(this)
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
        if (app.globalData.refresh) {
            app.globalData.refresh = false;
            getMessageList(this)
        }
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
        getMessageList(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: 'showLoading'
        })
        getMessageList(this, true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    navMessagePush() {
        nav({
            url: '/centerControl/messagePush/messagePush',
        })
    },
    navMessageDetail(e){
        nav({
            url: '/centerControl/messageDetail/messageDetail',
            data:{
                logId: e.currentTarget.dataset.id
            }
        })
    }
})

function getMessageList(self, isGetMore = false) {
    if (!isGetMore) {
        self.dataStore.pageIndex = 1;
    }
    let param = {
        url: 'msgPush/getList',
        data: {
            pageSize: self.dataStore.pageSize,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }
    };
    fetchApi(self, param).then((res) => {
        if (isGetMore) {
            self.dataStore.pageIndex++
        }
        let data = res.data.data.list;
        self.setData({
            loadStyle: data.length < self.dataStore.pageSize ? 'loadOver' : 'loadMore',
            messageList: isGetMore ? self.data.messageList.concat(data) : data,
            total: res.data.data.total
        })
        self.setData({
            showStyle: self.data.messageList.length == 0 ? 2 : 1
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });
};