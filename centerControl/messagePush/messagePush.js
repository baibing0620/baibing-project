const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    nav,
    showToast,
    makePhoneCall
} from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pushTag: ['全体客户', '标签客户'],
        moduleTag: ['名片','官网','资讯','商城', '服务'],
        skip_path_key_config: {
            '名片': 1,
            '官网': 2,
            '资讯': 3,
            '商城': 4,
            '动态': 5,
            '外卖': 6,
            '预约': 7,
            '服务': 8,
        },
        pushInfo: '',
        index: '0',
        moduleIndex:'0',
        messagePushTag: [],
        pushDate: new Date().getTime(),
        pushEnable: false,
        moduleType: {
            // 与 skip_path_key_config 对应
            2: { name: ['官网首页', '自定义页面'], activeIndex: 0 }, 
            3: { name: ['资讯列表', '资讯商品详情'], activeIndex: 0 }, 
            4: { name: ['商品列表', '商品详情'], activeIndex: 0 },
            8: { name: ['服务列表', '服务详情'], activeIndex: 0 }
        },
        transInfoData:'请选择资讯',
        transInfoId:'',
        transShopData:'请选择商品',
        transShopId: '',
        transServiceData: '请选择服务',
        transServiceId: '',
        diyIndex:'0',
        moduleDiy:[],
        isIphoneX: app.globalData.isIphoneX
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.globalData.messagePushTag = []
        getUserCount(this)
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
        if (app.globalData.refresh) {
            app.globalData.refresh = false;
            this.setData({
                messagePushTag: app.globalData.messagePushTag
            })
            getUserCount(this)
        }
        if (app.globalData.transData_chat) {
            let data = app.globalData.transData_chat[0].content
            if (data.type == 'info') {
                this.setData({
                    transInfoData: data.title,
                    transInfoId: data.id
                })
            } else if (data.type == 'shop') {
                this.setData({
                    transShopData: data.title,
                    transShopId: data.id
                })
            } else if (data.type == 'service') {
                this.setData({
                    transServiceData: data.title,
                    transServiceId: data.id
                })
            }
            
        }
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
        getUserCount(this)
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

    },
    bindPickerChange: function (e) {
        let value = e.detail.value
        this.setData({
            index: value
        })
        if (parseInt(value)){
            if (app.globalData.messagePushTag.length != 0) {
                getUserCount(this)
            } else {
                this.setData({
                    num: 0
                })
            }
        }else{
            getUserCount(this,0)
        }
    },
    bindDiyChange(e){
        let value = e.detail.value
        this.setData({
            diyIndex: value
        })
    },
    bindModuleChange(e){
        let value = e.detail.value
        if (value == 1 && this.data.moduleDiy.length ==0) {
            this.getTplInfo()
        }
        this.setData({
            moduleIndex: value,
        })
        
    },
    changeContent(e) {
        this.setData({
            pushInfo: e.detail.value
        })
    },
    moduleTypeChange(e){
        const { index } = e.currentTarget.dataset
        const { moduleIndex, moduleType, moduleTag, skip_path_key_config } = this.data
        const skip_path_key = skip_path_key_config[moduleTag[moduleIndex]]
        moduleType[skip_path_key].activeIndex = index
        this.setData({
            moduleType
        })
    },
    navTag() {
        nav({
            url: '/centerControl/systemTags/systemTags',
            data: {
                message: 'push'
            }
        })
    },
    pushMessage(e) {
        if (this.data.num == 0){
            showTips('预估推送0人，无法进行消息推送',this)
            return ;
        }
        this.setData({
            pushEnable:true
        })

        const { value } = e.detail
        const { skip_path_key_config, moduleIndex, moduleType, moduleTag, transShopData, transServiceData, transInfoData, transShopId, transInfoId, transServiceId,  moduleDiy, diyIndex} = this.data
        const module = moduleTag[moduleIndex]
        const moduleDiySelected = moduleDiy[diyIndex]
        const skip_path_key = skip_path_key_config[module]
        const skip_path_type = moduleType[skip_path_key] ? moduleType[skip_path_key].activeIndex == 1 ? 2 : 1 : ''
        const detail_config = {
            // 名片
            1: '',
            // 官网
            2: {
                title: moduleDiySelected ? moduleDiySelected.title : '',
                id : moduleDiySelected ? moduleDiySelected.id : '',
                tpl_id: moduleIndex == 1 ? this.data.moduleDiy[this.data.diyIndex] ? this.data.moduleDiy[this.data.diyIndex].tpl_id : '':''
            },
            // 资讯
            3: {
                title: transInfoData,
                id: transInfoId
            },
            // 商城
            4: {
                title: transShopData,
                id: transShopId
            },
            // 动态
            5: '',
            // 外卖
            6: '',
            // 预约
            7: '',
            // 服务
            8: {
                title: transServiceData,
                id: transServiceId
            }, 
        }
        const detail = detail_config[skip_path_key]
        console.log("detail", detail)

        if (skip_path_type == 2 && !detail.id) {
            const err_message_config = {
                2: '请选择要要推送的自定义页面',
                3: '请选择要推送的资讯内容哦',
                4: '请选择要推送的商品信息哦',
                8: '请选择要推送的服务内容哦',
            }
            showTips(err_message_config[skip_path_key], this)
            this.setData({
                pushEnable: false
            })
            return
        }

        const param = {
            url: `msgPush/add`,
            data: {
                type: parseInt(this.data.index) + 1,
                title: value.title,
                user_name: value.user_name,
                content: value.pushInfo,
                tags: this.data.messagePushTag,
                skip_path_key: skip_path_key,
                skip_path_type: skip_path_type,
                detail: detail
            }
        }

        fetchApi(this, param).then(res => {
            showToast('推送成功', 'success')
            app.globalData.refresh = true
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
            this.setData({
                pushEnable: false
            })
        }).catch(err => {
            console.log(err)
            this.setData({
                pushEnable: false
            })
        })
    },
    navigate(e) {
        let name = e.currentTarget.dataset.name;
        nav({ url: `/pages/${name}/${name}`,data:{from:'messagePush'} });
    },
    getTplInfo(){
        let param = {
            url: `editor/getTplInfo`,
            data: {
               
            }
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data.pages
            data.shift()
            let array = []
            data.forEach((item)=>{
                let obj = {
                    id: item.id,
                    title: item.title,
                    tpl_id: item.tpl_id
                }
                array.push(obj)
            })
           
            this.setData({
                moduleDiy: array
            })
        }).catch(err => {
            console.log(err)
        })
    }
})

function getUserCount(slef,type=1) {
    let param = {
        url: `msgPush/getUserCount`,
        data: {
            tags: type?app.globalData.messagePushTag:''
        }
    }
    fetchApi(slef, param).then(res => {
        slef.setData({
            num: res.data.data
        })
    }).catch(err => {
        console.log(err)
    })
}