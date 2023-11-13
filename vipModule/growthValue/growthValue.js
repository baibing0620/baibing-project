import {
    fetchApi
} from '../../api/api.js'

const app = getApp() 

Page({

    /**
     * 页面的初始数据
     */
    data: {
        levelData: null,
        showStyle: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getVipGrowDetail()

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
 
    getVipGrowDetail() {
        fetchApi(this, {
            url: app.API_HOST +  "VipNew/getVipGrowDetail",
            data: {}
        }).then(res => {
            console.log(res, 'getVipGrowDetail')
            const data = res.data.data
            if (data.vipGrowLogConfig.calculation_cycle == '0') {
                data.cycle = '永久'
            } else {
                data.cycle = data.startTime.slice(0, 10) + ' ~ ' + data.endTime.slice(0, 10)
            }
            const { grow_name } = data.vipGrowLogConfig
            data.vipGrowLogConfig.fix_rule = data.vipGrowLogConfig.fix_rule ? 
                JSON.parse(data.vipGrowLogConfig.fix_rule).filter(item => item.value != 0).map(e => {
                    switch(e.type) {
                        case 1: e.info = `完善资料,获得${e.value + grow_name}`; break; 
                        case 2: e.info = `授权登录,获得${e.value + grow_name}`; break; 
                        case 3: e.info = `授权手机号,获得${e.value + grow_name}`; break; 
                    }
                    return e
            }) : []
            data.vipGrowLogConfig.dynamic_rule = data.vipGrowLogConfig.dynamic_rule ?
                JSON.parse(data.vipGrowLogConfig.dynamic_rule).filter(item => item.value != 0).map(e => {
                    switch (e.type) {
                        case 2: e.info = `分享小程序,获得${e.value + grow_name}(一天最多得${e.num}次)`; break;
                        case 3: e.info = `消费一元,获得${e.value + grow_name}`; break;
                    }
                    return e
                }) : []
           
            const levelGrow = data.levelGrow
            let currentLevelIndex = 0
            data.levelAll.forEach((item, index) => {
                if (levelGrow >= item.level_start) {
                    item.active = true
                    currentLevelIndex = index
                    item.percent = levelGrow / (item.level_end - item.level_start)

                    if (levelGrow - item.level_end >= 0) {
                        item.percent = 100
                    } else {
                        item.percent = levelGrow / item.level_end * 100
                    }
                } else {
                    item.percent = 0
                    item.active = false
                }
            })
            wx.setNavigationBarTitle({
                title: `我的${grow_name}`,
            })
            this.setData({
                levelData: data,
                grow_name: grow_name,
                showStyle: 1
            })
        }).catch(err => {
            this.setData({
                showStyle: 3
            })
        })
    }
})