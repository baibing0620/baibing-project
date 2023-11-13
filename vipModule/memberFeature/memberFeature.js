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
        hidden:false,
        levelData: null,
        limitDataJson:null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getVipDetail()
        this.getShopVipConfig()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    getButton:function(){
        this.setData({
            hidden:true
        })
    },
    disapper:function(){
        this.setData({
            hidden:false
        })
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

    getVipDetail() {
        fetchApi(this, {
            url: app.API_HOST +  "VipNew/getVipDetail",
            data: {}
        }).then(res => {
            const data = res.data.data
            const vipRightsConfig = data.level ?  data.level.vipRightsConfig : []
            vipRightsConfig.forEach(item => {
                const vipIconItem = vipIcon.find(i => i.name === item.rights_img)
                item.icon = vipIconItem ? vipIconItem.value : ''
            })
            data.level.vipRightsConfig = vipRightsConfig
            this.setData({
                levelData: data,
            })
        })
    },
    getShopVipConfig() {
        fetchApi(this, {
            url: app.API_HOST +  "vipNew/getShopVipConfig",
            data: {}
        }).then(res => {
            const limitData = res.data.data
            var limitDataJson = JSON.parse(limitData.apply_limit_rule)
            limitDataJson = limitDataJson.filter(e => e.checked == 1).map((a,index)=>{
               let num = index+1
               a.num = num
                if(a.type == 1){
                    a.name="成为客户"
                    
                }
                if(a.type == 2 ){
                    a.name="绑定手机号"
                }
                if(a.type == 3 ){
                    a.name="累计购物满" +  a.val + '次'
                }
               if(a.type == 4 ){
                    a.name="累计消费满" +  a.val + '元'
                }
                
               if(a.type == 5){
                    a.name="购买指定商品:" + a.goods_name
                    let goodsName = a.goods_name
                    console.log(goodsName);
                    let goodsNameArr = goodsName.split(",")
                    console.log(goodsNameArr);
                }

                return a
            })
            console.log(limitDataJson);
            this.setData({
                limitDataJson,
                rights_style: limitData.rights_style,
                card_title: limitData.card_title,
                not_received_img_url: limitData.not_received_img_url
            })
        }).catch(err => { console.log(err, 'err') })
    },
    navToReceiveVip() {
        if (this.data.levelData.is_pass_cond == 1) {
            nav({
                url: '/vipModule/receiveMemberCard/receiveMemberCard'
            })
        }
    },
    toPersonal() {
        nav({ url: "/pages/personal/personal" })
    },
    toIndex() {
        nav({ url: "/pages/home/home" })
    },
    torightsdetail(e) {
        console.log(e, 'eee')
        nav({
            url: '/vipModule/memberRightsDetail/memberRightsDetail',
            data: {
                id: e.currentTarget.dataset.id
            }
        })
    }
})