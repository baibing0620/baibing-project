const app = getApp();
import {
    fetchApi
} from '../../api/api.js';
import {
    nav,
    showLoading,
    chooseAddress,
    makePhoneCall,
    deleteWhite,
    showToast,
    showTips
} from '../../utils/util';
import { personalIcons } from '../../map.js'
import Wex from '../../utils/wex.js';

Page({
    tapName:function(event){
      nav({//封装的链接
        url: '/pages/personalInformation/personalInformation',//参数传递到URL
        data:{
          avatar:this.data.user.avatar,
          nickname:this.data.user.nickname
        }
      })
    },
    data: {
        maskUrl: 'https://facing-1256908372.file.myqcloud.com//image/20201103/d9212cd955eae9b7.png',
        showStyle: 0,
        user: {
            nickname: '-',
            distributor: 0,
        },
        signPoint: 0,
        mainColor: app.extConfig.themeColor,
        extConfig: app.extConfig,
        giveModel:false,
        is_open_credit: false,
        profileMenuArr: [],
        personalIcons: personalIcons,
        levelData: null,
        open_vip:0
    },

    onLoad: function (options) {
        Wex.map(this, {
            vipInfo: 'vipInfo',
        })
        let setRender = () => {//let setRender=function () 
            this.setData({
                is_open_credit: app.globalConfig.is_open_credit,
                is_open_credit_level: app.globalConfig.is_open_credit_level,
                open_distribution: app.globalConfig.funcList.open_distribution,
                open_vip: app.globalConfig.funcList.open_vip
            });
            getInitData(this);
        }
        showLoading();
        if (app.globalConfig === null) {
            var params = {
                url: app.API_HOST + 'config/get',
                data: {}
            };
            fetchApi(this, params).then(res => {
                app.globalConfig = res.data.data;
                setRender();
            }).catch(err => {
                console.log('error: ', err)
            });
        } else {
            setRender();
        }
        let mainColor = this.data.mainColor;
        if (mainColor != deleteWhite(mainColor)) {
          this.setData({
            mainColor: deleteWhite(mainColor)
          })
        }
        this.getUserCreditInfo()
        this.getShopCreditSetting()
        this.getShopVipConfig()  
    },
    onReady: function () {

    },
    onShow: function () {
        app.showRemind(this);
        app.globalData.refresh && this.refresh()
    },
    onHide: function () {

    },
    onUnload: function () {

    },
    refresh() {
        app.globalData.refresh = false
        getInitData(this)
        this.getUserCreditInfo()
    },
    toBind() {
        nav({ url: '/centerControl/bindByCDKey/bindByCDKey'})
    },
    signIn() {
        var animation = wx.createAnimation({
            duration: 1500,
            timingFunction: 'ease',
        })

        this.animation = animation
        let param = {
            url: app.API_HOST + 'vip/dailySignIn',
            data: {}
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data;
            let user = this.data.user;
            user.credit = parseInt(user.credit) + parseInt(data.credit);
            user.is_sign_in = 1;
            this.setData({
                signPoint: data.credit,
                user: user
            })
            animation.scale(2, 2).translateY(-1).opacity(0.8).translateY(-20).opacity(0.3).step();
            this.setData({
                animationData: animation.export()
            });
            setTimeout(() => {
                this.setData({
                    signPoint: 0
                })
            }, 1500)
        }).catch(err => {})
    },
    onPullDownRefresh: function () {
        showLoading();
        getInitData(this);
        this.getUserCreditInfo()
        this.getShopCreditSetting()
        this.getShopVipConfig()
    },
    //函数
    toOrder: function (e) {
        var index = e.currentTarget.dataset.index;
        nav({
            url: '/pages/orderList/orderList',
            data: {
                status: index
            }
        })
    },
    getShopCreditSetting() {
        fetchApi(this, {
            url: "config/get",
            data: {}
        }).then(res => this.setData({
            is_open_credit: res.data.data.is_open_credit == 1,
            is_open_credit_level: res.data.data.is_open_credit_level == 1
        }))
    },
    getShopVipConfig() {
        //店铺会员配置
        fetchApi(this, {
            url: app.API_HOST + "vipNew/getShopVipConfig",
            data: {}
        }).then(res => {
            this.setData({
                open_vip: res.data.data.open_vip || 0
            })
        })
    },
    //选择地址
    chooseAddress() {
        chooseAddress();
    },
    // 联系商家
    callService() {
        makePhoneCall(app.globalConfig.service_phone);
    },
 
    navTo(e) {
        let pageName = e.currentTarget.dataset.page;
        let url = `/pages/${pageName}/${pageName}`
        switch (pageName) {
            case 'myBargain':
                nav({
                    url: '/pages/bargainOrderList/bargainOrderList'
                })
                break;
            case 'groupBuy':
                nav({
                    url: '/pages/groupOrderList/groupOrderList'
                })
                break;
            case 'address':
                chooseAddress();
                break;
            case 'shopOrder':
                nav({
                    url: '/pages/orderList/orderList',
                    data: {
                        status: 0
                    }
                })
                break;
            case 'o2oOrder':
                nav({
                    url: '/pages/menuOrderList/menuOrderList'
                })
                break;
            case 'predeterminedList':
                nav({
                    url: '/pages/myAppointment/myAppointment'
                })
                break;
            case 'wallet':
                nav({
                    url: '/pages/myWallet/myWallet'
                })
                break;
            case 'distribution':
                nav({
                    url: '/distribution/distributionCenter/distributionCenter'
                })
                break;
            default:
                nav({
                    url
                })
        }
    },
    navCreditDetail() {
        nav({
            url:"/centerControl/creditDetail/creditDetail"
        })
    },
    integralGive(){
        this.setData({
            giveModel:true
        })
    },
    closeModel(){
        this.setData({
            giveModel: false
        })
    },
    onGetvalue(e){
        let value = e.detail
        if(value.trim() == ''){
            showTips('请输入转赠积分',this)
            return ; 
        }
        wx.scanCode({
            success:(res)=> {
                console.log(res,"wx.scancode")
                let param = {
                    url: app.API_HOST + 'userCredit/giftUserCreditByQrCode',
                    data: { 
                        credit: value,
                        code: res.result
                    }
                }
                fetchApi(this, param).then(res => {
                    showToast('赠送积分成功','success')
                    this.closeModel()
                    this.getUserCreditInfo()
                }).catch(err => { })
            }
        })
    },
    navCredit(){
        nav({
            url:'/centerControl/creditVerification/creditVerification'
        })
    },
    getUserCreditInfo() {
        let params = {
            url: app.API_HOST + 'userCredit/getUserCreditInfo',
            data: {}
        }
        fetchApi(this, params).then(res => {
            this.setData({
                credit: res.data.data.credit
            })
        }).catch(err => {
            console.log('error: ', err)
        })
    },
    navPersonInfo() {
        nav({
            url: '/pages/personInfo/personInfo',
            data:{
                avatar:this.data.user.avatar
            }
        })
    },
    navVipDetail(e) {
        const { vip } = e.currentTarget.dataset
        let url = vip ? '/vipModule/memberCard/memberCard' : '/vipModule/memberFeature/memberFeature'
        nav({
            url: url
        })
    },
    getVipGrowDetail() {
        fetchApi(this, {
            url: app.API_HOST + "VipNew/getVipGrowDetail",
            data: {}
        }).then(res => {
            const data = res.data.data
            const { grow_name } = data.vipGrowLogConfig
            var vipInfo = Wex.getStore('vipInfo')
            vipInfo.grow_name = grow_name || '成长值'
            Wex.dispatch({
                vipInfo: vipInfo
            })
        })
    }
})

function matchingIcon(self, key) {
    let list = self.data.personalIcons.filter(e => {
        return e.name == key
    })
    if (list.length > 0) {
        return list[0].value
    } else {
        return 'icon-kanjia'
    }
}

//加载数据 初次加载 type=0请求
function getInitData(self) {
    let param = {
        url: app.API_HOST + 'user/userInfo',
        data: {}
    }
    fetchApi(self, param).then(res => {
        console.log("res: ", res)
        var data = res.data.data;
        let index = 0
        var profileMenuArr = [[]]
        try {
            for (let key in data.profileMenu) {
                data.profileMenu[key].key = key
                data.profileMenu[key].icon = matchingIcon(self, key)
                if (data.profileMenu[key].key != 'order' && data.profileMenu[key].isOpen) {
                    if (profileMenuArr[index].length < (index == 0 ?  self.data.is_open_credit ? 5 : 7 : 8)) {
                        profileMenuArr[index].push(data.profileMenu[key])
                    } else {
                        index++;
                        profileMenuArr.push([])
                        profileMenuArr[index].push(data.profileMenu[key])
                    }
                }
            }
        } catch (err) {
            console.log(err, 'err')
        }

        var vipInfo = {
            is_vip: res.data.data.user.is_vip
        };
        Wex.dispatch({
            vipInfo: vipInfo
        })
       
        if (res.data.data.user.is_vip) {
            getVipDetail(self)
            self.getVipGrowDetail()
        }
        self.setData({
            showStyle: 1,
            user: res.data.data.user,
            profileMenu: res.data.data.profileMenu,
            profileMenuArr: profileMenuArr,
            credit_level: (
                (res.data.data.user.credit_level_setting || [])
                .sort((a, b) => ~~b.begin - ~~a.begin)
                .find(e => (~~res.data.data.user.credit + ~~res.data.data.user.used_credit) >= ~~e.begin
            ) || {}).level || ''
        })
    }).catch((err) => {
        console.error(err)
        self.setData({
            showStyle: 3
        })
    })
}

function getVipDetail(self) {
    fetchApi(self, {
        url: app.API_HOST +  "VipNew/getVipDetail",
        data: {}
    }).then(res => {
        const data = res.data.data
        self.setData({
            levelData: data
        })
    })
}