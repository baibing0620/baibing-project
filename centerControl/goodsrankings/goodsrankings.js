const app = getApp();
import { fetchApi } from "../../api/api";
import { getNDay } from "../../utils/util.js"

Page({
  /**
   * 页面的初始数据
   */
  data: {
    topNum: false,
    topTime: false,
    topGoods: false,
    orderBy: "sales",
    sales: "desc",
    isQy: 2,
    timeAgo: "0000-00-00 00:00:00",
    status: -2,
    pageSize: 10,
    pageIndex: 1,
    getMore: false,
    loadStyle: "",
    showStyle: 1,
    goodsData: [],
    NumIndex: 0,
    DateIndex: 0,
    GoodsIndex: 0,
    selectDate: ["全部时长","昨天","近7日","近15日","近30日"],
    selectNum: ["销量由高到低","销量由低到高"],
    selectGoods: ["全部商品","企业商品","个人商品"]
  },

  // 点击销售量
  changeNumIndex(e) {
    let target = e.target.dataset.top;
    if(e.detail.value != this.data.NumIndex && e.detail.value == 0){
      this.setData({
        sales: "desc",
        pageIndex: 1
      });
      this.getSellMore();
    }else if(e.detail.value != this.data.NumIndex && e.detail.value == 1){
      this.setData({
        sales: "asc",
        pageIndex: 1
      });
      this.getSellMore();
    }
    this.setData({
      NumIndex: e.detail.value,
      [target]: false
    })
  },
  // 点击全部时间
  changeDateIndex(e) {
    let target = e.target.dataset.top;
    if(e.detail.value != this.data.DateIndex && e.detail.value == 0){  // 所有时间
      this.setData({
        timeAgo: "0000-00-00 00:00:00",
        pageIndex: 1
      });
      this.getSellMore();
    }else if(e.detail.value != this.data.DateIndex && e.detail.value == 1){  // 1天
      this.setData({
        timeAgo: getNDay(-1),
        pageIndex: 1
      });
      this.getSellMore();

    }else if(e.detail.value != this.data.DateIndex && e.detail.value == 2){ // 7天
      this.setData({
        timeAgo: getNDay(-7),
        pageIndex: 1
      });
      this.getSellMore();

    }else if(e.detail.value != this.data.DateIndex && e.detail.value == 3){ // 15天
      this.setData({
        timeAgo: getNDay(-15),
        pageIndex: 1
      });
      this.getSellMore();
    }else if(e.detail.value != this.data.DateIndex && e.detail.value == 4){  // 30天
      this.setData({
        timeAgo: getNDay(-30),
        pageIndex: 1
      });
      this.getSellMore();
    }
    this.setData({
      DateIndex: e.detail.value,
      [target]: false
    })
  },
  // 点击全部商品
  changeGoodsIndex(e) {
    let target = e.target.dataset.top;
    if(e.detail.value != this.data.GoodsIndex && e.detail.value == 0){
      this.setData({
        isQy: 2,
        pageIndex: 1
      });
      this.getSellMore()

    }else if(e.detail.value != this.data.GoodsIndex && e.detail.value == 1){
      this.setData({
        isQy: 1,
        pageIndex: 1
      });
      this.getSellMore()

    }else if(e.detail.value != this.data.GoodsIndex && e.detail.value == 2){
      this.setData({
        isQy: 0,
        pageIndex: 1
      });
      this.getSellMore();
    }
    this.setData({
      GoodsIndex: e.detail.value,
      [target]: false
    })
  },

  // 请求
  getSellMore(callback = function () { }) {
    let params = {
      url: app.API_HOST + 'CardGoods/goodsList',
      data: {
        orderBy: this.data.orderBy,
        orderType: this.data.sales,
        pageSize: this.data.pageSize,
        pageIndex: this.data.pageIndex,
        isQy: this.data.isQy,
        beginTime: this.data.timeAgo,
        endTime: getNDay(0),
        cid: 0,
        status: this.data.status,
        from: '3',
      }
    };
    this.setData({
      loadStyle: "loading"
    });
    fetchApi(this, params).then(res => {
      this.setData({
        goodsData: this.data.getMore ? this.data.goodsData.concat(res.data.data) : res.data.data
      });
      this.setData({
        showStyle: this.data.goodsData.length == 0 ? 2 : 1,
        loadStyle: res.data.data.length < 10 ? 'loadOver' : 'loadMore',
        getMore: false
      });
      callback();
    }).catch((err) => {
      console.log(err)
    });
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSellMore();
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      pageIndex: 1
    });
    this.getSellMore(function () {
      wx.stopPullDownRefresh()
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      pageIndex: this.data.pageIndex + 1,
      getMore: true
    });
    this.getSellMore()
  },
  
  ///////////////////////////////////////////////////////

  // 改变箭头
  changDir(e) {
    let target = e.target.dataset.top;
    this.setData({
      [target]: true
    });

  },
  // picker取消时让箭头朝下
  reset(e){
    let target = e.target.dataset.top;
    this.setData({
      [target]: false,
    });
  }
})