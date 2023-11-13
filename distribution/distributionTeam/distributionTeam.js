const app = getApp();
import { fetchApi, getGlobalConfig } from "./../../api/api.js";
import { nav } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        switchTab: {
            tabs: [
                "一级分销",
                "二级分销",
            ],
            themeColor: '#283A62',
            color: '#999999',
            currentIndex: 0,
            position: "relative",
            top: 0,
            noBottomDevide: true
        },
        showNoMsg: "您还没有分销团队，快去组建自己的团队吧！",
        list: [],
        pageSize: 10,
        pageIndex: 1,
        distribution_reward_type: 1
    },

    onTabClick(e) {
        this.data.switchTab.currentIndex = e.detail.currentIndex;
        switch(e.detail.currentIndex) {
            case 0: 
                this.setData({ showNoMsg: "您还没有分销团队，快去组建自己的团队吧！"});
                break; 
            case 1:
                this.setData({ showNoMsg: "您还没有二级分销团队，快去组建自己的团队吧！"});
                break;
            default:
                this.setData({ showNoMsg: "您还没有分销团队，快去组建自己的团队吧！"});
                return;
        }
        this.init();
    },

    toLowerLevel(e) {
        let id = e.currentTarget.dataset.id;
        nav({
            url: "/distribution/distributionLowerLevel/distributionLowerLevel",
            data: {
                id: id
            }
        });
    },

    getList() {
        this.setData({
            loadStyle: "loading"
        });
        let params = {
            url: app.API_HOST + "distribution/getDistributorTeam",
            data: {
                level: this.data.switchTab.currentIndex + 1,
                parentId: 0,
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        return fetchApi(this, params).then(res => {
            let data = res.data.data;
            this.setData({
                showStyle: 1,
                list: this.data.pageIndex > 1 ? this.data.list.concat(data) : data,
                loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver"
            });
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                showStyle: 3
            });
        })
    },

    getTeamTotal() {
        const params = {
            url: app.API_HOST + "distribution/getDistributorTeamCount",
            data: {}
        }
        fetchApi(this, params).then(res => {
            const {distributorFirstCount, distributorSecondCount} = res.data.data
            const {switchTab} = this.data
            switchTab.tabs = [`一级分销(${distributorFirstCount})`, `二级分销(${distributorSecondCount})`]
            this.setData({
                switchTab
            })
        })
    },

    init() {
        this.data.pageIndex = 1
        Promise.all([this.getList(), getGlobalConfig()]).then(res => {
            const [_, { data: {data: { distribution_reward_type}}}] = res
            this.setData({
                distribution_reward_type
            })
        })
        this.getTeamTotal()
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