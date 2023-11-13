const app = getApp()
import { fetchApi } from '../../api/api.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        diyConfig: app.extConfig, 
        addGoods: [],
        showStyle: 0,
        loadStyle: '',
        goodsList: [],
        keywords: '',
        pageSize: 10,
        pageIndex: 1
    },
    // 获取选品池列表
    getGoodsList: function () {
        this.setData({
            loadStyle: 'showLoading'
        })
        const { pageIndex, pageSize } = this.data
        if(pageIndex == 1) {
            this.setData({
                addGoods: []
            })
        }
        const params = {
            url: app.API_HOST + "CardGoods/getSelectedProductsList",
            data: {
                pageIndex,
                pageSize,
                title: this.data.keywords
            }
        }
        fetchApi(this, params).then(res => {
            const { list } = res.data.data
            this.setData({
                showStyle: pageIndex == 1 ? (list.length == 0 ? 2 : 1) : 1,
                loadStyle: list.length >= this.data.pageSize ? "loadMore" : "loadOver",
                goodsList: pageIndex > 1 ? this.data.goodsList.concat(list) : list,
                isShowPrice: res.data.data.is_show_price
            })
        }).catch(res => {
            this.setData({
                showStyle: 3
            })
        })
    },
    // 搜索商品
    search() {
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
    gotoPriview: function (e) {
        wx.navigateTo({
            url: '/centerControl/goodPreview/goodPreview?goodsId=' + e.currentTarget.dataset.goodid +'&hasBtn=1'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        app.pageData.setPage(this, 'selectingGoods')
        this.getGoodsList();
        

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
        this.data.addGoods = [];
        this.setData({
            goodsList: this.data.goodsList
        })
        this.data.goodsList.map(item => {
            if (item.isSelected) {
                this.data.addGoods.push(item.id)
            }
        })
        this.setData({
            addGoods: this.data.addGoods
        })
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
        app.pageData.removePage('selectingGoods')
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
        this.data.pageIndex++
        this.getGoodsList()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    gotoEdit: function () {
        let that = this
        wx.showModal({
            title: '提示',
            content: '是否统一设置选品库存和运费？',
            cancelText: '暂不设置',
            confirmText: '去设置',
            success(res) {
                if (res.confirm) {
                    wx.navigateTo({
                        url: "/centerControl/settingOneStep/settingOneStep?addGoods=" + JSON.stringify(that.data.addGoods) + '&isShowPrice=' + that.data.isShowPrice
                    })

                } else if (res.cancel) {
                    const params = {
                        url: app.API_HOST + "CardGoods/saveCardSelectedProducts",
                        data: {
                            goodsIds: that.data.addGoods.join()
                        }
                    }
                    fetchApi(that, params).then(res => {
                        wx.showToast({
                            title: '成功',
                            icon: 'success',
                            duration: 2000,
                            success() {
                                wx.navigateBack({
                                    delta: 1
                                })
                            }
                        })

                    }).catch(res => {
                        that.setData({
                            showStyle: 3
                        })
                    })

                }
            }
        })

    },
    handleChangeSelect: function (e) {
        const index = e.currentTarget.dataset.index;
        var hasOption = false
        if (!this.data.addGoods.includes(this.data.goodsList[index].id) )  {
            if (this.data.goodsList[index].hasOption == 1 && this.data.addGoods.length) {
                hasOption = true
            }
            this.data.goodsList.map((item, index) => {
                if ((item.id == this.data.addGoods[0])) {
                    hasOption = hasOption || item.hasOption == 1
                }
            })
            if (hasOption) {
                wx.showModal({
                    title: '提示',
                    content: '多规格商品只能单独选择',
                    showCancel: false,
                    confirmText: '确定',
                    success(res) {
                    }
                })
            }else {
                this.data.goodsList[index].isSelected = !this.data.goodsList[index].isSelected;
            }
        }else {
            this.data.goodsList[index].isSelected = !this.data.goodsList[index].isSelected;
        }
        this.data.addGoods = [];
        this.setData({
            goodsList: this.data.goodsList
        })
        this.data.goodsList.map(item => {
            if (item.isSelected) {
                this.data.addGoods.push(item.id)
            }
        })
        this.setData({
            addGoods: this.data.addGoods
        })
    }
})