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
        isOpen: true,
        is_express_tpl: '',
        SettingList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init()
    },

    init() {
        this.getCardInfo()
        let saveGoodsData = app.globalData.saveGoodsData
        getShopExpress(this).then(() => {
            let express_list = saveGoodsData.express_list || []
            this.data.Setting.forEach((item, index) => {
                express_list.forEach((good, goodIndex) => {
                    if (item.code == good.code) {
                        express_list[goodIndex].index = index
                        express_list[goodIndex].setting = this.data.Setting
                    }
                })
            })
            this.setData({
                isOpen: saveGoodsData.issendfree == 0 ? false : true,
                SettingList: express_list,
            })
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

    bindPickerChange: function (e) {
        let value = e.detail.value
        let index = e.currentTarget.dataset.index
        let flag = false
        this.data.SettingList.map((item, n)=>{
            if (item.index == value && n != index){
                showTips('快递出现重复，请选择不同的快递设置', this)
                this.data.SettingList[index].index = -1
                flag = true
            }
        })
        if (!flag){
            this.data.SettingList[index].index = value
        }
        this.setData({
            SettingList: this.data.SettingList
        })
    },
    freeChange() {
        this.setData({
            isOpen: !this.data.isOpen
        })
    },
    getCardInfo() {
        let params = {
            url: app.API_HOST + "Card/getCardInfo",
            data: {

            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data
            this.setData({
                is_express_tpl: data.is_express_tpl
            })
        }).catch(res => {
            console.log(res);
        })
    },
    addSetting() {
        this.data.SettingList.push({
            setting: this.data.Setting,
            index: -1,
        })
        this.setData({
            SettingList: this.data.SettingList
        })
    },
    changePrice(e) {
        const { value } = e.detail
        const { index } = e.currentTarget.dataset
        this.data.SettingList[index].price = value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1')
        this.setData({
            SettingList: this.data.SettingList
        })
    },
    nextSteps() {
        let express_list = []
        if (!this.data.isOpen && this.data.is_express_tpl == 0) {
            if (this.data.SettingList.length == 0) {
                showTips('请添加快递', this)
                return;
            }
            for (let item of this.data.SettingList) {
                if (item.index == -1) {
                    showTips('请选择分类', this)
                    return;
                }
                if (item.price === '' || !item.price && Number(item.price) !== 0) {
                    showTips('请输入快递价格', this)
                    return;
                }
            }
            express_list = this.data.SettingList.map((item, index) => {
                let obj = {}
                obj = item.setting[item.index]
                obj.price = Number(item.price)
                return obj
            })
        }
        let saveGoodsData = app.globalData.saveGoodsData
        saveGoodsData.issendfree = this.data.isOpen ? 1 : 0
        saveGoodsData.express_list = express_list
        nav({
            url: "/centerControl/constructionGoods/constructionGoods"
        })
    },
    backSteps() {
        wx.navigateBack({
            delta: 1,
        })
    },
    delSetting(e) {
        let index = e.currentTarget.dataset.index
        this.data.SettingList.splice(index, 1)
        this.setData({
            SettingList: this.data.SettingList
        })
    }
})
function getShopExpress(self) {
    return new Promise(function (resolve, reject) {
        let params = {
            url: app.API_HOST + "CardGoods/getShopExpress",
            data: {

            }
        }
        fetchApi(self, params).then(res => {
            let data = res.data.data
            self.data.Setting = data.map(item => {
                return { name: item.name, code: item.code }
            })
            resolve(res);
        }).catch(err => {
            reject(err)
        })
    })
}