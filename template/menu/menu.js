const app = getApp();
import {
    fetchApi, addActionLog
} from '../../api/api.js';
import {
    nav,
    showLoading,
    deepClone,
    getSum,
    showModal,
    showTips
} from '../../utils/util';
// 2 => '店内点单';
// 3 => '外卖';
// 4 => '流水订单';
export default function menu() {
    return {
        data: {
            extConfig: app.extConfig,
            couponUrl: 'https://facing-1256908372.file.myqcloud.com//image/20171221/b3497207424704a5.png',
            cartHeightStyle: '',
            showStyle: 0,
            startPrice: null,
            shopInfo: {
                shopName: '',
                address: '--',
                cropUrl: '',
                announcement: '--',
                isOpen: 1
            },
            bridge: {},
            goodsList: [],
            scrollDown: false,
            cartList: [],
            showCartDetail: false,
            menuType: 0, //初始化
            coupon: null,
            mainColor: app.extConfig.themeColor,
            classifyViewed: 'view_0',
            classifySeleted: 'view_0',
            showModalSpec: false,
            title: "小炒肉",
            price: "12.00",
            thumb_url: "https://facing-1256908372.file.myqcloud.com//image/20180314/c51b3ec2d48dbb3f.png",
            checkGoods: {},
            selectedSpec: {},
            menuSetting: {
                "留言": {},
                "个人中心": {},
                "管理中心": {}
            }
        },
        dataStore: {
            goodsList: [],
            couponHeight: 0,
            path: '',
            startTime: 0,
        },
        onLoad: function (options) {
            //扫餐桌码进入
            if (options.beid) {
                app.globalData.beid = options.beid;
            }
            if (options.deskNum) {
                app.globalData.tableNum = options.deskNum;
            }
            if (options.cardId) {
                app.globalData.cardId = options.cardId || 0;
                app.globalData.fromUser = options.fromUser || 0;
                if (app.tabBarPath.indexOf("/pages/takeAwayMenu/takeAwayMenu") == -1) {
                    this.setData({
                        isFromShare: true
                    })
                    this.getCardInfo()
                }
            }
            showLoading();
            getInitData(this);
            getCouponList(this);

        },
        onReady: function () {
            try {
                var res = wx.getSystemInfoSync();
                var cartHeight = parseInt(res.windowHeight * 0.7);
                this.setData({
                    cartHeightStyle: `max-height:${cartHeight}px`
                })
            } catch (e) {
                // Do something when catch error
            }

        },
        onShow: function () {
            this.dataStore.startTime = new Date().getTime();
            if (app.globalData.meunNeedRefresh == 1) {
                getCouponList(this);
                app.globalData.meunNeedRefresh = 0;
            }
            let shopInfo = this.data.shopInfo;
            if (shopInfo.shopName != '') {
                wx.setNavigationBarTitle({
                    title: shopInfo.shopName
                });
            }
            let cartList = app.globalData.cartList,
                bridge = {};
            if (this.data.goodsList.length > 0) {
                for (let i = 0; i < cartList.length; i++) {
                    let key = '_' + cartList[i].goodsId;
                    if (cartList[i].hasOption == 1) {
                        key = cartList[i].selectedSpec.id
                    }
                    bridge[key] = {
                        num: cartList[i].addNum
                    };
                }
                this.setData({
                    cartList, bridge
                })
            }

        },
        onHide: function () {
            addActionLog(this, {
                type: 31,
                detail: {
                    duration: new Date().getTime() - this.dataStore.startTime,
                }
            })
            app.globalData.cartList = this.data.cartList;
        },
        onUnload: function () {
            // app.globalData.cartList = [];

        },
        onPullDownRefresh: function () {
            showLoading();
            getInitData(this);
            getCouponList(this);
            if (this.data.fromShare) {
                this.getCardInfo();
            }
            this.setData({
                pageRefresh: new Date().getTime()
            });
        },
        onReachBottom: function () { },
        onShareAppMessage: function () {
            return {
                title: this.data.shopInfo.shopName,
                path: `${this.dataStore.path}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
                success: function (res) {
                    // 转发成功
                },
                fail: function (res) {
                    // 转发失败
                }
            }
        },
        tapClassify: function (e) {
            let goodsList = this.data.goodsList;
            var index = parseInt(e.currentTarget.dataset.index);

            this.setData({
                classifyViewed: goodsList[index].viewId
            });
            var self = this;
            setTimeout(function () {
                self.setData({
                    classifySeleted: goodsList[index].viewId
                });
            }, 100);
        },
        onGoodsScroll: function (e) {
            if (e.detail.scrollTop > 10 && !this.data.scrollDown) {
                this.setData({
                    scrollDown: true
                });
            }
            let goodsList = this.data.goodsList;
            let scrollTop = e.detail.scrollTop,
                h = this.dataStore.couponHeight,
                classifySeleted = this.data.classifySeleted,
                len = this.data.goodsList.length;
            for (var i = 0; i < goodsList.length; i++) {
                var _h = 35 + goodsList[i].goods.length * 90;
                if (scrollTop >= h && scrollTop < h + _h) {
                    classifySeleted = goodsList[i].viewId;
                    break;
                }
                h += _h;
            }
            if (classifySeleted != this.data.classifySeleted) {
                this.setData({
                    classifySeleted: classifySeleted
                });
            }

        },
        showHeader() {
            this.setData({
                scrollDown: false
            });
        },
        showSpec(e) {
            let goodsList = this.data.goodsList;
            let classifyIndex = parseInt(e.currentTarget.dataset.classifyIndex),
                goodsIndex = parseInt(e.currentTarget.dataset.goodsIndex),
                selectedSpec = {
                    id: 0,
                    title: ''
                },
                specId = [];
            let checkGoods = deepClone(goodsList[classifyIndex].goods[goodsIndex]);
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
        },
        closeModalSpec() {
            this.setData({
                showModalSpec: false
            })
        },
        stop() {

        },
        specAddCart() {
            let cartList = this.data.cartList,
                checkGoods = this.data.checkGoods,
                selectedSpec = deepClone(this.data.selectedSpec),
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
        tapAddCart: function (e) {
            let goodsList = this.data.goodsList,
                classifyIndex = parseInt(e.currentTarget.dataset.classifyIndex),
                goodsIndex = parseInt(e.currentTarget.dataset.goodsIndex),
                noSame = true,
                cartList = this.data.cartList,
                bridge = this.data.bridge;
            let goods = goodsList[classifyIndex].goods[goodsIndex];
            let key = '_' + goods.id.toString();
            if (goods.total == 0) {
                showTips('该菜品已售罄，请选购其他商品吧~~', this)
                return;
            }
            if (bridge[key]) {
                if (bridge[key].num >= goods.total) {
                    showTips('该菜品库存不足啦，请选购其他商品吧~~', this)
                    return;
                }
                bridge[key].num += 1;
            } else {
                bridge[key] = {
                    num: 1
                }
            }
            for (var i = 0; i < cartList.length; i++) {
                if (cartList[i].goodsId == goods.id) {
                    cartList[i].addNum += 1;
                    noSame = false;
                    break;
                }
            }
            if (noSame) {
                let item = {
                    title: goods.title,
                    goodsId: goods.id,
                    url: goods.thumb_url,
                    price: goods.price,
                    hasOption: 0,
                    addNum: 1,
                    total: goods.total
                }
                cartList.push(item);
            }

            app.globalData.cartList = cartList;
            this.setData({
                cartList: cartList,
                bridge: bridge
            });

        },

        tapReduceCart(e) {
            let goodsList = this.data.goodsList,
                classifyIndex = parseInt(e.currentTarget.dataset.classifyIndex),
                goodsIndex = parseInt(e.currentTarget.dataset.goodsIndex),
                noSame = true,
                cartList = this.data.cartList,
                bridge = this.data.bridge;
            let goods = goodsList[classifyIndex].goods[goodsIndex];
            for (var i = 0; i < cartList.length; i++) {
                if (cartList[i].goodsId == goods.id) {
                    let key = '_' + goods.id.toString();
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
            app.globalData.cartList = cartList;
            this.setData({
                cartList: cartList,
                bridge: bridge
            });

        },

        reduceCartList(e) {
            let cartList = this.data.cartList,
                index = parseInt(e.currentTarget.dataset.index),
                bridge = this.data.bridge;

            cartList[index].addNum -= 1;

            let key = '_' + cartList[index].goodsId;
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
            app.globalData.cartList = cartList;
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

            let key = '_' + cartList[index].goodsId;
            if (cartList[index].hasOption == 1) {
                key = cartList[index].selectedSpec.id;
            }
            if (bridge[key]) {
                bridge[key].num += 1;
            }
            app.globalData.cartList = cartList;
            this.setData({
                cartList: cartList,
                bridge: bridge
            });

        },
        cleanCartList() {
            showModal({
                title: '提示',
                content: '是否清空购物车',
                showCancel: true
            }).then(res => {
                app.globalData.cartList = [];
                this.setData({
                    cartList: [],
                    showCartDetail: false,
                    bridge: {}
                })
            })
        },
        showCartDetail: function () {
            if (this.data.cartList.length > 0) {
                this.setData({
                    showCartDetail: !this.data.showCartDetail
                });
            }

        },
        hideCartDetail: function () {
            this.setData({
                showCartDetail: false
            });
        },
        placeOrder(e) {
            nav({
                url: '/pages/confirmMenuOrder/confirmMenuOrder',
                data: {
                    menuType: this.data.menuType
                }
            })
        },
        receiveCoupons() {
            wx.navigateTo({
                url: '/pages/receiveAllCoupon/receiveAllCoupon?from=menu'
            });
        },
        showAnnouncement() {
            let announcement = this.data.shopInfo.announcement;
            if (announcement) {
                wx.showModal({
                    title: '公告',
                    content: announcement,
                    showCancel: false
                })
            }
        },
        getCardInfo() {
            let param = {
                url: 'card/getCardInfo',
                data: {
                    cardId: app.globalData.cardId,
                }
            }
            fetchApi(this, param).then(res => {
                this.setData({
                    cardInfo: {
                        avatar: res.data.data.avatar_url,
                        name: res.data.data.name,
                        position: res.data.data.position,
                    },
                    fromShare: true
                })
            }).catch(res => {
                console.log(res);
            });
        },
    };

    function getInitData(self) {
        let param = {
            url: app.API_HOST + 'foodIndex/foodList',
            data: {}
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
                self.setData({
                    bridge, cartList
                })
            }
        }


        fetchApi(self, param).then((res) => {
            let data = res.data.data,
                shopInfo = data.shopInfo,
                goodsList = data.goodsList,
                deliveryInfo = data.deliveryInfo,
                startPrice = 0;
            wx.setNavigationBarTitle({
                title: shopInfo.shopName
            });
            if (deliveryInfo != null) {
                app.globalData.deliveryPrice = deliveryInfo.deliveryPrice;
                self.setData({
                    startPrice: parseFloat(deliveryInfo.startPrice)
                });
            }
            goodsList = goodsList.map(function (item) {
                item.viewId = 'view_' + item.id;
                item.goods = item.goods.map(function (itemChild) {
                    itemChild.addNum = 0;
                    // itemChild.total = 10;
                    return itemChild;
                })
                if (item.goods.length == 0) {
                    item.goods = [{
                        id: -1,
                        title: '暂无该菜品'
                    }]
                }
                return item;
            });
            self.setData({
                showStyle: 1,
                shopInfo: shopInfo,
                goodsList: goodsList
            });

        }).catch(err => {
            self.setData({
                showStyle: 3
            })
        })
    }
}

function getCouponList(self) {
    let param = {
        url: app.API_HOST + 'coupon/couponsOfShop',
        data: {
            received: 0
        }

    }
    fetchApi(self, param).then((res) => {
        var data = res.data.data;
        if (data.length == 0) {
            self.dataStore.couponHeight = 0;
            self.setData({
                coupon: null
            })
            return;
        }
        if (data.length == 1) {
            self.dataStore.couponHeight = 70;
            self.setData({
                coupon: {
                    cutdown: data[0].cutdown,
                    des: '消费满' + data[0].sale_to + '可用'
                }
            })
            return;
        }
        if (data.length > 1) {
            self.dataStore.couponHeight = 70;
            var cutdown = getSum(data, 'cutdown');
            self.setData({
                coupon: {
                    cutdown: cutdown,
                    des: '共' + data.length + '张优惠券'
                }
            });
        }
    }).catch((e) => {
        console.log('获取优惠券列表错误: ', e)
    })
}