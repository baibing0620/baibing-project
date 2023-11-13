const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { nav, formatTime } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        data: {},
        showCover: false
    },

    getDetail() {
        let params = {
            url: app.API_HOST + "distribution/distributionOrderDetail",
            data: {
                recordId: this.data.id
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            let distributionInfo = this.formatDistributionInfo(data);
            this.setData({
                distributionInfo: distributionInfo,
                data: res.data.data,
                showStyle: 1
            });
        }).catch(res => {
            console.log("error: ", res);
        });
    },

    formatDistributionInfo (data) {
        let self = {
            isMySelf: 1,
            level: data.level,
            distribution_money: data.distribution_money,
            distribution_credit: data.distribution_credit,
            formula: data.formula
        };
        let info = data.other;
        let index = 0;
        for (let i = 0; i < info.length; i ++) {
            if (parseInt(info[i].level) > parseInt(self.level)) {
                index = i;
                break;
            } else if (info.length <= i + 1) {
                index = info.length;
            }
        }
        info.splice(index, 0, self);
        return info;
    },

    showCover() {
        this.setData({
            showCover: true
        });
    },
    
    hideCover() {
        this.setData({
            showCover: false
        });
    },

    toDetail(e) {
        let id = e.currentTarget.dataset.orderid;
        nav({
            url: "/distribution/distributionOrderDetail/distributionOrderDetail",
            data: {
                id: id
            }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.id) {
            this.data.id = options.id;
            this.getDetail();
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
        this.getDetail();
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
        return {
            path: `/distribution/distributionCenter/distributionCenter?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
        }
    }
})