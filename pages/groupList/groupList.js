// pages/goodsComment/goodsComment.js
// 拿到全局应用程序实例
const app = getApp(); // world
import {
    fetchApi,
    getGlobalConfig
} from '../../api/api.js';
import {
    cutdownTime2
} from '../../comm/time.js';
import {
    nav
} from '../../utils/util';
let timeNewGroupdown = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodsGroupBuyList: [],
        loadStyle: 'loadMore',
        canBuy: 0
    },
    dataStore: {
        goodsId: 0,
        canBuy: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        if (options.goodsId) {
            this.dataStore.goodsId = options.goodsId
        }
        this.dataStore.canBuy = options.canBuy ? options.canBuy : 0
        this.setData({
            canBuy: options.canBuy ? options.canBuy : 0
        })
        getGoodsGroupBuyList(this)
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
        clearInterval(timeNewGroupdown);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearInterval(timeNewGroupdown);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        clearInterval(timeNewGroupdown);
        getGoodsGroupBuyList(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    toGroupBuy(e) {
        let gbId = e.currentTarget.dataset.gbId;
        if (this.dataStore.canBuy != 1) {
            return
        };

        nav({
            url: '/pages/groupDetail/groupDetail',
            data: {
                gid: this.dataStore.goodsId,
                gbVersion: 1,
                gbid: gbId
            }
        });

    },
})
function getGoodsGroupBuyList(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGoodsGroupBuyList',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        console.log(res)
        // clearInterval(timeNewGroupdown); 
        let data = res.data.data.list
        // 头像处理
        data.forEach(element => {
            element.userHead = []
            let list = element.users
            let listAr = list.concat([{ id: 0 }, { id: 0 }, { id: 0 }])
            if (parseInt(element.subUserCount + element.userCount) > 4) {
                element.userHead = listAr.slice(0, 3)
                element.userHead.push({ id: 0 })
            } else {
                element.userHead = listAr.slice(0, parseInt(element.subUserCount + element.userCount))
            }
        });
        let nowTime = parseInt(new Date().getTime() / 1000);
        cutdownTime2(nowTime, self.data.goodsGroupBuyList);
        self.setData({
            goodsGroupBuyList: data,
        })

        timeNewGroupdown = setInterval(function () {
            nowTime++;
            var hasFinishAll = cutdownTime2(nowTime, self.data.goodsGroupBuyList);
            self.setData({
                goodsGroupBuyList: self.data.goodsGroupBuyList
            })
            if (hasFinishAll) {
                clearInterval(timeNewGroupdown);
            }
        }, 1000);
    }).catch((err) => { });
}