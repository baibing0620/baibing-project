const app = getApp();
import { fetchApi } from '../../api/api.js';

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
    dataStore:{
        from:''
    },

    select(e) {
        const selectIndex = parseInt(e.currentTarget.dataset.index);
        const {list} = this.data;
        if (this.dataStore.from == 'messagePush'){
            this.data.list.forEach((item, index) => {
                if (index == selectIndex) {
                    item.selected = !item.selected
                } else {
                    item.selected = false
                }
            })
        }else{
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
                url: app.API_HOST + "ServiceGoods/getRecommendGoodsAll",
                data: {
                    pageIndex: this.data.pageIndex,
                    pageSize: this.data.pageSize
                }
            }
   
            
            if (this.data.searchType) {
                params.data.title = this.data.name;
            }

            fetchApi(this, params).then(res => {
                const {info: list} = res.data.data
                this.setData({
                    showStyle: 1,
                    list: this.data.pageIndex == 1 ? list : this.data.list.concat(list),
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
                        type: "service",
                        id: i.id,
                        title: i.service_name,
                        url: i.img_url.url
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
        if (options.from == 'messagePush'){
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