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
        array: ['拍下立减库存','付款减库存','永不减少库存'],
        delectWay: '',
        goodsInfo: {},
        limitNum: '',
        price: '',
        sales: '',
        // 快递信息
        SettingList: [],
        issendfree: '',
        Setting: [],
        isShowPrice: '',
				change_reduce_total_type_open: false,
				change_spec_open: false,
				change_total_open: false,
				change_express_open: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const goodsInfo = JSON.parse(options.params);
        const {array} = this.data
        this.setData({
            goodsInfo: goodsInfo,
            isShowPrice: options.isShowPrice == 1,
            delectWay: array[parseInt(goodsInfo.totalcnf || 0)],
            price: goodsInfo.price,
            limitNum: goodsInfo.total,
            issendfree: goodsInfo.issendfree != 0,
            sales: goodsInfo.sales
            // SettingList: goodsInfo.express_list ? JSON.parse(goodsInfo.express_list) : []
        })
        this.init();
				this.getManageConfig()
        if (goodsInfo.hasoption == 1) {
            this.editSpecs()
        }
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
        console.log(e, 'e')
        const { index } = e.currentTarget.dataset
        const { value } = e.detail
        var temp = "specTable[" + index + "].stock";
        this.setData({
            [temp]: value
        })
    },

    priceChange(e) {
        console.log(e, 'e')
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
        console.log(this.data.newSpec, 'this.data.newSpec')
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

    editSpecs() {
        let specs = [];
        var goodsInfo = this.data.goodsInfo;
        for (var i = 0; i < goodsInfo.specs.types.length; i++) {
            let spec = goodsInfo.specs.types[i];
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
            this.data.specTable[i].id = goodsInfo.specs.options[i].id;
            this.data.specTable[i].productprice = goodsInfo.specs.options[i].productprice;
            this.data.specTable[i].stock = goodsInfo.specs.options[i].stock;
        }
        this.setData({
            specTable: this.data.specTable
        })
    },

    init: function(){
        let SettingList = []
        try {
            if (this.data.goodsInfo.express_list) SettingList = JSON.parse(this.data.goodsInfo.express_list)
        } catch(err) {
            console.log('error: ', err)
        }
        this.getShopExpress().then(res => {
            const { data } = res.data
            if (!data.length) {
                this.notSetYet()
                return
            }
            const Setting = data.map((i, n) => {
                const {name, code} = i
                const index = SettingList.findIndex(item => i.code === item.code)
                if (index >= 0) SettingList[index].index = n
                return {name, code}
            })
            this.setData({
                SettingList,
                Setting
            })
        })



    },

    notSetYet: function() {
        wx.showModal({
            title: '提示',
            content: '企业暂未设置快递列表，商品仅可包邮',
            showCancel: false,
            success: () => {
                this.setData({
                    issendfree: true
                })
            }
        })

    },

    save: function(){
            let express_list = []
            if (!this.data.issendfree) {
                if (this.data.SettingList.length == 0) {
                    showTips('请添加快递', this)
                    return;
                }
                for (let item of this.data.SettingList) {
                    if (item.index == -1) {
                        showTips('请选择分类', this)
                        return;
                    }
                    if (item.price === '' || !item.price && Number(item.price) !== 0) {
                        showTips('请输入快递价格', this)
                        return;
                    }
                }
                express_list = this.data.SettingList.map(i => {
                    const {price, name, code} = i
                    return {
                        price: Number(price),
                        name,
                        code
                    }
                })
            }
            if(this.data.isShowPrice){
                if((this.data.price*1).toFixed(2) != (this.data.price*1) || (this.data.price*1) < 0){
                    showTips('价格为不多于两位小数的正数', this)
                            return;
                }
            }
            if((this.data.limitNum*1)<0){
                showTips('库存不能小于0', this)
                        return;
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
                    delete item.thumb;
                });
                options = JSON.stringify(options)
            }
            let params = {
                url: 'CardGoods/saveSelectedProducts',
                data: {
                    id: this.data.goodsInfo.goods_id,
                    price: this.data.price,
                    total: this.data.limitNum,
                    expressList: express_list,
                    totalcnf: this.data.array.indexOf(this.data.delectWay),
                    isSendFree: this.data.issendfree ? 1 : 0,
                    sales: this.data.sales,
                    options: options
                }
            }
            fetchApi(this, params).then(res => {
                wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 1500
                })
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 1500)
            }).catch(err => {
                console.log('error: ', err)
            })
    },
    pickerMyChange: function(e) {
        this.setData({
          delectWay: this.data.array[e.detail.value]
        })
      },
    handlechangeMailWay: function(e){
        this.setData({
            issendfree: e.detail.value
        })
    },
    changeMyPrice: function(e){
        this.setData({
            price: e.detail.value
        })
    },
    changeLimitNum: function(e){
        this.setData({
            limitNum: e.detail.value
        })
    },
    changeSales: function (e) {
        this.setData({
            sales: e.detail.value
        })
    },

    // 快递
    bindPickerChange: function (e) {
        const value = parseInt(e.detail.value)
        const {index} = e.currentTarget.dataset
        const {SettingList, Setting} = this.data
        const hasIndex = SettingList.findIndex((i, n) => i.index == value && index != n)
        if (hasIndex >= 0) {
            showTips('快递出现重复，请选择不同的快递设置', this)
            SettingList[index].index = -1
        } else {
            SettingList[index].index = value
            SettingList[index].name = Setting[value].name
            SettingList[index].code = Setting[value].code
        }
        this.setData({
            SettingList
        })
    },
    changePrice(e) {
        const {value} = e.detail
        const {index} = e.currentTarget.dataset
        this.data.SettingList[index].price = value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1')
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
        const {SettingList} = this.data
        this.setData({
            SettingList: SettingList.concat({
                index: -1, 
                name: '', 
                code: '',
                price: ''
            })
        })
    },
    getShopExpress: function() {
        return new Promise((resolve, reject) => {
            const params = {
                url: app.API_HOST + "CardGoods/getShopExpress",
                data: {
                    
                }
            }
            fetchApi(this, params).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err)
            })
        })
    }
})  