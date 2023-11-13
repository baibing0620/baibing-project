const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog,getToken } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        tabBar: [{
            name: '预约数量',
            orderBy: 'people_num_total',
            orderType: 'desc',
            typeText: '↓',
        }, {
            name: '时间',
            orderBy: 'create_time',
            orderType: 'desc',
            typeText: '↓',
        }, {
            name: '价格',
            orderBy: 'mini_price',
            orderType: 'desc',
            typeText: '↓',
        }],
        activeTabBarIndex: 0,
        goodListData: [],
        loadStyle: 'loadMore',
        showStyle: 0,
        menuSetting: {
            "留言": {},
            "个人中心": {},
            "管理中心": {}
        },
    },
    dataStore: {
        pageIndex: 1,
        startTime: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        showLoading();
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            if (!app.globalData.token) {
                getServiceList(this)
                if (app.tabBarPath.indexOf("/pages/reservationServiceList/reservationServiceList") == -1) {
                    this.setData({
                        isFromShare: true
                    });
                }
            } else {
                getServiceList(this)
                if (app.tabBarPath.indexOf("/pages/reservationServiceList/reservationServiceList") == -1) {
                    this.setData({
                        isFromShare: true
                    });
                }
            }
            
        }else{
            getServiceList(this)
        }
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
        this.dataStore.startTime = new Date().getTime();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        addActionLog(this, {
            type: 36,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime
            }
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        addActionLog(this, {
            type: 36,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime
            }
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.dataStore.pageIndex = 1;
        this.data.loadStyle = "loadMore";
        getServiceList(this);
        this.setData({
            pageRefresh: new Date().getTime()
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.loadStyle == 'loadOver') {
            return
        }
        this.setData({
            loadStyle: 'showLoading'
        })
        getServiceList(this, true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
      return {
        title: '预约服务列表',
          path: `/pages/reservationServiceList/reservationServiceList?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
      }
    },
    tabBarClick(e) {
        this.dataStore.pageIndex = 1;
        let index = parseInt(e.currentTarget.dataset.index);
        let tabBar = this.data.tabBar;
        if (index == this.data.activeTabBarIndex) {
            tabBar[index].orderType = tabBar[index].orderType == 'desc' ? 'asc' : 'desc';
            tabBar[index].typeText = tabBar[index].typeText == '↓' ? '↑' : '↓';
        }
        this.setData({
            tabBar: tabBar,
            activeTabBarIndex: index
        });
        getServiceList(this)
    },
    navSeniorResevation(e){
      nav({
        url: '/pages/seniorResevation/seniorResevation',
        data: {
          goodsId: e.currentTarget.dataset.id
        }
      })
    }
})

function getServiceList(self, isGetMore = false) {
    let index = parseInt(self.data.activeTabBarIndex),
        tabBar = self.data.tabBar;
    let param = {
        url: `${app.API_HOST}appointment/getAppointmentGoodsList`,
        data: {
            orderBy: tabBar[index].orderBy,
            orderType: tabBar[index].orderType,
            pageSize: 10,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }
    }
    fetchApi(self, param).then((res) => {
        if (isGetMore) { self.dataStore.pageIndex++ };

        self.setData({
            goodListData: isGetMore ? self.data.goodListData.concat(res.data.data) : res.data.data,
            loadStyle: res.data.data.length < 10 ? 'loadOver' : 'loadMore'
        })
        self.setData({
          showStyle: self.data.goodListData.length == 0 ? 2 : 1
        })

    }).catch((e) => {
        console.log(e)
        self.setData({
            showStyle: 3
        })
    });
}

