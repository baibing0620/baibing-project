const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        serviceList:[],
        loadStyle: 'loadMore',
        showStyle:0,
        name:''
    },
    dataStore:{
        pageIndex: 0,//当前页码
        pageSize: 10,//每页数量
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getServiceFormValuesList()
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
        this.getServiceFormValuesList()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return
        }
        this.setData({
            loadStyle: 'showLoading'
        })
        this.getServiceFormValuesList(true);
    },
    getServiceFormValuesList: function (isGetMore = false) {
        let {pageIndex, pageSize} = this.dataStore
        let params = {
            url: app.API_HOST + "ServiceGoods/getServiceFormValuesList",
            data: {
              pageSize,
              pageIndex: isGetMore?++pageIndex:1,
              name:this.data.name
            }
        }
        fetchApi(this, params).then(res => {
            const {data} = res.data
            if (isGetMore) { 
                this.dataStore.pageIndex++
            }else{
                this.dataStore.pageIndex = 1
            }
            this.setData({
                serviceList: isGetMore ? this.data.serviceList.concat(data) : data,
                loadStyle: data.length < pageSize ? 'loadOver' : 'loadMore'
            });
            this.setData({
                showStyle: this.data.serviceList.length == 0 ? 2 : 1
            })
        }).catch(err=>{
            this.setData({
                showStyle: 3
            })
        })
    },
    bindInput(e) {
        this.setData({
            name: e.detail.value
        })
    },
    search(e){
        this.getServiceFormValuesList()
    },
    navDetail(e){
        const {id} = e.currentTarget.dataset
        nav({
            url:'/centerControl/serviceBookingDetails/serviceBookingDetails',
            data:{
                id
            }
        })
    }
})