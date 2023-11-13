const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    showToast,
    deepClone
} from "../../utils/util";
Page({

    /** 
     * 页面的初始数据
     */
    data: {
			freeMailImageUrl: 'https://facing-1256908372.file.myqcloud.com//image/20181130/413a04116d91fa5d.png',
			array: ['拍下立减库存', '下单立减库存', '永不减少库存'],
			delectWay: '拍下立减库存',
			limitNum: 0,
			// 快递信息
			SettingList: [],
			issendfree: '',
			Setting: [],
			addGoods: [],
			change_reduce_total_type_open: false,
			change_spec_open: false,
			change_total_open: false,
			change_express_open: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var addGoods = JSON.parse(options.addGoods)
        this.setData({
            addGoods: addGoods,
            isShowPrice: options.isShowPrice || ''
        })
				this.getManageConfig()
        addGoods.length == 1  && this.getSelectGoodsDetail(addGoods[0])

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
        this.init();
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

	getManageConfig() {
			let param = {
				url: app.API_HOST + 'config/getStaffFuncManageSetting',
				data: {}
			}
			fetchApi(this, param).then(res => {
				const data = res.data.data
				this.setData({
					change_reduce_total_type_open: data.change_reduce_total_type_open == 1,
					change_spec_open: data.change_spec_open == 1,
					change_total_open: data.change_total_open == 1,
					change_express_open: data.change_express_open == 1,
				})
			}).catch((err) => {
				console.log(err);

			});
		},

    stockChange(e) {
        const { index } = e.currentTarget.dataset
        const { value } = e.detail
        var temp = "specTable[" + index + "].stock";
        this.setData({
            [temp]: value
        })
    },
    priceChange(e) {
        const { index } = e.currentTarget.dataset
        const { value } = e.detail
        var temp = "specTable[" + index + "].productprice";
        this.setData({
            [temp]: value
        })
    },

    cartesianProductOf(args) {
        return args.reduce((a, b) => {
            let ret = [];
            a.forEach(a => {
                b.forEach(b => {
                    ret.push(a.concat([b]));
                });
            });
            return ret;
        }, [[]]);
    },
    generateTableData() {
        let tableData = [];
        console.log(this.data.newSpec,'this.data.newSpec')
        let specItems = this.data.newSpec.map(spec => {
            return spec.specItem.map(i => i.title);
        });

        this.cartesianProductOf(specItems).forEach(item => {
            let tableItem = {};
            item.forEach((name, index) => {
                let key = this.data.newSpec[index].name;
                let value = name;
                tableItem[key] = value;
            });
            tableItem.title = item.join('+');
            tableItem.stock = '';
            tableItem.productprice = '';
            tableItem.marketprice = '';
            tableItem.weight = '0';
            tableItem.sales = '0';
            tableItem.thumb = {};

            tableData.push(tableItem);
        });

        return tableData;
    },

    getSelectGoodsDetail(id) {
        let param = {
            url: app.API_HOST + 'goods/detail',
            data: {
                id
            }
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data;
            if (data.hasOption == 1) {
                let specs = [];
                for (var i = 0; i < data.specs.types.length; i++) {
                    let spec = data.specs.types[i];
                    specs.push({
                        name: spec.title,
                        id: spec.id, 
                        specItem: spec.items
                    }); 
                }
                console.log(specs, 'specs')
                console.log(deepClone(specs), 'deepClone(specs)')
                
                this.data.newSpec = deepClone(specs)
                this.setData({
                    specs: specs,
                    specTable: this.generateTableData(),
                    specTableVisible: true
                })
                for (var i = 0; i < this.data.specTable.length; i++) {
                    this.data.specTable[i].id = data.specs.options[i].id;
                    this.data.specTable[i].productprice = data.specs.options[i].productprice;
                    this.data.specTable[i].stock = data.specs.options[i].stock;
                }
                this.setData({
                    specTable: this.data.specTable
                })
            }
        })

    },

    init() {
        // let saveGoodsData = JSON.parse(this.data.goodsInfo.express_list)
        this.getShopExpress().then(() => {
            let express_list = []


            this.data.Setting.forEach((item, index) => {
                express_list.forEach((good, goodIndex) => {
                    if (item.code == good.code) {
                        express_list[goodIndex].index = index
                        express_list[goodIndex].setting = this.data.Setting
                    }
                })
            })
            this.setData({
                SettingList: express_list
            })
        })
    },

    save: function () {
        let express_list = []
        if ((this.data.limitNum * 1) <= 0) {
            showTips('库存应大于0',this)
            return;
        }
        if (!this.data.issendfree) {
            if (this.data.SettingList.length == 0) {
                showTips('请添加快递',this)
                return;
            }
            for (let item of this.data.SettingList) {
                if (item.index == -1) {
                    showTips('请选择分类',this)
                    return;
                }
                if (!item.price || item.price == '') {
                    showTips('请输入快递价格',this)
                    return;
                }
            }
            express_list = this.data.SettingList.map((item, index) => {
                let obj = {}
                obj = item.setting[item.index]
                obj.price = item.price
                return obj
            })
        }
        var options = '' 
        if (this.data.specTableVisible) {
            options = deepClone(this.data.specTable);
            options.forEach(item => {
                let title = this.data.specs.map(i => i.name).reduce((prev, curr) => {
                    prev.push(item[curr]);
                    delete item[curr];
                    return prev;
                }, []).join('+');
                item.title = title;
                item.thumb_id = item.thumb && item.thumb.id;
                item.id = 0;   //重置id为0, 后端要用
                delete item.thumb;
            });
            options = JSON.stringify(options)
        }
        const params = {
            url: app.API_HOST + "CardGoods/saveCardSelectedProducts",
            data: {
							goodsIds: this.data.addGoods.join(),
							total: this.data.limitNum,
							totalcnf: this.data.array.indexOf(this.data.delectWay),
							isSendFree: this.data.issendfree ? 1 : 0,
							expressList: express_list,
							price: this.data.price,
							options: options
            }
        }
        fetchApi(this, params).then(res => {
            let that = this
            wx.showModal({
                title: '保存成功',
                content: '是否将这些商品上架售卖？',
                cancelText: '暂不上架',
                confirmText: '统一上架',
                success(res) {
                    if (res.confirm) {
                        const params = {
                            url: app.API_HOST + "CardGoods/batchSelectedGoodsUp",
                            data: {
                                goodsIds: that.data.addGoods.join()
                            }
                        }
                        fetchApi(that, params).then(res => {
                            wx.showToast({
                                title: '上架成功!',
                                icon: 'success',
                                duration: 1500,
                                success: function () {
                                    wx.navigateBack({
                                        delta: 2
                                    })
                                }
                            })
                        }).catch(err => {
                            throw err
                        })

                    } else if (res.cancel) {
                        wx.navigateBack({
                            delta: 2
                        })
                    }
                }
            })
        }).catch(err => {
            throw err
        })
    },
    pickerMyChange: function (e) {
        this.setData({
            delectWay: this.data.array[e.detail.value]
        })
    },
    handlechangeMailWay: function (e) {
        this.setData({
            issendfree: e.detail.value
        })
    },
    changeMyPrice: function (e) {
        this.setData({
            price: e.detail.value
        })
    },
    changeLimitNum: function (e) {
        this.setData({
            limitNum: e.detail.value
        })
    },


    // 快递
    bindPickerChange: function (e) {
        let value = e.detail.value
        let index = e.currentTarget.dataset.index
        let flag = false
        this.data.SettingList.map(item => {
            if (item.index == value) {
                showTips('快递出现重复，请选择不同的快递设置',this)
                this.data.SettingList[index].index = -1
                flag = true
            }
        })
        if (!flag) {
            this.data.SettingList[index].index = value
        }
        this.setData({
            SettingList: this.data.SettingList
        })
    },
    changePrice(e) {
        let value = e.detail.value
        let index = e.currentTarget.dataset.index
        this.data.SettingList[index].price = value
        this.setData({
            SettingList: this.data.SettingList
        })
    },
    delSetting(e) {
        let index = e.currentTarget.dataset.index
        this.data.SettingList.splice(index, 1)
        this.setData({
            SettingList: this.data.SettingList
        })
    },
    addSetting() {
        this.data.SettingList.push({
            setting: this.data.Setting,
            index: -1,
        })
        this.setData({
            SettingList: this.data.SettingList
        })
    },
    getShopExpress() {
        let that = this
        return new Promise(function (resolve, reject) {
            let params = {
                url: app.API_HOST + "CardGoods/getShopExpress",
                data: {

                }
            }
            fetchApi(this, params).then(res => {
                let data = res.data.data
                that.data.Setting = data.map(item => {
                    return { name: item.name, code: item.code }
                })
                // that.setData({
                //     Setting: that.data.Setting
                // })
                resolve(res);
            }).catch(err => {
                reject(err)
            })
        })
    }
})