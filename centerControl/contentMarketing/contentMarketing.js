const app = getApp();
import * as echarts from '../../centerControl/ec-canvas/echarts';
import {
  fetchApi
} from "../../api/api.js";
import {
  showTips,
  formatDuring,
  showLoading,
  getNDay,
  deepClone,
} from "../../utils/util";
let today = getNDay(0),
  before1Day = getNDay(-1),
  before7Day = getNDay(-7),
  before15Day = getNDay(-15),
  before30Day = getNDay(-30);
let startTimes = ['', before1Day, before7Day, before15Day, before30Day];
var optionConversion = {
  animation: false,
  calculable: true,
  legend: {
    data: ['浏览视频', '点击商品', '生产订单', '实际购买'],
    bottom: '0'
  },
  color: ['#91B5F4', '#ACDE9A','#FBE451', '#EC5D60'],
  // color: [{
  //   type: 'linear',
  //   x: 0,
  //   y: 0,
  //   x2: 0,
  //   y2: 1,
  //   colorStops: [{
  //       offset: 0, color: '#91B5F4' // 0% 处的颜色
  //   }, {
  //       offset: 1, color: '#427EF2' // 100% 处的颜色
  //   }],
  //   global: false // 缺省为 false
  // },{
  //   type: 'linear',
  //   x: 0,
  //   y: 0,
  //   x2: 0,
  //   y2: 1,
  //   colorStops: [{
  //       offset: 0, color: '#ACDE9A' // 0% 处的颜色
  //   }, {
  //       offset: 1, color: '#91C67C' // 100% 处的颜色
  //   }],
  //   global: false // 缺省为 false
  // },{
  //   type: 'linear',
  //   x: 0,
  //   y: 0,
  //   x2: 0,
  //   y2: 1,
  //   colorStops: [{
  //       offset: 0, color: '#FBE451' // 0% 处的颜色
  //   }, {
  //       offset: 1, color: '#F4BF79' // 100% 处的颜色
  //   }],
  //   global: false // 缺省为 false
  // },{
  //   type: 'linear',
  //   x: 0,
  //   y: 0,
  //   x2: 0,
  //   y2: 1,
  //   colorStops: [{
  //       offset: 0, color: '#EC5D60' // 0% 处的颜色
  //   }, {
  //       offset: 1, color: '#EE8D7A' // 100% 处的颜色
  //   }],
  //   global: false // 缺省为 false
  // }],
  series: [{
    name: '漏斗图',
    type: 'funnel',
    left: '20%',
    top: 10,
    //x2: 80,
    bottom: '20%',
    width: '60%',

    sort: 'descending',
    gap: 2,
    label: {
      normal: {
        show: true,
        color: '#666',
        position: 'inside',
        formatter: function (obj) {
          return obj.data.value 
            // + '(' + obj.data.percentage + ')'  
        }
      },
    },
    labelLine: {
      normal: {
        length: 20,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      }
    },
    itemStyle: {
      normal: {
        borderColor: '#fff',
        borderWidth: 1
      }
    },
    data: [
      {
        value: '0',
        name: '浏览视频',
        percentage: '0%'
      },
      {
        value: '0',
        name: '点击商品',
        percentage: '0%'
      },
      {
        value: '0',
        name: '生产订单',
        percentage: '0%'
      },
      {
        value: '0',
        name: '实际购买',
        percentage: '0%'
      }
    ]
  }]
};
let cancavsVideo,
  cancavsContent
Page({

  /**
   * 页面的初始数据
   */
  data: {
    requireCardId: '',
    themeColor: "#247CF6",
    MarketingSwitchTabCommon: {
      tabs: ["全部", "昨日", "近7日", "近15日", "近30日"],
      themeColor: "#247CF6",
      currentIndex: 0,
    },
    ec: {},
    channelList: [
      {id: 1, name: '短视频', value: '33.3'},
      {id: 2, name: '内容营销', value: '33.3'},
      {id: 3, name: '正常渠道', value: '33.3'}
    ]
  },

  getSalesPerformanceAnalysis(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'DataAnalysis/getSalesPerformanceAnalysis',
      data: {
        isCardStaff: 0,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        requireCardId: this.data.requireCardId
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var data = res.data.data;
      console.log(data)
      var contentData = data.contentData
      var orderAnalysis = data.orderAnalysis
      var shortVideoData = data.shortVideoData
      var channelList = [
        {id: 1, name: '短视频', value:  orderAnalysis.videoOrderProportion*100},
        {id: 2, name: '内容营销', value: orderAnalysis.contentOrderProportion*100},
        {id: 3, name: '正常渠道', value: orderAnalysis.ordinaryOrderProportion*100}
      ]
      let videoOptionSale = deepClone(optionConversion);
      videoOptionSale.series[0].data = [
          {
            value: shortVideoData.browseTotal,
            name: '浏览视频',
            percentage: (shortVideoData.browseProportion*100) + '%'
          },
          {
            value: shortVideoData.clickTotal,
            name: '点击商品',
            percentage: (shortVideoData.clickProportion*100) + '%'
          },
          {
            value: shortVideoData.allShopOrderTotal,
            name: '生产订单',
            percentage: (shortVideoData.allShopOrderTotalProportion*100) + '%'
          },
          {
            value: shortVideoData.alreadyShopOrderTotal,
            name: '实际购买',
            percentage: (shortVideoData.alreadyShopOrderTotalProportion*100) + '%'
          }
      ];
      let contentOptionSale = deepClone(videoOptionSale);
      contentOptionSale.series[0].data = [
        {
          value: contentData.browseTotal,
          name: '浏览资讯',
          percentage: (contentData.browseProportion*100) + '%'
        },
        {
          value: contentData.clickTotal,
          name: '点击资讯',
          percentage: (contentData.clickProportion*100) + '%'
        },
        {
          value: contentData.allShopOrderTotal,
          name: '生产订单',
          percentage: (contentData.allShopOrderTotalProportion*100) + '%'
        },
        {
          value: contentData.alreadyShopOrderTotal,
          name: '最终付款',
          percentage: (contentData.alreadyShopOrderTotalProportion*100) + '%'
        }
      ];
      this.setData({
        channelList: channelList
      })
      init(cancavsVideo, videoOptionSale);
      init(cancavsContent, contentOptionSale);
    }).catch(err => {})
  },

  marketingChange(e) {
    var index = parseInt(e.detail.currentIndex);

    this.getSalesPerformanceAnalysis(index);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      requireCardId: options.cardId || ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    cancavsVideo = this.selectComponent('#mychart-video');
    cancavsContent = this.selectComponent('#mychart-content');
    this.getSalesPerformanceAnalysis()
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

function init(canvasDom, option) {
  canvasDom.init((canvas, width, height) => {
    // 获取组件的 canvas、width、height 后的回调函数
    // 在这里初始化图表
    let chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
    chart.setOption(option)
  });
};