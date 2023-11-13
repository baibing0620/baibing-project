const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite, formatDuring } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },
    dataStore:{
        lock:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.dataStore.lock = true
        getAwakenConfig(this)
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
        if (!this.dataStore.lock){
            getAwakenConfig(this)
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.dataStore.lock = false
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
        this.dataStore.lock = true
        getAwakenConfig(this)
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
    navAitips(e) {
        let item = e.currentTarget.dataset.item.awaken_time_type
        nav({
            url: '/centerControl/aiTips/aiTips',
            data: {
                awaken_time_type:item
            }
        })
    }
})

function getAwakenConfig(self) {
    let param = {
        url: `Card/getAwakenConfig`,
        data: {}
    }
    fetchApi(self, param).then(res => {
        self.setData({
            awkenList: res.data.data
        })
    }).catch(err => {

    })
}