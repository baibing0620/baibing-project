const app = getApp();
import { fetchApi } from '../../api/api.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getServiceFormValuesDetail(options.id)
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

    getServiceFormValuesDetail(id){
        let params = {
            url: app.API_HOST + "ServiceGoods/getServiceFormValuesDetail",
            data: {
             id
            }
        }
        fetchApi(this, params).then(res => {
            const {data} = res.data
            try{
                data.values = JSON.parse(data.values)
            }catch(err){  }
            this.setData({
                showStyle:1,
                ...data
            })
        }).catch(err=>{
            this.setData({
                showStyle:3
            })
        })
    }
})