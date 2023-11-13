const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    showToast,
    previewImage,
    nav
} from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        typeStock: ["拍下立减库存", "付款减库存", "永不减少库存"],
        index: -1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let saveGoodsData = app.globalData.saveGoodsData
        this.setData({
            sellingPrice: saveGoodsData.productprice || '',
            marketPrice: saveGoodsData.marketprice || '',
            weight: saveGoodsData.weight || '',
            total: saveGoodsData.sales || '',
            stock: saveGoodsData.total || '',
            index: saveGoodsData.totalcnf || -1
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
       
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
    bindPickerChange: function(e) {
        let value = e.detail.value
        this.setData({
            index: value
        })
    },
    changeSellingPrice(e) {
        this.setData({
            sellingPrice: e.detail.value
        })
    },
    changeMarketPrice(e) {
        this.setData({
            marketPrice: e.detail.value
        })
    },
    changeWeight(e) {
        this.setData({
            weight: e.detail.value
        })
    },
    changeTotal(e) {
        this.setData({
            total: e.detail.value
        })
    },
    changeStock(e) {
        this.setData({
            stock: e.detail.value
        })
    },
    nextSteps() {
        if (this.data.sellingPrice.trim() == ''){
            showTips('请输入本店售价',this)
            return ;
        }
        if (this.data.marketPrice.trim() == '') {
            showTips('请输入市场售价', this)
            return;
        }
        if (this.data.weight.trim() == '') {
            showTips('请输入商品重量', this)
            return;
        }
        if (this.data.total.trim() == '') {
            showTips('请输入商品销量', this)
            return;
        }
        if (this.data.stock.trim() == '') {
            showTips('请输入商品库存', this)
            return;
        }
        if (this.data.index == -1) {
            showTips('请选择减库存方式', this)
            return;
        }
        let saveGoodsData = app.globalData.saveGoodsData
        saveGoodsData.productprice = this.data.sellingPrice
        saveGoodsData.marketprice = this.data.marketPrice
        saveGoodsData.weight = this.data.weight
        saveGoodsData.sales = this.data.total
        saveGoodsData.total = this.data.stock
        saveGoodsData.totalcnf = this.data.index
        nav({
            url: "/distribution/distributionSettings/distributionSettings"
        })
    },
    backSteps() {
        wx.navigateBack({
            delta: 1,
        })
    }
})