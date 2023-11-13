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
        categoryTitle: "",
        categoryStatus: ["实体商品", "虚拟商品"],
        checkIndex: 0,
        categoryGoods: [],
        index: '-1',
        name: '',
        ServiceData: [],
        showDelData:false,
        sonsIndex: -1,
        secondCategoryList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.init()
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
       this.init()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
    init(){
        let saveGoodsData = app.globalData.saveGoodsData
        getcategoryGoods(this).then(() => {
            if (JSON.stringify(saveGoodsData) != "{}") {
                this.data.categoryGoods.forEach((item, index) => {
                    if (item.status == saveGoodsData.pcate) {
                        this.data.index = index
                        this.data.secondCategoryList = item.sons
                    }
                })
                this.data.secondCategoryList.forEach((item, index) => {
                    if (item.id == saveGoodsData.ccate) {
                        this.data.sonsIndex = index
                    }
                })
                this.setData({
                    checkIndex: saveGoodsData.is_virtual_goods,
                    name: saveGoodsData.title,
                    index: this.data.index,
                    secondCategoryList: this.data.secondCategoryList,
                    sonsIndex: this.data.sonsIndex,
                    ServiceData: typeof saveGoodsData.tags == 'string' && saveGoodsData.tags ? JSON.parse(saveGoodsData.tags) : saveGoodsData.tags
                })
            }
        })
    },
    bindPickerChange: function(e) {
        let value = e.detail.value
        this.setData({
            index: value
        })  
        let firstCategory = this.data.categoryGoods.find(item => item.status == this.data.categoryGoods[value].status)
        if (firstCategory){
            this.setData({
                secondCategoryList: firstCategory.sons,
                sonsIndex:-1
            })
        }
    },
    chooseCategoryStatus(e) {
        this.setData({
            checkIndex: e.currentTarget.dataset.index
        })
    },
    changeName(e) {
        this.setData({
            name: e.detail.value
        })
    },
    addServiceDes(e) {
        let value = e.detail.value
        if (value.trim() == '') {
            return;
        }
        for (let item of this.data.ServiceData) {
            if (item == value) {
                showTips('服务说明已存在，请换一个吧', this)
                return;
            }
        }
        this.data.ServiceData.push(value)
        this.setData({
            ServiceData: this.data.ServiceData,
            service: ''
        })
    },
    nextSteps() {
        if (this.data.name.trim() == '') {
            showTips('请输入商品名称', this)
            return;
        }
        if (this.data.index == '-1') {
            showTips('请选择商品分类', this)
            return;
        }
        let saveGoodsData = app.globalData.saveGoodsData
        saveGoodsData.is_virtual_goods = this.data.checkIndex
        saveGoodsData.title = this.data.name
        saveGoodsData.pcate = this.data.categoryGoods[this.data.index].status
        saveGoodsData.ccate = this.data.secondCategoryList[this.data.sonsIndex]&&this.data.secondCategoryList[this.data.sonsIndex].id
        saveGoodsData.tags = this.data.ServiceData
        nav({
            url: '/centerControl/importantParametersGoods/importantParametersGoods'
        })
    },
    showDel(){
        this.setData({
            showDelData: !this.data.showDelData
        })
    },
    delServiceData(e){
        let index = e.currentTarget.dataset.index
        this.data.ServiceData.splice(index,1)
        this.setData({
            ServiceData: this.data.ServiceData
        })
    },
    bindSecondCategoryChange(e){
        let value = e.detail.value
        this.setData({
            sonsIndex: value
        })
    }
})

function getcategoryGoods(self) {
    return new Promise(function(resolve, reject) {
        let param = {
            url: app.API_HOST + "CardGoods/getCategoryList",
            data: {
                ifMyGoods: 1
            }
        }
        fetchApi(self, param).then(res => {
            let data = res.data.data;
            let categoryGoods = data.map(item => {
                let obj = {}
                obj.status = item.id
                obj.title = item.name
                obj.sons = item.sons
                return obj
            })
            self.setData({
                categoryGoods: categoryGoods
            })
            resolve(res);
        }).catch((err) => {
            reject(err)
        });
    })
}