const app = getApp() //const声明常量   let声明变量
import {
    fetchApi
} from '../../api/api.js'
import {
    vipIcon
} from '../../map.js'
import {
    nav
} from '../../utils/util'
import Wex from '../../utils/wex.js';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        levelData: null,
        imgMap: {
            '0': 'https://facing-1256908372.file.myqcloud.com//image/20210426/ef041d791974b2a2.png',
            '1': 'https://facing-1256908372.file.myqcloud.com//image/20210426/5bdd3f3ce215e3da.png',
            '2': 'https://facing-1256908372.file.myqcloud.com//image/20210426/fcd7fce92047d42b.png',
            '3': 'https://facing-1256908372.file.myqcloud.com//image/20210426/0c45c27e77011c21.png',
            '4': 'https://facing-1256908372.file.myqcloud.com//image/20210426/8a53dabdfacf3428.png',
            '5': 'https://facing-1256908372.file.myqcloud.com//image/20210430/29d8a80e0ae4f77c.png',
            '6': 'https://facing-1256908372.file.myqcloud.com//image/20210430/291df6533b8189d1.png',
            '7': 'https://facing-1256908372.file.myqcloud.com//image/20210430/0a45481649a11f9e.png',
            '8': 'https://facing-1256908372.file.myqcloud.com//image/20210430/1bbc34e6c94b4e9a.png',

        },
        showStyle: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            vipInfo: Wex.getStore('vipInfo')
        })
        this.getShopVipConfig()
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

    getShopVipConfig() {
        fetchApi(this, {
            url: app.API_HOST +  "vipNew/getShopVipConfig",
            data: {}
        }).then(res => {
            const limitData = res.data.data
            this.setData({
                rights_style: limitData.rights_style,
                vip_head_config: limitData.vip_head_config
            })
            this.getVipDetail()
        }) 
    },
    
    getVipDetail() {
        fetchApi(this, {
            url: app.API_HOST +  "VipNew/getVipDetail",
            data: {}
        }).then(res => {
            const data = res.data.data
            const { imgMap } = this.data
            const vipRightsConfig = data.level.vipRightsConfig
            vipRightsConfig.forEach(item => {
                const vipIconItem = vipIcon.find(i => i.name === item.rights_img)
                item.icon = vipIconItem ? vipIconItem.value : ''
            })
            data.level.vipRightsConfig = vipRightsConfig
            if (this.data.rights_style == 1) {
                data.level.img_url = data.levelkey < 9 ? imgMap[data.levelkey] : imgMap[data.levelKey % 9]
            }
            this.setData({
                levelData: data,
                showStyle: 1
            })
        }).catch(err => {
            this.setData({
                showStyle: 3
            })
        })
    },
    navGrowth() {
        nav({
            url: '/vipModule/growthValue/growthValue'
        })
    },
    toPersonal() {
        nav({ url: "/pages/personal/personal" })
    },
    toIndex() {
        nav({ url: "/pages/home/home" })
    },
    torightsdetail(e) {
        console.log(e ,'eee')
        nav({
            url: '/vipModule/memberRightsDetail/memberRightsDetail',
            data: {
                id: e.currentTarget.dataset.id
            }
        })
    }
})