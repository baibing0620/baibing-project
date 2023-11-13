const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav, showTips, showLoading } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        loadStyle: 'loadMore',
        orderList: [],
        activeStatus: 1,
        tabBar: [{ title: '我发起的', status: 1 }, { title: '我帮砍的', status: 2 }]

    },
    dataStore: {
        pageIndex: 1
    },
    onLoad: function(options) {
        showLoading();
        getData(this);
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
        this.dataStore.pageIndex = 1;
        showLoading();
        getData(this);

    },

    onReachBottom: function() {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: 'loading'
        })
        getData(this, true)
    },
    tabChange(e) {
        if (this.data.activeStatus==e.currentTarget.dataset.status) {
            return;
        }
        this.setData({
            loadStyle: 'loadMore',
            activeStatus: e.currentTarget.dataset.status
        });
        this.dataStore.pageIndex = 1;
        showLoading();
        getData(this);

    },
    navToDetail(e) {
        nav({
            url: '/pages/bargainDetail/bargainDetail',
            data: {
                bargainId: e.currentTarget.dataset.id
            }
        })
    }

});

function getData(self, isGetMore = false) {
    let param = {
        url: app.API_HOST + 'bargain/getUserBargain',
        data: {
            type: self.data.activeStatus,
            pageSize: 6,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        if (isGetMore) { self.dataStore.pageIndex++ };
        self.setData({
            loadStyle: data.length < 6 ? 'loadOver' : 'loadMore',
            orderList: isGetMore ? self.data.orderList.concat(data) : data
        })
        self.setData({
          showStyle: self.data.orderList.length == 0 ? 2 : 1,
        })

    }).catch(err => {
        self.setData({
            showStyle: 3
        })
    });
};