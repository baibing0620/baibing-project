    import {
        fetchApi
    } from '../../api/api.js'
    import {
        nav
    } from '../../utils/util'
    import {
        vipIcon
    } from '../../map.js'
    const app = getApp()
    Page({

    /**
     * 页面的初始数据
     */
    data: {
        defaultId: 0,
        activeindex: 0,
        dataLists:null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.defaultId = options.id
        this.getVipDetail()
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
    handelSwpierChange: function (e) {
        this.setData({
            activeindex: e.detail.current,
        })
    }, 
    changeIndex(e) {
        // console.log(e ,'e')
        this.setData({
            activeindex: e.currentTarget.dataset.index,
        })
    },
    getVipDetail(){
        fetchApi(this, {
        url: app.API_HOST +  "VipNew/getVipDetail",
        data: {}
    }).then(res =>{
        const data = res.data.data
        const vipRightsConfig = data.level ?  data.level.vipRightsConfig : []
        vipRightsConfig.forEach(item => {
            const vipIconItem = vipIcon.find(i => i.name === item.rights_img)
            item.icon = vipIconItem ? vipIconItem.value : ''
        })
        const activeindex = vipRightsConfig.findIndex(_ => _.id == this.data.defaultId)
        data.level.vipRightsConfig = vipRightsConfig
        this.setData({
            dataLists: data,
            activeindex: activeindex == -1 ? 0 : activeindex
        })
    })
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

    }

    })