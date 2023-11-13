const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite, formatDuring, showToast, showTips } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabIndex: 0,
        switchTab: {
            tabs: [
                "全部",
                "未绑定",
                "已关闭",
                "使用中",
                "未开通"
            ],
            themeColor: "#1F94FD",
            currentIndex: 0,
            top: 0,
            position: "fixed",
        },
        configCode: false,
        showStyle:1,
        staffList:[],
        loadStyle: 'loadMore',
        isIphoneX: app.globalData.isIphoneX
    },
    dataStore: {
        pageIndex: 1,
        config_code:''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getStaffList(this)
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
        if (app.globalData.refresh){
            app.globalData.refresh = false;
            this.dataStore.pageIndex = 1
            getStaffList(this)
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
        this.dataStore.pageIndex = 1
        getStaffList(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return
        }
        this.setData({
            loadStyle: 'showLoading'
        })
        getStaffList(this, true);
    },
    onTabClick(e) {
        this.setData({
            tabIndex: e.detail.currentIndex
        });
        this.dataStore.pageIndex = 1
        getStaffList(this)
    },
    navPage(e){
        let item = e.currentTarget.dataset.item
        nav({
            url:'/centerControl/staffCardOperation/staffCardOperation',
            data:{
                name: item.name,
                avatar: item.avatar,
                gender: item.gender,
                position: item.position,
                mobile: item.mobile,
                opencard: item.opencard,
                status: item.card?item.card.status:0,
                staffId:item.id,
                config_code: this.dataStore.config_code
            }
        })
    },
    navAdd(){
        nav({
            url:'/centerControl/addStaffCard/addStaffCard'
        })
    }

})

function getStaffList(self, isGetMore = false) {
    let param = {
        url: app.API_HOST + "CardManage/getStaffList",
        data: {
            status: self.data.tabIndex,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
            pageSize: 9,
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data.staffInfo||[];
        if (isGetMore) { self.dataStore.pageIndex++ };
        self.dataStore.config_code = res.data.data.config_code
        self.setData({
            staffList: isGetMore ? self.data.staffList.concat(data) : data,
            loadStyle: data.length < 9 ? 'loadOver' : 'loadMore',
            configCode: res.data.data.config_code == 3?true:false
        })
        self.setData({
            showStyle: self.data.staffList.length == 0 ? 2 : 1,
        })

    }).catch((err) => {
        self.setData({
            showStyle: 3,
        })
    });
}