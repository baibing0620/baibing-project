const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { nav } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        indus: [],
        list: [],
        mode: "viewed",
        currentIndex: 0,
        showStyle: 0,
        pageSize: 10,
        pageIndex: 1
    },

    toDetail(e) {
        nav({
            url: "/cardFair/cardFairDetail/cardFairDetail",
            data: {
                mCardId: e.currentTarget.dataset.cardid,
                beid: e.currentTarget.dataset.beid
            }
        });
    },

    getList() {
        if (this.data.mode === "viewed") {
            this.getAllCardMyViews();
        } else if (this.data.mode === "collection") {
            this.getAllCardMyCollection();
        }
    },

    getAllCardMyViews() {
        this.setData({
            loadStyle: "loading"
        });
        let params = {
            url: app.API_HOST + "CardMarket/getAllCardMyViews",
            data: {
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            data.map(i => {
                try {
                    i.tags = JSON.parse(i.tags).join(" | ")
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
        });
    },

    getAllCardMyCollection() {
        this.setData({
            loadStyle: "loading"
        });
        let params = {
            url: app.API_HOST + "CardMarket/getAllCardMyCollection",
            data: {
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            data.map(i => {
                try {
                    i.tags = JSON.parse(i.tags).join(" | ")
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
        });
    },

    bindTabClick(e) {
        let mode = e.currentTarget.dataset.mode;
        this.setData({
            mode: mode,
        });
        this.init();
    },

    init() {
        this.data.pageIndex = 1;
        this.getList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.init();
        app.pageData.setPage(this, "cardFairCardCase");
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        app.pageData.removePage("cardFairCardCase");
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.init();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        if (this.data.loadStyle === "loading" || this.data.loadStyle === "loadOver") return;
        this.data.pageIndex ++;
        this.getList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})