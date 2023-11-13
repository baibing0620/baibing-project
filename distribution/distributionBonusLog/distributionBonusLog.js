const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { showTips, nav,  makePhoneCall } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        showStyle: 0,
        currentIndex: -1,
        pageSize: 10,
        pageIndex: 1
    },

    getList() {
        this.setData({
            loadStyle: "loading"
        });
        let params = {
            url: app.API_HOST + "distribution/distributionOrderList",
            data: {
                isStaffCommission: 1,
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            data.map(i => {
                try {
                    if(i.tags){
                        i.tags = JSON.parse(i.tags)
                    }
                } catch (err) {
                    console.log("error: ", err);
                }
            });
            this.setData({
                showStyle: 1,
                list: this.data.pageIndex > 1 ? this.data.list.concat(data) : data,
                loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver"
            });
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                showStyle: -1
            });
        })
    },

    toDetail(e) {
        let id = e.currentTarget.dataset.id;
        nav({
            url: "/distribution/distributionOrderDetail/distributionOrderDetail",
            data: {
                id: id
            }
        });
    },

    showCover(e) {
        this.setData({
            currentIndex: parseInt(e.currentTarget.dataset.index),
            showCover: true
        });
    },
    
    hideCover() {
        this.setData({
            showCover: false
        });
    },

    init() {
        this.data.pageIndex = 1;
        this.getList();
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
        if (this.data.loadStyle === "loading" || this.data.loadStyle === "loadOver") return;
        this.data.pageIndex ++;
        this.getList();
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