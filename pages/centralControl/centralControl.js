const app = getApp();
import {
  nav,
} from '../../utils/util';
import {
  fetchApi,
  getEffectiveCardId,
  getGlobalConfig
} from '../../api/api.js';
Page({

  /**
   * 页面的初始数据
   */ 
  data: {
    diyConfig: app.extConfig,
    name: "",
    avatar: "",
    privilege:'',
    distributionPriceCount: 0,
    crmUserCount: 0,
    orderPrice: 0,
    unreadMsgCount: 0,
    showStyle: 0,
    permission: [],
    permissionRange: [],
    aboutOne: false,
    is_open_credit: false,
    private_region_type: '',
		open_replace_order: false,
    videoShow: true,
    beid: app.globalData.beid,
    specEnter: false,
  },

  getSpecEnter() {
    let params = {
      url: app.API_HOST + "order/getSpecialReplaceShop",
      data: {}
    }
    fetchApi(this, params).then(res => {
      let data = res.data.data;
      if(data.includes(app.globalData.beid)) {
        this.setData({
          specEnter: true
        })
      }
    }).catch(res => {
    })
  },

  getCardstaff() {
    return new Promise ((resolve, reject) => {
      let params = {
        url: app.API_HOST + "card/getCardStaff",
        data: {
          cardId: app.globalData.cardId
        }
      }
      fetchApi(this, params).then(res => {
        let data = res.data.data;
        data.staff.permission ? app.globalData.permission = JSON.parse(data.staff.permission) : app.globalData.permission = [];
        resolve(data);
      }).catch(res => {
        reject(res); 
      })
    })  
  },

  getConfigCommunityIfOpen() {
    return new Promise ((resolve, reject) => {
      let params = {
        url: app.API_HOST + "XLFCommunity/getConfigCommunityIfOpen",
        data: {}
      }
      fetchApi(this, params).then(res => {
        resolve(res.data.data);
      }).catch(res => {
        reject(res);
      })
    })
  },

  getOrderConfig() {
    return new Promise ((resolve, reject) => {
      let params = {
        url: app.API_HOST + "config/getStaffFuncManageSetting",
        data: {}
      }
      fetchApi(this, params).then(res => {
        resolve(res.data.data);
      }).catch(res => {
        reject(res);
      })
    })
  },

  async init() {
    if (!~~app.globalData.cardId || app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId) {
      try {
        const { cardId, myCardId } = await getEffectiveCardId()
        app.globalData.cardId = myCardId || cardId || ''
        if (!~~app.globalData.cardId) throw Error('无可用名片')
        if (!~~myCardId) {
          nav({
            url: app.tabBarPath[0]
          })
          return
        }
      } catch (error) {
        console.error(error)
        wx.reLaunch({
          url: '/pages/cardList/cardList'
        })
        return
      }
    }

    Promise.all([this.getCardstaff(), this.getConfigCommunityIfOpen(), this.getOrderConfig(), this.getRootSetting(), this.getShopCreditSetting(),this.getShortVideoRead()]).then(async res => {
      const permissionRange = res[0].staff.permission_range || [];
      this.setData({
        name: res[0].staff.name,
        avatar: res[0].staff.avatar,
        distributionPriceCount: res[0].distributionPriceCount,
        orderPrice: res[0].orderPrice,
        serviceFromValueCount: res[0].serviceFromValueCount,
        crmUserCount: res[0].crmUserCount,
        unreadMsgCount: res[0].unreadMsgCount,
        permission: res[0].staff.permission ? JSON.parse(res[0].staff.permission) : [],
        permissionRange,
        aboutOne: permissionRange.includes(1) || permissionRange.includes("1"),
        cardManage: parseInt(res[2].card_manage || 0),
        ifOpen: res[1].if_open ? parseInt(res[1].if_open) : 0,
        openOrderManage: parseInt(res[2].open_order_manage || 0),
        openGoodManage: parseInt(res[2].card_goods_open || 0),
        customerConfig: parseInt(res[0].customerConfig || 0),
        myWordsCount: parseInt(res[0].myWordsCount || 0),
        msgPushLogCount: parseInt(res[0].msgPushLogCount || 0),
        openCardMarket: parseInt(res[2].open_card_market || 0),
        goodsOrder: parseInt(res[2].goods_order || 0),
        crmFollowTaskNotCompleted: parseInt(res[0].crmFollowTaskNotCompleted || 0),
        is_open_credit: res[4].data.data.is_open_credit == 1,
				open_replace_order: res[4].data.data.open_replace_order == 1,
        showStyle: 1,
        private_region_type: app.globalConfig ? app.globalConfig.private_region_type : (await getGlobalConfig(), app.globalConfig.private_region_type),
        videoShow: res[5].read_short_video == 0
      });
    }).catch(res => {
        console.log(res,'resss')
      this.setData({
        showStyle: 3
      })
    })
  },

  networkFaildRealod() {
    this.setData({
      showStyle: 0
    })
    this.init();
  },

  getShopCreditSetting() {
    return fetchApi(this, {
      url: "config/get",
      data: {}
    })
  },

  getShortVideoRead() {
    return new Promise ((resolve, reject) => {
      let params = {
        url: app.API_HOST + "ShortVideo/getShortVideoRead",
        data: {}
      }
      fetchApi(this, params).then(res => {
        let data = res.data.data;
        // console.log(data)
        resolve(data);
      }).catch(res => {
        reject(res); 
      })
    })  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.getPollNum()
    this.getAccountInfo()
    this.getSignStatus()
    wx.hideShareMenu();
    app.pageData.setPage(this, "centralControl");
    this.getSpecEnter()
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
    this.init();
    app.showRemind(this);

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
    app.pageData.removePage("centralControl");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.init();
    this.getPollNum();
    this.getAccountInfo();
    this.getSignStatus();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  toNewPage(e){
    var page = e.currentTarget.dataset.page;
    if (page == 'shortVideoList') {
      let params = {
        url: app.API_HOST + "ShortVideo/setShortVideoRead"
      }
      fetchApi(this, params).then(res => {
        let data = res.data.data;
        this.setData({
          videoShow: false
        })
        nav({
          url: `/shortVideo/${page}/${page}`,
          data:{
              goodsOrder: this.data.goodsOrder
          }
        })
      }).catch(res => {
        nav({
          url: `/shortVideo/${page}/${page}`,
          data:{
              goodsOrder: this.data.goodsOrder
          }
        })
      })
    } else if(page == 'customerPool'){
      nav({
        url: `/pages/${page}/${page}`,
        data:{
            goodsOrder: this.data.goodsOrder
        }
      })
    } else if(page == 'signOnline'){
      nav({
        url: `/pages/${page}/${page}`,
        data:{
            goodsOrder: this.data.goodsOrder
        }
      })
    }else {
      nav({
        url: `/centerControl/${page}/${page}`,
        data:{
            goodsOrder: this.data.goodsOrder
        }
      })
    }
  },
  getRootSetting() {
    let param = {
      url: app.API_HOST + 'card/getCardInfo',
      data: {
        cardId: app.globalData.cardId,
      }
    }
    fetchApi(this, param).then(res => {
      // console.log(res.data.data, 'data')
      let data = res.data.data
      this.setData({
        privilege: data.privilege || ''
      })
    })
  },
  getSignStatus(){
    let params = {
      url: 'ElectronicContractInitiateSign/showCardSignStatus',
      data: {
        card_id: app.globalData.cardId
      }
    }
    fetchApi(this,params).then(res=>{
      this.setData({
        is_open_signature: res.data.data.is_open_signature,
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  getAccountInfo(){
    let params = {
      url: 'ElectronicContractInitiateSign/showPersonalAccountInfo',
      data: {
        bbeid: app.globalData.beid
      }
    }
    fetchApi(this,params).then(res=>{
      this.setData({
        // is_open_signature: res.data.data.is_open_signature,
        signUpNum: res.data.data.has_remain,
      })
    }).catch(err=>{
      console.log(err)
    })
  }
})