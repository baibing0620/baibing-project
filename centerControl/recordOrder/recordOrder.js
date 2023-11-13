const app = getApp(); 
import {
    fetchApi,
} from '../../api/api.js';
import {
    nav,
    showLoading,
    showModal,
    showToast,
		previewImage
} from '../../utils/util';

Page({

	data: {
		showStyle: 1,
		avatar: {
			url: '',
			status: 0,
		},
		userInfo: null,
		totalCount: 0,
		realPrice: '',
		goodsList: [],
		discountTime: null,
		discount: 0,
		fromIndex: -1,
		remark: '',
		customerFromOptions: []
		// {}, {}
	},
	onLoad: function (options) {
		this.getReplaceConfig()
		this.getReplaceOrderFromInfo()
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
		this.data.userInfo &&	this.getCartSelect()
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
		this.deleteAllGoods()
	},

	bindfromChange(e) {
		let value = e.detail.value
    this.setData({
        fromIndex: value
    })
	},

	changeRemark(e) {
    this.setData({
      remark: e.detail.value
    })
	},

	getReplaceOrderFromInfo() {
		let param = {
			url: app.API_HOST + 'order/getReplaceOrderFromInfo',
			data: {}
		}
		fetchApi(this, param).then(res => {
      console.log(res.data.data, 'qwerqeq')
      this.setData({
        customerFromOptions: res.data.data
      })
		})
	},

	deleteAllGoods() {
		if (!this.data.userInfo) {
			return
		}
		let param = {
			url: app.API_HOST + 'cart/deleteAllReplaceOrder',
			data: {
				openId: this.data.userInfo.member.openid,
				isReplaceOrder: 1
			}
		}
		fetchApi(this, param).then(res => {}).catch(err => { console.log(err ,'Delete ERR') })
	},

	priceChange(e) {
		this.setData({
			realPrice: e.detail.value
		})

		clearTimeout(this.data.discountTime)
		this.data.discountTime = null
		this.data.discountTime = setTimeout(e => {
			let discount = this.data.totalCount - this.data.realPrice 
			this.setData({
				discount: discount <= 0 ? 0 : discount
			})
		}, 500)

	},

	confirmRecord() {
    if (!this.data.userInfo) {
      showModal({
        title: '提示',
        content: '请先选择用户',
        success: res => { },
      })
      return
    } 
		if(!this.data.goodsList.length) {
			showModal({
				title: '提示',
				content: '请先选择商品',
				success: res => {},
			})
			return
		} 
		wx.showModal({
			title: '提示',
			content: '确认录入订单吗？',
			showCancel: true,
			success: res => {
        console.log(res ,'resss')
        if(res.confirm) {
          this.createOrder()
        }
			},
			fail: function (err) { console.log(err, 'err') },
			complete: function (res) { },
		})
	},

	createOrder() {
		let param = {
			url: app.API_HOST + 'order/createOrderNew',
			data: {
				payType: 0,
				bargainId: 0,
				distributorId: 0,
				optionId: 0,
				total: 0,
				remark: this.data.remark,
				myRemark: '',
				addressId: 0,
				expressName: '快递免邮',
				expressCode: '_free',
				expressPrice: 0,
				myExpressName: '快递免邮',
				myExpressCode: '_free',
				myExpressPrice: 0,
				couponId: 0,
				channelId: 0,
				realname: this.data.userInfo.name || '',
				mobile: this.data.userInfo.phone || '',
				deliveryType: 4,
				storeId: 0,
				openId: this.data.userInfo.member.openid,
				uid: this.data.userInfo.uid,
				realPrice: this.data.realPrice == '' ?  this.data.totalCount : this.data.realPrice,
				voucher_url: this.data.avatar.url,
				isReplaceOrder: 1,
        replaceOrderFrom: this.data.customerFromOptions[this.data.fromIndex] ? this.data.customerFromOptions[this.data.fromIndex] : ''
			}
		}

		fetchApi(this, param).then(res => {
			showToast('订单录入成功', 'success')
			setTimeout(() => {
        wx.navigateBack({})
      }, 1500)
		}).catch(err => {
			console.log(err , 'err 订单录入失败')
		})
	},

	getReplaceConfig() {
		let param = {
			url: app.API_HOST + 'order/getReplaceOrderConfig',
			data: {
			}
		}
		fetchApi(this, param).then(res => {
			let data = res.data.data
			this.setData({
				open_voucher: data.open_voucher == 1,
				open_revise_price: data.open_revise_price == 1,
			})
		})
	},


	previewImage(e) {
		previewImage(e)
	},

	toChooseCustomer() {
		nav({
			url: `/centerControl/chooseCustomer/chooseCustomer`,
			data: {}
		})
	},

	getTotalMoney() {
		var count = 0
		this.data.goodsList.forEach(e => {
			count += e.totalprice
		})
		this.setData({
			totalCount: parseFloat(count).toFixed(2),
			realPrice: parseFloat(count).toFixed(2),
		})
	},

	getCartSelect() {
		let param = {
			url: app.API_HOST + 'cart/get',
			data: {
				openId: this.data.userInfo.member.openid,
				isReplaceOrder: 1
			}
		};
		fetchApi(this, param).then(res => {
			let data = res.data.data
			this.setData({
				goodsList: data.filter(item => { return item.status != 2 }),
				disUseCartList: data.filter(item => { return item.status == 2 }),
			});
			this.getTotalMoney()
		}).catch(err => {
		})
	},

	delItem (e) {
		showModal({
			content: '是否删除',
			showCancel: true
		}).then(() => {
			let goodsList = this.data.goodsList,
				index = parseInt(e.currentTarget.dataset.index);
			let param = {
				url: app.API_HOST + 'cart/delete',
				data: {
					id: goodsList[index].id,
					openId: this.data.userInfo.member.openid,
					isReplaceOrder: 1
				}
			};
			fetchApi(this, param).then(res => {
				goodsList.splice(index, 1);
				this.setData({
					goodsList: goodsList,
				});
				this.getTotalMoney()
			}).catch(err => {
				console.log('del fail')
			})

		}).catch(err => {
			console.log('error: ', err)
		})
	},
	toAddGoods() {
		if (!this.data.userInfo) {
			showModal({
				title: '提示',
				content: '请先选择下单客户'
			})
			return
		}
		const { openid } = this.data.userInfo.member
		nav({
			url: '/centerControl/chooseGoods/chooseGoods',
			data: { 
				openid: openid
			}
		})
	},

	uploadCertificate() {
		this.chooseImages(1).then((res) => {
			this.toUploadAvatar(res[0]);
		}).catch((res) => {
			console.log(res, "取消")
		})
	},
	chooseImages(number) {
		return new Promise((resolve, reject) => {
			wx.chooseImage({
				count: number,
				sizeType: ["original"],
				success: (res) => {
					resolve(res.tempFilePaths);
				},
				fail: (res) => {
					reject(res);
				}
			})
		})
	},
	toUploadAvatar(imgPath) {

		let avatar = this.data.avatar;
		// 开始上传

		let uploadTask = wx.uploadFile({
			url: app.API_HOST + 'card/uploadImg',
			formData: {
				token: app.globalData.token,
			},
			filePath: imgPath,
			name: 'file',
			success: (res) => {
				res.data = JSON.parse(res.data);
				if (parseInt(res.data.code) >= 0) {
					avatar.id = res.data.data.id
					avatar.url = res.data.data.url
					avatar.status = 2;
					this.setData({
						avatar: avatar
					})
				} else {
					avatar.status = -1;
					avatar.errorMsg = res.data.msg;
					this.setData({
						avatar: avatar
					})
				}

			},
			fail: (res) => {
				console.log(res, "上传失败了！")
				avatar.status = -1;
				this.setData({
					avatar: avatar 
				})
			}
		}) 
		// 上传进度
		uploadTask.onProgressUpdate((res) => {
			if (res.progress > 0 && res.progress < 100) {
				avatar.status = 1;
				avatar.progress = res.progress;
				this.setData({
					avatar: avatar
				})
			}
		})
	},

	deleteCertificate() {
		wx.showModal({
			title: '提示',
			content: '确认删除图片？',
			success: (res) => {
				if (res.confirm) {
					this.data.avatar = {
						url: '',
						status: 0,
					}
					this.setData({
						avatar: this.data.avatar
					})

				}
			}
		})
	},

})