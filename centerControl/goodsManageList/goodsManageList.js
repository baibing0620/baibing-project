const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { showTips, nav } from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        plain: true,
        firstEnter: false,
        // 选品池开关
        isOpenSelectGoods: '',
        // 员工商品权限
        isOpenManage: '',
        isNeedShow: false,
        categoryListLength: 0
    },

    init() {
        this.getConfig()
        const param = {
            url: 'CardGoods/getGoodsAndCategoryTotal',
            data: {
            }
        }
        fetchApi(this, param).then(res => {
            const data = res.data.data
            this.setData({
                myGoodsCount: data.myGoodsCount,
                myCategoryCount: data.myCategoryCount,
                qyGoodsCount: data.qyGoodsCount,
                qyCategoryCount: data.qyCategoryCount,
                cardSelectGoodsCount: data.cardSelectGoodsCount
            })
        }).catch(res => {
            console.log(res);
        });
    },
    getConfig(){
        const param = {
            url: 'config/getStaffFuncManageSetting',
            data: {
            }
        }
        fetchApi(this, param).then(res => {
            const data = res.data.data
            this.setData({
                isOpenSelectGoods: data.selected_products_open == 1,
                isOpenManage: data.card_goods_open == 1
            })
        }).catch(res => {
            console.log(res);
        });
    },
    stopTap() {
        return false
    },
    closeMask() {
        this.setData({
            firstEnter: false
        })
        wx.setStorage({
            key: 'isFirstEnter',
            data: false
        })
    },
    isFirstEnter(){
        let self = this
        wx.getStorage({
            key: 'isFirstEnter',
            success (res) {
                if(!res.data){
                    self.setData({
                        firstEnter: false
                    })
                }
            },
            fail(){
                self.setData({
                    firstEnter: true
                })
            }
          })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getCategoryList()
        this.isFirstEnter()
        let that = this
        wx.getStorage({
            key: 'isClick',
            success (res) {
                that.setData({
                    isNeedShow: !res.data
                })
            }
          })
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
        this.init();
        this.getGoodsList();

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

    },
    // 获取选品商品分类长度(奢侈接口)
    getCategoryList() {
        let param = {
            url: app.API_HOST + 'CardGoods/getSelectedGoodsCategory',
            data: {}
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data;
            this.setData({
                categoryListLength: data.length
            })
        }).catch((err) => {
            this.setData({
                showStyle: 3,
            })
        });
    },
    navPage(e) {
        let page = e.currentTarget.dataset.page
        if(page === 'selectGoods'){
            wx.setStorage({
                key: "isClick",
                data: true
              })
        }
        if(page === 'myCategoryList'){
            let configData = {
                isOpenSelectGoods: this.data.isOpenSelectGoods,
                isOpenManage: this.data.isOpenManage,
                cardSelectGoodsCount: this.data.cardSelectGoodsCount
            }
            nav({
                url: `/centerControl/${page}/${page}?configData=${JSON.stringify(configData)}`
            })
            return
        }
        
        nav({
            url: `/centerControl/${page}/${page}`
        })
    },
    // 用于判断小红点
    getGoodsList: function(){
        const params = {    
            url: app.API_HOST + "CardGoods/getSelectedProductsList",
            data: {
                pageIndex: 1,
                pageSize: 1,
                cardId: ''  
            }
        }
        fetchApi(this, params).then(res => {
            const {list} = res.data.data
            if(list.length){
                // 有新品
                if(list[0].isNewGoods == 1){
                    wx.getStorage({
                        key: 'isNewGoods',
                        success: res => {
                            if(list[0].goodsUpTime > res.data){
                                wx.setStorage({
                                    key: 'isNewGoods',
                                    data: list[0].goodsUpTime
                                })
                                wx.setStorage({
                                    key: 'isClick',
                                    data: false
                                })
                                this.setData({
                                    isNeedShow: true
                                })
                            }else{
                                wx.getStorage({
                                    key: 'isClick',
                                    success: res => {
                                        if(res.data){
                                            this.setData({
                                                isNeedShow: false
                                            })
                                        }else{
                                            this.setData({
                                                isNeedShow: true
                                            })
                                        }
                                    }
                                })
                            }
                        },
                        // 只会在storage没的时候执行一次
                        fail: err => {
                            wx.setStorage({
                                key: 'isNewGoods',
                                data: list[0].goodsUpTime
                            })
                            wx.setStorage({
                                key: 'isClick',
                                data: false
                            })
                            this.setData({
                                isNeedShow: true
                            })
                        }

                    })
                }else{
                    this.setData({
                        isNeedShow: false
                    })
                }
            }
          }).catch(res => {
              this.setData({
              showStyle: 3
            })
          })
    },
})