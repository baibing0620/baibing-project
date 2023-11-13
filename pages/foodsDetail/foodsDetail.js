const app = getApp();
import {
    fetchApi, addActionLog
} from '../../api/api';
import {
    showLoading,
    previewImageList,
    getSum,
    showModal,
    nav,
    deepClone,
    showTips, 
    shareParam
} from '../../utils/util';
Page({
    data: {
        headerColor: app.extConfig.headerColor,
        cartList: [],
        type: 0,
        showCartDetail: false,
        animationData: {},
        cartHeightStyle: '',
        fromPage: '',
        showStyle: 0,
        bridge: {},
        showModalSpec: false,
        id: ''
    },
    dataStore: {
        id: 0,
        ratio: 0,
        animation: '',
        startTime: 0,
    },

    onLoad: function (options) {
        this.dataStore.id = options.id || app.link.id ||  0;
        if (!this.dataStore.id) {
            showModal({
                title: '提示',
                content: '未传入商品id'
            });
            return;
        }
        if (options.beid && app.isMultiShop == 1) {
            app.globalData.beid = options.beid
        }
        if (options.pageId && options.tplId) {
            app.pageId = options.pageId || 0;
            app.tplId = options.tplId || 0;
        }
       
        this.setData({
            id: this.dataStore.id
        })
        if (options.from == 'menu') {
            let fromPage = options.from;
            this.setData({
                fromPage: fromPage,
                menuType: options.menuType
            })
        }
        options.cardId && (app.globalData.cardId = options.cardId || 0)
        options.fromUser && (app.globalData.fromUser = options.fromUser || 0)
        options.cardId && (this.setData({isFromShare: true}))
        if (options.startPrice) {
            this.setData({
                startPrice: parseFloat(options.startPrice)
            })
        }
        getInitData(this)
    },
    getQRCode() {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10);
        let QRcode = `${app.API_HOST}FoodIndex/getQRcode?id=${this.dataStore.id}&${shareParam()}&_t=${qrCodeTime}`;
        wx.previewImage({
            urls: [QRcode]
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.dataStore.animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
        })
        this.setData({
         
          //  open_qr_code: app.globalConfig.funcList.open_qr_code
            
          });

    },
    onShow: function () {
        this.dataStore.startTime = new Date().getTime();
        if (app.globalData.cartList.length == 0) {
            this.setData({
                bridge: {},
                cartList: []
            })
        }

    },
    onShareAppMessage() {
        console.log(`/pages/foodsDetail/foodsDetail?id=${this.dataStore.id}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,1111)
        return {
            title: this.dataStore.title,
            path: `/pages/foodsDetail/foodsDetail?id=${this.dataStore.id}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}&menuType=${this.data.menuType}&from=${this.data.fromPage}`,
        }
    },
    onHide: function () {
        addActionLog(this, {
            type: 32,
            detail: {
                id: this.dataStore.id,
                duration: new Date().getTime() - this.dataStore.startTime,
                name: this.data.goods.title
            }
        })
        app.globalData.cartList = this.data.cartList;
    },
    onUnload: function () {
        addActionLog(this, {
            type: 32,
            detail: {
                id: this.dataStore.id,
                duration: new Date().getTime() - this.dataStore.startTime,
                name: this.data.goods.title
            }
        })
        app.globalData.cartList = this.data.cartList;
    },

    onPullDownRefresh() {
        getInitData(this);
    },

    closeModalSpec() {
        this.setData({
            showModalSpec: false
        })
    },
    stop() {

    },
    showCartDetail: function () {
        if (this.data.cartList.length > 0) {
            this.setData({
                showCartDetail: !this.data.showCartDetail
            });
        }
    },
    cleanCartList() {
        let self = this;
        showModal({
            title: '提示',
            content: '是否清空购物车',
            showCancel: true
        }).then(res => {
            app.globalData.cartList = [];
            this.setData({
                showCartDetail: false,
                cartList: [],
                bridge: {}
            })
        })
    },
    reduceCartList(e) {
        let cartList = this.data.cartList,
            index = parseInt(e.currentTarget.dataset.index),
            bridge = this.data.bridge;
        cartList[index].addNum -= 1;

        let key = '';
        if (cartList[index].hasOption == 1) {
            key = cartList[index].selectedSpec.id;
        }

        if (bridge[key]) {
            bridge[key].num -= 1;
        }
        if (cartList[index].addNum <= 0) {
            cartList.splice(index, 1);
            delete bridge[key];
        }
        this.setData({
            cartList: cartList,
            bridge: bridge
        });
        if (this.data.cartList.length == 0) {
            this.setData({
                showCartDetail: false
            })
        }
    },
    addCartList(e) {
        let cartList = this.data.cartList,
            index = parseInt(e.currentTarget.dataset.index),
            bridge = this.data.bridge;
        if (cartList[index].addNum >= cartList[index].total) {
            showTips('该菜品库存不足啦，请选购其他商品吧~~', this)
            return;
        }
        cartList[index].addNum += 1;

        let key = '';
        if (cartList[index].hasOption == 1) {
            key = cartList[index].selectedSpec.id;
        }
        if (bridge[key]) {
            bridge[key].num += 1;
        }
        this.setData({
            cartList: cartList,
            bridge: bridge
        });
    },
    tapAddCart(e) {
        let goods = this.data.goods;
        if (goods.total == 0) {
            showTips('该菜品已售罄，请选购其他商品吧~~', this)
            return;
        }
        if (goods.hasOption == 1) {
            let checkGoods = deepClone(goods),
                selectedSpec = {
                    id: 0,
                    title: ''
                },
                specId = [];
          checkGoods.spec.types.sort(function (a, b) {
            return parseInt(a.id) - parseInt(b.id)
          });
            checkGoods.spec.types.map(typeItem => {
                typeItem.items.map((item, itemIndex) => {
                    if (itemIndex == 0) {
                        item.isSelected = true;
                        selectedSpec.title += `${item.title}+`;
                        specId.push(item.id);
                    } else {
                        item.isSelected = false;
                    }
                })
            });
            selectedSpec.title = selectedSpec.title.replace(/\+$/, '');
            selectedSpec.id = specId.sort(function (a, b) {
                return a - b
            }).join('_');
          for (let i = 0; i < checkGoods.spec.options.length; i++) {
            if (checkGoods.spec.options[i].specs == selectedSpec.id) {
              selectedSpec.optionId = checkGoods.spec.options[i].id;
              break;
            }
          }
            this.setData({
                showModalSpec: true,
                checkGoods: checkGoods,
                selectedSpec: selectedSpec
            })
            return;
        };
        let Y = parseInt(e.detail.y);
        let noSame = true;
        let cartList = this.data.cartList;
        for (var i = 0; i < cartList.length; i++) {
            if (cartList[i].goodsId == this.dataStore.id) {
                if (cartList[i].addNum >= goods.total) {
                    showTips('该菜品库存不足啦，请选购其他商品吧~~', this)
                    return;
                }
                cartList[i].addNum += 1;
                noSame = false;
            }
        }
        if (noSame) {
            let item = {
                title: goods.title,
                goodsId: goods.id,
                url: goods.thumb_url,
                price: goods.price,
                hasOption: goods.hasOption,
                specs: goods.specs,
                addNum: 1,
                total: goods.total
            }
            cartList.push(item);
        }
        app.globalData.cartList = cartList;
        this.setData({
            cartList: cartList,
            hideRedDot: false
        });
        this.dataStore.animation.scale(1.5).translateY(Y).opacity(1).step().opacity(0).scale(1).translateY(0).step();
        this.setData({
            animationData: this.dataStore.animation.export()
        });
    },
    hideCartDetail: function () {
        this.setData({
            showCartDetail: false
        });
    },
    placeOrder() {
        nav({
            url: '/pages/confirmMenuOrder/confirmMenuOrder',
            data: {
                menuType: this.data.menuType || 0
            }
        })
    },
    specAddCart() {
        let cartList = this.data.cartList,
            checkGoods = this.data.checkGoods,
          selectedSpec = deepClone(this.data.selectedSpec) ,
            bridge = this.data.bridge,
            noSame = true;

        for (let i = 0; i < cartList.length; i++) {
            if (cartList[i].goodsId == checkGoods.id) {
                if (cartList[i].selectedSpec && cartList[i].selectedSpec.id == selectedSpec.id) {
                    cartList[i].addNum += 1;
                    noSame = false;
                    break;
                }

            }
        }
        if (noSame) {
            let item = {
                title: checkGoods.title,
                goodsId: checkGoods.id,
                selectedSpec: selectedSpec,
                url: checkGoods.thumb_url,
                hasOption: checkGoods.hasOption,
                price: checkGoods.price,
                addNum: 1,
            }
            cartList.push(item);
        }

        let key = selectedSpec.id.toString();
        if (bridge[key]) {
            bridge[key].num += 1;
        } else {
            bridge[key] = {
                num: 1
            }
        }
        app.globalData.cartList = cartList;
        this.setData({
            cartList: cartList,
            bridge: bridge
        });
    },
    specReduceCart() {
        let cartList = this.data.cartList,
            checkGoods = this.data.checkGoods,
            selectedSpec = this.data.selectedSpec,
            bridge = this.data.bridge;
        for (let i = 0; i < cartList.length; i++) {
            if (cartList[i].goodsId == checkGoods.id) {
                if (cartList[i].selectedSpec && cartList[i].selectedSpec.id == selectedSpec.id) {
                    let key = selectedSpec.id.toString();
                    cartList[i].addNum -= 1;
                    bridge[key].num -= 1;
                    if (cartList[i].addNum <= 0) {
                        cartList.splice(i, 1);
                        bridge[key] = null;
                        delete bridge[key];
                    }
                    break;
                }
            }
        }
        app.globalData.cartList = cartList;
        this.setData({
            cartList: cartList,
            bridge: bridge
        });
    },
    selectSpecItem(e) {
        let itemsIndex = parseInt(e.currentTarget.dataset.itemsIndex),
            typesIndex = parseInt(e.currentTarget.dataset.typesIndex),
            checkGoods = this.data.checkGoods,
            selectedSpec = this.data.selectedSpec;
        let itemsId = selectedSpec.id.split('_'),
            specTitles = selectedSpec.title.split('+');
        selectedSpec.title = '';
        itemsId[typesIndex] = checkGoods.spec.types[typesIndex].items[itemsIndex].id;
        specTitles[typesIndex] = checkGoods.spec.types[typesIndex].items[itemsIndex].title;
        specTitles.map((item, index) => {
            selectedSpec.title += `${item}+`;
        })
        selectedSpec.id = itemsId.sort(function (a, b) {
            return a - b
        }).join('_');
      for (let i = 0; i < checkGoods.spec.options.length; i++) {
        if (checkGoods.spec.options[i].specs == selectedSpec.id) {
          selectedSpec.optionId = checkGoods.spec.options[i].id;
          break;
        }
      }
      
        checkGoods.spec.types[typesIndex].items.map(item1 => {
            item1.isSelected = false;
        })
        checkGoods.spec.types[typesIndex].items[itemsIndex].isSelected = true;

        selectedSpec.title = selectedSpec.title.replace(/\+$/, '');
        this.setData({
            checkGoods: checkGoods,
            selectedSpec: selectedSpec
        });
    },

});

function getInitData(self) {
    let param = {
        url: app.API_HOST + 'goods/detail',
        data: {
            id: self.dataStore.id
        }
    }
    showLoading();
    fetchApi(self, param).then((res) => {
        let data = res.data.data;
        let goods = {
            id: data.id,
            title: data.title,
            price: data.price,
            thumb_url: data.thumb.thumb.url,
            hasOption: data.hasOption,
            spec: data.specs,
            total: data.total,
            saleState: data.saleState
        }
        let cartList = app.globalData.cartList,
            bridge = {};
        if (cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                let key = '_' + cartList[i].goodsId;
                if (cartList[i].hasOption == 1) {
                    key = cartList[i].selectedSpec.id
                }
                bridge[key] = {
                    num: cartList[i].addNum
                };
            }
            self.setData({
                cartList,
                bridge
            })
        }
        wx.setNavigationBarTitle({
            title: data.title,
        });
        self.setData({
            showStyle: 1,
            goods: goods,
            desc: data.desc,
            sales: data.sales
        })
    }).catch(err => {
        self.setData({
            showStyle: 3
        })
    })
}