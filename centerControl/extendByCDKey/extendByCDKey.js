const app = getApp();
import { fetchApi } from "../../api/api.js";
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
        staff_id: '',
    },

    /**
     * 页面的方法
     */

    checkForm(e) {
        const { CDKey } = e.detail.value
        if (!CDKey) {
            showTips("请填写CDKey", this);
            return
        }
        this.submit({
            CDKey
        })
    },

    getStaffInfoAndOtherData() {
        fetchApi(this, {
            url: 'Card/getStaffInfoAndOtherData',
            data: {}
        }).then(res => {
            const { name, mobile, staff_id } = res.data.data
            this.setData({
                name: name || '',
                mobile: mobile || '',
                staff_id: staff_id || '',
                showStyle: 1
            })
        }).catch(err => {
            console.log('error: ', err)
        })
    },

    init() {
        this.getStaffInfoAndOtherData()
    },

    submit({ CDKey }) {
        const { name,
            mobile,
            staff_id } = this.data
        fetchApi(this, {
            url: 'Card/continueTime',
            data: {
                name,
                mobile,
                cdKey: CDKey,
                staffId: staff_id
            }
        }).then(res => {
            const { cdk_end_time } = res.data.data
            app.globalData.refresh = true
            wx.showModal({
                title: '续时成功',
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