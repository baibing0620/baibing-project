const app = getApp();
import { fetchApi, getEffectiveCardIdByOriginal} from '../../api/api';
import { nav, setCurrentLoginUserCardInfo, showTips,showToast} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    diyConfig: app.extConfig,
    cardList: [],
    loadStyle: '',
    showStyle: 0,
    openAuthorization: false,
    openAuthorizationType: '',
    shopImg: ''
  },
  dataStore: {
    pageSize: 12,
    pageIndex: 1,
    hasMyCard:0,
    isLoading:false   // 并发锁，保证同一时间只有一个加载更多的请求
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: async function (options) {
    app.globalData.cardId = 0;
    if (options && options.code && options.channel){
        beginDistributeCrmToCardStaff(options.code,options.channel,this) //活动分发
    }else if (options && options.code){
        getBindingQrCode(options.code, this) //绑定员工码
    }else{
        try {
            const { cardId } = await getEffectiveCardIdByOriginal()
            if (cardId) {
                this.handleNavToCard(cardId)
                return
            }
        } catch (error) {
            console.error(error)
        }
        wx.setNavigationBarTitle({
          title: '名片列表'
        })
        getCardList(this)
    }
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

  },

  onReachBottom: function() {
    if (this.data.loadStyle == 'loadOver') {
      return;
    }
    this.setData({
      loadStyle: ''
    })
    getCardList(this, true);
  },
/**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
      var cardInfo = res.target.dataset.sharemodel;
      return {
          title: cardInfo.card_share_desc ? cardInfo.card_share_desc : `您好，我是${cardInfo.company}的${cardInfo.position}——${cardInfo.name}。请多指教！`,
          imageUrl: `${app.API_HOST}Card/genCardShareImg?token=${app.globalData.token}&beid=${app.globalData.beid}&cardId=${cardInfo.id}`,
          path: `/pages/home/home?cardId=${cardInfo.id}&fromUser=${app.globalData.uid}`,
      }

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.dataStore.pageIndex = 1;
    this.data.loadStyle = "loadMore";
    this.dataStore.isLoading = false;
    getCardList(this)
  },

  /**
   * 网络加载失败时候的处理
   */
  networkFaildRealod:function(){
    this.setData({showStyle:0});
    this.dataStore.pageIndex = 1;
    getCardList(this)
  },

  toAbout(){
    nav({
      url:'/pages/about/about'
    })
  },
  toCardFair() {
    nav({
        url:'/cardFair/cardFairIndexCopy/cardFairIndex'
    });
  },
  toCard(e) {
    var index = parseInt(e.currentTarget.dataset.index);
    this.handleNavToCard(this.data.cardList[index].card.id)
    
  },
  handleNavToCard(cardId) {
    app.globalData.cardId = cardId;
    nav({
        url: app.tabBarPath[0]
    })
  },
  starCard(e) {
    var index = parseInt(e.detail.index);
    var cardList = this.data.cardList;

    var cardItem = cardList[index];

    if(parseInt(cardItem.is_like)){
      var param = {
        url: 'card/unLikeStick',
        data: {
          card_id: cardItem.card.id
        }
      }

      fetchApi(this, param).then(res => {
        cardList[index].is_like = 0;
        this.dataStore.pageIndex = 1;
        this.dataStore.hasMyCard = 0;
        this.data.cardList = [];
        getCardList(this);
      })

    }else{
      var param = {
        url: 'card/likeStick',
        data: {
          card_id: cardList[index].card.id
        }
      }

      fetchApi(this, param).then(res => {
        cardList[index].is_like = 1;
        if(this.dataStore.hasMyCard){
          cardList.unshift(cardList.splice(index, 1)[0]);
          cardList.unshift(cardList.splice(1, 1)[0]);
        }else{
          cardList.unshift(cardList.splice(index, 1)[0]);
        }
        this.setData({
          cardList
        })
      })
    }
  },
  unstarCard(e){
    var index = parseInt(e.detail.index);
    var cardList = this.data.cardList;
    var param = {
      url: 'card/unLikeStick',
      data: {
        card_id: cardList[index].card.id
      }
    }
    fetchApi(this, param).then(res => {
    })
  },
  getOrderConfig() {
      let params = {
          url: app.API_HOST + "config/getStaffFuncManageSetting",
          data: {}
      }
      fetchApi(this, params).then(res => {
          this.setData({
              openCardMarket: parseInt(res.data.data.open_card_market || 0)
          });
      }).catch(res => {
          reject(res);
      })
  }
})

function getCardList(self, isGetMore = false) {
  let param = {
    url: 'card/myCardList',
    data: {
      pageSize: 6,
      pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
    }
  };

  if(self.dataStore.isLoading) return;


  self.dataStore.isLoading = true;
  fetchApi(self, param).then((res) => {
    self.dataStore.isLoading = false;
    let data = res.data.data;

    if(data.length > 0 && self.dataStore.pageIndex==1 && data[0]['card'].isMyCard==1){
      self.dataStore.hasMyCard = 1;

      if(!app.globalData.currentLoginUserCardInfo.cardId){
        // 刷新一下全局的缓存内容
        setCurrentLoginUserCardInfo({cardId:data[0]['card'].id}, true);

      }
      // 刷新缓存内容
      // 如果存在我的卡片
    }

    if (isGetMore) {
      self.dataStore.pageIndex++
    }

    var loadStyle = 'loadMore';
    if(data.length == 0 || (data.length > 0 && data[data.length-1]['noMoreCard']==1)){
      loadStyle = 'loadOver';
    }

    self.setData({
      loadStyle: loadStyle,
      cardList: isGetMore ? self.data.cardList.concat(data) : data,
      showStyle: self.data.cardList.length == 0 ? 2 : 1
    })
    self.getOrderConfig();
  }).catch((err) => {
    self.dataStore.isLoading = false;
    self.setData({
      showStyle: 3
    })
  });
};
function getBindingQrCode(code,self){ 
  let param = {
    url: 'card/bindCardManage',
    data: {
      code: code
    }
  }
  fetchApi(self, param).then(res => {
    showToast("绑定成功","success")

    // 缓存处理
    app.globalData.token = null;
    wx.removeStorageSync("loginInfo" + app.globalData.beid);
    getCardList(self);

  }).catch(e=>{
    console.log(e,'err')
    getCardList(self);
  })
}
function beginDistributeCrmToCardStaff(code,channel,self){
    let param = {
        url: 'CardActivities/beginDistributeCrmToCardStaff',
        data: {
            fromUser: app.globalData.uid,
            code: code,
            channel: channel
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data
        if (app.tabBarPath.indexOf(data.url) >= 0) {
            app.globalData.cardId = data.data.cardId || 0;
            app.globalData.fromUser = data.data.fromUser || 0;
        }
        
        nav({
            url:data.url,
            data:data.data
        })


    }).catch(e => {
        console.log(e, 'err')
        getCardList(self);
    })
}