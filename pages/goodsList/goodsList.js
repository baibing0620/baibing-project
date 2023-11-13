const app = getApp();
import {
  fetchApi,
  addActionLog
} from '../../api/api';
import {
  showLoading,
  nav,
  deepClone
} from '../../utils/util';
Page({
  data: {
    activeTabBarIndex: 0,
    activeScrollIndex: 0,
    goodsList: [],
    extConfig: app.extConfig,
    goodsShowStyle: 'column',
    loadStyle: 'loadMore',
    searchType: 1,
    scrollView: 'view0',
    groupIds: [],
    labelHead: [],
    labelGroup: [],
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
    }]

  },
  dataStore: {
    pageIndex: 1,
    searchText: '',
    cid: 0,
    searchType: 1,
    child: 0,
    startTime: 0,
    title: '',
    isCredit: ''
  },

  onLoad: function(options) {
    console.log(options, 'options')
    console.log(options.label, 'label' )
    this.dataStore.cid = options.id || app.link.id || 0;
    this.dataStore.searchText = options.searchText || '';
    this.dataStore.child = options.child || 0;
    this.dataStore.searchType = options.searchType || 1;
    this.dataStore.title = options.title || '';
    if (options.cardId) {
      app.globalData.cardId = options.cardId || 0;
      app.globalData.fromUser = options.fromUser || 0;
      this.setData({
        isFromShare: true
      });
    }

    if(options.label) {
      var label = JSON.parse(options.label)
      if (label.length) {
        this.dataStore.label = label.map(e => e.id)
      }
    }

    if (options.title) {
      wx.setNavigationBarTitle({
        title: options.title
      })
    }; 
    this.setData({
      searchType: options.searchType || 1,
      isCredit: options.isCredit || ''
    })
    if (options.distributorId) {
      app.globalData.distributorId = options.distributorId;
    }
    this.getGroupListByCid()
    this.getShopCreditSetting()
  },
  onShow() {
    this.dataStore.startTime = new Date().getTime();
    app.showRemind(this);
  },
  onHide() {
    addActionLog(this, {
      type: 15,
      detail: {
        duration: new Date().getTime() - this.dataStore.startTime,
        id: this.dataStore.cid,
        name: this.dataStore.title + '类'
      }
    })
  },
  onUnload() {
    addActionLog(this, {
      type: 15,
      detail: {
        duration: new Date().getTime() - this.dataStore.startTime,
        id: this.dataStore.cid,
        name: this.dataStore.title + '类'
      }
    })
  },
  onPullDownRefresh: function() {
    showLoading({
      title: '刷新中'
    });
    this.dataStore.pageIndex = 1;
    loadGoodsList(this);
  },

  onReachBottom: function() {
    if (this.data.loadStyle == 'loadOver') {
      return
    }
    this.setData({
      loadStyle: 'loading'
    })
    loadGoodsList(this, true)

  },
  onShareAppMessage: function() {
    return {
      title: `我发现${app.globalData.appName}商城有很多好物，快来看看吧`,
      path: `/pages/goodsList/goodsList?child=${this.dataStore.child}&id=${this.dataStore.cid}&searchText=${this.dataStore.searchText}&searchType=${this.dataStore.searchType}&isCredit=${this.data.isCredit}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`,
    }
  },
  changeGoods() {
    this.setData({
      goodsShowStyle: this.data.goodsShowStyle == 'row' ? 'column' : 'row'
    })
  },
  navGoods(e) {
    let param = {},
      id = e.currentTarget.dataset.id;
    if (this.dataStore.searchType == 1) {
      param = {
        url: '/pages/goodsdetail/goodsdetail',
        data: {
          goodsId: id
        }
      }
    } else if (this.dataStore.searchType == 2) {
      param = {
        url: '/pages/foodsDetail/foodsDetail',
        data: {
          id: id
        }
      }
    }
    nav(param);
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
    loadGoodsList(this)
  },
  scrolltabchange(e) {
    this.dataStore.pageIndex = 1;
    let index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      activeScrollIndex: index
    });
    loadGoodsList(this)
  },
  chooseHeadLabel(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      labelHeadShow: false,
      scrollView: 'view' + index,
      activeScrollIndex: index,
    });
    this.dataStore.pageIndex = 1;
    loadGoodsList(this)
  },
  getShopCreditSetting() {
    fetchApi(this, {
      url: "config/get",
      data: {}
    }).then(res => this.setData({
      is_open_credit: res.data.data.is_open_credit == 1
    }))
  },
  getGroupListByCid() {
    let param = {
      url: app.API_HOST + 'category/getGroupListByCid',
      data: {
        cid: this.dataStore.cid,
      }
    }
    fetchApi(this, param).then(res => {
      let data = res.data.data;
      if(data.length) {
        let labelHead = data.filter(e => e.is_head == 1)
        let labelGroup = data.filter(e => e.is_head == 0)
        let all = [{ name: '全部', id: '' }]
        all = all.concat(labelHead[0] ? labelHead[0].labelGroupInfo.labelInfo : [])
        if (this.dataStore.label && this.dataStore.label.length) {
          labelGroup.forEach(item => {
            item.labelGroupInfo.labelInfo.forEach(e => {
              this.dataStore.label.forEach(_ => {
                if(_ == e.id) {
                  e.isactive = true
                  this.data.groupIds.push(e.id)
                  this.setData({
                    groupIds: this.data.groupIds
                  })
                }
              })
            })
          })
          all.forEach((item, index) => {
            this.dataStore.label.forEach(_ => {
              if (_ == item.id) {
                this.setData({
                  activeScrollIndex: index
                })
              }
            })
          })
        } 
        this.setData({
          labelHead: all,
          labelGroup: labelGroup
        })
      }
      loadGoodsList(this);
    })
  },
  filterLabel() {
    if(!this.data.labelGroupShow) {
      this.setData({
        labelGroupOption: deepClone(this.data.labelGroup)
      })
    }
    this.setData({
      labelGroupShow: !this.data.labelGroupShow
    })
  },
  chooseGroupLabel(e) {
    console.log(e, 'eee')
    const { index, labelindex } = e.currentTarget.dataset;
    const isactive = this.data.labelGroupOption[index].labelGroupInfo.labelInfo[labelindex].isactive || false
    var activeStr = `labelGroupOption[${index}].labelGroupInfo.labelInfo[${labelindex}].isactive`
    this.setData({
      [activeStr]: !isactive
    })
  },
  labelHeadDown() {
    this.setData({
      labelHeadShow: true
    })
  },
  preventEvent: function (e) { console.log(2222) },
  labelHeadUp() {
    this.setData({
      labelHeadShow: false,
    });
  },
  confirmLabel() {
    let ids = [], idArr;
    this.data.labelGroupOption.forEach(item => {
      idArr = item.labelGroupInfo.labelInfo.filter(e =>  e.isactive).map(_ => _.id)
      ids = ids.concat(idArr)
    })
    console.log(ids, 'ids')
    this.setData({
      groupIds: ids,
      labelGroup: deepClone(this.data.labelGroupOption),
      labelGroupShow: false
    })
    this.dataStore.pageIndex = 1;
    loadGoodsList(this)
  },
  resetLabel() {
    this.data.labelGroupOption.forEach(item => {
      item.labelGroupInfo.labelInfo.forEach(e => { e.isactive = false })
    })
    this.setData({
      groupIds: [],
      labelGroupOption: this.data.labelGroupOption,
      labelGroup: deepClone(this.data.labelGroupOption),
    })
    this.dataStore.pageIndex = 1;
    loadGoodsList(this)
  },
  cancelGroupBox() {
    this.setData({
      labelGroupOption: deepClone(this.data.labelGroup),
      labelGroupShow: false
    })
  },

  
  
});
/*加载更多商品数据
    cid为0时候加载全部类别
    pageIndex为分页，从1开始
    pageSize为一页加载多少个，默认6  
    orderBy productprice 价格  createtime 时间  sales 销量 （可不填）
    orderType asc 升序 desc 降序 （可不填）
*/

function loadGoodsList(self, isGetMore = false) {
  let index = parseInt(self.data.activeTabBarIndex),
    tabBar = self.data.tabBar;

  var labelIds = deepClone(self.data.groupIds)
  labelIds.push(self.data.labelHead.length ? self.data.labelHead[self.data.activeScrollIndex].id : '')

  var param = {
    url: app.API_HOST + 'category/goodsList',
    data: {
      searchType: self.dataStore.searchType,
      child: self.dataStore.child,
      cid: self.dataStore.cid,
      pageSize: 10,
      orderBy: tabBar[index].orderBy,
      orderType: tabBar[index].orderType,
      search: self.dataStore.searchText,
      pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
      city: app.globalData.cityLocate,
      isPutInPointsMall: self.data.isCredit == 1 ? 1 : 0,
      labelIds: labelIds.join(',')
    }

  };
  fetchApi(self, param).then(res => {
    if (isGetMore) {
      self.dataStore.pageIndex++
    };
    self.setData({
      goodsList: isGetMore ? self.data.goodsList.concat(res.data.data) : res.data.data,
      loadStyle: res.data.data.length < 10 ? 'loadOver' : 'loadMore'
    });
    self.setData({
      showStyle: self.data.goodsList.length == 0 ? 2 : 1
    })
  }).catch((err) => {
    self.setData({
      showStyle: 3
    })
  });
}