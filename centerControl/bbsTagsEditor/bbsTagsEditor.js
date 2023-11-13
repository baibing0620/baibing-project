
import { fetchApi } from '../../api/api.js';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 1,
        tags: ['', '', '']
    },

    init() {
        this.getTagsInfo();
    },

    getTagsInfo() {
        const params = {
            url: 'Card/getCardCommunityLabel',
            data: {} 
        }
        fetchApi(this, params).then(res => {
            const {data} = res.data;
            const {tags} = this.data;
            (data || []).map((i, n) => {
                tags[n] = i;
            });
            this.setData({ tags });
        }).catch(err => {
            console.log('error: ', err);
        });
    },

    handleInput(e) {
        const {currentTarget: {dataset: {index}}, detail: {value}} = e;
        const {tags} = this.data;
        tags[parseInt(index)] = value.replace(/(^\s*)|(\s*$)/g, "");
        this.setData({ tags });
    },

    handleDelete(e) {
        const {index} = e.currentTarget.dataset;
        const {tags} = this.data;
        tags[parseInt(index)] = '';
        this.setData({ tags });
    },

    handleSubmit() {
        const {tags} = this.data;
        const params = {
            url: 'Card/addCardCommunityLabel',
            data: {
                label: JSON.stringify(tags)
            }
        }
        fetchApi(this, params).then(() => {
            wx.showToast({
                title: '保存成功',
                icon: 'none',
                duration: 1500
            });
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1
                });
            }, 1500)
        }).catch(err => {
            console.log('error: ', err)
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init();
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})