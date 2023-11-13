const app = getApp();
import { fetchApi } from '../../api/api';
import { showLoading ,nav} from '../../utils/util';
Page({

    data: {
        orderList: [],
        loadStyle: 'loadMore',
        showStyle: 0

    },
    onLoad: function(options) {
        showLoading();
        getData(this);

    },
    dataStore: {
        pageIndex: 1
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
      this.dataStore.pageIndex = 1;
      if (app.globalData.menuOrderNeedRefresh) {
            app.globalData.menuOrderNeedRefresh = 0;
            getData(this);
        }

    },

    onHide: function() {

    },

    onPullDownRefresh: function() {
        showLoading();
        this.dataStore.pageIndex = 1;
        getData(this);

    },

    onReachBottom: function() {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
        getData(this, true)

    },
    navToDetail(e){
      nav({
        url:'/pages/menuOrderDetail/menuOrderDetail',
        data:{
          id:e.currentTarget.dataset.id
        }
      })
    }

});

function getData(self, isGetMore = false) {
    let param = {
        url: app.API_HOST + 'order/getOrderList',
        data: {
            ordersType:2,
            pageSize: 10,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex

        }
    };
    fetchApi(self, param).then((res) => {
        if (isGetMore) { self.dataStore.pageIndex++ }
        let data = res.data.data;
        self.setData({
            loadStyle: data.length < 10 ? 'loadOver' : 'loadMore',
            orderList: isGetMore ? self.data.orderList.concat(data) : data,
        });
        self.setData({
            showStyle: self.data.orderList.length == 0 ? 2 : 1
        })

    }).catch((e) => {
        self.setData({
            showStyle: 3
        });
    });

};