import { fetchApi, getPhoneNumber } from '../../api/api'
import { nav, getHomePage } from '../../utils/util'

const app = getApp()

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
	},

	/**
	 * 组件的初始数据
	 */
	data: {
	},

	/**
	 * 组件的生命周期
	 */
	lifetimes: {
		attached() {
			this.init()
		}
	},
	// 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容W
	attached() {
		this.init()
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		interval: null,
		timeout: null,

		init () {
			this.getCardInfo()
			this.interval = setInterval(() => {
				const {update_time, mobile} = app.globalData.currentLoginUserCardInfo
				if (update_time) {
					clearInterval(this.interval)
					this.setData({
						hasBindPhone: mobile ? true : false
					})
				}
			}, 300)
			this.timeout = setTimeout(() => {
				clearInterval(this.interval)
			}, 30000)
		},

		getCardInfo() {
			const { cardId } = app.globalData
			const params = {
				url: 'card/getCardInfo',
				data: { cardId }
			}
			fetchApi(this, params).then(res => {
				const { data } = res.data
				this.setData({
					...data,
					isReady: true
				})
			}).catch(err => {
				console.log('error: ', err)
			})
		},

		handleNavToHomePage() {
			nav({ url: getHomePage() })
		},

		handleNavToChat() {
			const { admin_uid } = this.data
            nav({
                url: '/pages/chat/chat',
                data: {
                    toUid: admin_uid,
                }
            });
        },

		handleGetPhoneNumber(e) {
			getPhoneNumber(e).then(res => {
				res && this.setData({ hasBindPhone: true });
				this.handleNavToChat()
			}).catch(err => {
				wx.showToast({
					title: err,
					icon: 'none',
					mask: true,
					duration: 1500
				})
				setTimeout(() => {
					this.handleNavToChat()
				}, 1500)
			})
		},
		
		handleCall() {
			const {mobile} = this.data
			wx.makePhoneCall({
				phoneNumber: mobile
			})
		}
	}
})
