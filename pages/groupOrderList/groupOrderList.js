// pages/groupOrderList/groupOrderList.js
const app = getApp();
import {
    fetchApi
} from '../../api/api.js';
import {
    nav,
    showLoading,
    showToast
} from '../../utils/util';
Page({
    data: {
        showStyle: 0,
        loadStyle: 'loadMore',
        orderList: [],
        activeStatus: -1,
        tabBar: [{
            title: '全部',
            status: -1
        }, {
            title: '待成团',
            status: 1
        }, {
            title: '拼团成功',
            status: 2
        }, {
            title: '拼团失败',
            status: 0
        }]
    },
    dataStore: {
        pageIndex: 1
    },
    onLoad: function (options) {
        showLoading();
        getData(this);

    },
    onReady: function () {

    },

    onShow: function () {
        app.showRemind(this);
    },
    onHide: function () {

    },
    onUnload: function () {

    },
    onPullDownRefresh: function () {
        this.dataStore.pageIndex = 1;
        showLoading();
        getData(this);

    },
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
        getData(this, true)

    },
    tabChange(e) {
        if (this.data.activeStatus == e.currentTarget.dataset.index) {
            return;
        }
        this.setData({
            loadStyle: 'loadMore',
            activeStatus: e.currentTarget.dataset.index
        });
        this.dataStore.pageIndex = 1;
        showLoading();
        getData(this);

    },
    navToDetail(e) {
        if (e.currentTarget.dataset.status == 0) {
            showToast('失败的拼团，暂无法查看',this)
            return;
        }
        if (e.currentTarget.dataset.groupbuy == '1') {
            nav({
                url: '/pages/groupDetail/groupDetail',
                data: {
                    gbid: e.currentTarget.dataset.gbid,
                    gid: e.currentTarget.dataset.gid
                }
            })
        } else if (e.currentTarget.dataset.groupbuy == '2') {
            nav({
                url: '/pages/groupFriends/groupFriends',
                data: {
                    gbid: e.currentTarget.dataset.gbid,
                    gid: e.currentTarget.dataset.gid
                }
            })
        } else if (e.currentTarget.dataset.groupbuy == '3') {
            nav({
                url: '/pages/goodsdetail/goodsdetail',
                data: {
                    id: e.currentTarget.dataset.gid
                }
            })
        }


    }
});

function getData(self, isGetMore = false) {
    let param = {
        url: app.API_HOST + 'groupBuy/getMyGroupBuyList',
        data: {
            status: self.data.activeStatus,
            pageSize: 6,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }
    };
    fetchApi(self, param).then((res) => {
        let data = res.data.data;
        if (isGetMore) {
            self.dataStore.pageIndex++
        };
        self.setData({
            loadStyle: data.length < 6 ? 'loadOver' : 'loadMore',
            orderList: isGetMore ? self.data.orderList.concat(data) : data
        })
        self.setData({
            showStyle: self.data.orderList.length == 0 ? 2 : 1,
        })

    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });
};