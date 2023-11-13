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
		this.setData({
			openid: options.openid || ''
		})
		this.getReplaceOrderGoods()
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
		if (this.data.activeIndex == 0) {
			this.getReplaceOrderGoods()
		} else {
			this.getlikeGoodsList()
		}
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
		if (this.data.activeIndex == 0) {
			this.getReplaceOrderGoods(true)
		} else {
			this.getlikeGoodsList(true)
		}
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
	
	tabChange(e) {
		if (e.currentTarget.dataset.index == this.data.activeIndex ) {
			return
		}
		this.setData({
			showStyle: 0,
			loadStyle: '',
			keywords: '',
			activeIndex: e.currentTarget.dataset.index,
		})
		this.dataStore.pageIndex = 1
		
		if( this.data.activeIndex == 0 ) {
			this.getReplaceOrderGoods()
		}else {
			this.getlikeGoodsList()
		}

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
		let params = {
			url: app.API_HOST + 'goods/detail',
			data: {
				id: e.currentTarget.dataset.id,
			}
		};
		fetchApi(this, params).then((data) => {
			let datas = data.data.data,
				tags = [],
				optionDesc = [],
				goodsThumb = datas.thumb.thumb.url;
			let types = [];
			if (datas.hasOption == 1) {
				types = datas.specs.types;
				for (let i = 0; i < types.length; i++) {
					for (let j = 0; j < types[i].items.length; j++) {
						types[i].items[j].isSelected = false;
					}
				}
			}
			var optionDescType = 0;
			try {
				optionDesc = JSON.parse(datas.optionDesc);
				//判断是否为obj 和存在imgID
				let isNeedObj = typeof (optionDesc) == 'object' && ('imgId' in optionDesc);
				if (isNeedObj) {
					optionDesc = optionDesc.imgUrl;
					optionDescType = '1';
				} else {
					if (datas.optionDesc != '') {
						optionDesc = datas.optionDesc.split("\n");
					}
				}
			} catch (err) {
				if (datas.optionDesc != '') {
					optionDesc = datas.optionDesc.split("\n");
				}
			}

			let goods = {
				id: datas.id,
				title: datas.title,
				price: datas.price,
				marketPrice: datas.marketPrice,
				sales: datas.sales,
				desc: datas.desc ? datas.desc.split('\n') : [],
				istime: datas.istime,
				total: datas.total
			}

			this.setData({
				goods: goods,
				allOptions: datas.hasOption ? datas.specs.options : [],
				options: types,
				addCartPrice: datas.price,
				addCartStocks: datas.total,
				goodsThumb: goodsThumb,
				purchaseBox: true
			})
		})
	},

	selectSpecItem(e) {
		let specId = e.target.dataset.specId,
			itemId = e.target.dataset.itemId,
			options = this.data.options,
			goodsThumb = this.data.goodsThumb,
			addCartPrice = this.data.addCartPrice,
			addCartStocks = this.data.addCartStocks,
			selectedOptionId = this.data.selectedOptionId,
			allOptions = this.data.allOptions;
		let selectedItems = [];

		for (let i = 0; i < options.length; i++) {
			if (parseInt(options[i].id) == parseInt(specId)) {
				for (let j = 0; j < options[i].items.length; j++) {
					let item = options[i].items[j];
					if (parseInt(item.id) == parseInt(itemId)) {
						options[i].items[j].isSelected = true;
					} else {
						options[i].items[j].isSelected = false;
					}
				}
			}
		}


		for (let i = 0; i < options.length; i++) {
			for (let j = 0; j < options[i].items.length; j++) {
				let item = options[i].items[j];
				if (item.isSelected) {
					selectedItems.push(parseInt(item.id));
				}
			}
		}
		let selectedItemsStr = selectedItems.sort(function (a, b) {
			return a - b
		}).join('_');


		for (let i = 0; i < allOptions.length; i++) {
			let specs = allOptions[i].specs;
			if (specs == selectedItemsStr) {
				addCartPrice = allOptions[i].productprice;
				addCartStocks = allOptions[i].stock;
				selectedOptionId = allOptions[i].id;
				goodsThumb = allOptions[i].option_thumb_url;
				break;
			}
		}

		this.setData({
			options: options,
			addCartPrice: addCartPrice,
			addCartStocks: addCartStocks,
			selectedOptionId: selectedOptionId,
			goodsThumb: goodsThumb,
		});
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
    if (num > this.data.addCartStocks) {
      showModal({
        title: '提示',
        content: '数量不能大于库存',
      }).then(_ => {
        this.setData({
          buyNum: this.data.buyNum
        });
      })

    } else if (num <= 0) {
      showModal({
        title: '提示',
        content: '商品数量不能小于1',
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
			if (num >= this.data.addCartStocks) {
				showModal({
					title: '提示',
					content: '添加数量不能大于库存',
				}).then(_ => { })
			} else {
				num++;
			}
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
		if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
			showModal({
				title: '提示',
				content: '请选择商品的相应的规格。'
			})
		} else {
			let params = {
				url: app.API_HOST + 'cart/add',
				data: {
					beid: app.globalData.beid,
					goodsId: this.data.goods.id,
					optionId: this.data.selectedOptionId,
					total: this.data.buyNum,
					openId: this.data.openid,
					isReplaceOrder: 1
				}
			};
			fetchApi(this, params).then(res => {
				showToast('选择成功' , 'success', 1500);
				this.closePurchase()
			});
		}
	},

	goodsSearch() {
		this.dataStore.pageIndex = 1
		if (this.data.activeIndex == 0) {
			this.getReplaceOrderGoods()
		} else {
			this.getlikeGoodsList()
		}
	},

	changeKeyWords(e) {
		console.log(e, 'eeee')
		this.setData({
			keywords: e.detail.value
		})
	},


	getReplaceOrderGoods(isGetMore = false) {
		let param = {
			url: 'Goods/getReplaceOrderGoods',
			data: {
				pageSize: this.dataStore.pageSize,
				pageIndex: isGetMore ? this.dataStore.pageIndex + 1 : this.dataStore.pageIndex,
				title: this.data.keywords,
        selectedProductsType: this.data.pickerlist[this.data.pickerindex].value
			}
		};
		fetchApi(this, param).then((res) => {
			if (isGetMore) {
				this.dataStore.pageIndex++
			}
			let data = res.data.data.data;
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

	getlikeGoodsList(isGetMore = false) {
		let param = {
			url: 'Goods/likeGoodsList',
			data: {
				pageSize: this.dataStore.pageSize,
				pageIndex: isGetMore ? this.dataStore.pageIndex + 1 : this.dataStore.pageIndex,
				title: this.data.keywords,
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

	toMycollection(e) {
		const { index } = e.currentTarget.dataset;
		var goodsList = this.data.goodsList
		var goodsInfo = this.data.goodsList[index]
		let param = {
			url: app.API_HOST + 'goods/likeGoods',
			data: {
				goodsId: goodsInfo.id
			}
		}

		let param2 = {
			url: app.API_HOST + 'goods/unLikeGoods',
			data: {
				goodsId: this.data.activeIndex == 0 ? goodsInfo.id : goodsInfo.goodsid
			}
		}
	
		fetchApi(this, goodsInfo.isLike == 0 ? param : param2).then(res => {
			if(this.data.activeIndex == 0) {
				goodsList[index].isLike = goodsList[index].isLike == 1 ? 0 : 1
				this.setData({
					goodsList: goodsList
				});
				
			} else {
				goodsList.splice(index, 1)
				this.setData({
					goodsList: goodsList
				});
			}
			showToast('操作成功', 'success', 1500);
		}).catch((err) => {
			// self.setData({
			//     showStyle: 3
			// })
		});


	},
})