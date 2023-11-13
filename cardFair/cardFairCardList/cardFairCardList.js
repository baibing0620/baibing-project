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
        sortMode: "default",
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
        this.setData({
            loadStyle: "loading"
        });
        let params = {
            url: app.API_HOST + "CardMarket/getCardMarketList",
            data: {
                orderBy: this.data.sortMode === "default" ? "" : this.data.sortMode,
                aiCode: this.data.sortMode === "default" ? -1 : 0,
                indus: this.data.indus[this.data.currentIndex] ? this.data.indus[this.data.currentIndex].pindus_name : "",
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

    getAllindus() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "CardMarket/getAllindus",
                data: {}
            }
            fetchApi(this, params).then(res => {
                let data = res.data.data;
                resolve();
                this.setData({
                    indus: data
                });
            }).catch(res => {
                console.log("error: ", res);
                reject(res);
                this.setData({
                    showStyle: -1
                });
            });
        });
    },

    bindSortClick(e) {
        let mode = e.currentTarget.dataset.mode;
        this.setData({
            sortMode: this.data.sortMode === mode ? "default" : mode
        });
        this.init();
    },

    bindTabsMenuClick(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        this.setData({
            currentIndex: index,
            scrollIndex: index,
            sliderShow: false
        });
        this.init();
    },
 
    bindTabsClick(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        this.setData({
            currentIndex: index,
            sliderShow: false
        });
        this.init();
    },

    bindMenuClick() {
        if (this.sliderTimer) clearTimeout(this.sliderTimer);
        this.setData({
            sliderNone: false,
        });
        this.sliderTimer = setTimeout(() => {
            this.setData({
                sliderShow: !this.data.sliderShow
            });
            this.clearSlider();
        }, 50);
    },

    clearSlider() {
        if (this.data.sliderShow) return;
        if (this.clearSliderTimer) clearTimeout(this.clearSliderTimer);
        this.clearSliderTimer = setTimeout(() => {
            this.setData({
                sliderNone: true
            });
        }, 500);
    },

    bindHideSlider() {
        this.setData({
            sliderShow: false
        });
    },

    init() {
        this.data.pageIndex = 1;
        this.getList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad (options) {
        this.getAllindus().then(() => {
            this.init();
        }).catch(err => {
            console.log(err);
        });
        app.pageData.setPage(this, "cardFairCardList");
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
        app.pageData.removePage("cardFairCardList");
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.getAllindus().then(() => {
            this.init();
        }).catch(err => {
            console.log(err);
        });
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