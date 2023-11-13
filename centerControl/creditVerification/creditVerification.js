
const app = getApp();//const声明常量   let声明变量
import {
    fetchApi
} from '../../api/api.js';
import { showToast } from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {

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
        app.WSManager.initResHandle(this.WSRequest());
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
        app.WSManager.initResHandle();
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
    init() {
        let qrcode = `${app.API_HOST}userCredit/getUserCreditQRCoed?token=${app.globalData.token}&beid=${app.globalData.beid}`
        this.setData({
            qrcode
        })
        this.getUserCreditInfo()
    },
    getUserCreditInfo() {
        let params = {
            url: app.API_HOST + 'userCredit/getUserCreditInfo',
            data: {}
        };
        fetchApi(this, params).then(res => {
            this.setData({
                credit: res.data.data.credit
            })
        }).catch(err => {
            console.log('error: ', err)
        });
    }, 
    WSRequest() {
        return {
            writeOffUserCredit: (res) => {  
                showToast('您被核销'+res+'积分','success')
                app.globalData.refresh = true;
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1,
                    })
                }, 1500)
            },
            gifUserCredit: (res) => {
                showToast('您获赠' + res + '积分', 'success')
                app.globalData.refresh = true;
                setTimeout(() => {
                    wx.navigateBack({
                      delta: 1,
                    }) 
                }, 1500)
            }
        }
    }

})