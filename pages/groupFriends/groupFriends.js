const app = getApp()
import {
    fetchApi,
    getGlobalConfig
} from '../../api/api.js';
import {
    nav,
    showModal,
    shareParam,
    previewImage,
} from '../../utils/util';
import {
    cutdownTime2
} from '../../comm/time.js';
let groupTimePrivateCutdown = 0;
let getGroupId = 0
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        isMask: '',
        showPost: false,
        QRcode: '',
        QRcodeLoadIf: true,
        posterHeight: 0,
        posterScale: 1,
        buyNum: 1,
        selectedOptionId: 0,
        types: [],
        allOptions: [],
        goodsThumb: '',
        isHeadShop: false,
        phoneNumber: 0,
        noshow: true
    },
    dataStore: {
        gid: 0,
        gbid: 0,
        gbVersion: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.dataStore.gid = options.gid ? options.gid : 0;

        if (options.gbId) { 
            this.dataStore.gbid = options.gbId
        } else if (options.gbid) {
            this.dataStore.gbid = options.gbid
        } else {
            this.dataStore.gbid = 0
        }
        this.dataStore.gbVersion = options.gbVersion ? options.gbVersion : 0;
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
        }
        if (app.globalConfig) {
        } else {
            getGlobalConfig().then(res => {
            
            })
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
        if (this.dataStore.gbid == 0) {
            // 先查团id
            getGroupId = setInterval(() => {
                getUserGroupBuyByGoods(this)
            }, 1000);
        } else {
            getInitData(this);
        }
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
        clearInterval(groupTimePrivateCutdown);
        clearInterval(getGroupId);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        getInitData(this);
    },
    //分享
    onShareAppMessage: function () {
        return this.getShareParams(1);
    },
    /**
     * 获取分享参数，type = 1 分享好友 ，2 分享朋友圈
     */ 
    getShareParams: function (type = 1) {
        if (this.data.invitationGroup) {
            // 分享商品
            return { 
                title: this.data.goods.title,
                path: `/pages/goodsdetail/goodsdetail?goodsId=${this.dataStore.gid}&invitorId=${app.globalData.uid}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
            }
        } else {
            return {
                title: this.data.goods.title,
                path: `/pages/groupFriends/groupFriends?gid=${this.dataStore.gid}&gbId=${this.dataStore.gbid}&invitorId=${app.globalData.uid}&beid=${app.globalData.beid}&gbVersion=1&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
            }
        }
    },
    invitationFriends(e) {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10);
        let QRcode;
     
        QRcode = `${app.API_HOST}groupBuy/getGroubBuyQrCode?gbid=${this.dataStore.gbid}&gid=${this.dataStore.gid}&gbVersion=1&_t=${qrCodeTime}&${shareParam()}&token=${app.globalData.token}&invitorId=${app.globalData.uid}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`

        this.setData({
            QRcode: QRcode,
            showShare: true
        })
    },

    hideMask() {
        this.setData({
            isMask: '',
            showPost: false,
            purchaseBox: false
        });
    },
    toGoodsDetail() {
        nav({
            url: '/pages/goodsdetail/goodsdetail?id=' + this.dataStore.gid
        })
    },
    previewDesImg(e) {
        previewImage(e)
    },
    joinTheLeague() {
        // 参加私密团
        this.setData({
            isgroup: true,
            isMask: 'mask',
            purchaseBox: true,
            bargainDialog: false
        })
    },
    changeCartGoodsNum: function (e) {
        let type = e.target.dataset.type,
            num = this.data.buyNum;
        if (type == 'plus') {
            if (num >= this.data.addCartStocks) {
                showModal({
                    title: '提示',
                    content: '购买数量不能大于库存',
                }).then(_ => { })
            } else {
                num++;
            }
        } else {
            if (num == 1) {
                showModal({
                    title: '提示',
                    content: '添加到购物车中的商品数量不能小于1',
                }).then(_ => { })
            } else {
                num--;
            }
        }
        this.setData({
            buyNum: num
        });
    },
    selectSpecItem(e) {
        let specId = e.target.dataset.specId,
            itemId = e.target.dataset.itemId,
            types = this.data.types,
            selectedItems = [];

        for (let i = 0; i < types.length; i++) {
            if (parseInt(types[i].id) == parseInt(specId)) {
                for (let j = 0; j < types[i].items.length; j++) {
                    let item = types[i].items[j];
                    if (parseInt(item.id) == parseInt(itemId)) {
                        types[i].items[j].isSelected = true;
                    } else {
                        types[i].items[j].isSelected = false;
                    }
                }
            }
        }
        for (let i = 0; i < types.length; i++) {
            for (let j = 0; j < types[i].items.length; j++) {
                let item = types[i].items[j];
                if (item.isSelected) {
                    selectedItems.push(parseInt(item.id));
                }
            }
        }

        let selectedItemsStr = selectedItems.sort(function (a, b) { return a - b }).join('_'),
            goodsThumb = this.data.goodsThumb,
            addCartStocks = this.data.addCartStocks,
            selectedOptionId = this.data.selectedOptionId,
            allOptions = this.data.allOptions;

        for (let i = 0; i < allOptions.length; i++) {
            if (allOptions[i].specs == selectedItemsStr) {
                selectedOptionId = allOptions[i].id;
                goodsThumb = allOptions[i].option_thumb_url;
                addCartStocks = allOptions[i].stock;
            }
        }

        this.setData({
            types: types,
            selectedOptionId: selectedOptionId,
            goodsThumb: goodsThumb,
            addCartStocks: addCartStocks

        });
    },
    changeBuyNum(e) {
        if (!e.detail.value) {
            showModal({
                title: '提示',
                content: '购买数量不能为空',
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
                content: '购买数量不能大于库存',
            }).then(_ => {
                this.setData({
                    buyNum: this.data.buyNum
                });
            })

        }
        else if (num <= 0) {
            showModal({
                title: '提示',
                content: '添加到购物车中的商品数量不能小于1',
            }).then(_ => {
                this.setData({
                    buyNum: 1
                });
            })
        }
        else {
            this.setData({
                buyNum: num
            });
        }
    },
    buyNow() {
        let total = this.data.buyNum,
            types = this.data.types,
            selectedOptionId = this.data.selectedOptionId,
            addCartStocks = this.data.addCartStocks;
        if (total > addCartStocks) {
            wx.showModal({
                title: '提示',
                content: '库存不足,请调整购买数量',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {

                    }
                }
            })
            return
        }

        if (types.length > 0 && selectedOptionId == 0) {
            wx.showModal({
                title: '提示',
                content: '请选择商品的相应的规格。',
                showCancel: false,
                success: function (res) {

                }
            })
        }
        else {
            this.setData({
                showDialog: false
            });
            nav({
                url: '/pages/confirmOrder/confirmOrder',
                data: {
                    goodsId: this.dataStore.gid,
                    gbid: this.dataStore.gbid,
                    optionId: selectedOptionId,
                    total: total,
                    gbVersion: this.dataStore.gbVersion,
                    isGrounp: 1
                }
            })
        }
    },
})

function getInitData(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGroupBuyDetail',
        data: {
            gid: self.dataStore.gid,
            gbid: self.dataStore.gbid
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        if (data.id) {
            self.dataStore.gbid = data.id;
        }
        if (data.goods.is_groupbuy == '1') {
            // 进入之前的拼团页面
            wx.redirectTo({
                url: `/pages/groupDetail/groupDetail?gid=${self.dataStore.gid}&gbid=${self.dataStore.gbid}`
            })
            return
        }
        let types = [],
            goods = {
                thumb_url: data.goods.thumb_url,
                id: data.goods.id,
                title: data.goods.title,
                productprice: data.goods.productprice,
                groupbuy_price: data.goods.groupbuy_price,
                sales: data.goods.sales,
                limit_num: data.goods.limit_num,
                hasoption: data.goods.hasoption
            };
        if (data.goods.hasoption == 1) {
            types = data.goods.specs.types;
            for (var i = 0; i < types.length; i++) {
                for (var j = 0; j < types[i].items.length; j++) {
                    types[i].items[j].isSelected = false;
                }
            }
        }
        // 判断我是否在团中
        let loginInfo = app.globalData.userInfo
        let participate = true
        if (loginInfo.id) {
            // 判断参团还是邀请
            let has = data.users.filter(ele => {
                return ele.uid == loginInfo.id
            })
            if (has.length > 0) {
                participate = false
            }
        }
        let frequency = data.goods.limit_num - data.users.length
        let currentHeadcount = data.users.length
        if (data.users.length > 0) {
            // 人员拼凑
            for (let index = 0; index < frequency; index++) {
                data.users.push({})
            }
        }
        // 判断分享还是邀请
        let invitationGroup = participate
        if (participate) {
            invitationGroup = false
        } else if (data.status == 2 || data.status == 0) {
            invitationGroup = true
        } else {
            invitationGroup = false
        }

        let nowTime = parseInt(new Date().getTime() / 1000);
        let groupbuytimes = [{
            end_time: data.end_time,
            timeShown: '',
            timeType: 0,
            day: 0,
            hr: 0,
            min: 0,
            sec: 0
        }];
        cutdownTime2(nowTime, groupbuytimes);
        groupTimePrivateCutdown = setInterval(function () {
            nowTime++;
            var hasFinishAll = cutdownTime2(nowTime, groupbuytimes);
            self.setData({
                groupbuytimes: groupbuytimes
            })
            if (hasFinishAll) {
                clearInterval(groupTimePrivateCutdown);
            }
        }, 1000);
        console.log('数据types', types)
        self.setData({
            showStyle: 1,
            goodsThumb: data.goods.thumb_url,
            goods: goods,
            endTime: data.end_time,
            addCartStocks: data.goods.total,
            users: data.users,
            expireTime: data.deadline,
            types: types,
            allOptions: data.goods.hasoption == 1 ? data.goods.specs.options : [],
            isCurrentUserJoin: data.isCurrentUserJoin,
            status: data.status,
            frequency: frequency,
            currentHeadcount: currentHeadcount,
            participate: participate,
            invitationGroup: invitationGroup,
            groupbuytimes: groupbuytimes
        })
    }).catch(err => {
        self.setData({
            showStyle: 3
        })
    })
}
// 获取用户在商品下正在进行中的团
function getUserGroupBuyByGoods(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getUserGroupBuyByGoods',
        data: {
            goods_id: self.dataStore.gid
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data
        console.log('正在拼团的数据====>', data)
        if (data.users && data.users.length > 0) {
            self.dataStore.gbid = data.users[0].gbid
            clearInterval(getGroupId)
            getInitData(self)
        }
    }).catch(err => {
        clearInterval(getGroupId)
    })
}