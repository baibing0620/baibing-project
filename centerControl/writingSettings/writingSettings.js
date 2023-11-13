const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav, showTips, showLoading, showToast, chooseAddress, deleteWhite, formatDuring } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        copySetting: '',
        disabled:false
    },
    dataStore:{
        aiData:''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.dataStore.aiData=options
        this.setData({
            copySetting: this.dataStore.aiData.content
        })
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

    },
    changeSetting(e) {
        this.setData({
            copySetting: e.detail.value
        })
    },
    formSubmit(e){
        let value = e.detail.value.textSetting
        if(!value){
            showTips('文案内容不能为空哦',this)
            return ;
        }
        this.setData({
            disabled:true
        })
        let param = {
            url: `Card/setAwakenConfigByAwakenType`,
            data: {
                awaken_time_type: this.dataStore.aiData.awaken_time_type,
                content: e.detail.value.textSetting,
                if_open: this.dataStore.aiData.awaken_time_type_if_open == 'true'?1:0,
                content_if_auto: this.dataStore.aiData.content_if_auto == 'true'?1:0,
            }
        }
        fetchApi(self, param).then(res => {
            showToast('推送成功', 'success')
            app.globalData.refresh = true
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
        }).catch(err => {
            this.setData({
                disabled: false
            })
        })
    }
})