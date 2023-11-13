const app = getApp();
import { fetchApi, getGlobalConfig } from "../../api/api.js";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        showStyle: 0,
        pageSize: 10,
        pageIndex: 1,
        searchName: "",
        name: "",
        distribution_reward_type: 1
    },

    getList() {
        this.setData({
            loadStyle: "loading"
        });
        let params = {
            url: app.API_HOST + "distribution/getMyCRMList",
            data: {
                nickname: this.data.searchName,
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        return fetchApi(this, params).then(res => {
            let data = res.data.data;
            this.setData({
                list: this.data.pageIndex > 1 ? this.data.list.concat(data) : data,
                loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver"
            });
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                showStyle: 3
            })
        })
    },

    bindInput(e) {
        this.data.name = e.detail.value;
    },

    search() {
        this.data.searchName = this.data.name;
        this.init();
    },

    init() {
        this.data.pageIndex = 1
        Promise.all([getGlobalConfig(), this.getList()]).then(res => {
            const [globalConfig] = res
            const { distribution_reward_type } = globalConfig.data.data
            this.setData({
                distribution_reward_type,
                showStyle: 1
            })
        }).catch(_ => {
            this.setData({
                showStyle: 3
            })
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