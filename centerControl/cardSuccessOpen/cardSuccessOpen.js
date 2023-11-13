const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
    showTips
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        payInfo: {
            // "id": "--",
            // "order_id": "--",
            // "name": "--",         // 公司名称
            // "beid": "--",
            // "phone": "--",          // 联系电话
            // "open_limit": "--",         // 开通张数
            // "open_date": "--",          // 开通时长   单位  月
            // "card_price": "--",          // 名片单价
            // "count_discount": "--",        // 数量折扣
            // "time_discount": "--",     // 时长折扣
            // "pay_date": "--",
            // "pay_number": "--",      // 支付金额
            // "status": "--",
            // "enable": "--",
            // "service_phone": "--",     // 客服电话
            // "updatetime": "--",
            // "createtime": "--"
        },
        order_id: ''
        // totalMoney: 0
    },
    callNumber() {
        wx.makePhoneCall({
            phoneNumber: this.data.payInfo.service_phone
        })
    },
    getPayInfo(){
        let param = {
            url: app.API_HOST + 'Feedback/getPersonCardOrder',
            data: {
                orderId: this.data.order_id
            }
        };
        fetchApi(this, param).then((res) => {
            this.setData({
                //计算总价 后端算
                // totalMoney: this.data.payInfo.open_limit * this.data.payInfo.card_price * this.data.payInfo.count_discount / 100 * this.data.payInfo.open_date * this.data.payInfo.time_discount
                payInfo: res.data.data
            })
        }).catch(err => {
            showTips('订单获取失败', this)
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            //计算总价 后端算
            // totalMoney: this.data.payInfo.open_limit * this.data.payInfo.card_price * this.data.payInfo.count_discount / 100 * this.data.payInfo.open_date * this.data.payInfo.time_discount
            order_id: options.id
        })
        
        this.getPayInfo();
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
        this.getPayInfo();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})