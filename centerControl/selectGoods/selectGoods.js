const app = getApp()
import { fetchApi } from '../../api/api.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        diyConfig: app.extConfig,
        showStyle: 1,
        loadStyle: '',
        keywords: '',
        goodsList: [],
        pageSize: 10,
        pageIndex: 1
    },
    // 获取选品池列表
    getGoodsList: function(){
        this.setData({
            loadStyle: 'showLoading'
        })
        const {pageIndex, pageSize} = this.data
        const params = {    
            url: app.API_HOST + "CardGoods/getSelectedProductsList",
            data: {
                pageIndex,
                pageSize,
                title: this.data.keywords,
                cardId: ''  
            }
        }
        fetchApi(this, params).then(res => {
            const {list} = res.data.data
            this.setData({
              showStyle: 1,
              loadStyle: list.length >= this.data.pageSize ? "loadMore" : "loadOver",
              goodsList: pageIndex > 1 ? this.data.goodsList.concat(list) : list
            })
          }).catch(res => {
              this.setData({
              showStyle: 3
            })
          })
    },
    // 搜索商品
    searchGoodsList() {
        this.setData({
            pageIndex: 1
        })
        this.getGoodsList()
    },
    // bindInput
    bindKeywords(e) {
        this.data.keywords = e.detail.value
    },
    // 预览
    gotoPriview: function(e){
        wx.navigateTo({
            url: '/centerControl/goodPreview/goodPreview?goodsId=' + e.currentTarget.dataset.goodid
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getGoodsList()
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
        this.setData({
            pageIndex: 1,
            keywords: ''
        })
        this.getGoodsList()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle !== 'loadMore') return
        this.data.pageIndex ++
        this.getGoodsList()
    }
})