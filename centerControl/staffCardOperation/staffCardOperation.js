const app = getApp();
import { fetchApi } from '../../api/api.js';
import { showToast, showTips, nav } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},//status	状态筛选 0为所有，1未绑定，2已关闭，3正常使用，4未开通
        configCode:false,
        status:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.staffId = options.staffId
        this.setData({
            configCode: options.config_code == 3?true:false 
        })
        this.init();        
    },

    init() {
        const param = {
            url: app.API_HOST + "cardManage/getCanUseCardCount",
            data: {}
        }
        fetchApi(this,param).then(res=>{
            this.setData({
                number:res.data.data
            })
        }).catch(err=>{

        })
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
        getStaffInfo(this)
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
    setCardOpen(e){
        wx.showModal({
            title: '提示',
            content: '是否给该员工开通企业名片？',
            confirmText: '立即开通',
            success: (res) => {
                if (res.confirm) {
                    setOpen(this)
                } else if (res.cancel) {

                }
            }
        })

    },
    setOpenCard(){
        wx.showModal({
            title: '提示',
            content: '开启名片后，该员工可重新使用名片',
            confirmText: '立即开启',
            success: (res) => {
                if (res.confirm) {
                    setOpen(this)
                } else if (res.cancel) {

                }
            }
        }) 
    },
    setColseCard(){
        wx.showModal({
            title: '提示',
            content: '关闭名片后，该员工将无法使用名片',
            confirmText: '立即关闭',
            success: (res) => {
                if (res.confirm) {
                    setOpen(this, 2)
                    if (app.globalData.currentLoginUserCardInfo &&
                        app.globalData.currentLoginUserCardInfo.cardId == this.data.info.card.id) {
                        setTimeout(() => {
                            wx.reLaunch({
                                url: '/pages/cardList/cardList'
                            })
                        }, 500)
                    }
                } else if (res.cancel) {

                }
            }
        }) 
    },
    bindCard(){
        let info = this.data.info
        nav({
            url:"/centerControl/bindImmediately/bindImmediately",
            data:{
                staffId: this.data.staffId,
                name: info.name,
                position: info.position
            }
        })
    },
    unBindCard(){
        wx.showModal({
            title: '提示',
            content: '解除绑定后，该员工将无法使用名片',
            confirmText: '立即解绑',
            success: (res) => {
                if (res.confirm) {
                    let param = {
                        url: app.API_HOST + "CardManage/untieUserFromHasBind",
                        data: {
                            staffId: this.data.staffId,
                        }
                    }
                    fetchApi(self, param).then(res => {
                        this.setData({
                            'info.opencard': 1,
                            'status': 1
                        })
                        if (app.globalData.currentLoginUserCardInfo &&
                            app.globalData.currentLoginUserCardInfo.cardId == this.data.info.card.id){
                            setTimeout(() => {
                            wx.reLaunch({
                                url: '/pages/cardList/cardList'
                            })
                            },500)
                        }
                    }).catch((err) => {
                       
                    });
                } else if (res.cancel) {

                }
            }
        }) 
    },
    editStaff(){
        nav({
            url: "/centerControl/addStaffCard/addStaffCard",
            data: {
               edit: 1,
               staffId: this.data.staffId
            }
        })
    },
    delStaff(){
        wx.showModal({
            title: '提示',
            content: '确认删除吗？',
            success:res=> {
                if (res.confirm) {
                    let param = {
                        url: app.API_HOST + "CardManage/delStaff",
                        data: {
                            staffId: this.data.staffId,
                        }
                    }
                    fetchApi(self, param).then(res => {
                        showToast('删除成功', 'success')
                        app.globalData.refresh = true;
                        setTimeout(() => {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }, 500)
                    }).catch((err) => {

                    });
                }
            }
        })
        
    }
})

function setOpen(self,openCard =1){
        let param = {
            url: app.API_HOST + "CardManage/setCardOpen",
            data: {
                staffId: self.data.staffId,
                openCard: openCard,
            }
        }
        fetchApi(self, param).then(res => {
            getStaffInfo(self)
        }).catch((err) => {
           
        });
}
function getStaffInfo(self){
    let param = {
        url: app.API_HOST + "cardManage/getStaffInfo",
        data: {
            staff_id: self.data.staffId,
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data
        if (data.opencard != 3) {
            wx.setNavigationBarTitle({
                title: data.name,
            })
        }
        self.setData({
            status: data.card&&data.card.status,
            info: { ...data }
        })
    }).catch((err) => {
        
    });
}