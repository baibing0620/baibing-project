const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { nav } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        goodsDistributionRate: [],
        config: {},
        showStyle: 0
    },

    getShopConfig() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "config/get",
                data: {}
            }
            fetchApi(this, params).then(res => {
                let data = res.data.data;
                data.chain_distribution_level = parseInt(data.chain_distribution_level || 0);
               
                data.distribution_setting = data.distribution_setting.slice(0, data.chain_distribution_level);
                resolve(data);
            }).catch(res => {
                reject(res);
            });
        })
    },

    getGoodsDistributionRate() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "distribution/getGoodsDistributionRate",
                data: {}
            }
            fetchApi(this, params).then(res => {
                let data = res.data.data;
                resolve(data);
            }).catch(res => {
                reject(res);
            })
        })
    },

    formatGoodsName(name) {
        return name.length > 27 ? name.substring(0, 28) + "..." : name;
    },

    init() {
        Promise.all([this.getShopConfig(), this.getGoodsDistributionRate()]).then(res => {
            res[1].map(i => {
                i.goodsName = this.formatGoodsName(i.goodsName);
                i.rate_rule = i.rate_rule.slice(0, res[0].chain_distribution_level);
            });
            this.setData({
                showStyle: 1,
                config: res[0],
                goodsDistributionRate: res[1]
            });
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init();
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
        this.init();
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