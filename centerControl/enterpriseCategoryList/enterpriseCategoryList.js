const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { nav, showLoading, } from '../../utils/util';Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle:0,
        enterpriseCateLgoryist: [],
        loadStyle: 'loadOver'   
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getCategoryList(this)
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
        getCategoryList(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }
})

function getCategoryList(self) {
    let param = {
        url: app.API_HOST + "CardGoods/getCategoryList",
        data: {
            isQy: 1
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        var rows = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            rows.push(data[i]);
            for (var k = 0; k < item.sons.length; k++) {
                item.sons[k].name = item.sons[k].name;
                item.sons[k].parentName = item.name;
                rows.push(item.sons[k]);
            }
        }
        self.setData({
            enterpriseCateLgoryist: rows,
            showStyle: rows.length == 0 ? 2 : 1,
        })

    }).catch((err) => {
        self.setData({
            showStyle: 3,
        })
    });
}