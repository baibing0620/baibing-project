const app = getApp();
import { fetchApi, wxpay } from "./../../api/api.js";
import { nav, showTips } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        inputValue: "",
        inputMode: false,
        deleteMod: false,
        sliderNone: true,
        indus: [],
        indusIndex: [-1, -1],
        data: {}
    },
    
    bindMenuClick(e) {
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
        (!this.data.indus || this.data.indus.length < 1) && (this.getAllIndus());
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

    bindTabsMenuClick(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        this.setData({
            indusIndex: [index, 0],
        });
    },

    bindTabsMenuClick2(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        this.setData({
            "indusIndex[1]": index,
            sliderShow: false
        });
        this.clearSlider();
    },

    bindHideSlider() {
        this.setData({
            sliderShow: false
        });
    },

    getAllIndus() {
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

    bindDeleteTag(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        let tags = this.data.data.tags;
        tags.splice(index, 1);
        this.setData({
            "data.tags" : tags
        });
        if (tags.length < 1) {
            this.setData({
                deleteMode: false
            });
        }
    },

    startInput() {
        this.setData({
            inputValue: "",
            inputMode: true
        });
    },

    finishInput(e) {
        let value = e.detail.value.replace(/(^\s*)|(\s*$)/g, "");
        if (value) {
            (this.data.data.tags || []).push(value);
        }
        this.setData({
            "data.tags": this.data.data.tags || [value],
            inputMode: false,
            inputValue: ""
        });
    },

    bindDeleteModeChange() {
        this.setData({
            deleteMode: !this.data.deleteMode
        });
    },

    bindDeleteModeClose() {
        this.setData({
            deleteMode: false
        });
    },

    submit() {
        if (this.requesting) return;
        if (this.data.indusIndex[0] < 0) {
            showTips("请选择投放行业");
        } else {
            wx.showModal({
                title: '提示',
                confirmColor: "#c2984c",
                content: '确定投放名片？',
                success: (res) => {
                    if (res.confirm) {
                        this.requesting = true;
                        let params = {
                            url: app.API_HOST + "CardMarket/putOnMyCardToMarket",
                            data: {
                                pindus_code: this.data.indus[this.data.indusIndex[0]].code,
                                cindus_code: this.data.indusIndex[1],
                                tags: JSON.stringify(this.data.data.tags || [])
                            }
                        }
                        fetchApi(this, params).then(() => {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }).catch(res => {
                            console.log("error: ", res);
                        });
                    }
                }
            })
        }
    },

    init() {
        this.cardFairSelf = app.pageData.getPage("cardFairSelf");
        this.data.data = this.cardFairSelf.data.data;
        this.getAllIndus().then(() => {
            const index = this.data.indus.findIndex((i) => {
                return i.code == this.data.data.pindus_code;
            });
            this.setData({
                indusIndex: [index, parseInt(this.data.data.cindus_code || 0)],
                data: this.data.data,
                showStyle: 1
            });
        });
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
})