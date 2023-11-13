const app = getApp();
import { fetchApi, wxpay } from "./../../api/api.js";
import { nav } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        data: {}
    },

    getData() {
        let params = {
            url: app.API_HOST + "CardMarket/getMyCardInfoInMarket",
            data: {}
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            try {
                data.tags = JSON.parse(data.tags);
                data.tagsArr = [];
                let n = Math.ceil(data.tags.length / 3);
                if (n > 0) {
                    for (let i = 0; i < n; i++) {
                        data.tagsArr.push(data.tags.slice(i * 3, i * 3 + 3).join(" / "));
                    }
                }
            } catch (err) {
                console.log("error: ", err);
            }
            this.setData({
                showStyle: 1,
                data: data
            });
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                showStyle: -1
            });
        });

    },

    putOut() {
        wx.showModal({
            title: '提示',
            confirmColor: "#c2984c",
            content: '确定取消投放？',
            success: (res) => {
                if (res.confirm) {
                    if (this.requesting) return;
                    this.requesting = true;
                    let params = {
                        url: app.API_HOST + "CardMarket/putOutMyCardFromMarket",
                        data: {}
                    }
                    fetchApi(this, params).then(res => {
                        this.requesting = false;
                        this.getData();
                    }).catch(res => {
                        console.log("error: ", res);
                    });
                }
            }
        })

    },

    showWhat() {
        wx.showModal({
            title: '名片投放与集市',
            content: '企业名片集市是AI名片内信息交换平台，您可以将名片投放至该集市，并从该集市获取各行业名片。该投放完全免费！',
            confirmColor: '#c29844'
        });
    },

    navigate() {
        nav({ url: "/centerControl/cardFairPutOn/cardFairPutOn" });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        if(!wx.getStorageSync("showCardFairMsg")) {
            wx.showModal({
                title: '注意',
                content: '(1)投放名片前，请确保公司地址中包含省、市信息，否则无法检索名片；(2)投放名片后，如果修改了公司名称或公司地址，请重新投放。',
                confirmColor: '#c29844'
            });
            wx.setStorage({
                key: 'showCardFairMsg',
                data: true,
            });
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getData();
        app.pageData.setPage(this, "cardFairSelf");
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
        app.pageData.removePage("cardFairSelf");
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getData();
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

    }
});