const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { showTips, nav, getYMD } from "../../utils/util";

Page({
    /**
     * 页面的初始数据 
     */
    data: {
        extConfig: app.extConfig,
        // 表单
        name: '',
        mobile: '',
        CDKey: '',
    },

    /**
     * 页面的方法
     */

    checkForm(e) {
        const { name, mobile, CDKey } = e.detail.value
        if (!name) {
            showTips("请填写姓名", this)
            return
        }
        if (!mobile) {
            showTips("请填写手机号码", this)
            return
        }
        if (!CDKey) {
            showTips("请填写CDKey", this)
            return
        }
        this.submit({
            name,
            mobile,
            cdk: CDKey
        })
    },

    handleShopQue() {
        fetchApi(this, {
            url: 'Card/handleSkipQue',
            data: {}
        }).then(res => {
            const { skipType, //1 跳卡片详情页  2 cdk激活页)
                card_id } = res.data.data
            card_id && (app.globalData.cardId = card_id)
            if (skipType == 2) return
            nav({ url: "/pages/home/home" })
        }).catch(err => {
            console.log('error: ', err)
        })
    },

    getStaffInfoAndOtherData() {
        fetchApi(this, {
            url: 'Card/getStaffInfoAndOtherData',
            data: {}
        }).then(res => {
            const { name, mobile } = res.data.data
            this.setData({
                name: name || '',
                mobile: mobile || ''
            })
        }).catch(err => {
            console.log('error: ', err)
        })
    },

    init() {
        this.handleShopQue()
        this.getStaffInfoAndOtherData()
    },

    submit({ name, mobile, cdk }) {
        fetchApi(this, {
            url: 'Card/bindCardByCdKey',
            data: {
                name,
                mobile,
                cdk
            }
        }).then(res => {
            const { card_id, cdk_end_time } = res.data.data
            app.globalData.cardId = card_id
            app.globalData.refresh = true
            wx.showModal({
                title: '开通成功',
                content: `有效期至${getYMD(new Date(Number(cdk_end_time) * 1000), '-')}`,
                showCancel: false,
                confirmText: '前往名片',
                success: res => {
                    if (!res.confirm) return
                    nav({ url: "/pages/home/home" })
                }
            })
        }).catch(err => {
            console.log('error: ', err)
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init()
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
        this.init()
    },
})