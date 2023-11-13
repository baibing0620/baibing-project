const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    nav,
    showToast
} from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        typeStock: ['秒杀', '拼团', '砍价'],
        index: 0,
        startTime: '',
        endTime: "",
        order: "",
        groupPrice: "",
        limitNum: "",
        bargainPrice: "",
        bargain: ['1天', '2天', '3天', '4天', '5天', '6天', '7天'],
        barginIndex: -1,
        group: ['1天', '2天', '3天', '4天', '5天', '6天', '7天'],
        groupIndex: -1,
        disabled: false, 
        isOpen:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let saveGoodsData = app.globalData.saveGoodsData
        if ((!saveGoodsData.istime || saveGoodsData.istime == 0) && (!saveGoodsData.isGroupBuy || saveGoodsData.isGroupBuy == 0) && (!saveGoodsData.is_bargain || saveGoodsData.is_bargain == 0)) {
                this.setData({
                    isOpen: false
                })
            } else {
                this.setData({
                    isOpen: true,
                    startTime: saveGoodsData.timestart,
                    endTime: saveGoodsData.timeend,
                    groupIndex: parseInt(saveGoodsData.effectiveTime) - 1,
                    groupPrice: saveGoodsData.groupbuyPrice,
                    limitNum: saveGoodsData.limitNum,
                    barginIndex: parseInt(saveGoodsData.bargain_time) - 1,
                    bargainPrice: saveGoodsData.bargain_price,
                    order: saveGoodsData.displayorder,
                    index: saveGoodsData.istime == 1 ? 0 : saveGoodsData.isGroupBuy == 1 ? 1 : 2
                })
                if (saveGoodsData.id) {
                    this.setData({
                        edit: true
                    })
                }
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    changeStart(e) {
        e.detail.success()
        this.data.startTime = e.detail.time
        this.setData({
            startTime: this.data.startTime
        })
    },
    changeEnd(e) {
        e.detail.success()
        this.data.endTime = e.detail.time
        this.setData({
            endTime: this.data.endTime
        })
    },
    nextSteps() {
        let saveGoodsData = app.globalData.saveGoodsData
        if (!this.data.isOpen) {//促销未开启时，秒杀砍价拼团全为0
            saveGoodsData.istime = 0
            saveGoodsData.is_groupbuy = 0
            saveGoodsData.is_bargain = 0
        } else {
            if (this.data.index == 0 && (!this.data.startTime || !this.data.endTime)) {
                showTips('请选择促销时间', this)
                return;
            }
            if (JSON.stringify(this.data.order).trim() == '') {
                showTips('请设置商品排序', this)
                return;
            }
            if (this.data.index == 1 && this.data.groupIndex == -1) {
                showTips('请选择成团时间', this)
                return;
            }
            if (this.data.index == 1 && this.data.groupPrice.trim() == '') {
                showTips('请输入拼团价格', this)
                return;
            }
            if (this.data.index == 1 && this.data.limitNum.trim() == '') {
                showTips('请设置拼团上限人数', this)
                return;
            }
            if (this.data.index == 2 && this.data.barginIndex == -1) {
                showTips('请选择砍价时间', this)
                return;
            }
            if (this.data.index == 2 && this.data.bargainPrice.trim() == '') {
                showTips('请输入砍价价格', this)
                return;
            }
            if (this.data.index == 2 && this.data.limitNum.trim() == '') {
                showTips('请设置砍价上限人数', this)
                return;
            }
            saveGoodsData.istime = this.data.index == 0 ? 1 : 0
            saveGoodsData.is_groupbuy = this.data.index == 1 ? 1 : 0
            saveGoodsData.is_bargain = this.data.index == 2 ? 1 : 0
        }
        this.setData({
            disabled:true
        })
        saveGoodsData.timestart = this.data.startTime
        saveGoodsData.timeend = this.data.endTime
        saveGoodsData.effective_time = parseInt(this.data.groupIndex) +1
        saveGoodsData.groupbuy_price = this.data.groupPrice
        saveGoodsData.limit_num = this.data.limitNum
        saveGoodsData.bargain_time = parseInt(this.data.barginIndex) + 1
        saveGoodsData.bargain_price = this.data.bargainPrice
        saveGoodsData.displayorder = this.data.order
        let param = {
            url: 'CardGoods/saveGoods',
            data: {
                all: JSON.stringify(saveGoodsData),
            }
        }
        fetchApi(this, param,'post').then(res => {
            if(this.data.edit){
                showToast('编辑商品成功', 'success')
            }else{
                showToast('添加商品成功', 'success')
            }
          setTimeout(()=>{
              wx.navigateBack({
                  delta: 5,
              })
          },1500)
        }).catch(res => {
            console.log(res);
            this.setData({
                disabled: false
            })
        });
    },
    backSteps() {
        wx.navigateBack({
            delta: 1,
        })
    },
    freeChange() {
        this.setData({
            isOpen: !this.data.isOpen
        })
    },
    bindPickerChange(e) {
        this.setData({
            index: e.detail.value
        })
    },
    changeGroup(e) {
        this.setData({
            groupIndex: e.detail.value
        })
    },
    changeBargain(e) {
        this.setData({
            barginIndex: e.detail.value
        })
    },
    changeOrder(e) {
        this.setData({
            order: e.detail.value
        })
    },
    changeGroupPrice(e) {
        this.setData({
            groupPrice: e.detail.value
        })
    },
    changeNum(e) {
        this.setData({
            limitNum: e.detail.value
        })
    },
    changeBargainPrice(e) {
        this.setData({
            bargainPrice: e.detail.value
        })
    }
})