const app = getApp()
import {
    fetchApi
} from '../../api/api.js';
import {
    nav, 
    showTips,
    showModal,
    shareParam
} from '../../utils/util';
import {
    secondFormat
} from '../../comm/time.js';
let timeCutdown = 0;
Page({

    data: {
        homepage: app.HOMEPAGE_URL,
        detail: {
            goods: {}
        },
        showStyle: 0,
        needBargain: 0,
        bargainMoney: -1,
        type: 0,
        canBuy:true,
        reason:'',
        sourceType: 0,
        videoId: 0,
        articleId: 0

    },
    dataStore: {
        bargainId: 0,
        goodsId: 0,
    },

    onLoad: function (options) {
        this.dataStore.bargainId = options.bargainId ? options.bargainId : 0;
        this.dataStore.goodsId = options.goodsId ? options.goodsId : 0;

        if (options.cardId){
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
        }

        if (options.sourceType) {
          this.setData({
            sourceType: options.sourceType,
            videoId: options.videoId || 0,
            articleId: options.articleId || 0
          })
        }

        getInitData(this);
        this.setData({
            needBargain: options.needBargain ? 1 : 0
        })

    },

    onReady: function () {

    },

    onShow: function () {
      app.showRemind(this);
    },

    onHide: function () {

    },

    onUnload: function () {
        clearTimeout(timeCutdown)
    },

    onPullDownRefresh: function () {
        getInitData(this)

    },

    onReachBottom: function () {

    },
    onShareAppMessage: function () {
        return {
            title: this.data.detail.goods.title,
            path: `/pages/bargainDetail/bargainDetail?bargainId=${this.data.detail.id}&needBargain=1&${shareParam()}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },
    toGoods(e) {
        nav({
            url: '/pages/goodsdetail/goodsdetail',
            data: {
                id: e.currentTarget.dataset.id
            }
        })
    },
    toBargainGoods() {
        // wx.redirectTo({
        //     url: '/pages/bargainGoodsList/bargainGoodsList'
        // })
        nav({
            url: '/pages/mall/mall'
        })
    },
    buyNow() {
        let optionId = this.data.detail.option_id ? this.data.detail.option_id : 0;
        let detail = this.data.detail;
        if(detail.goods.total<=0){
            showModal({
                title:'提示',
                content:'您来晚了，商品已售完，是否返回首页',
                showCancel:true
            }).then(res=>{
                nav({
                    url:app.HOMEPAGE_URL
                })
            }).catch(err=>{});
            return;
        }
        if(detail.goods.saleState&&detail.goods.saleState.canBuy==0){
            showModal({
                title:'提示',
                content:'商品已下架，是否返回首页',
                showCancel:true
            }).then(res=>{
                nav({
                    url:app.HOMEPAGE_URL
                })
            }).catch(err=>{});
            return;
        }
        nav({
            url: '/pages/confirmOrder/confirmOrder',
            data: {
                goodsId: this.data.detail.goods.id,
                optionId: optionId,
                total: 1,
                bargainId: this.data.detail.id,
                isBargain: 1,
                videoId: this.data.videoId,
                sourceType: this.data.sourceType,
                articleId: this.data.articleId
            }
        })
    },
    showBargain() {
        this.setData({
            needBargain: 1
        })
    },
    friendsBargain() {
        let self = this;
        let param = {
            url: app.API_HOST + 'bargain/friendsBargain',
            data: {
                bargainId: this.data.detail.id,
            }
        }
        fetchApi(self, param).then(res => {
            self.setData({
                bargainMoney: res.data.data.bargainMoney
            })

        }).catch(err => {
            showTips('砍价失败')
        })
    },
    closeBargainDiolog() {
        this.setData({
            needBargain: 0
        })
        if (this.data.bargainMoney > 0) {
            getInitData(this)
        }
    }
});

function getInitData(self) {
    let params = {
        url: app.API_HOST + 'bargain/getBargainDetail',
        data: {
            bargainId: self.dataStore.bargainId,
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, params).then(res => {
        let data = res.data.data,
            nowTime = parseInt(new Date().getTime() / 1000),
            endTime = parseInt(data.detail.endtime),
            timeStr = endTime > nowTime ? '离活动结束还有: ' + secondFormat(endTime - nowTime) : '活动已结束';
        var canBuy = true,reason = '';
        if(data.detail.goods.saleState.canBuy==0){
            canBuy = false;
            reason =  data.detail.goods.saleState.reason||'已下架'
        }
        else if(data.detail.goods.total<=0){
            canBuy = false;
            reason = '已售完'
        }
       
        self.setData({
            showStyle: 1,
            detail: data.detail,
            friendsList: data.friendsList,
            type: data.type,
            timeStr: timeStr,
            canBuy:canBuy,
            reason:reason
        });

        timeCutdown = setInterval(function () {
            nowTime++;
            if (endTime <= nowTime||!canBuy) {
                clearInterval(timeCutdown);
                self.setData({
                    timeStr: '活动已结束'
                })
            } else {
                self.setData({
                    timeStr: '离活动结束还有: ' + secondFormat(endTime - nowTime)
                })
            }


        }, 1000);
    }).catch(err => {
        console.log(err)
        self.setData({
            showStyle: 3
        })
    })
}