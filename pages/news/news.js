const app = getApp();
import {
    fetchApi,
    getGlobalConfig,
    addActionLog,
    getEffectiveCardId
} from '../../api/api';
import {
    showLoading,
    showToast,
    showTips,
    getTitleFromTabbar,
    nav,
    deleteWhite
} from '../../utils/util';
Page({
    data: {
        mainColor: app.extConfig.themeColor,
        extConfig: app.extConfig,
        contentList: [],
        swiperContent: [],
        categoryHeight: [],
        actvieIndex: 0,
        toView: 'view0',
        categoryList: [{
            id: 0,
            name: '全部'
        }],
        goodsList: [],
        loadStyle: '',
        menuSetting: {
            "留言": {},
            "个人中心": {},
            "管理中心": {}
        },
    },
    dataStore: {
        barTitle: '',
        pageIndex: 1,
        startTime: '',
        bless: '',
        onloadLock: false
    },

    onLoad: async function (options) {
        let mainColor = this.data.mainColor;
        if (mainColor != deleteWhite(mainColor)) {
            this.setData({
                mainColor: deleteWhite(mainColor)
            })
        }
        this.dataStore.cid = app.globalData.pageOption.id || 0;
        this.dataStore.onloadLock = true

        if (!~~app.globalData.cardId) {
            try {
                const { cardId, myCardId } = await getEffectiveCardId()
                app.globalData.cardId = myCardId || cardId || ''
                if (!~~app.globalData.cardId) throw Error('无可用名片')
                if (app.tabBarPath.indexOf("/pages/news/news") == -1) {
                    this.setData({
                        isFromShare: true
                    })
                }
            } catch (error) {
                console.error(error)
                wx.reLaunch({
                    url: '/pages/cardList/cardList'
                })
                return
            }
        }else if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            if (app.tabBarPath.indexOf("/pages/news/news") == -1) {
                this.setData({
                    isFromShare:true
                });
            }   
        }
        getInitData(this);
        this.setData({
            onLoad: true
        })
    },
    onReady: function () {

    },
    onShow: function () {
      this.dataStore.startTime = new Date().getTime();
      if (this.dataStore.barTitle != '') {
          wx.setNavigationBarTitle({
              title: getTitleFromTabbar(this) || this.dataStore.barTitle
          })
      }
      app.showRemind(this);

      if (this.dataStore.onloadLock) {
        this.dataStore.onloadLock = false;
        return;
      }
      this.dataStore.pageIndex = 1;
      this.dataStore.cid = app.globalData.pageOption.id || 0;
      if (this.dataStore.cid != 0) {
        if (app.globalConfig.content_view_type == 1) {
          getData(this);
        } else {
          getCategoryData(this)
        }
      }
      
    },
    onHide: function () {
        addActionLog(this, {
            type: 18,
            detail: {
                id: 0,
                duration: new Date().getTime() - this.dataStore.startTime,
                name: '全部'
            }
        })
    },
    onUnload: function () {
        addActionLog(this, {
            type: 18,
            detail: {
                id: 0,
                duration: new Date().getTime() - this.dataStore.startTime,
                name: '全部'
            }
        })
    },
    onPullDownRefresh: function () {
        this.dataStore.pageIndex = 1;
        getInitData(this);
        this.setData({
            pageRefresh: new Date().getTime()
        });

    },
    onReachBottom: function () {
        if (this.data.categoryViewType != 2) {
            return;
        }
        if (this.data.loadStyle == 'loadOver') {
            return
        }
        this.setData({
            loadStyle: 'showLoading'
        })
        getGoodsList(this, true);
    },
    onShareAppMessage: function () {
        return {
            title: `你想看的${app.globalData.appName}资讯内全都有，快来探索下吧`,
            path: `/pages/news/news?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
        }
    },
    getSwiperContent() {
        const params = {
            url: 'CarouselImage/getCarouselImage',
            data: {
                status: 2
            }
        }
        fetchApi(this, params).then(res => {
            const {info} = res.data.data;
            this.setData({
                swiperContent: info.filter(i => i.shopGoods && i.shopGoods.status == 1),
                swiperShow: false
            });
            setTimeout(() => {
                this.setData({
                    swiperShow: info.length > 0
                });
            }, 300)
        }).catch(err => {
            console.log('error: ', err);
        });
    },
    handleSwiperClick(e) {
        const {url} = e.currentTarget.dataset;
        nav({ url });
    },
    activeTap(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            actvieIndex: index,
            toView: 'view' + index
        })

    },
    activeTopTap(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            actvieIndex: index,
        });
        this.dataStore.pageIndex = 1;
        this.setData({
            loadStyle: ''
        })
        getGoodsList(this)
    },
    toContent(e) {
        nav({
            url: '/pages/contentDetail/contentDetail',
            data: {
                id: e.currentTarget.dataset.id
            }
        })
    },
    bindInput(e) {
        this.setData({
            posterName: e.detail.value
        })
    },

    search(e) {
        this.setData({
            postList: []
        })
        if (this.data.posterName) {
            this.data.search = true;
        } else {
            this.data.search = false;
        }
        this.data.pageIndex = 1;
        getGoodsList(this)
    },
});

function getInitData(self) {
    showLoading();
    getGlobalConfig(self).then(res => {
        self.dataStore.barTitle = app.globalConfig.content_view_type == 1 ? '产品分类' : '我的资讯';
        wx.setNavigationBarTitle({
            title: getTitleFromTabbar(self) || self.dataStore.barTitle
        })
        self.setData({
            categoryViewType: app.globalConfig.content_view_type
        });
        if (app.globalConfig.content_view_type == 1) {
            getData(self);
        } else {
            getCategoryData(self)
        }
        self.getSwiperContent();
    }).catch(err => { })
}

function getData(self) {
    showLoading();
    let param = {
        url: `${app.API_HOST}content/contentList`,
        data: {

        }
    }
    fetchApi(self, param).then(res => {
        let contentList = res.data.data;
        self.setData({
            showStyle: contentList.length == 0 ? 2 : 1,
            contentList: contentList
        })
        if (self.dataStore.cid != 0) {
          var newIndex = 0;
          for (var i = 0; i < contentList.length; i++) {
            if (contentList[i].id == self.dataStore.cid) {
              newIndex = i;
            }
          }
          self.setData({
            actvieIndex: newIndex,
            toView: 'view' + newIndex
          })
        }
        self.dataStore.cid = 0;
        app.globalData.pageOption = '';
    }).catch(err => {
        self.setData({
            showStyle: 3
        })
    })
}

function getGoodsList(self, isGetMore = false) {
    let index = parseInt(self.data.actvieIndex),
        categoryList = self.data.categoryList,
        tabBar = self.data.tabBar;
    var params = {
        url: app.API_HOST + 'content/cateGoodsList',
        data: {
            cid: categoryList[index].id,
            goodsType: 3,
            pageSize: 6,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }

    };
    if (self.data.posterName) {
        params.data.title = self.data.posterName.replace(/(^\s*)|(\s*$)/g, "");
    }
    fetchApi(self, params).then(res => {
        if (isGetMore) {
            self.dataStore.pageIndex++;
        };
        self.setData({
            goodsList: isGetMore ? self.data.goodsList.concat(res.data.data) : res.data.data,
            loadStyle: res.data.data.length < 6 ? 'loadOver' : 'loadMore'
        });
        self.setData({
            showStyle: self.data.goodsList.length == 0 ? 2 : 1
        })
        self.dataStore.cid = 0;
        app.globalData.pageOption = '';
    }).catch((err) => {
        console.log('error', err)
        self.dataStore.cid = 0;
        app.globalData.pageOption = '';
        self.setData({
            showStyle: 3
        })
    });
}

function getCategoryData(self) {
    let param = {
        url: app.API_HOST + "category/categoryList",
        data: {
            categoryType: 3,
        }
    }
    fetchApi(self, param).then(res => {
        let categoryList = [{
            id: 0,
            name: '全部'
        }].concat(res.data.data);
        if (self.dataStore.cid != 0) {
          var newIndex = 0;
          for (var i = 0; i < categoryList.length; i++) {
            if (categoryList[i].id == self.dataStore.cid) {
              newIndex = i;
            }
          }
          self.setData({
            actvieIndex: newIndex,
            toIndex: 'view' + newIndex
          })
        } 

        self.setData({
            categoryList: categoryList,
        })
        getGoodsList(self);
    }).catch((err) => {
        self.setData({
            showStyle: 3,
        })
    });
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