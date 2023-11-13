const app = getApp();
import { fetchApi } from '../../api/api';
import { nav, setCurrentLoginUserCardInfo, showTips, showToast } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ruleList:[],
        loadStyle: 'loadMore',
        showStyle: 0,
    },
    dataStore: {
        pageIndex: 1,
        pageSize:4
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        loadRuleList(this)
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
        if (app.globalData.refresh) {
            app.globalData.refresh = false;
            loadRuleList(this)
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

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        loadRuleList(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
        loadRuleList(this, true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    delRule(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        wx.showModal({
            title: '提醒',
            content: '删除了你可别后悔',
            confirmText:'不后悔',
            cancelText:'再想想',
            success:(res)=> {
                if (res.confirm) {
                    var params = {
                        url: app.API_HOST + 'Chat/delCustomerService',
                        data: {
                            id:id
                        }

                    };
                    fetchApi(self, params).then(res => {
                        this.data.ruleList.splice(index,1)
                        this.setData({
                            ruleList: this.data.ruleList
                        })
                        showToast('删除成功', 'success')
                    }).catch((err) => {

                    }); 
                }
            }
        })
    },
    editRule(e){
        let id = e.currentTarget.dataset.id
        nav({
            url: '/centerControl/addRecoveryRule/addRecoveryRule',
            data:{id:id}
        })
    },
    navAddRecoveryRule(){
        nav({
            url:'/centerControl/addRecoveryRule/addRecoveryRule'
        })
    }
})
function loadRuleList(self, isGetMore = false) {
    if (!isGetMore) {
        self.dataStore.pageIndex = 1;
    }
    var params = {
        url: app.API_HOST + 'Chat/getCustomerServiceList',
        data: {
            pageSize: 6,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }

    };
    fetchApi(self, params).then(res => {
        if (isGetMore) { self.dataStore.pageIndex++ };
        let data = res.data.data
        data.forEach(item=>{
            item.keywords = JSON.parse(item.keywords).join(" / ")
        })
        self.setData({
            loadStyle: data.length < self.dataStore.pageSize ? 'loadOver' : 'loadMore',
            ruleList: isGetMore ? self.data.ruleList.concat(data) : data,
            total: res.data.data.total
        })
        self.setData({
            showStyle: self.data.ruleList.length == 0 ? 2 : 1
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });
}
