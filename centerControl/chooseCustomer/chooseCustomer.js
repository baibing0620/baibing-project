// centerControl/chooseCustomer/chooseCustomer.js
const app = getApp();
import {
	fetchApi,
} from '../../api/api';
import {
	nav,
	showToast,
	showTips,
} from '../../utils/util';

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		showStyle: 0,
		customerList: [],
		keywords: ''
	},

	dataStore: {
		pageIndex: 1,
		pageSize: 10
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getCustomerData()
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
		this.dataStore.pageIndex = 1
		this.getCustomerData()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (this.data.loadStyle == 'loadOver') {
			return;
		}
		this.setData({
			loadStyle: ''
		})
		this.getCustomerData(true)
	},

	customSearch() {
		this.dataStore.pageIndex = 1
		this.getCustomerData()
	},

	changeKeyWords(e) {
		console.log(e, 'eeee')
		this.setData({
			keywords: e.detail.value
		})	
	},

	chooseUser(e) {
		const { index } = e.currentTarget.dataset;
		const userInfo = this.data.customerList[index]

		var pages = getCurrentPages()
		let prevPage = pages[pages.length - 2]; // 上一页

		if (prevPage.data.userInfo && (prevPage.data.userInfo.member.openid != userInfo.member.openid)) {
			prevPage.deleteAllGoods()
		}

		prevPage.setData({
			userInfo: userInfo
		})
		wx.navigateBack({
			
		})
	},

	getCustomerData(isGetMore = false) {
    let param = {
			url: 'crmUser/getCrmUserList',
			data: {
				pageSize: this.dataStore.pageSize,
				pageIndex: isGetMore ? this.dataStore.pageIndex + 1 : this.dataStore.pageIndex,
				nickname: this.data.keywords,
				interact: 0,
				status: 0,
				cooper_order: '',
			}
		};
		fetchApi(this, param).then((res) => {
			if(isGetMore) {
				this.dataStore.pageIndex++
			}
			let data = res.data.data.info;
			this.setData({
				loadStyle: data.length < this.dataStore.pageSize ? 'loadOver' : 'loadMore',
				customerList: isGetMore ? this.data.customerList.concat(data) : data,
			})
			this.setData({
				showStyle: this.data.customerList.length == 0 ? 2 : 1
			})
		}).catch((err) => {
			this.setData({
				showStyle: 3
			})
		})
	}
})