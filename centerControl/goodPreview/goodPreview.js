// 拿到全局应用程序实例  (该页面属于Ctrl+V,页面含大量无用代码,望删)
const app = getApp(); 
import {
  cutdownTime
} from '../../comm/time.js';
import {
  fetchApi,
  getGlobalConfig,
  addActionLog,
  getPhoneNumber
} from '../../api/api.js';
import {
  nav,
  showLoading,
  showModal,
  showToast,
  previewImageList,
  shareParam,
  getHomePage,
  previewImage
} from '../../utils/util';
let timeCutdown = 0;
let _w = 0;
let _h = 0;
let _pixelRatio = 0;
let flag = false
Page({
  data: {
    videoSrc: '',
    hasBtn: false,
    extConfig: app.extConfig,
    playUrl: 'https://facing-1256908372.file.myqcloud.com//image/20180322/268ac785eb953f36.png',
    customization: '',
    showStyle: 0,
    bargainDialog: false,
    banners: [],
    hasBindPhone: false,
    goods: {
      title: '',
      price: '',
      marketPrice: '',
      sales: '',
      desc: [],
      istime: 0,
    },
    showModalService: false,
    tags: [],
    desType: 1,
    playVideo: false,
    detail: [],
    menuActiveType: 0,
    goodsThumb: '',
    allOptions: [],
    options: [],
    showDialog: false,
    buyNum: 1,
    addCartPrice: 0,
    addCartStocks: 0,
    weight: 0,
    selectedOptionId: 0,
    open_custom_service: 0,
    optionDesc: [],
    times: [],
    saleState: {
      canBuy: 1,
      reason: "可正常售卖"
    },
    hasForm: 0,
    isGroupBuy: 0,
    groupBuyPrice: 0,
    groupBuyLimitNum: 0,
    groupBuyNum: 0,
    groupBuyDeadline: 0,
    is_bargain: 0,
    bargain_now_price: -1,
    bargain_price: 0,
    bragain_limit_num: 0,
    checkCommentType: 'all',
    comments: [],
    commentTotal: {},
    loadStyle: 'loadMore',
    isFrom: '',
    isCollect: 0,
    optionDescType: 0,
    image: "",
    isIphoneX: app.globalData.isIphoneX
  },
  dataStore: {
    goodsId: 0,
    pageIndex: 1,
    limitIos: 0
  },

  toGetCardInfo() {
    return new Promise((resolve, reject) => {
      let param = {
        url: 'card/getCardInfo',
        data: {
          cardId: app.globalData.cardId,
          //fromUser: 10495
        }
      }
      fetchApi(this, param).then(res => {
        resolve(res);
      }).catch(res => {
        reject(res);
      });
    })
  },

  onLoad(options) {
    if (app.globalConfig) {
      this.dataStore.limitIos = app.globalConfig.open_ios
    } else {
      getGlobalConfig(self).then(res => {
        this.dataStore.limitIos = res.data.data.open_ios
      }).catch(_ => { })
    }
    if(options){
      this.setData({
        hasBtn: options.hasBtn == 1
      })
    }
    if (options.cardId) {
      app.globalData.cardId = options.cardId || 0;
      app.globalData.fromUser = options.fromUser || 0;
      this.setData({
        isFromShare: true
      })
    }
    if (app.globalData.currentLoginUserCardInfo.mobile) {
      this.setData({
        hasBindPhone: true
      });
    }

    this.setData({
      toChat: app.globalData.cardUid && app.globalData.cardUid != app.globalData.uid
    })

    timeCutdown = 0;
    this.dataStore.goodsId = parseInt(options.goodsId || options.id);
    // this.dataStore.goodsId = parseInt(3072 || options.id);
    if (options.isFrom) {
      this.setData({
        isFrom: options.isFrom
      })
    }

    getInitData(this);
    if (_w == 0) {
      try {
        var res = wx.getSystemInfoSync();
        _w = res.windowWidth,
          _h = res.windowHeight;
        _pixelRatio = res.pixelRatio;
        if (res.system.indexOf('iOS') != -1) {
          flag = true
        }
      } catch (e) {

      }
    }

  },
  onShow() {
    this.dataStore.startTime = new Date().getTime();
    app.showRemind(this);
  },
  onUnload: function () {
    addActionLog(this, {
      type: 16,
      detail: {
        duration: new Date().getTime() - this.dataStore.startTime,
        id: this.dataStore.goodsId,
        name: this.data.goods.title
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    addActionLog(this, {
      type: 16,
      detail: {
        duration: new Date().getTime() - this.dataStore.startTime,
        id: this.dataStore.goodsId,
        name: this.data.goods.title
      }
    })
  },
  onReachBottom() {
    if (this.data.menuActiveType != 2 || this.data.loadStyle == 'loadOver' || this.data.isOpenComment == 0) {
      return;
    }
    this.setData({
      loadStyle: 'loading'
    })
    getComment(this, this.data.checkCommentType, true);
  },
  onPullDownRefresh() {

    if (app.globalConfig) {
      this.dataStore.limitIos = app.globalConfig.open_ios
    } else {
      getGlobalConfig(self).then(res => {
        this.dataStore.limitIos = res.data.data.open_ios
      }).catch(_ => { })
    }

    getInitData(this);
  },
  
  previewDesImg(e) {
    previewImage(e)
  },
  
  showServiceBox(e) {
    this.setData({
      showModalService: true
    })
  },
  closeServiceBox(e) {
    this.setData({
      showModalService: false
    })
  },
  showVideo(e) {
    let src = e.currentTarget.dataset.src;
    this.setData({
      playVideo: true,
      videoSrc: src
    })
  },
  closeVideo() {
    this.setData({
      playVideo: false
    })
  },
  // 函数
  toggleCartPanel(e) {
    if (this.data.saleState.canBuy == 1) {
      if (app.globalConfig.open_customization_category == 1 && this.data.customization) {
        nav({
          url: '/pages/webView/webView',
          data: {
            to: 'choose',
            goodsId: this.dataStore.goodsId,
            optionId: 0,
            total: this.data.buyNum,
            goodsName: this.data.goods.title,
            optionName: '',
            _w: _w,
            _h: _h,
            _pixelRatio: _pixelRatio
          }
        });
        return;
      }

      this.setData({
        showDialog: !this.data.showDialog,
        bargainDialog: false
      });
    }

  },
  selectGood(){
    const selectingGoods = app.pageData.getPage('selectingGoods')

    console.log(selectingGoods.data.addGoods,'addGoodsaddGoodsaddGoods')
    var hasoption = false;
    selectingGoods.data.goodsList.map((item, index) => {
        if (( item.id == this.dataStore.goodsId ) && selectingGoods.data.addGoods.length ) {
            hasoption = item.hasOption == 1
        }
    })

    selectingGoods.data.goodsList.map((item, index) => {
        if ((item.id == selectingGoods.data.addGoods[0])) {
            hasoption = hasoption ||  item.hasOption == 1
        }
    })
    if (hasoption) {
        wx.showModal({
            title: '提示',
            content: '多规格商品只能单独选择',
            showCancel: false,
            confirmText: '确定',
            success(res) { 
                wx.navigateBack({
                    delta: 1
                })
            }
        })
    }else {
        selectingGoods.data.goodsList.map((item, index) => {
            if (item.id == this.dataStore.goodsId) {
                selectingGoods.data.goodsList[index].isSelected = true;
            }
        })
        wx.navigateBack({
            delta: 1
        })
    }

   
  },
  toGroupBuy() {
    if (this.data.saleState.canBuy != 1) {
      return
    };
    nav({
      url: '/pages/groupDetail/groupDetail',
      data: {
        gid: this.dataStore.goodsId
      }
    });
  },
  toShowBargainDialog() {
    if (this.data.saleState.canBuy != 1) {
      return
    }
    if (this.data.bargain_now_price == -1) {
      this.setData({
        showDialog: !this.data.showDialog,
        bargainDialog: true
      })
    } else {
      nav({
        url: '/pages/bargainDetail/bargainDetail',
        data: {
          goodsId: this.dataStore.goodsId
        }
      })
    }
  },
  exchangeGoods() {
    if (this.data.buyNum > this.data.addCartStocks) {
      showModal({
        title: '提示',
        content: '库存不足,请调整购买数量'
      })
      return
    }
    if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
      showModal({
        title: '提示',
        content: '请选择商品的相应的规格。'
      })
    } else {
      this.setData({
        showDialog: false
      });
      nav({
        url: '/pages/confirmOrder/confirmOrder',
        data: {
          goodsId: this.dataStore.goodsId,
          optionId: this.data.selectedOptionId,
          total: this.data.buyNum,
          isPoints: 1
        }
      })
    }
  },
  bargainNow() {
    if (this.data.addCartStocks <= 0) {
      showModal({
        title: '提示',
        content: '库存不足',
      })
      return
    }
    if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
      showModal({
        title: '提示',
        content: '请选择商品的相应的规格。',
      })
    } else {
      let param = {
        url: app.API_HOST + 'bargain/createBargain',
        data: {
          goodsId: this.dataStore.goodsId,
          optionId: this.data.selectedOptionId,
        }
      }
      fetchApi(this, param).then(res => {
        this.setData({
          showDialog: false,
          bargainDialog: true
        });
        nav({
          url: '/pages/bargainDetail/bargainDetail',
          data: {
            goodsId: this.dataStore.goodsId,
            bargainId: res.data.data.bargainId
          }
        })
      })
    }

  },
  selectSpecItem(e) {
    let specId = e.target.dataset.specId,
      itemId = e.target.dataset.itemId,
      options = this.data.options,
      goodsThumb = this.data.goodsThumb,
      addCartPrice = this.data.addCartPrice,
      addCartStocks = this.data.addCartStocks,
      weight = this.data.weight,
      selectedOptionId = this.data.selectedOptionId,
      allOptions = this.data.allOptions;
    let selectedItems = [];

    for (let i = 0; i < options.length; i++) {
      if (parseInt(options[i].id) == parseInt(specId)) {
        for (let j = 0; j < options[i].items.length; j++) {
          let item = options[i].items[j];
          if (parseInt(item.id) == parseInt(itemId)) {
            options[i].items[j].isSelected = true;
          } else {
            options[i].items[j].isSelected = false;
          }
        }
      }
    }


    for (let i = 0; i < options.length; i++) {
      for (let j = 0; j < options[i].items.length; j++) {
        let item = options[i].items[j];
        if (item.isSelected) {
          selectedItems.push(parseInt(item.id));
        }
      }
    }
    let selectedItemsStr = selectedItems.sort(function (a, b) {
      return a - b
    }).join('_');


    for (let i = 0; i < allOptions.length; i++) {
      let specs = allOptions[i].specs;
      if (specs == selectedItemsStr) {
        addCartPrice = allOptions[i].productprice;
        addCartStocks = allOptions[i].stock;
        weight = allOptions[i].weight;
        selectedOptionId = allOptions[i].id;
        goodsThumb = allOptions[i].option_thumb_url;
        break;
      }
    }

    this.setData({
      options: options, 
      addCartPrice: addCartPrice,
      addCartStocks: addCartStocks,
      selectedOptionId: selectedOptionId,
      goodsThumb: goodsThumb,
      weight: weight

    });
  },
  changeBuyNum(e) {
    if (!e.detail.value) {
      showModal({
        title: '提示',
        content: '购买数量不能为空',
      }).then(_ => {
        this.setData({
          buyNum: this.data.buyNum
        });
      })
      return;
    }
    let num = parseInt(e.detail.value);
    if (num > this.data.addCartStocks) {
      showModal({
        title: '提示',
        content: '购买数量不能大于库存',
      }).then(_ => {
        this.setData({
          buyNum: this.data.buyNum
        });
      })

    }
    else if (num <= 0) {
      showModal({
        title: '提示',
        content: '添加到购物车中的商品数量不能小于1',
      }).then(_ => {
        this.setData({
          buyNum: 1
        });
      })
    }
    else {
      this.setData({
        buyNum: num
      });
    }
  },
  changeCartGoodsNum: function (e) {
    let type = e.target.dataset.type,
      num = this.data.buyNum;
    if (type == 'plus') {
      if (num >= this.data.addCartStocks) {
        showModal({
          title: '提示',
          content: '购买数量不能大于库存',
        }).then(_ => { })
      } else {
        num++;
      }
    } else {
      if (num == 1) {
        showModal({
          title: '提示',
          content: '添加到购物车中的商品数量不能小于1',
        }).then(_ => { })
      } else {
        num--;
      }
    }
    this.setData({
      buyNum: num
    });
  },
  addToCart: function () {
    if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
      showModal({
        title: '提示',
        content: '请选择商品的相应的规格。'
      })
    } else {
      let params = {
        url: app.API_HOST + 'cart/add',
        data: {
          beid: app.globalData.beid,
          goodsId: this.dataStore.goodsId,
          optionId: this.data.selectedOptionId,
          total: this.data.buyNum
        }
      };

      fetchApi(this, params).then(res => {
        this.setData({
          showDialog: false
        });
        wx.showToast({
          title: '添加购物车成功',
          icon: 'success',
          duration: 1000,
        });
      });
    }
  },
  buyNow() {
    if (this.data.isVirtualGoods == 1 && this.dataStore.limitIos == 1) {
      if (flag) {
        showModal({
          title: '提示',
          content: '商家未开启iOS系统用户可购买设置'
        })
        return
      }
    }
    if (this.data.buyNum > this.data.addCartStocks) {
      showModal({
        title: '提示',
        content: '库存不足,请调整购买数量'
      })
      return
    }
    if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
      showModal({
        title: '提示',
        content: '请选择商品的相应的规格。'
      })
    } else {
      this.setData({
        showDialog: false
      });
      let optionId = this.data.selectedOptionId;
      if (this.data.customization) {
        let optionName = '';
        if (optionId > 0) {
          for (var i = 0; i < this.data.allOptions.length; i++) {
            if (this.data.allOptions[i].id == optionId) {
              optionName = this.data.allOptions[i].title;
              break;
            }
          }
        }
        nav({
          url: '/pages/webView/webView',
          data: {
            goodsId: this.dataStore.goodsId,
            optionId: optionId,
            total: this.data.buyNum,
            goodsName: this.data.goods.title,
            optionName: optionName,
            _w: _w,
            _h: _h,
            _pixelRatio: _pixelRatio
          }
        })
      } else {
        nav({
          url: '/pages/confirmOrder/confirmOrder',
          data: {
            goodsId: this.dataStore.goodsId,
            optionId: optionId,
            total: this.data.buyNum
          }
        })
      }

    }
  },
  //
  toMycart() {
    nav({
      url: '/pages/myCart/myCart'
    })
  },
  toMycollection() {
    let param = {
      url: app.API_HOST + 'goods/likeGoods',
      data: {
        goodsId: this.dataStore.goodsId
      }
    }
    if (this.data.isCollect == 1) {
      param.url = app.API_HOST + 'goods/unLikeGoods'
    }
    fetchApi(this, param).then(res => {
      this.setData({
        isCollect: this.data.isCollect ? 0 : 1
      });

      showToast(res.data.msg, this, 1500, 'success');
    }).catch((err) => {
      console.log('err',err)
    });


  },
  toCourse() {
    let related_virtual_goods = this.data.related_virtual_goods;
    if (!related_virtual_goods || !related_virtual_goods.id) {
      showToast('暂未关联id');
      return;
    }
    nav({
      url: '/pages/course/course',
      data: {
        id: related_virtual_goods.id
      }
    })
  },
  
  tapChange(e) {
    let index = parseInt(e.currentTarget.dataset.type);
    this.setData({
      menuActiveType: index,
    });
    if (index == 2 && this.data.comments.length == 0) {
      getComment(this, this.data.checkCommentType, false);
    }

  },
  tapCommentChange(e) {
    let type = e.currentTarget.dataset.type;
    this.dataStore.pageIndex = 1;
    this.setData({
      checkCommentType: type,
      loadStyle: 'loadMore',
    });
    getComment(this, this.data.checkCommentType, false)
  },
  previewImage(e) {
    let imgIndex = parseInt(e.currentTarget.dataset.imgIndex),
      banners = this.data.banners;
    previewImageList(banners, 'url', banners[imgIndex].url);

  },
  previewDetailImage(e) {
    let imgIndex = parseInt(e.currentTarget.dataset.index),
      detailImgs = this.data.detailImgs;
    previewImageList(detailImgs, 'url', detailImgs[imgIndex].url)
  },
  getQRCode() {
    let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10);
    let QRcode = `${app.API_HOST}goods/getQRcode?goodsId=${this.dataStore.goodsId}&distributorId=${app.globalData.uid}&${shareParam()}&_t=${qrCodeTime}`;
    return QRcode;
  },

  getPhoneNumber(e) {
    getPhoneNumber(e).then(phoneNumber => {
      if (phoneNumber!='') {
        this.setData({
            hasBindPhone: true
        })
        this.toChat();
      } else {
        this.toChat();
      }
    }).catch(err => {
      showTips('手机号获取失败', this)
    })
  },

  toChat() {
    if (app.globalData.cardUid && app.globalData.cardUid != app.globalData.uid) {
      let data = {
        type: "readyToSend",
            content: {
              type: "shop",
              id: this.data.goods.id,
              price: this.data.goods.price,
              title: this.data.goods.title,
              url: this.data.goodsThumb
            }
      };
      nav({
        url: '/pages/chat/chat',
        data: {
          toUid: app.globalData.cardUid,
          readyToSend: JSON.stringify(data)
        }
      })
    } else if (!app.globalData.cardUid) {
      this.getInfoBeforeToChat();
    }
  },

  getInfoBeforeToChat() {
    this.toGetCardInfo().then(res => {
      app.globalData.cardUid = res.data.data.admin_uid;
      this.toChat();
    }).catch(res => {
      console.log(res);
    })
  },

  navHomePage() {
    nav({
      url: getHomePage()
    })
  }
});
// 加载数据
function getInitData(self) {
  let renderPage = function () {
    self.setData({
      open_custom_service: app.globalConfig.funcList.open_custom_service,
      open_qr_code: app.globalConfig.funcList.open_qr_code,
      isOpenComment: app.globalConfig.comments_config.isComment
    });
    getGoodsData(self);
  }
  if (app.globalConfig) {
    renderPage();
  } else {
    getGlobalConfig(self).then(res => {
      renderPage()
    }).catch(err => {
      console.log('初始化失败: ', err);
      self.setData({
        showStyle: 3
      })
    });
  }
}

function getGoodsData(self) {
  showLoading();
  let params = {
    url: app.API_HOST + 'goods/detail',
    data: {
      id: self.dataStore.goodsId,
      channelId: app.globalData.channelId,
      is_points: self.data.isFrom == 'integralMall' ? 1 : 0
    }
  };

  fetchApi(self, params).then((data) => {
    clearInterval(timeCutdown);
    let datas = data.data.data,
      tags = [],
      vipInfo,
      optionDesc = [],
      banners = datas.thumb.banners,
      goodsThumb = datas.thumb.thumb.url,
      detailImgs = datas.thumb.detail,
      saleState = datas.saleState;

    let goods = {
      id: datas.id,
      title: datas.title,
      price: datas.price,
      marketPrice: datas.marketPrice,
      sales: datas.sales,
      desc: datas.desc ? datas.desc.split('\n') : [],
      istime: datas.istime
    }
    let times = [{
      timeend: datas.timeend,
      timestart: datas.timestart,
      timeShown: '',
      timeActive: 'bc-c'
    }];
    wx.setNavigationBarTitle({
      title: goods.title
    })
    if (datas.tags) {
      tags = JSON.parse(datas.tags)
    }
    let types = [];
    if (datas.hasOption == 1) {
      types = datas.specs.types;
      for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < types[i].items.length; j++) {
          types[i].items[j].isSelected = false;
        }
      }
    }
    if (datas.has_vip_price == 1) {
      vipInfo = {
        hasVipPrice: datas.has_vip_price,
        vipPrice: datas.vip_price,
        userIsVip: datas.current_user_is_vip
      }
    } else {
      vipInfo = null
    }
    var optionDescType = 0;
    try {
      optionDesc = JSON.parse(datas.optionDesc);
      //判断是否为obj 和存在imgID
      let isNeedObj = typeof (optionDesc) == 'object' && ('imgId' in optionDesc);
      if (isNeedObj) {
        optionDesc = optionDesc.imgUrl;
        optionDescType = '1';
      } else {
        if (datas.optionDesc != '') {
          optionDesc = datas.optionDesc.split("\n");
        }
      }
    } catch (err) {
      if (datas.optionDesc != '') {
        optionDesc = datas.optionDesc.split("\n");
      }
    }
    let nowTime = parseInt(new Date().getTime() / 1000);
    cutdownTime(nowTime, times);
    self.setData({
      optionDescType: optionDescType,
      isCollect: datas.isLiked ? parseInt(datas.isLiked) : 0,
      tags: tags,
      showStyle: 1,
      banners: banners,
      goods: goods,
      detailImgs: detailImgs,
      goodsThumb: goodsThumb,
      options: types,
      desType: datas.type,
      allOptions: datas.hasOption ? datas.specs.options : [],
      addCartStocks: datas.total,
      addCartPrice: datas.price,
      optionDesc: optionDesc,
      times: times,
      saleState: saleState,
      isGroupBuy: datas.isGroupBuy ? datas.isGroupBuy : 0,
      groupBuyPrice: datas.groupBuyPrice ? datas.groupBuyPrice : 0,
      groupBuyLimitNum: datas.groupBuyLimitNum ? datas.groupBuyLimitNum : 0,
      groupBuyNum: datas.groupBuyNum ? datas.groupBuyNum : 0,
      groupBuyDeadline: datas.groupBuyDeadline ? datas.groupBuyDeadline : 0,
      is_bargain: datas.is_bargain ? datas.is_bargain : 0,
      bargain_now_price: datas.bargain_now_price ? datas.bargain_now_price : 0,
      bargain_price: datas.bargain_price ? datas.bargain_price : 0,
      bragain_limit_num: datas.bragain_limit_num ? datas.bragain_limit_num : 0,
      costCredit: datas.costCredit || 0,
      vipInfo: vipInfo,
      weight: datas.weight,
      hasForm: datas.hasForm || 0,
      customization: datas.customization || '',
    });
    self.setData({
      isVirtualGoods: datas.is_virtual_goods,
      related_virtual_goods: datas.related_virtual_goods || '',
      has_virtual_goods_order: datas.has_virtual_goods_order || 0,

    })
    if (app.globalConfig.comments_config.isComment == 1) {
      datas.comments.rate = (datas.comments.good / datas.comments.all).toFixed(2) * 100;
      self.setData({
        commentTotal: datas.comments
      })
    }

    timeCutdown = setInterval(function () {
      nowTime++;
      var hasFinishAll = cutdownTime(nowTime, times);
      self.setData({
        times: times
      })

      if (hasFinishAll) {
        clearInterval(timeCutdown);
      }

    }, 1000);
  }).catch(err => {
    self.setData({
      showStyle: 3
    });
    console.log('error', err)
  });

};

function getComment(self, rate, isGetMore = false) {
  let param = {
    url: app.API_HOST + 'comment/get',
    data: {
      goodsId: self.dataStore.goodsId,
      pageSize: 7,
      pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
      rate: rate,
    }

  };
  fetchApi(self, param).then(res => {
    if (isGetMore) {
      self.dataStore.pageIndex++
    }
    let data = res.data.data
    self.setData({
      loadStyle: data.length < 7 ? 'loadOver' : 'loadMore',
      comments: isGetMore ? self.data.comments.concat(data) : data,
    })
  }).catch((err) => {
    console.log('err',err);
  });
}