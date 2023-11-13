const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
    showLoading,
    nav,
    showToast,
    showTips
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        replyChecked: false,
        autoChecked: false,
        aiTips: ''
    },
    dataStore: {
        awaken_time_type: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.dataStore.awaken_time_type = options.awaken_time_type
        getAwakenConfigByAwakenType(this)

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
            getAwakenConfigByAwakenType(this)
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
        getAwakenConfigByAwakenType(this);
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

    },
    replyChange(e) {
        this.setData({
            'aiTips.awaken_time_type_if_open': e.detail.value
        })
        setAwakenConfigByAwakenType(this)
    },
    autoChange(e) {
        this.setData({
            'aiTips.content_if_auto': e.detail.value
        })
        setAwakenConfigByAwakenType(this)
    },
    navWritingSettings() {
        if (this.data.aiTips.content_if_auto) {
            return;
        }
        nav({
            url: '/centerControl/writingSettings/writingSettings',
            data: this.data.aiTips
        })
    }
})
function getAwakenConfigByAwakenType(self, awaken_time_type) {
    let param = {
        url: `Card/getAwakenConfigByAwakenType`,
        data: {
            awaken_time_type: self.dataStore.awaken_time_type
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data
        data.awaken_time_type_if_open = data.awaken_time_type_if_open == 1 ? true : false
        data.content_if_auto = data.content_if_auto == 1 ? true : false
        self.setData({
            aiTips: data,
            // replyChecked: data.awaken_time_type_if_open == 1 ? true : false,
            // autoChecked: data.content_if_auto == 1 ? true : false
        })
    }).catch(err => {

    })
}

function setAwakenConfigByAwakenType(self) {
    let aiTips = self.data.aiTips
    let param = {
        url: `Card/setAwakenConfigByAwakenType`,
        data: {
            awaken_time_type: aiTips.awaken_time_type,
            content: aiTips.content,
            if_open: aiTips.awaken_time_type_if_open ? 1 : 0,
            content_if_auto: aiTips.content_if_auto ? 1 : 0,
        }
    }
    fetchApi(self, param).then(res => {

    }).catch(err => {

    })
}