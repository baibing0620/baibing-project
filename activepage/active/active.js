import {
    fetchApi
} from '../../api/api.js'
import {
    showToast
} from '../../utils/util';
const app = getApp()
Page({
    data: {},
    onLoad() {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage']
        })
    },
    getPhoneNumber(e) {
        let date = new Date().toLocaleDateString()
        let date2 = new Date("2024-01-31").toLocaleDateString()
        if (date > date2) {
            return showToast("活动结束", "none")
        }
        wx.login({
            success: (res) => {
                console.log(res, "res")
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
                fetchApi(self, param, 'POST').then((res) => {
                    const {
                        phoneNumber
                    } = res?.data?.data?.phone_info || {}
                    if (phoneNumber) {
                        wx.navigateTo({
                            url: `/activepage/coupon/coupon?id=${phoneNumber}`,
                        })
                    } else {
                        showToast("未获取到手机号，请重新授权", "none")
                    }
                }).catch(err => {
                    showToast(err, "none")
                })
            },
        })
    },
    onShareAppMessage: function () {
        return {
            title: '  ',
            path: '/activepage/active/active',
            imageUrl:"https://anhuidaowei.com/media/1c82ca2baa906cf4b42a184eea073ca.png" 
          }
    },
})