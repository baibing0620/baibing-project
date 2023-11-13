const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    nav,
    makePhoneCall
} from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        customerList: [],
        diyConfig: app.extConfig,
        keywords:'',
        showStyle: 0,
        loadStyle: 'loadMore',
        statusList: []
    },
    dataStore: {
        pageSize: 10,
        pageIndex: 1,
        customer:'',
        push_user_detail:''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.dataStore.push_user_detail = options.push_user_detail
        getData(this);
        this.getUserStatus()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        app.showRemind(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        getData(this);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
        getData(this, true);
    },
    search(e){
        getData(this);
    },
    bindKeywords(e){
        this.data.keywords = e.detail.value;
    },
    getUserStatus() {
        let params = {
            url: app.API_HOST + "CrmUser/getUserStatus",
        }
        fetchApi(this, params).then(res => {
            this.setData({
                statusList: res.data.data,
            })
        }).catch(res => {
            console.log(res);
        })
    },
})

function getData(self, isGetMore = false) {
    var customerList = self.data.customerList;
    if (!isGetMore){
        self.dataStore.pageIndex =1;
    }
    let param = {
        url: 'crmUser/getCrmUserList',
        data: {
            card_id:  app.globalData.cardId,
            pageSize: self.dataStore.pageSize,
            nickname: self.data.keywords,
            push_user_detail: self.dataStore.push_user_detail,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }
    };
    fetchApi(self, param).then((res) => {
        if (isGetMore) {
            self.dataStore.pageIndex++
        }
        let data = res.data.data.info;
        self.setData({
            loadStyle: data.length < self.dataStore.pageSize ? 'loadOver' : 'loadMore',
            customerList: isGetMore ? self.data.customerList.concat(data) : data,
            total: res.data.data.total
        })
        self.setData({
            showStyle: self.data.customerList.length == 0 ? 2 : 1
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });

};
