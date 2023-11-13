const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav, showLoading,shareParam } from '../../utils/util';
import {
    cutdownTime2
} from '../../comm/time.js';
let groupTimePrivateCutdown = 0;
Page({
    data: {
        extConfig: app.extConfig,
        showStyle: 0,
        showDialog: false,
        types: [],
        allOptions: [], 
        selectedOptionId: 0,
        goodsThumb: '',
        buyNum: 1,
        addCartStocks: 0,
        isCurrentUserJoin: 0,
        status:-1,
        sourceType: 0,
        videoId: 0,
        articleId: 0
    },
    dataStore: {
        gid: 0,
        gbid: 0
    },
    onLoad: function(options) {
        this.dataStore.gid = options.gid ? options.gid : 0;
        this.dataStore.gbid = options.gbid ? options.gbid : 0;
        this.dataStore.gbVersion = options.gbVersion ? options.gbVersion : 0;
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            this.setData({
                isFromShare: true
            });
        }
        if (options.sourceType) {
            this.setData({
              sourceType: options.sourceType,
              videoId: options.videoId || 0,
              articleId: options.articleId || 0
            })
          }
        getInitData(this);

    },

    onReady: function() {

    },

    onShow: function() {
        app.showRemind(this);
    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onPullDownRefresh: function() {
        getInitData(this);
    },

    onShareAppMessage() {
        return {
            title: this.data.goods.title,
            path: `/pages/groupDetail/groupDetail?gbid=${this.dataStore.gbid}&gid=${this.dataStore.gid}&${shareParam()}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
            success: function(res) {
                // 转发成功
            },
            fail: function(res) {
                // 转发失败
            }
        }

    },
    toggleCartPanel(e) {
        this.setData({
            isgroup: true,
            isMask: 'mask',
            purchaseBox: true,
            bargainDialog: false
        })
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

        let selectedItemsStr = selectedItems.sort(function(a, b) { return a - b }).join('_'),
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
    toGoodsDetail(){
      nav({
        url:'/pages/goodsdetail/goodsdetail?id='+this.dataStore.gid
      })
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
                success: function(res) {
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
                success: function(res) {

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
                    gbid: this.dataStore.gbid,
                    isGrounp: 1,
                    gbVersion: this.dataStore.gbVersion,
                    videoId: this.data.videoId,
                    sourceType: this.data.sourceType,
                    articleId: this.data.articleId
                }
            })
        }
    },

    // 新的
    invitationFriends(e) {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10);
        let QRcode;
       
        QRcode = `${app.API_HOST}groupBuy/getGroubBuyQrCode?gbid=${this.dataStore.gbid}&gid=${this.dataStore.gid}&_t=${qrCodeTime}&${shareParam()}&token=${app.globalData.token}&invitorId=${app.globalData.uid}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
       
        this.setData({
            QRcode: QRcode,
            showShare: true
        })
    },
    hideMask() {
        let isShare = this.data.isShare == '' ? '' : 'un-share-box'
        this.setData({
            isMask: '',
            isShare: isShare,
            showPost: false,
            purchaseBox: false
        });
    },

});

function getInitData(self) {
    showLoading();
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
        if (data.goods.is_groupbuy == '2') {
            // 进入之前的拼团页面
            wx.redirectTo({
                url: `/pages/groupFriends/groupFriends?gid=${self.dataStore.gid}&gbid=${self.dataStore.gbid}&gbVersion=${self.dataStore.gbVersion}`
            })
            return
        }
        console.log(self.dataStore.gbid, 'self.dataStore.gbid ')
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
        let frequency = data.goods.limit_num - data.users.length
        let currentHeadcount = data.users.length
        if (data.users.length > 0) {
            // 人员拼凑
            for (let index = 0; index < frequency; index++) {
                data.users.push({})
            }
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
        self.setData({
            showStyle: 1,
            goodsThumb: data.goods.thumb_url,
            goods: goods,
            addCartStocks: data.goods.total,
            users: data.users,
            expireTime: data.deadline,
            types: types,
            allOptions: data.goods.hasoption == 1 ? data.goods.specs.options : [],
            isCurrentUserJoin: data.isCurrentUserJoin,
            status: data.status,
            frequency: frequency,
            currentHeadcount: currentHeadcount,
        })
    }).catch(err => {
        console.log(err ,'err')
        self.setData({ showStyle: 3 })
    })
}
