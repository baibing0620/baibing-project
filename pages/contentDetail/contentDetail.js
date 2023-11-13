const app = getApp();
import {
  fetchApi,
  getGlobalConfig,
  addActionLog,
  getPhoneNumber
} from '../../api/api';
import {
  previewImage,
  showLoading, 
  showToast,
  showTips,
  nav,
  getHomePage,
  openLocation,
  makePhoneCall,
  trim
} from '../../utils/util';
Page({ 
  data: {
    shop_Name:'',
    showStyle: 0,
    contentList: [],
    productprice: '',
    mainColor: '#fe952e',
    contentType: -1,
    title: '',
    priceForm: '',
    commontList: [],
    serverList:[],
    serverLabel:[],
    total: 0,
    zanNum: 0,
    showZan: false,
    showContentModal: false,
    loadStyle: 'loadMore',
    isShowArticleComment: false,
    isFromShare:0,
    name: "",
    position: "",
    avatar: "",
    menuSetting: {
        "留言": { 
            from:'contentDetail'
        },
        "分享": {
            image: ""
        }
    },
    showShareModal:false,
    canBuy: true,
    link_goods_id: [],
    is_content_marketing: 0,
    ssg_id: "0",
    news_contact_open: false,
    has_add_wechat: false,
    isIphoneX: app.globalData.isIphoneX,
    palette:{},
    userInfo:{},
  },
  dataStore: {
    id: 0,
    pageIndex: 1,
    title:'',
    startTime: '',
  },

  onLoad: function (options) {
  console.log('options',options);
    this.dataStore.id = options.id || options.goodsId || app.link.id || 0;
    if (options.cardId) {
      app.globalData.cardId = options.cardId || 0;
      app.globalData.fromUser = options.fromUser || 0;
      this.setData({
        isFromShare:1
      });
    }
    if (app.globalData.currentLoginUserCardInfo.mobile) {
      this.setData({
        hasBindPhone: true
      });
    }
    let menuSetting = this.data.menuSetting;
    this.setData({
      menuSetting
    })
    getInitData(this);
    getshopName(this);
  },
  onReady: function () {

  },
  onShow: function () {
    this.dataStore.startTime = new Date().getTime();
    app.showRemind(this);
  },
  onHide: function () {
    addActionLog(this, {
      type: 19,
      detail: {
        duration: new Date().getTime() - this.dataStore.startTime,
        id: this.dataStore.id,
        name: this.dataStore.title
      }
    })
  },
  onUnload: function () {
    addActionLog(this, {
      type: 19,
      detail: {
        duration: new Date().getTime() - this.dataStore.startTime,
        id: this.dataStore.id,
        name: this.dataStore.title
      }
    })
  },
  onPullDownRefresh: function () {
    this.dataStore.pageIndex = 1;
    this.data.loadStyle = "loadMore";
    getInitData(this);
  },
  onReachBottom: function () {
    if (this.data.loadStyle == 'loadOver' || this.data.isShowArticleComment == 0) {
      return;
    }
    this.setData({
      loadStyle: 'loading'
    })
    getMoreCommentList(this, true)
  },
  closeShareModal() {
    this.setData({
      upShareModal: false,
    })
    setTimeout(() => {
      this.setData({
        showShareModal: false
      })
    }, 180)
  },
  onShareAppMessage: function (res) {
    addActionLog(this, {
      type: 20,
    });
    this.setData({
        showShareModal:false
    })
    this.setGoodsInfo(3)
    return {
      title:  this.data.share_words || this.data.news_share_language ||  `我发现了一篇特别棒的文章，${this.data.title ? this.data.title + "，" : ""}快来看看吧`,
      imageUrl: this.data.share_image || this.data.thumbUrl,
      path: `/pages/contentDetail/contentDetail?id=${this.dataStore.id}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
    }
  },
  shareCard(e) {
    let param = {
      url: `${app.API_HOST}card/getCardInfo`,
      data: {
        token:app.globalData.token,
        cardId:app.globalData.cardId
      }
    }
    fetchApi(this,param).then(res=>{
      this.setData({
        userInfo: res.data.data
      })
    })
    this.setData({
      upShareModal: true,
      showShareModal: true
    })
  },
  getPageQRCode(){
    this.setData({
      showCover:true,
      showShareModal: false,
      palette:this.palette()
    })
  },
  palette() {
    // return `Content/makeNewsCodeImg?goodsId=${parseInt(this.dataStore.id)}`;
    let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
      path = encodeURIComponent(`/pages/contentDetail/contentDetail?id=${this.dataStore.id}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`),
      qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}`
    const { title, thumbUrl, share_words, share_content } = this.data
    return {
      "width": "750px",
      "height": "1094px",
      "background": "linear-gradient(to bottom, #3574FA 100%,#3F9AFB 50%)",
      "borderRadius": "0px",
      "views": [
        {
          "type": "text",   //昵称
          "text": this.data.description,
          "css": {
            "color": "#ffffff",
            "background": "rgba(0,0,0,0)",
            "width": "670px",
            "height": "104.36399999999999px",
            "top": "30px",
            "left": "40.99999877929696px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "36px",
            "fontWeight": "bold",
            "maxLines": "2",
            "fontStyle": "oblique",
            "lineHeight": "51.94800000000001px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "image",
          "url": "../../imgs/color_000.png",   ////手机蒙版
          "css": {
            "width": "670px",
            "height": "350px",
            "top": "650.99990794529822px",
            "left": "40px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",   // 素材图片
          "url": `${thumbUrl}?imageView2/1/w/670/h/446`,
          "css": {
            "width": "670px",
            "height": "446px",
            "top": "220px",
            "left": "40.00000276692697px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "aspectFill"
          }
        },
        {
          "type": "text",   //文章标题
          "text": title,
          "css": {
            "color": "#ffffff",
            "background": "rgba(0,0,0,0)",
            "width": "670px",
            "height": "104.36399999999999px",
            "top": "90px",
            "left": "40.99999877929696px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "40px",
            "fontWeight": "bold",
            "maxLines": "2",
            "lineHeight": "51.94800000000001px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "text",
          "text": share_content,   //资讯内容
          "css": {
            "color": "#888888",
            "background": "rgba(0,0,0,0)",
            "width": "590px",
            "height": "34.32px",
            "top": "700px",
            "left": "80.00000032552077px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "30px",
            "fontWeight": "normal",
            "maxLines": "4",
            "lineHeight": "34.632000000000005px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "image",
          "url": "https://facing-1256908372.file.myqcloud.com/image/20200325/b864dbe4688defbd.jpg",  //白底蒙版
          "css": {
            "width": "670px",
            "height": "174px",
            "top": "880.0000000000001px",
            "left": "40px",
            "rotate": "0",
            "borderRadius": "20px",
            "borderWidth": "",
            "borderColor": "#eeeeee",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",   //二维码
          "url": qrcode,
          "css": {
            "width": "176px",
            "height": "176px",
            "top": "860.0000141622618px",
            "left": "94.000000976562433px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "text",
          "text": `长按识别小程序码查看详情`,   //分享标题
          "css": {
            "color": "#000000",
            "background": "rgba(0,0,0,0)",
            "width": "500px",
            "height": "57.19999999999999px",
            "top": "930.0000141622618px",
            "left": "340.000000976562433px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "26px",
            "fontWeight": "700",
            "maxLines": "1",
            "lineHeight": "57.72000000000001px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "text",
          "text": "分享自 ["+this.data.shop_Name+"]",    //分享 内容
          "css": {
            "color": "#666666",
            "background": "rgba(0,0,0,0)",
            "width": "500px",
            "height": "86.96999999999998px",
            "top": "980px",
            "left": "340px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "26px",
            "fontWeight": "normal",
            "maxLines": "2",
            "lineHeight": "43.290000000000006px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        }
      ]
    }

  },
  coverHide() {
    this.setData({
      showCover: false
    })
  }, 
  previewImage: function (e) {
      let src = e.currentTarget.dataset.src
      if (src){
          src = src.replace(/\?/g, '&')
          wx.navigateTo({
              url: `/pages/webH5/webH5?src=${src}`,
          })
      }else{
          previewImage(e);
      }
   
  },
  
  toAppointment() {
    app.globalData.reservationGoods = {
      url: this.data.thumbUrl,
      title: this.data.title,
      id: this.dataStore.id
    };
    nav({
      url: '/pages/reservation/reservation',
      data: {}
    })
  },
  toConsult() {
    nav({
      url: '/pages/consult/consult',
      data: {}
    })
  },
  toPay() {
    nav({
      url: '/pages/contentConfirm/contentConfirm',
      data: {
        title: this.data.title,
        id: this.dataStore.id,
        price: this.data.productprice
      }
    })
  },
  toNavigation() {
    let navigation = this.data.priceForm.navigation;
    if (!navigation.lngLat) {
      showToast('经纬度为空');
      return;
    }
    let longitude = parseFloat(navigation.lngLat.split(',')[0]),
      latitude = parseFloat(navigation.lngLat.split(',')[1]),
      address = navigation.address;
    openLocation(latitude, longitude, address);
  },
  callPhone() {
    makePhoneCall(this.data.priceForm.contact.phone);
  },
  clickZan() {
    let zanNum = parseInt(this.data.zanNum) + 1
    let param = {
      url: `${app.API_HOST}content/zan`,
      data: {
        id: parseInt(this.dataStore.id)
      }
    }
    fetchApi(this, param).then(res => {
      addActionLog(this, {
        type: 21,
      })
      this.setData({
        showZan: true,
        zanNum: zanNum > 999 ? '999+' : zanNum
      })
    }).catch(err => {
      console.log('error: ', err)
    })
  },
  cancelZan() {
    let zanNum = parseInt(this.data.zanNum) - 1
    let param = {
      url: `${app.API_HOST}content/unZan`,
      data: {
        id: parseInt(this.dataStore.id)
      }
    }
    fetchApi(this, param).then(res => {
      this.setData({
        showZan: false,
        zanNum: zanNum > 999 ? '999+' : zanNum
      })
    }).catch(err => {
      console.log('error: ', err)
    })
  },
  showModal() {
    this.setData({
      showContentModal: true
    })
  },
  closeModal() {
    this.setData({
      showContentModal: false
    })
  },
  formSubmit(e) {
    let textarea = trim(e.detail.value.textarea);
    if (textarea) {
      let param = {
        url: `${app.API_HOST}comment/addArticleComment`,
        data: {
          id: parseInt(this.dataStore.id),
          comment: textarea
        }
      }
      fetchApi(this, param).then(res => {
        this.setData({
          showContentModal: false
        })
        this.dataStore.pageIndex = 1;
        getInitData(this)
      }).catch(err => {
        console.log('error: ', err)
      })

    } else {
      showToast('评论内容不能为空', this);
    }
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
              type: "info",
              id: this.dataStore.id,
              title: this.data.title,
              url: this.data.thumbUrl
            }
      }
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
  showModal() {
    this.setData({
      showContentModal: true
    })
  },
  
  closeModal() {
    this.setData({
      showContentModal: false
    })
  },
  navHomePage() {
    nav({
      url: getHomePage()
    })
  },
  getStaffFuncManageSetting() {
    let params = {
      url: app.API_HOST + "config/getStaffFuncManageSetting",
      data: {}
    }
    fetchApi(this, params).then(res => {
      let { news_contact_open_main, staff_func_control } = this.data;
      this.setData({
        news_contact_open: staff_func_control == 1 ? res.data.data.news_contact_open : news_contact_open_main,
        has_add_wechat: res.data.data.has_add_wechat == 1 ? true : false
      });
    }).catch(res => {
      console.log('error: ', res);
    })
  },
  navAddWechat() {
    nav({
      url: '/centerControl/addentErpriseWechat/addentErpriseWechat',
      data: {
        status: 4
      }
    })
  },
  navGoodsdetail(e) {
    this.setGoodsInfo(1, e.currentTarget.dataset.id)
    nav({
      url: '/pages/goodsdetail/goodsdetail',
      data: {
        id: e.currentTarget.dataset.id,
        sourceType: 2,
        articleId: this.dataStore.id
      }
    })
  },
  navServerdetail(e) {
    nav({
      url: '/pages/serviceCommodityDetail/serviceCommodityDetail',
      data: {
          id:e.currentTarget.dataset.id
      }
    })
  },
  setGoodsInfo(type, goods_id ) {
    let param = {
      url: app.API_HOST + 'ShortVideo/addMarketingLog',
      data: {
        type: type,
        source_type: 2,
        goods_id: goods_id || 0,
        video_id: 0,
        content_id: this.dataStore.id,
      }
    }
    fetchApi(this, param).then(res => {
      console.log(res, 'res')
    })
  },
  getH5Link() {
    let apiHost = app.API_HOST.substring(0, app.API_HOST.length - 4)
    this.setData({
      linkUrl: `${apiHost}multi.html#/enterpriseContent?beid=${app.globalData.beid}&id=${parseInt(this.dataStore.id)}`,
      linkOpen: true,
      showShareModal: false,
    })
  },
  closeLinkBox() {
    this.setData({
      linkOpen: false
    })
  },
  copyLinkUrl() {
    wx.setClipboardData({
      data: this.data.linkUrl,
      success: e => {
        showToast('复制成功', 'success');
        this.setData({
          linkOpen: false
        })
      }
    })
  },
});

function getshopName(self){
  var shopName = {
      url: 'card/getShopName',
      data: {
          beid:app.globalData.beid,
          token:app.globalData.token
      }
  }
  fetchApi(self, shopName).then(res => {
      self.setData({
          shop_Name: res.data.data
      })
  }).catch(err => {
      console.log(err)
  })
}
function getInitData(self) {
  // showLoading();
  if (app.globalConfig === null) {
    getGlobalConfig(self).then(reN => {
      self.setData({
        type: app.globalConfig.type,
        isShowArticleComment: app.globalConfig.comments_config.isArticleComment == 1 ? true : false,
        news_contact_open_main: app.globalConfig.news_contact_open,
        staff_func_control: app.globalConfig.staff_func_control
      })
      self.getStaffFuncManageSetting();

      if (app.globalConfig.comments_config.isArticleComment == 1) {
        getData(self);
      } else {
        getContentDetail(self).then(_ => {
          self.setData({
            showStyle: 1
          })
        }).catch((err) => {
          console.log('error: ', err)
          self.setData({
            showStyle: 3
          })
        })
      }
    }).catch(err => {})

  } else {
    self.setData({
      type: app.globalConfig.type,
      isShowArticleComment: app.globalConfig.comments_config.isArticleComment == 1 ? true : false,
      news_contact_open_main: app.globalConfig.news_contact_open,
      staff_func_control: app.globalConfig.staff_func_control
    })
    self.getStaffFuncManageSetting();
    if (app.globalConfig.comments_config.isArticleComment == 1) {
      getData(self);
    } else {
      getContentDetail(self).then(_ => {
        self.setData({
          showStyle: 1
        })
      }).catch((err) => {
        console.log('error: ', err)
        self.setData({
          showStyle: 3
        })
      })
    }
  }
}

function getData(self) {
  Promise.all([getMoreCommentList(self), getContentDetail(self)]).then(res => {
    self.setData({
      showStyle: 1,
    })
  }).catch((err) => {

    self.setData({
      showStyle: 3
    })
  })
}

function getContentDetail(self) {
  let param = {
    url: `${app.API_HOST}content/detail`,
    data: {
      id: parseInt(self.dataStore.id)
    }
  }
  return new Promise(function (resolve, reject) {
    fetchApi(self, param).then(res => {
      let data = res.data.data,
        productprice = parseFloat(data.productprice),
        link_goods_id = data.link_goods_id,
        is_content_marketing = data.is_content_marketing,
        ssg_id = data.ssg_id,
        contentType = data.type,
        priceForm = data.setting ? JSON.parse(data.setting) : null,
        zanNum = data.zan_num || 0,
        showZan = data.is_zan == 1 ? true : false,
        canBuy = parseInt(data.saleState && data.saleState.canBuy || 0),
        share_content='',
        content, barTitle;
        if(data.ssg_id != '0'){
          let parms = {
            url:`${app.API_HOST}ServiceGoods/getServiceGoods`,
            data:{goodsId:data.ssg_id}
          }
          fetchApi(self,parms).then(_res=>{
            self.setData({
              serverList: _res.data.data.info
            })
          }).catch(_err=>{
            console.log(_err)
          })
        }
      if (contentType == 1) {
        content = JSON.parse(data.content);
        if (content == null) {
          self.setData({
            showStyle: 2
          })
          return
        }
        content.forEach(item => {
          item['type'] == 'text' && (share_content += item['content']);
        })
        share_content = share_content.replace(/&nbsp;|\r\n|\n|\r|\s+/g, '')
        for (let i = content.length - 1; i >= 0; i--) {
          if (content[i].type == 'text') {
            content[i].content = content[i].content.indexOf('\n') == -1 ? [content[i].content] : content[i].content.split('\n');
          }
        }
        barTitle = data.title;
       
      } else {
        content = data.richContent || '';
        barTitle = data.category ? data.category.name : '';
        share_content = content.replace(/<\/?.+?>|&nbsp;/g, "").substring(0, 600)
      }
      self.dataStore.title = data.title;

      self.dataStore.barTitle = barTitle;
      wx.setNavigationBarTitle({
        title: barTitle
      })
      
      self.setData({
        contentType: contentType,
        contentList: content,
        productprice: productprice,
        title: data.title || '',
        description: data.description || '',
        sales: data.sales || '',
        recommand_title: data.recommand_title || '',
        thumbUrl: data.thumb.thumb.url,
        priceForm: priceForm,
        is_content_marketing: is_content_marketing,
        ssg_id: ssg_id,
        link_goods_id: link_goods_id,
        zanNum: zanNum > 999 ? '999+' : zanNum,
        showZan: showZan,
        canBuy,
        news_share_language: data.news_share_language,
        share_words: data.share_words,
        share_image: data.share_image,
        share_content
      })
      if (!canBuy) {
        wx.showModal({
          title: '提示',
          content: '该内容已下架',
          confirmColor: '#ff9b1f',
          success() {
            wx.navigateBack({
              delta: 2
            });
          }
        })
      }
      self.setGoodsInfo(2)
      resolve(res);
    }).catch((err) => {
      console.log('error: ', err)
      reject(err);
    })
  })
}

function getMoreCommentList(self, isGetMore = false) {
  let paramContent = {
    url: `${app.API_HOST}comment/getArticleComments`,
    data: {
      id: parseInt(self.dataStore.id),
      pageSize: 6,
      pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
    }
  }
  return new Promise(function (resolve, reject) {
    fetchApi(self, paramContent).then(res => {
      if (isGetMore) {
        self.dataStore.pageIndex++
      };
      let dataContent = res.data.data,
        commontList = dataContent.list,
        total = dataContent.total
      for (let i = 0; i < commontList.length; i++) {
        if (commontList[i].reply) {
          commontList[i].reply.time = getDateDiff(commontList[i].reply.createtime * 1000)
        }
      }
      self.setData({
        commontList: isGetMore ? self.data.commontList.concat(commontList) : commontList,
        loadStyle: commontList.length < 6 ? 'loadOver' : 'loadMore',
        total: total || 0,
      })
      resolve();
    }).catch(err => {
      console.log(err)
      reject();
    })
  })
}

function getDateDiff(dateTimeStamp) {
  let result;
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime();
  var diffValue = now - dateTimeStamp;
  if (diffValue < 0) {
    return;
  }
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  if (monthC >= 1) {
    result = "" + parseInt(monthC) + "月前";
  } else if (weekC >= 1) {
    result = "" + parseInt(weekC) + "周前";
  } else if (dayC >= 1) {
    result = "" + parseInt(dayC) + "天前";
  } else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时前";
  } else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟前";
  } else
    result = "刚刚";
  return result;
}