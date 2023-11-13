const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { nav } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        tabbar: ["今天", "近7天", "全部"],
        currentIndex: 0,
        showCompleted: false,
        menuCurrent: -1,
        pageIndex: 1,
        pageSize: 10
    },

    tabClick(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        if (this.data.currentIndex === index) return;
        this.setData({
            currentIndex: index
        });
        this.init();
    },

    showCompleted() {
        this.setData({
            showCompleted: !this.data.showCompleted
        });
        this.init();
    },

    clickMore(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        this.setData({
            menuCurrent: this.data.menuCurrent == index ? -1 : index
        });
    },

    closeMore() {
        if (this.data.menuCurrent !== -1) {
            this.setData({
                menuCurrent: -1
            });
        }
    },

    getList() {
        this.setData({
            loadStyle: "loading"
        });
        let params = {
            url: app.API_HOST + "CrmUser/getCrmUserFollowTaskList",
            data: {
                completedIsShow: this.data.showCompleted ? "1" : "",
                pageIndex: this.data.pageIndex || 1,
                pageSize: this.data.pageSize || 10
            }
        }
        switch (this.data.currentIndex) {
            case 0: 
                params.data.beginTime = getDate();
                params.data.endTime = getDate(1);
                break;
            case 1:
                params.data.beginTime = getDate();
                params.data.endTime = getDate(7);
                break;
            default:
                params.data.beginTime = "";
                params.data.endTime = "";
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            this.setData({
                showStyle: 1,
                list: this.data.pageIndex > 1 ? (this.data.list || []).concat(data) : data,
                loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver"
            });
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                showStyle: -1
            });
        });
    },

    clickMenuItem(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        let type = e.currentTarget.dataset.type;
        this.closeMore();
        switch (type) {
            case "cancel":
                this.cancel(index);
                break;
            case "delete":
                this.delete(index);
                break;
            default:
                return;
        }
    },

    delete(index) {
        if (!index && index !== 0) return;
        let id = this.data.list[index].id;
        this.data.list.splice(index, 1);
        this.setData({
            list: this.data.list
        });
        let params = {
            url: app.API_HOST + "CrmUser/delCrmUserFollowTask",
            data: {
                id: id
            }
        }
        fetchApi(this, params).then(res => {
        }).catch(res => {
            console.log("error: ", res);
        });
    },

    cancel(index) {
        if (!index && index !== 0) return;
        let id = this.data.list[index].id;
        if (this.data.showCompleted) {
            this.data.list[index].completed = 1;
            this.setData({
                list: this.data.list
            });
        } else {
            this.data.list.splice(index, 1);
            this.setData({
                list: this.data.list
            });
        }
        let params = {
            url: app.API_HOST + "CrmUser/cancleCrmUserFollowTask",
            data: {
                id: id
            }
        }
        fetchApi(this, params).then(res => {
        }).catch(res => {
            console.log("error: ", res);
        });
    },

    // toDetail(e) {
    //     let index = parseInt(e.currentTarget.dataset.index || 0);
    //     let data = this.data.list[index];
    //     let params = {
    //         url:'/pages/clueDetail/clueDetail',
    //         data:{
    //             crmId: 422,
    //             crmUid: data.crmUserMember.id,
    //         }
    //     }
    //     nav(params);
    // },

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

    }
})

let getDate = (afterDays = 0) => {
    let time = new Date(Number(new Date()) + parseInt(afterDays || 0) * 24 * 60 * 60 * 1000);
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    month.toString().length < 2 ? month = `0${month}` : "";
    day.toString().length < 2 ? day = `0${day}` : "";
    return `${year}-${month}-${day} 00:00:00`;
}