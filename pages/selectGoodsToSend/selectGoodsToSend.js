const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite, getNDay } from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        extConfig: app.extConfig,
        value: "",
        name: "",
        searchType: 0,
        pageIndex: 1,
        pageSize: 20
    },
    dataStore: {
        from: ''
    },
    select(e) {
        let selectIndex = parseInt(e.currentTarget.dataset.index);
        let list = this.data.list;
        if (this.dataStore.from == 'messagePush') {
            this.data.list.forEach((item, index) => {
                if (index == selectIndex) {
                    item.selected = !item.selected
                } else {
                    item.selected = false
                }
            })
        } else {
            list[selectIndex].selected = !list[selectIndex].selected
        }
        this.setData({
            list: list
        })
    },

    getList() {
        if (!this.data.loading) {
            this.data.loading = true;
            this.setData({
                loadStyle: "loading"
            })
            let params = {
                url: app.API_HOST + "category/goodsList",
                data: {
                    cid: 0,
                    orderBy: "sales",
                    orderType: "desc",
                    pageIndex: this.data.pageIndex,
                    pageSize: this.data.pageSize
                }
            }
   
            
            if (this.data.searchType) {
                params.data.search = this.data.name,
                params.data.searchType = 1
            }

            fetchApi(this, params).then(res => {
                this.setData({
                    showStyle: 1,
                    list: this.data.list.concat(res.data.data),
                    hasMore: res.data.data.length >= this.data.pageSize,
                    loadStyle: res.data.data.length >= this.data.pageSize ? "loadMore" : "loadOver"
                });
                this.data.loading = false;
            }).catch(res => {
                this.setData({
                    showStyle: 3
                })
                this.data.loading = false;
            });
        }
    },
    
    bindInput(e) {
        this.data.value = e.detail.value;
    },

    search() {
        this.data.name = this.data.value.replace(/^\s+|\s+$/g, '');
        this.data.name ? this.data.searchType = 1 : this.data.searchType = 0;
        this.data.list = [];
        this.pageIndex = 1;
        this.getList();
    },

    confirm() {
        let data = [];
        this.data.list.map(i => {
            if (i.selected) {
                data.push({
                    from_user: app.globalData.uid,
                    sending: true,
                    content: {
                        type: "shop",
                        id: i.id,
                        title: i.title,
                        price: i.productprice,
                        url: i.thumb
                    }
                })
            }
        })
        app.globalData.transData_chat = data;
        wx.navigateBack({
            delta: 1,
        });
    },

    init() {
        this.setData({
            list: [],
            value: "",
        });
        this.data.name = "";
        this.pageIndex = 1;
        this.getList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.from == 'messagePush') {
            this.dataStore.from = options.from
        }
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
        if (this.data.hasMore) {
            this.data.pageIndex ++;
            this.getList();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})