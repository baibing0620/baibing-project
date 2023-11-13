// centerControl/auditOrderList/auditOrderList.js
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

	/**
	 * 页面的初始数据
	 */
	data: {
		showStyle: 1,
		pageIndex: 1,
		pageSize: 10
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getOrderList()
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

	onPullDownRefresh: function () {
		this.data.pageIndex = 1
		this.setData({
			loadStyle: ''
		})
		this.getOrderList()
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
		this.getOrderList(true)
	},

	nav(e) {
		let path = e.currentTarget.dataset.path;
		let id = e.currentTarget.dataset.id;
		if (!path) return;
		let params = {
			url: `/centerControl/${path}/${path}`,
			data: {
				id: id,
				mode: 'retail'
			}
		}
		nav(params);
	},

	getOrderList(isGetMore = false) {
		let params = {
			url: app.API_HOST + "cardOrder/orderList",
			data: {
				orderBy: "createtime",
				orderType: "desc",
				ordersn: "",
				addressMobile: "",
				addressRealname: "",
				orderTypesChecked: 8,	 //8表示待审核的代客下单订单
				ordersType: "",
				pageIndex: isGetMore ? this.data.pageIndex + 1 : this.data.pageIndex,
				pageSize: this.data.pageSize,
				selected_products_type: 0,
			}
		}
		fetchApi(this, params).then(res => {
			if (isGetMore) {
				this.data.pageIndex++
			}
			let data = res.data.data.orders;
			this.setData({
				loadStyle: data.length < this.data.pageSize ? 'loadOver' : 'loadMore',
				orderList: isGetMore ? this.data.orderList.concat(data) : data,
			})
			this.setData({
				showStyle: this.data.orderList.length == 0 ? 2 : 1
			})
		}).catch(err => {
			console.log(err, 'errr')
			this.setData({
				showStyle: 3
			})
		})
	}
})