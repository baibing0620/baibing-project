// centerControl/chooseCustomer/chooseCustomer.js
const app = getApp();
import {
	fetchApi,
} from '../../api/api';
import {
	nav,
	showToast,
	showTips,
	showModal
} from '../../utils/util';

Page({
 
	/**
	 * 页面的初始数据
	 */
	data: {
		showStyle: 0,
		tabSetting: [{ name: '全部商品'},{name: '我收藏的'}],
		activeIndex: 0,
		goodsList: [],
		keywords: '',
		buyNum: 1,
		openid: '',
		selectedOptionId: 0,
		pickerlist: [{ label: '不限商品', value: -1 }, { label: '个人商品', value: 3 }, { label: '平台商品', value: 1 }, { label: '门店商品', value: 4 }],
		pickerindex: 0
	},

	dataStore: {
		pageIndex: 1,
		pageSize: 10
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getSeriesList()
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
    this.getSeriesList()
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
	
    this.getSeriesList(true)
	},

  navback() {
    wx.navigateBack({})
  },

	bindPickerChange(e) {
		console.log(e ,'e')
		this.setData({
			pickerindex: e.detail.value
		})
    this.dataStore.pageIndex = 1
    this.getReplaceOrderGoods()
	},
	
	toPreview(e) {
		nav({
			url: '/centerControl/goodPreview/goodPreview',
			data: {
				goodsId: e.currentTarget.dataset.id
			}
		})
	},

	stopPro() {},

	closePurchase() {
		this.setData({
			purchaseBox: false,
			goods: {},
			allOptions: [],
			options: [],
			addCartPrice: '',
			addCartStocks: '',
			goodsThumb: '',
			selectedOptionId: 0,
			buyNum: 1,
		})
	},

	chooseGoods(e) {
		let { index } = e.currentTarget.dataset
		const item = this.data.goodsList[index]
		let goods = {
			series_id: item.id,
			id: item.goods.id,
			name: item.series_name
		}
		this.setData({
			goods: goods,
			purchaseBox: true
		})
		// fetchApi(this, params).then((data) => {
		// 	let datas = data.data.data,
		// 		tags = [],
		// 		optionDesc = [],
		// 		goodsThumb = datas.thumb.thumb.url;
		// 	let types = [];
		// 	if (datas.hasOption == 1) {
		// 		types = datas.specs.types;
		// 		for (let i = 0; i < types.length; i++) {
		// 			for (let j = 0; j < types[i].items.length; j++) {
		// 				types[i].items[j].isSelected = false;
		// 			}
		// 		}
		// 	}
		// 	var optionDescType = 0;
		// 	try {
		// 		optionDesc = JSON.parse(datas.optionDesc);
		// 		//判断是否为obj 和存在imgID
		// 		let isNeedObj = typeof (optionDesc) == 'object' && ('imgId' in optionDesc);
		// 		if (isNeedObj) {
		// 			optionDesc = optionDesc.imgUrl;
		// 			optionDescType = '1';
		// 		} else {
		// 			if (datas.optionDesc != '') {
		// 				optionDesc = datas.optionDesc.split("\n");
		// 			}
		// 		}
		// 	} catch (err) {
		// 		if (datas.optionDesc != '') {
		// 			optionDesc = datas.optionDesc.split("\n");
		// 		}
		// 	}

		// 	let goods = {
		// 		id: datas.id,
		// 		title: datas.title,
		// 		price: datas.price,
		// 		marketPrice: datas.marketPrice,
		// 		sales: datas.sales,
		// 		desc: datas.desc ? datas.desc.split('\n') : [],
		// 		istime: datas.istime,
		// 		total: datas.total
		// 	}

		// 	this.setData({
		// 		goods: goods,
		// 		allOptions: datas.hasOption ? datas.specs.options : [],
		// 		options: types,
		// 		addCartPrice: datas.price,
		// 		addCartStocks: datas.total,
		// 		goodsThumb: goodsThumb,
		// 		purchaseBox: true
		// 	})
		// })
	},

  changeBuyNum(e) {
    if (!e.detail.value) {
      showModal({
        title: '提示',
        content: '数量不能为空',
      }).then(_ => {
        this.setData({
          buyNum: this.data.buyNum
        });
      })
      return;
    }
    let num = parseInt(e.detail.value);
   	if (num <= 0) {
      showModal({
        title: '提示',
        content: '不能小于1',
      }).then(_ => {
        this.setData({
          buyNum: 1
        });
      })
    } else {
      this.setData({
        buyNum: num
      });
    }
  },

	changeCartGoodsNum: function (e) {
		let type = e.target.dataset.type,
			num = this.data.buyNum;
		if (type == 'plus') {
      num++;
		} else {
			if (num == 1) {
				showModal({
					title: '提示',
					content: '添加数量不能小于1',
				}).then(_ => { })
			} else {
				num--;
			}
		}
		this.setData({
			buyNum: num
		});
	},

	addGoods () {
		let lastPage = getCurrentPages()[getCurrentPages().length - 2]
		this.data.goods.total = this.data.buyNum
		const index = lastPage.data.goodsList.findIndex(e => e.series_id == this.data.goods.series_id )
		console.log(index, 'indexxx')
		if(index != -1) {
			let total = lastPage.data.goodsList[index].total * 1 +  this.data.goods.total * 1
			let value = `goodsList[${index}].total`
			lastPage.setData({
				[value]: total
			})
		} else {
			lastPage.data.goodsList.push(this.data.goods)
			lastPage.setData({
				goodsList: lastPage.data.goodsList
			})
		}
		

    showToast('选择成功' , 'success', 1500);
    this.closePurchase()
	},



	getSeriesList(isGetMore = false) {
		let param = {
			url: 'order/seriesList',
			data: {
				pageSize: this.dataStore.pageSize,
				pageIndex: isGetMore ? this.dataStore.pageIndex + 1 : this.dataStore.pageIndex
			}
		};
		fetchApi(this, param).then((res) => {
			if (isGetMore) {
				this.dataStore.pageIndex++
			}
			let data = res.data.data;
			this.setData({
				loadStyle: data.length < this.dataStore.pageSize ? 'loadOver' : 'loadMore',
				goodsList: isGetMore ? this.data.goodsList.concat(data) : data,
			})
			this.setData({
				showStyle: this.data.goodsList.length == 0 ? 2 : 1
			})
		}).catch((err) => {
			this.setData({
				showStyle: 3
			})
		})
	},
})