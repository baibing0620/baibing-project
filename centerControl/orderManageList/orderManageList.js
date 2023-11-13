const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav } from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        switchTab: {
            tabs: [],
            currentIndex: 0
        },
        list: [],
        pageIndex: 1,
        pageSize: 15,
        array: ['全部订单', '平台发货', '个人发货'],
        orderType: '全部订单',
        selectType: 0
    },

    bindPickerChange: function(e){
        this.setData({
            orderType: this.data.array[e.detail.value],
            selectType: e.detail.value == 0 ? e.detail.value : (e.detail.value == 1 ? e.detail.value : 3)
            // selectType: e.detail.value
        })
        this.getList()
    },

    switchTabOnClick(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        if (index !== this.data.switchTab.currentIndex) {
            this.setData({
                "switchTab.currentIndex": index
            });
            this.data.pageIndex = 1;
            this.init();
        }
    },

    getList() {
        if (this.data.loadStyle === "loading" || !this.data.mode) return;
        this.setData({
            loadStyle: "loading"
        });
        let method = this.data.mode === "appointment" ? this.getAppointmentOrderList : this.getOrderList;
        method().then(res => {
            this.setData({
                list: this.data.pageIndex === 1 ? res : this.data.list.concat(res),
                showStyle: 1,
                loadStyle: res.length >= this.data.pageSize ? "loadMore" : "loadOver"
            });
        }).catch(res => {
            this.setData({
                showStyle: 2,
            });
            console.log("error: ", res);
        })
    },

    getOrderList() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "cardOrder/orderList",
                data: {
                    orderBy: "createtime",
                    orderType: "desc",
                    ordersn: "",
                    addressMobile: "",
                    addressRealname: "",
                    orderTypesChecked: this.data.switchTab.tabs[this.data.switchTab.currentIndex].status,
                    ordersType: this.data.mode === "retail" ? 0 : this.data.mode === "restaurant" ? 2 : "",
                    pageIndex: this.data.pageIndex,
                    pageSize: this.data.pageSize,
                    selected_products_type: this.data.selectType
                }
            }
            fetchApi(this, params).then(res => {
                resolve(res.data.data.orders);
            }).catch(res => {
                reject(res);
            })
        });
    },

    getAppointmentOrderList() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "cardOrder/getAppointmentOrderList",
                data: {
                    appointmentGoodsId: "",
                    mobile: "",
                    status: this.data.switchTab.tabs[this.data.switchTab.currentIndex].status,
                    time: "",
                    pageIndex: this.data.pageIndex,
                    pageSize: this.data.pageSize,
                }
            }
            fetchApi(this, params).then(res => {
                resolve(res.data.data.list);
            }).catch(res => {
                reject(res);
            })
        });
    },

    nav(e) {
        let path = e.currentTarget.dataset.path;
        let id = e.currentTarget.dataset.id;
        if (!path) return;
        let params = {
            url: `/centerControl/${path}/${path}`,
            data: {
                id: id,
                mode: this.data.mode
            }
        }
        nav(params);
    },

    init() {
        this.data.pageIndex = 1;
        this.data.loadStyle === "loadOver";
        this.getList();
    },

    retailStatus() {
        return [
            { title: "全部", status: 0 },
            { title: "待付款", status: 1 },
            { title: "待自提", status: 5 },
            { title: "待发货", status: 2 },
            { title: "待收货", status: 3 },
            { title: "已完成", status: 4 },
            { title: "已取消", status: 7 },
        ]
    },

    restaurantStatus() {
        return [
            { title: "全部", status: 0 },
            { title: "待付款", status: 1 },
            { title: "待配送", status: 2 },
            { title: "配送中", status: 3 },
            { title: "已完成", status: 4 },
            { title: "已取消", status: 7 },
        ]
    },

    appointmentStatus() {
        return [
            { title: "全部", status: "" },
            { title: "待审核", status: 1 },
            { title: "已接受", status: 2 },
            { title: "已拒绝", status: -1 },
            { title: "已完成", status: 3 },
            { title: "已取消", status: -2 },
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        switch (options.type) {
            case "retail":
                wx.setNavigationBarTitle({ title: '电商订单' });
                this.setData({
                    "switchTab.tabs": this.retailStatus()
                });
                break;
            case "restaurant":
                wx.setNavigationBarTitle({ title: '餐饮订单' });
                this.setData({
                    "switchTab.tabs": this.restaurantStatus()
                });
                break;
            case "appointment":
                wx.setNavigationBarTitle({ title: '预约订单' });
                this.setData({
                    "switchTab.tabs": this.appointmentStatus()
                });
                break;
            default:
                wx.setNavigationBarTitle({ title: '订单列表' });
        }
        if (options.type) {
            this.setData({ mode: options.type });
            this.init();
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
        if (app.globalData.transDataToOrderManageList) {
            let data =  app.globalData.transDataToOrderManageList;
            let index = this.data.list.findIndex((item) => {
                return parseInt(item.id) === parseInt(data.id);
            });
            if (index >= 0) {
                this.data.list[index] = data;
                this.setData({
                    list: this.data.list
                });
            }
            app.globalData.transDataToOrderManageList = "";
        }
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
        if (this.data.loadStyle === "loadOver" || this.data.loadStyle === "loading") return;
        this.data.pageIndex++;
        this.getList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})