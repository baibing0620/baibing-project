const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog, getToken } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite, formatDuring, openLocation, makePhoneCall } from '../../utils/util';
import {
    blessBagTask
} from '../../map'
Page({
    data: {
        activeTabBarIndex: 4,
        categoryList: [],
        couponList:[],
        swiperContent: [],
        getCouponLock: false,
        isFirst: true,
        swiperShow: false,
        tipVisible: false,
        goodsList: [],
        goodsShowStyle: 'column',
        loadStyle: 'loadMore',
        tabBar: [{
            name: '销量',
            orderBy: 'sales',
            orderType: 'desc',
            typeText: '↓',
        }, {
            name: '时间',
            orderBy: 'createtime',
            orderType: 'desc',
            typeText: '↓',
        }, {
            name: '价格',
            orderBy: 'productprice',
            orderType: 'desc',
            typeText: '↓',
        }],
        categoryViewType: 0,
        actvieIndex: 0,
        diyConfig: app.extConfig,
        toView: "view0",
        menuSetting: {
            "购物车": {},
            "留言": {},
            "个人中心": {},
            "管理中心": {}
        },
        pageRefresh: 0,
        is_open_credit: 0,
        is_open_consumption_shopping: 0,
        fourHeight: '100'
    },
    dataStore: {
        pageIndex: 1,
        startTime: 0,
        bless: ''
    },
    
    onLoad: function (options) {
        if (options.beid) {
            app.globalData.beid = options.beid;
        }
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0; 
            if (app.tabBarPath.indexOf("/pages/mall/mall") == -1) {
                this.setData({
                    isFromShare: true
                });
            }
            getInitData(this);
        } else {
            getInitData(this);
        }
        let mainColor = this.data.mainColor;
        if (mainColor != deleteWhite(mainColor)) {
            this.setData({
                mainColor: deleteWhite(mainColor)
            })
        }
        this.getShopCreditSetting()
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
        let self = this
        this.getCouponList()
        this.dataStore.startTime = new Date().getTime();
        app.showRemind(this);
        wx.getSystemInfo({
            success (res) {
              self.setData({
                fourHeight: res.windowHeight-54
              })
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.setData({
          tipVisible: false
        })
        addActionLog(this, {
            type: 15,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime,
                id: 0,
                name: ' 全部'
            }
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        addActionLog(this, {
            type: 15,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime,
                id: 0,
                name: ' 全部'
            }
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.dataStore.pageIndex = 1
        this.data.loadStyle == 'loadMore';
        this.getCouponList()
        getInitData(this, true)
        this.setData({
            pageRefresh: new Date().getTime()
        });
        this.getShopCreditSetting()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.categoryViewType != 1) {
            return;
        }
        if (this.data.loadStyle == 'loadOver') {
            return
        }
        this.setData({
            loadStyle: 'showLoading'
        });
        loadGoodsList(this, true);

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: `我发现${app.globalData.appName}商城有很多好物，快来看看吧`,
            path: `/pages/mall/mall?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
        }
    },
    getShopCreditSetting() {
        fetchApi(this, {
            url: "config/get",
            data: {}
        }).then(res => this.setData({
            is_open_credit: res.data.data.is_open_credit == 1,
            is_open_consumption_shopping: res.data.data.is_open_consumption_shopping == 1
        }))
    },
    handleSwiperClick(e) {
        console.log(e)
        const { linkType, roomId, url, eventparam} = e.currentTarget.dataset;
        switch (parseInt(linkType)) {
            case 3:
                wx.navigateTo({
                    url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}`
                })
                break
            case 5:
                this.navigateToMiniProgram(eventparam)
                break
            case 6:
                // console.log(eventparam, 'eventparam')
                let latitude = Number(eventparam.lnglat.split(',')[1]),
                    longitude = Number(eventparam.lnglat.split(',')[0]),
                    address = eventparam.address || '';
                openLocation(latitude, longitude, address);
                break
            case 7:
                nav({
                    url: '/pages/contentDetail/contentDetail',
                    data: { id: eventparam.id }
                })
                break
            case 8:
                this.navigateToWebView(eventparam)
                break
            case 9:
                nav({
                    url: `/pages/${eventparam.eventType}/${eventparam.eventType}`,
                    data: { id: eventparam.id }
                })
                break
            case 10:
                makePhoneCall(eventparam.phone);
                break
            case 11:
                nav({
                    url: '/pages/couponDetail/couponDetail',
                    data: { id: eventparam.id }
                })
                break
            case 12:
                nav({
                    url: '/pages/goodsList/goodsList',
                    data: eventparam
                })
                break
            default:
                nav({ url })
        }
    },
    navigateToWebView(eventParam) {
        let url = eventParam.url
        var urlArr = url.split('?')
        if (urlArr[1]) {
            let newArr = [];
            let parameter = urlArr[1].split('&')
            parameter.forEach(item => {
                newArr.push(item.split('=')[0], item.split('=')[1])
            })
            eventParam.url = urlArr[0]
            eventParam.parameter = JSON.stringify(newArr)
        }
        nav({
            url: '/pages/webView/webView',
            data: eventParam
        });
    },
    navigateToMiniProgram(param) {
        wx.navigateToMiniProgram({
            appId: param.id,
            path: param.path || '',
            fail: err => {
                showModal({
                    title: "打开错误"
                })
            }
        })
    },
    getSwiperContent() {
        const params = {
            url: 'CarouselImage/getCarouselImage',
            data: {
                status: 1 
            }
        }
        fetchApi(this, params).then(res => {
            const {info} = res.data.data;
            let list = info.filter(i => i.link_live_type.indexOf('2') != -1)
            let swiperContent = list.filter(ele => {
                if (ele.link_type == 0) {
                    return ele.shopGoods && ele.shopGoods.status == 1
                } else if (ele.link_type == 3) {
                    return ele.live_name != ''
                } else if (ele.link_type == 4) {
                    return ele.shopPage
                } else {
                    return ele.event_param
                }
            })
            this.setData({
                swiperContent: swiperContent,
                swiperShow: false
            });
            setTimeout(() => {
                this.setData({
                    swiperShow: swiperContent.length > 0
                });
            }, 300)
        }).catch(err => {
            console.log('error: ', err);
        });
    },
    changeGoods() {
        this.setData({
            goodsShowStyle: this.data.goodsShowStyle == 'row' ? 'column' : 'row'
        })
    },
    closeTip() {
      this.setData({
        tipVisible: false
      })
    },
    getCoupon(e) {
      const { id, index } = e.currentTarget.dataset;
      let param = {
        url: app.API_HOST + 'coupon/receiveCoupon',
        data: {
          id: id
        }
      }
      if (this.data.getCouponLock) {
        return
      }
      this.data.getCouponLock = true;
      fetchApi(this, param).then((res) => {
        // showTips('领取成功', 'success');
        let couponData = this.data.couponList;
        couponData[index].received = 1;
        this.setData({
          couponList: couponData, 
          tipVisible: true
        })
        this.data.getCouponLock = false;
        setTimeout(() => {
          this.setData({
            tipVisible: false
          })
        },1500)
        
      }).catch(err => {
        console.log(err, 'err')
        this.data.getCouponLock = false;
      })
    },
    // 加载商品数据
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
            activeTabBarIndex: index,
            isFirst: false
        });
        loadGoodsList(this)
    },
    search() {
        var param = {
            url: '/pages/searchPage/searchPage',
            data: {}
        }
        nav(param)
    },
    goodsnavList(event) {
        var param = {
            url: '/pages/goodsList/goodsList',
            data: {
                'id': event.currentTarget.dataset.cid,
                'title': event.currentTarget.dataset.title,
                child: event.currentTarget.dataset.type
            }
        }
        nav(param)
    },
    activeTap(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            actvieIndex: index,
            toView: 'view' + index
        })
    },
    goodsnav(e) {
        nav({
          url: '/pages/goodsdetail/goodsdetail',
          data: {
            'goodsId': e.currentTarget.dataset.goodsId
          }
        })
    },
    toMyCart() {
        nav({
            url: "/pages/myCart/myCart"
        })
    },
    toOrderList() {
        nav({
            url: '/pages/personal/personal'
        })
    },
    toIntegralMall() {
        nav({
            url: '/pages/integralMall/integralMall'
        })
    },
    getCouponList(e) {

      let param = {
        url: app.API_HOST + 'coupon/couponsOfShop',
        data: {
          received: 0
        }
      }
      fetchApi(this, param).then(res => {
        const { data } = res.data;
        this.setData({
          couponList : data
        })
      })
    }
});

//
function getOneCategoryData(self) {
    self.dataStore.pageIndex = 1;
    let index = parseInt(self.data.activeTabBarIndex),
        tabBar = self.data.tabBar;
    // 加载类别数据
    let param1 = {
        url: app.API_HOST + 'category/categoryList',
        data: {
            city: app.globalData.cityLocate

        }

    },
        param2 = {
            url: app.API_HOST + 'category/goodsList',
            data: {
                cid: 0,
                pageSize: 10,
                orderBy: self.data.isFirst ? 'displayorder' : tabBar[index].orderBy,
                orderType: self.data.isFirst ? 'desc' : tabBar[index].orderType,
                pageIndex: self.dataStore.pageIndex,
                city: app.globalData.cityLocate
            }

        };
    Promise.all([fetchApi(self, param1), fetchApi(self, param2)]).then(res => {
        const { data: categoryList } = res[0].data
        self.setData({
            categoryList: new Array(Math.ceil(categoryList.length / 8))
                .fill({})
                .map((_, index) => categoryList.slice(index * 8, (index + 1) * 8)),
            showStyle: 1,
            goodsList: res[1].data.data,
            loadStyle: res[1].data.data.length < 10 ? 'loadOver' : 'loadMore'
        })

    }).catch(err => {
        self.setData({
            showStyle: 3
        })
    })

}

/*加载更多商品数据
    cid为0时候加载全部类别
    pageIndex为分页，从1开始
    pageSize为一页加载多少个，默认10  
    orderBy productprice 价格  createtime 时间  sales 销量 （可不填）
    orderType asc 升序 desc 降序 （可不填）
*/

function loadGoodsList(self, isGetMore = false) {
    let index = parseInt(self.data.activeTabBarIndex),
        tabBar = self.data.tabBar;
    var params = {
        url: app.API_HOST + 'category/goodsList',
        data: {
            cid: 0,
            pageSize: 10,
            orderBy: self.data.isFirst ? 'displayorder' : tabBar[index].orderBy,
            orderType:  self.data.isFirst ? 'desc' : tabBar[index].orderType,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }

    };
    fetchApi(self, params).then(res => {
        if (isGetMore) { self.dataStore.pageIndex++ };
        self.setData({
            showStyle: 1,
            goodsList: isGetMore ? self.data.goodsList.concat(res.data.data) : res.data.data,
            loadStyle: res.data.data.length < 10 ? 'loadOver' : 'loadMore'
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });
}

function getTwoCategoryData(self) {
    let param = {
        url: app.API_HOST + "category/categoryListWidthLevel",
        data: {
            city: app.globalData.cityLocate
        }
    }
    fetchApi(self, param).then(res => {
        let contentList = res.data.data;
        self.setData({
            categoryList: contentList,
            showStyle: 1,
        })

    }).catch((err) => {
        self.setData({
            showStyle: 3,
        })
    });
}

function getFourGoodsData(self) {
    // 加载类别数据
    let param = {
      url: app.API_HOST + 'foodIndex/foodList',
      data: {
        isTakeout:3,
        ismultiple: app.globalConfig.is_multiple_stores,
        categoryType: 1,
        goodsType: 1
      }
    }
    fetchApi(self, param).then(res => {
      let data = res.data.data
    //   console.log('foodList',res)
      let goodsList = data.goodsList.filter(e => {
        return e.id
      })
    //   console.log(goodsList)
      self.setData({
        categoryList: goodsList,
        showStyle: 1
      })
    }).catch((err) => {
      self.setData({
        showStyle: 3
      })
    });
  }

function getInitData(self, isRefresh = false) {
    var getCategoryData = function () {
        // console.log(app.globalConfig.categoryViewType)
        if (app.globalConfig.categoryViewType == 1) {
            getOneCategoryData(self);
        } else if (app.globalConfig.categoryViewType == 4) {
            getFourGoodsData(self)
        } else {
            getTwoCategoryData(self)
        }
        self.setData({
            categoryViewType: app.globalConfig.categoryViewType
        })
    }
    if (!isRefresh) {
        if (app.globalConfig != null) {
            getCategoryData(self)
        } else {
            getGlobalConfig(self).then(res => {
                app.globalConfig = res.data.data
                getCategoryData(self)
            }).catch(err => { console.log('获取配置失败: ', err) })

        }
    } else {
        getGlobalConfig(self).then(res => {
            getCategoryData(self)
        }).catch(err => { console.log('获取配置失败: ', err) })
    }
    self.getSwiperContent();

}
function selectBless(that) {
    if (that.dataStore.bless) {
        that.dataStore.bless.getOnLineActivity()
    } else {
        that.dataStore.bless = that.selectComponent('#bless')

        if (that.dataStore.bless) {
            that.dataStore.bless.getOnLineActivity()
        }
    }
}