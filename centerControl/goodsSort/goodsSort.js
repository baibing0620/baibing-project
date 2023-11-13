const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showTip: true,
        animationData: {},
        animation: {},
        loadStyle: '',
        showStyle: 0,
        myGoodsList: [],
        selectGoods: [],
        pageIndex: 1,
        pageSize: 6

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getGoodsList(this)


        this.animation = wx.createAnimation({duration: 200, timingFunction: "linear"});
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
            pageIndex: 1
        })
        this.getGoodsList(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if(this.data.loadStyle != 'loadMore'){
            return
        }
        this.getGoodsList(this, true)
    },

     /**
     * 关闭提示
     */
    handleCloseTip: function() {
        this.animation.height(0).step()
        this.setData({
            animationData: this.animation.export()
        })
    },
    blurSort(e){
        wx.showLoading({
            title: '排序中'
          })
        const params = {
            url: 'CardGoods/updateCardGoodsDisPlayOrder',
            data: {
                num: e.detail.value,
                goodsId: e.target.dataset.id
            }
        }
        fetchApi(this, params).then(res => {
            this.setData({
                pageIndex: 1
            })
            this.getGoodsList(this)
            wx.hideLoading()
        }).catch(err => {
            throw err
        })
    },
    getGoodsList: function(self, isGetMore = false) {
        let param = {
            url: app.API_HOST + "CardGoods/getCardShopGoods",
            data: {
                pageIndex: isGetMore ? self.data.pageIndex + 1 : self.data.pageIndex,
                pageSize: self.data.pageSize,
                orderBy: 'displayorder'
            }
        }
        fetchApi(self, param).then(res => {
            let {list} = res.data.data;
            if (isGetMore) { self.data.pageIndex++ };
            self.setData({
                selectGoods: isGetMore ? self.data.selectGoods.concat(list) : list,
                loadStyle: list.length < self.data.pageSize ? 'loadOver' : 'loadMore',
            })
            self.setData({
                showStyle: self.data.selectGoods.length == 0 ? 2 : 1,
                })
    
        }).catch((err) => {
            self.setData({
                showStyle: 3,
            })
        });
    }
})