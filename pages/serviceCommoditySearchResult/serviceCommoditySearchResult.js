const app = getApp();
import { fetchApi, getToken, addActionLog} from '../../api/api.js';
import { nav } from '../../utils/util.js';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        showStyle: 1,
        searchValue: '',
        currentValue: '',
        recommendList: [],
        loadStyle: 'loading'
    },

    store: {
        pageIndex: 1,
        pageSize: 10,
    },

    handleInput (e) {
        const {value} = e.detail;
        this.setData({
            searchValue: value
        });
    },

    handleDelete () {
        this.setData({
            searchValue: ''
        });
    },

    handleSearch () {
        const {searchValue} = this.data;
        this.setData({
            currentValue: searchValue
        });
        this.init();
    },

    handleCancel () {
        wx.navigateBack({
            delta: 1
        });
    },

    handleNavigate(e) {
        const {page} = e.currentTarget.dataset;
        nav({url: page})
    },

    handleNavToDetail (e) {
        const {id} = e.currentTarget.dataset;
        nav({
            url: '/pages/serviceCommodityDetail/serviceCommodityDetail',
            data: {
                id
            }
        });
    },

    getSearchResult () {
        const {currentValue} = this.data;
        this.setData({
            loadStyle: 'loading'
        });
        const {pageIndex, pageSize} = this.store;
        const params = {
            url: 'ServiceGoods/searchServiceGoods',
            data: {
                pageIndex,
                pageSize,
                search: currentValue
            }
        }
        fetchApi(this, params).then(res => {
            const {data: {info}} = res.data;
            const {recommendList} = this.data;
            this.setData({
                recommendList: (pageIndex == 1 ? [] : recommendList).concat(info),
                loadStyle: info.length < pageSize ? 'loadOver' : 'loadMore'
            });
            // 事件上报
            addActionLog(this, {
                type: 39, 
                detail: {
                    name: currentValue,
                }
            })
        }).catch(err => {
            this.setData({
                showStyle: 3,
                loadStyle: 'loadMore'
            });
            console.log('error: ', err);
        })
    },

    init() {
        this.store.pageIndex = 1;
        this.getSearchResult();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {searchValue} = options;
        searchValue && (
            this.setData({
                searchValue,
                currentValue: searchValue
            })
        );
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
        const {loadStyle} = this.data;
        if (loadStyle != 'loadMore') return;
        this.store.pageIndex ++;
        this.getSearchResult();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})