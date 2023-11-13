const app = getApp();
import {
    fetchApi, wxpay
} from '../../api/api.js';
import { showTips } from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shopMessage: '',
        serverMessage: '',
        informationMessage: '',
        showStyle: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getMessageList()
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
        app.showRemind(this);
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

    changeMessage(e){
        switch(e.target.dataset.type){
            case 'shop':
            this.setData({shopMessage: e.detail.value})
            break;
            case 'server':
            this.setData({serverMessage: e.detail.value})
            break;
            case 'information':
            this.setData({informationMessage: e.detail.value})
            break;
        }
    },
    saveMessage(){
        console.log(111);
        
        if(!this.data.shopMessage || !this.data.serverMessage || !this.data.informationMessage){
            showTips('分享语不能为空!', this);
            return
        }
        const params = {
            url: 'CardShareLanguage/setCardShareLanguageSetting',
            data: {
                goods_share_language: this.data.shopMessage,
                service_share_language: this.data.serverMessage,
                news_share_language: this.data.informationMessage
            }
        }
        fetchApi(this, params).then(msg => {
            wx.showToast({
                title: '分享语编辑成功!',
                icon: 'success',
                duration: 1500,
                success: function(){
                    setTimeout( _ => {
                        wx.navigateBack({
                            delta: 1
                        })
                    },1500)
                }
              })
        }).catch( err => {
            throw err
        })
        
    },
    getMessageList(){
        const params = {
            url: 'CardShareLanguage/getCardShareLanguageSetting'
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data
            this.setData({
                shopMessage: data.goods_share_language,
                serverMessage: data.service_share_language,
                informationMessage: data.news_share_language
            })
        }).catch( err => {
            throw err
        })
    }
})