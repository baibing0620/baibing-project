const app = getApp()

const getCurrentPageUrl = () => {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var url = currentPage.route;
    var options = currentPage.options;
    return options || {}
}
import {
    fetchApi,
} from '../../api/api.js';
import {
    request
} from "../api/api"
import {
    showToast
} from '../../utils/util';
Page({
    data: {
        isReceive: false,
        isExpire: false,
        isChecked: false,
        erCodeId: "",
        showErCodeId: "",
        showModal: false,
        showCheckedModal: false,
        userInfo: {},
        reloadPhoneNumberVisible: false,
        receiveSuccess: false,
    },
    handleChecked() {
        this.setData({
            showCheckedModal: true
        })
    },
    handleCheckedClosed() {
        this.setData({
            showCheckedModal: false
        })
    },
    handleCheckedStore() {
        this.setData({
            showModal: true
        })
    },
    handleCheckedStoreClosed() {
        this.setData({
            showModal: false
        })
    },
    onLoad() {
        this.getInitData({})
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage']
        })
    },
    async getInitData(data) {
        let {
            phoneNumber = ""
        } = data || {}

        if (!phoneNumber) {
            const {
                id
            } = getCurrentPageUrl()
            const {
                mobile
            } = app?.globalData?.currentLoginUserCardInfo || {}
            phoneNumber = mobile
            let _phoneNumber = wx.getStorageSync('phone')
            phoneNumber = id || mobile || _phoneNumber
            if (!phoneNumber) {
                await this.reloadPhoneNumber()
            } else {
                wx.setStorage({
                    key: "phone",
                    data: phoneNumber
                })
                this.setData({
                    erCodeId: phoneNumber,
                    showErCodeId: phoneNumber.split("").reverse().join("").slice(0, 8)
                })
                await this.initPage()
            }
        } else {
            wx.setStorage({
                key: "phone",
                data: phoneNumber
            })
            this.setData({
                erCodeId: phoneNumber,
                showErCodeId: phoneNumber.split("").reverse().join("").slice(0, 8)
            })
            await this.initPage()
        }
    },
    confirmChecked() {
        //调接口
        let param = {
            url: `https://anhuidaowei.com/api/dw/claim`,
            data: {
                userId: this.data.erCodeId,
            },
            method: "PUT"
        }
        request(param).then(res => {
            this.setData({
                isChecked: true
            })
        }).catch((err) => {
            console.error(err)
        })
    },
    receiveCoupon() {
        if (this.data.erCodeId) {
            let param = {
                url: `https://anhuidaowei.com/api/dw/claim`,
                data: {
                    userId: this.data.erCodeId,
                    userName: this.data.erCodeId
                },
                method: "POST"
            }
            request(param).then(res => {
                const {
                    success
                } = res
                if (success) {
                    this.setData({
                        receiveSuccess: true,
                        isReceive: true,
                        isChecked: false,
                        isExpire: false
                    })
                }
            }).catch((err) => {
                console.error(err)
                showToast('领取失败', 'none')
            })
        }
    },
    async initPage() {
        let param = {
            url: `https://anhuidaowei.com/api/dw/claim`,
            data: {
                userId: this.data.erCodeId,
            },
        }
        request(param).then(res => {
            const {
                data,
                success
            } = res || {}
            const {
                expireTime,
                userId,
                writeOff
            } = data
            let date = new Date().toLocaleDateString()
            let date2 = new Date(expireTime).toLocaleDateString()
            // 判断是否过期
            if (expireTime && date > date2) {
                this.setData({
                    isExpire: true
                })
                return
            }
            // 是否重新领取
            if (writeOff && writeOff !== 0) {
                this.setData({
                    isChecked: true
                })
                return
            }
            // 已领取状态
            if (userId) {
                this.setData({
                    isReceive: true
                })
                return
            } else {
                this.receiveCoupon()
            }
        }).catch((err) => {
            console.error(err)
        })
    },
    async reloadPhoneNumber() {
        this.setData({
            reloadPhoneNumberVisible: true
        })
    },
    getPhoneNumber(e) {
        wx.login({
            success: (res) => {
                const {
                    code,
                    encryptedData
                } = e.detail
                const param = {
                    url: app.API_HOST + 'vip/getPhoneNumberNew',
                    data: {
                        code: code || encryptedData
                    }
                }
                fetchApi(self, param, 'POST').then(async (res) => {
                    const {
                        phoneNumber
                    } = res?.data?.data?.phone_info || {}
                    if (phoneNumber) {
                        wx.setStorage({
                            key: "phone",
                            data: phoneNumber
                        })
                        this.setData({
                            reloadPhoneNumberVisible: false,
                            erCodeId: phoneNumber
                        })
                        await this.getInitData({
                            phoneNumber
                        })
                    } else {
                        wx.showToast({
                            title: "未获取到手机号，请重新授权",
                            icon: 'none',
                            mask: true,
                            duration: 1500
                        })
                        this.setData({
                            reloadPhoneNumberVisible: true
                        })
                    }
                }).catch(err => {
                    wx.showToast({
                        title: err,
                        icon: 'none',
                        mask: true,
                        duration: 1500
                    })
                    this.setData({
                        reloadPhoneNumberVisible: true
                    })
                })
            },
        })
    },
    closeReceiveSuccess() {
        this.setData({
            receiveSuccess: false
        })
    },
    openReceiveSuccess() {
        this.setData({
            receiveSuccess: true
        })
    },
    jumpAttention() {
        wx.navigateTo({
            url: `/activepage/attention/attention`,
        })
    },
    mapNavigation() {
        var addr = "亳州星途汽车4s店";
        wx.openLocation({
            latitude: 33.853931,
            longitude: 115.78273,
            scale: 28,
            name: addr, //打开后显示的地址名称
        })
    }
})