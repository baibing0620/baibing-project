const app = getApp();
import * as echarts from '../../centerControl/ec-canvas/echarts';
import {
  fetchApi
} from "./../../api/api.js";
import {
  showTips,
  formatDuring,
  showLoading,
  getNDay,
  deepClone,
} from "../../utils/util";
function FormatHour(value, index){
  var date = new Date(value);
  var texts = date.getHours() + ':00';
  if (index == 0) {
    texts = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
  }
  return texts;
  
}
function FormatDay(value, index) {
  var date = new Date(value);
  var texts = [(date.getMonth() + 1), date.getDate()];
  if (index == 0) {
    texts.unshift(date.getFullYear());
  }
  return texts.join('/');
}
var optionOpenCard = {
  animation: false,
  grid: {
    top: '8%',
    bottom: 0,
    left: 13,
    right: 13,
    containLabel: true
  },
  xAxis: {
    type: 'time',
    show: true,
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#c9c9c9'
      }
    },

    axisLabel: {
      fontSize: 10,
      align: 'right',
      color: '#999',
      align: 'center',
      formatter: function (value, index) {
        var date = new Date(value);
        var texts = [(date.getMonth() + 1), date.getDate()];
        if (index == 0) {
          texts.unshift(date.getFullYear());
        }
        return texts.join('/');
      }
    }
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true
    },
    axisTick: {
      alignWithLabel: false,
      show: false
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#c9c9c9'
      }
    },
    axisLabel: {
      fontSize: 10,
      color: '#999'
    }
  },
  series: [{
    data: [{
        value: ['2018-12-18', 80]
      },
      {
        value: ['2018-12-19', 80]
      }
    ],
    type: 'line',
    symbol: 'circle',
    label: {
      show: true,
      color: '#333',
      fontSize: 11
    },
    itemStyle: {
      normal: {
        color: "#3bcaff",
        borderColor: "#3bcaff",
        shadowColor: "#3bcaff",
        shadowBlur: 4
      }

    },
    lineStyle: {
      normal: {
        color: "#3bcaff",
        width: 1
      }
    },
    areaStyle: {
      normal: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(59, 202, 255, 0.2)' // 0% 处的颜色
          }, {
            offset: 1,
            color: 'rgba(59,202,255,0.08)' // 100% 处的颜色
          }],
          globalCoord: false // 缺省为 false
        }
      }
    }
  }]
};
var optionNewUser = deepClone(optionOpenCard);
var optionCardShare = deepClone(optionOpenCard);
var optionOrderMoney = deepClone(optionOpenCard);
var optionCardLike = deepClone(optionOpenCard);
var optionFollowUser = deepClone(optionOpenCard);
var optionConversion = {
  animation: false,
  calculable: true,
  legend: {
    data: ['展现', '点击', '访问', '咨询', '订单'],
    bottom: 0
  },
  color: ['#d8f4ff', '#b1eaff', '#89dfff'],
  series: [{
    name: '漏斗图',
    type: 'funnel',
    left: '20%',
    top: 10,
    //x2: 80,
    bottom: '15%',
    width: '60%',

    sort: 'descending',
    gap: 2,
    label: {
      normal: {
        show: true,
        color: '#666',
        position: 'inside',
        formatter: function (obj) {

          return obj.value
        },
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
    data: [{
        value: 60,
        name: '访问'
      },
      {
        value: 40,
        name: '咨询'
      },
      {
        value: 20,
        name: '订单'
      },
      {
        value: 80,
        name: '点击'
      },
      {
        value: 100,
        name: '展现'
      }
    ]
  }]
};
var optionSale = deepClone(optionConversion);
var optionGender = {
  animation: false,
  grid: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    containLabel: true
  },
  legend: {
    bottom: 0,
    left: 'center',
    padding: [15, 30, 15, 30],
    data: ['对产品感兴趣', '对资讯感兴趣', '对我感兴趣', '对公司感兴趣'],
    
  },
  color: ['#606bf9', '#3befff', '#3bcaff', '#3b93ff'],
  series: [{
    name: '访问来源',
    type: 'pie',
    center: ['50%', '40%'],
    radius: ['40%', '65%'],
    avoidLabelOverlap: false,
    label: {
      normal: {
        show: true,
        position: 'outside',
        formatter: '{c}人 {d}%',
        color: '#333'
      },

    },
    labelLine:{
      length:5,
      lineStyle: {
        color: '#ccc'
      },
      
    },
    data: [],
  }]
};
var optionAge = {
  animation: false,
  color: ['#3bcaff'],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '2%',
    top: '3%',
    containLabel: true
  },
  xAxis: [{
    type: 'category',
    nameRotate:30,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisTick: {
      alignWithLabel: true,
      show:false
    },
    axisLine:{
      lineStyle:{
        color: '#999'
      }
    },
    axisLabel:{
      fontSize:10,
      interval:0,
      // rotate:30,
      color: '#999'
    }
  }],
  yAxis: [{
    type: 'value',
    axisTick: {
      show: false
    },
    axisLine: {
      lineStyle: {
        color: '#999'
      },
      
    },
  }],
  series: [{
    name: '直接访问',
    type: 'bar',
    barWidth: '60%',
    label: {
      normal: {
        show: true,
        position: 'inside',
        formatter: function(obj){
          return obj.value||''
        },
      },

    },
    data: [10, 52, 200, 334, 390, 330, 220]
  }]
};
var optionUserBehavior  = {
  animation: false,
  color: ['#3bcaff'],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '2%',
    top: '3%',
    containLabel: true
  },
  xAxis: [{

    type: 'category',
    nameRotate: 30,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisTick: {
      alignWithLabel: true,
      show: true
    },
    axisLine: {
      lineStyle: {
        color: '#999'
      }
    },
    axisLabel: {
      fontSize: 10,
      interval: 0,
      rotate: 30,
      color: '#999'
    }
  }],
  yAxis: [{
    type: 'value',
    axisTick: {
      show: false
    },
    axisLine: {
      lineStyle: {
        color: '#999'
      },

    },
  }],
  series: [{
    name: '直接访问',
    type: 'bar',
    label: {
      normal: {
        show: true,
        position: 'inside',
        formatter: function (obj) {
          return obj.value || ''
        },
      },

    },
    barWidth: '60%',
    data: [10, 52, 200, 334, 390, 330, 220]
  }]
};
var optionCity  = {
  animation: false,
  grid: {
    top:0,
    left: '30%',
    right: 0,
    bottom: 0,
    containLabel: false
  },
  xAxis: {
    show: false,
    type: 'value',

  },
  yAxis: {
    inverse: true,
    show: false,
    type: 'category',
    data: ['巴西', '印尼', '美国', '印度', '中国']
  },
  series: [
    {
      type: 'bar',
      barWidth:'26%',
      barMinHeight:6,
      color:'#3bcaff',
      data: [18203, 23489, 29034, 104970, 131744],
      label: {
        show: true,
        position: 'left',
        
        formatter: '{c6|{b}}{c3|{c}}',
        rich:{
          c6:{
            color:'#999',
            padding:[0,16,0,0],
          },
          c3:{
            color:'#333',
            padding: [0, 10, 0, 0]
          }
        }
       
      }
    },

  ]
};
var optionInterest = deepClone(optionGender);
optionInterest.series[0].label.normal.formatter='{d}%'

var optionCustomer = deepClone(optionGender)
var optionEnterEfficiency = deepClone(optionUserBehavior)


let today = getNDay(0),
  before1Day = getNDay(-1),
  before7Day = getNDay(-7),
  before15Day = getNDay(-15),
  before30Day = getNDay(-30);
let startTimes = ['', before1Day, before7Day, before15Day, before30Day];
let cancavsOpenCard,
  cancavsNewUser,
  cancavsCardShare,
  cancavsConversion,
  cancavsGender,
  cancavsAge,
  canvasCity,
  canvasInterest,
  cancavsSale,
  cancavsOrderMoney,
  cancavsCardLike,
  cancavsFollowUser,
  cancavsUserBehavior,
  cancavsCustomer,
  cancavsEnterEfficiency,
  cancavsVideo,
  cancavsContent

Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    departmentIds: {
      type: null,
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        if (newVal != ""){
          this.getBusinessConversion();
          this.getBusinessSale();
          this.getOrderMoney();
          this.getDataStatistics()
          this.getSalesPerformanceAnalysis()
        }
      }
    }
  },
  data: {
    tabIndex: 0,
    beginTime:'请输入开始时间',
    endTime: '请输入截止时间',
    switchTab: {
      tabs: [
        { label: "业务分析", value: '0'},
        { label: "团队表现", value: '1' },
        { label: "客户画像", value: '2' },
        { label: "企微转化", value: '3' },
      ],
      themeColor: "#247CF6",
      currentIndex: 0,
      top: 0,
      position: "relative"
    },
    switchTabCommon: {
      tabs: ["近45日", "昨日", "近7日", "近15日", "近30日"],
      themeColor: "#247CF6",
      currentIndex: 0,
    },
    switchTabOverview:{
      tabs: ["概览", "昨日", "近7日", "近15日", "近30日"],
      themeColor: "#1F94FD",
      currentIndex: 0,
    },
    MarketingSwitchTabCommon: {
      tabs: ["全部", "昨日", "近7日", "近15日", "近30日"],
      themeColor: "#247CF6",
      currentIndex: 0,
    },
    ec: {},
    getDataStatistics: {
      userCount: [0, 0, 0],
      userTimeCount: 0,
      userShareCount: 0,
      userLikeCount: 0
    },
    userByStatusCount: [],
    openCardNum: 0,
    newUserCount: 0,
    cardSharNum: 0,
    saleConversion:0,
    loadOVerPersonas:false,
    loadOverTeam:false,
    channelList: [
      {id: 1, name: '短视频', value: '33.3'},
      {id: 2, name: '内容营销', value: '33.3'},
      {id: 3, name: '正常渠道', value: '33.3'}
    ],
    private_region_type: ''
  },


  attached: function (options) {
   // this.getDataStatistics();
    this.setData({
      private_region_type: app.globalConfig.private_region_type
    })
    if (this.data.private_region_type != 1 && this.data.private_region_type != 3 ) {
      this.data.switchTab.tabs.map((item,index) => {
        if(item.value == 3) {
          this.data.switchTab.tabs.splice(index,1)
        }
      })
    }
    this.setData({
      switchTab: this.data.switchTab
    })
  },
 

  ready: function () {
    cancavsOpenCard = this.selectComponent('#mychart-open-card');
    cancavsNewUser = this.selectComponent('#mychart-new-user');
    cancavsCardShare = this.selectComponent('#mychart-card-share');
    cancavsCardShare = this.selectComponent('#mychart-card-share');
    cancavsConversion = this.selectComponent('#mychart-conversion');
    cancavsGender = this.selectComponent('#mychart-gender');
    cancavsAge = this.selectComponent('#mychart-user-age');
    canvasCity = this.selectComponent('#mychart-user-city');
    canvasInterest = this.selectComponent('#mychart-user-interest');
    cancavsSale = this.selectComponent('#mychart-sale');
    cancavsOrderMoney = this.selectComponent('#mychart-order-money');
    cancavsCardLike = this.selectComponent('#mychart-card-like');
    cancavsFollowUser = this.selectComponent('#mychart-follow-user');
    cancavsUserBehavior = this.selectComponent('#mychart-user-behavior');
    cancavsCustomer = this.selectComponent('#mychart-customer');
    cancavsEnterEfficiency = this.selectComponent('#mychart-enter-efficiency');
    cancavsVideo = this.selectComponent('#mychart-video');
    cancavsContent = this.selectComponent('#mychart-content');

    this.getBusinessConversion();
    this.getBusinessSale();
    this.getOrderMoney();
    this.getSalesPerformanceAnalysis()
    

    if(this.data.tabIndex == 1&&!this.data.loadOVerPersonas){
        //this.getPersonas();
    }
      


    
  },
  methods: {
  onTabClick(e) {
    this.setData({
      tabIndex: e.detail.currentIndex,
      tabValue: e.detail.value
    });
    if (this.data.tabValue == 3) {
      this.getCustomer();
    }
    if (this.data.tabValue == 2&&!this.data.loadOVerPersonas){
      //this.getPersonas();
      this.getUserInterestAnalysis();
      this.getUserGenderCount();
      this.getUserAgeCount();
      this.getUserCityCount();
      this.getUserBehavior();
  }
    if (this.data.tabValue == 1&&!this.data.loadOverTeam){
      this.getCardOpenCount();
      this.getCardShareCount();
      this.getNewUserCount();
      this.getCardLikeCount();
      this.getFollowUserCount();
  }
  },
  statisticsChange(e) {
    var index = parseInt(e.detail.currentIndex);
    this.getDataStatistics(index);

  },

  bindStartChange(e) {
    let value = e.detail.value;
    this.setData({
      beginTime: value
    })
    this.getCustomer()
  },
  bindEndChange(e) {
    let value = e.detail.value;
    this.setData({
      endTime: value
    })
    this.getCustomer()
  },
  cardOpenCountChange(e) {
    var index = parseInt(e.detail.currentIndex);
    this.getCardOpenCount(index);
  },
  newUserCountChange(e) {
    var index = parseInt(e.detail.currentIndex);

    this.getNewUserCount(index);
  },
  cardSharNumChange(e) {
    var index = parseInt(e.detail.currentIndex);

    this.getCardShareCount(index);
  },
  conversionChange(e) {
    var index = parseInt(e.detail.currentIndex);

    this.getBusinessConversion(index);
  },
  saleChange(e){
    var index = parseInt(e.detail.currentIndex);

    this.getBusinessSale(index);
  },
  marketingChange(e) {
    var index = parseInt(e.detail.currentIndex);

    this.getSalesPerformanceAnalysis(index);
  },
 orderMoneyChange(e) {
    var index = parseInt(e.detail.currentIndex);

    this.getOrderMoney(index);
  },
  cardLikeNumChange(e){
  var index = parseInt(e.detail.currentIndex);

    this.getCardLikeCount(index);
  },
  newFollowCountChange(e){
    var index = parseInt(e.detail.currentIndex);

    this.getFollowUserCount(index);
  },
  userInterestChange(e){
    var index = parseInt(e.detail.currentIndex);

    this.getUserInterestAnalysis(index);
  },
  userGenderCountChange(e){
    var index = parseInt(e.detail.currentIndex);

    this.getUserGenderCount(index);
  },
  userAgeChange(e){
    var index = parseInt(e.detail.currentIndex);

    this.getUserAgeCount(index);
  },
  userCityChange(e){
    var index = parseInt(e.detail.currentIndex);
    this.getUserCityCount(index)
  },
  userBehaviorChange(e){
    var index = parseInt(e.detail.currentIndex);
    this.getUserBehavior(index)
  },
  onPullDownRefresh: function () {

  },

  getDataStatistics(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getDataStatistics',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        needGrowthRate:1,
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var data = res.data.data;
      data.userTimeCount = parseInt(data.userTimeCount.count/1000/60)+' min';
      const list = Object.values(data.userByStatusCount)
      this.setData({
        getDataStatistics: data,
        userByStatusCount: list
      })
    }).catch(err => {
      console.log('*******************请求770',err)
    })
  },
  getSalesPerformanceAnalysis(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'DataAnalysis/getSalesPerformanceAnalysis',
      data: {
        isCardStaff: 0,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var data = res.data.data;
      // console.log(data)
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
      videoOptionSale.series[0].bottom = "20%"
      videoOptionSale.legend.data = ['浏览视频', '点击商品', '生产订单', '实际购买'];
      videoOptionSale.series[0].label.normal.formatter = function (obj) {
        return obj.data.value 
          // + '(' + obj.data.percentage + ')'
      }
      videoOptionSale.color = ['#91B5F4', '#ACDE9A','#FBE451', '#EC5D60']
     
      let contentOptionSale = deepClone(videoOptionSale);
      contentOptionSale.series[0].data = [
        {
          value: contentData.browseTotal,
          name: '浏览资讯',
          // percentage: (contentData.browseProportion*100) + '%'
        },
        {
          value: contentData.clickTotal,
          name: '点击资讯',
          // percentage: (contentData.clickProportion*100) + '%'
        },
        {
          value: contentData.allShopOrderTotal,
          name: '生产订单',
          // percentage: (contentData.allShopOrderTotalProportion*100) + '%'
        },
        {
          value: contentData.alreadyShopOrderTotal,
          name: '最终付款',
          // percentage: (contentData.alreadyShopOrderTotalProportion*100) + '%'
        }
      ];
      contentOptionSale.legend.data = ['浏览资讯', '点击资讯', '生产订单', '最终付款'];
      this.setData({
        channelList: channelList
      })
      init(cancavsVideo, videoOptionSale);
      init(cancavsContent, contentOptionSale);
    }).catch(err => {})
  },
  getCardOpenCount(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getCardOpenCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var lineData = res.data.data.lineData;
      optionOpenCard.series[0].data = [];
      for (var key in lineData) {
        var item = {
          value: [key, parseInt(lineData[key])]
        };
        optionOpenCard.series[0].data.push(item)
      }
      if(index==1){
        optionOpenCard.xAxis.axisLabel.formatter = FormatHour;
      }else{
        optionOpenCard.xAxis.axisLabel.formatter = FormatDay;
      }
      this.setData({
        openCardNum: res.data.data.count
      })
      this.data.loadOverTeam = true
      init(cancavsOpenCard, optionOpenCard)
    }).catch(err => {
      console.log('error: ', err)
    })
  },
  getNewUserCount(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getNewUserCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var lineData = res.data.data.lineData;
      optionNewUser.series[0].data = [];
      for (var key in lineData) {
        var item = {
          value: [key, parseInt(lineData[key])]
        };
        optionNewUser.series[0].data.push(item)
      }
      if(index==1){
        optionNewUser.xAxis.axisLabel.formatter = FormatHour;
      }else{
        optionNewUser.xAxis.axisLabel.formatter = FormatDay;
      }
      this.setData({
        newUserCount: res.data.data.count
      })
      init(cancavsNewUser, optionNewUser);
    }).catch(er => {})
  },
  getCardShareCount(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getCardShareCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var lineData = res.data.data.lineData;
      optionCardShare.series[0].data = [];
      for (var key in lineData) {
        var item = {
          value: [key, parseInt(lineData[key])]
        };
        optionCardShare.series[0].data.push(item)
      }
      this.setData({
        cardSharNum: res.data.data.count
      })
      if(index==1){
        optionCardShare.xAxis.axisLabel.formatter = FormatHour;
      }else{
        optionCardShare.xAxis.axisLabel.formatter = FormatDay;
      }
      init(cancavsCardShare, optionCardShare);
    }).catch(er => {})
  },
  getBusinessConversion(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getBusinessConversion',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }

    fetchApi(this, param, "POST").then(res => {

      let userByStatusCount = res.data.data.userByStatusCount;
      let legends= []
      let series= []
      userByStatusCount.forEach(element => {
        legends.push(element.statusName)
        series.push({
          name: element.statusName,
          value: element.statusCount
        })
      });
      optionConversion.series[0].data = series;
      optionConversion.legend.data = legends;
      this.setData({
        conversion: res.data.data.conversion
      })
      init(cancavsConversion, optionConversion);
    }).catch(er => {
      console.log(er)
    })
  },
  getOrderMoney(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getOrderLineData',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var lineData = res.data.data.lineData;
      optionOrderMoney.series[0].data = [];
      optionOrderMoney.series[1] = deepClone(optionOrderMoney.series[0])
      for (var key in lineData) {
        var item = {
          value: [key, parseInt(lineData[key].count)]
        };
        optionOrderMoney.series[0].data.push(item)
        var salesPrice = {
          value: [key, parseInt(lineData[key].salesPrice)]
        };
        optionOrderMoney.series[1].data.push(salesPrice)
      }
      this.setData({
        cardOrderMoney: res.data.data.count
      })
      if (index == 1) {
        optionOrderMoney.xAxis.axisLabel.formatter = FormatHour;
      } else {
        optionOrderMoney.xAxis.axisLabel.formatter = FormatDay;
      }
      //成交金额折线图的样式颜色
      optionOrderMoney.series[1].lineStyle.normal.color="#ff3600"
      optionOrderMoney.series[1].itemStyle.normal={
        color: "#fd9a33",
        borderColor: "#fd9a33",
        shadowColor: "#fd9a33",
        shadowBlur: 4
      }
      optionOrderMoney.series[1].areaStyle.normal.color.colorStops[1].color = 'rgba(253, 154, 51, 0.1)'
      optionOrderMoney.series[1].areaStyle.normal.color.colorStops[0].color = 'rgba(253, 154, 51, 0.8)'
      init(cancavsOrderMoney, optionOrderMoney);
    }).catch(er => { })
  },

  getBusinessSale(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getSalesConversion',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }

    fetchApi(this, param, "POST").then(res => {
      var data = res.data.data;
      optionSale.series[0].data = [];
      optionSale.legend.data = [];
      var funnelMap = { userCount: '客户总数', followUserCount: '跟进客户数', hasOrderUserCount:'购买用户数'};
      for (let i in funnelMap) {
        optionSale.series[0].data.push({
          value: parseInt(data[i]),
          name: funnelMap[i]
        })
        optionSale.legend.data.push(funnelMap[i])
      }
      this.setData({
        saleConversion: res.data.data.conversion
      })
      init(cancavsSale, optionSale);
    }).catch(er => {
      console.log(er)
    })
  },
   getCardLikeCount(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getCardLikeCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var lineData = res.data.data.lineData;
      optionCardLike.series[0].data = [];
      for (var key in lineData) {
        var item = {
          value: [key, parseInt(lineData[key])]
        };
        optionCardLike.series[0].data.push(item)
      }
      this.setData({
        cardLikeNum: res.data.data.count
      })
      if(index==1){
        optionCardLike.xAxis.axisLabel.formatter = FormatHour;
      }else{
        optionCardLike.xAxis.axisLabel.formatter = FormatDay;
      }
      init(cancavsCardLike, optionCardLike);
    }).catch(er => {})
  },
  getFollowUserCount(index = 0) {
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getFollowUserCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }
    fetchApi(this, param, "POST").then(res => {
      var lineData = res.data.data.lineData;
      optionFollowUser.series[0].data = [];
      for (var key in lineData) {
        var item = {
          value: [key, parseInt(lineData[key])]
        };
        optionFollowUser.series[0].data.push(item)
      }
      if (index == 1) {
        optionFollowUser.xAxis.axisLabel.formatter = FormatHour;
      } else {
        optionFollowUser.xAxis.axisLabel.formatter = FormatDay;
      }
      this.setData({
        followUserCount: res.data.data.count
      })
      init(cancavsFollowUser, optionFollowUser);
    }).catch(er => { })
  },
  getUserInterestAnalysis(index = 0){
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getUserInterestAnalysis',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }

    fetchApi(this, param, "POST").then(res => {
      var data = res.data.data
      let interestMap = {
        goods: '对产品感兴趣',
        news: '对资讯感兴趣',
        card: '对我感兴趣',
        company: '对公司感兴趣'
      }
      var optionPieData = [];
      for (var key in interestMap) {
        optionPieData.push({
          value: data[key],
          name: interestMap[key]
        })

      }
      optionInterest.series[0].data = optionPieData;
      init(canvasInterest, optionInterest);
      this.data.loadOVerPersonas = true;
    }).catch(er => {
      console.log(er)
    })
  },
  getUserGenderCount(index = 0){
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getUserGenderCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }

    fetchApi(this, param, "POST").then(res => {
      var genderDistribution = res.data.data,
        genderMap = ['保密', '男性', '女性']
      optionGender.series[0].data = [];
      genderDistribution.map((i, index) => {
        optionGender.legend.data.push(genderMap[index]);
        optionGender.series[0].data.push({
          value: parseInt(i),
          name: genderMap[index]
        })
      })
      init(cancavsGender, optionGender);
    }).catch(er => {
      console.log(er)
    })
  },
  getUserAgeCount(index = 0){
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getUserAgeCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }

    fetchApi(this, param, "POST").then(res => {
      var area = res.data.data,
        ageMap = ['未知', '18岁以下', '18~30岁', '31~50岁', '51~70岁', '70岁以上'];
      optionAge.xAxis[0].data = ageMap;
      optionAge.series[0].data = area;
      init(cancavsAge, optionAge);
    }).catch(er => {
      console.log(er)
    })
  },
  getUserCityCount(index = 0){
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getUserCityCount',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }

    fetchApi(this, param, "POST").then(res => {
      var cityDistribution = res.data.data

      optionCity.yAxis.data = [];
      optionCity.series[0].data = [];
      for (var key in cityDistribution) {
        optionCity.yAxis.data.push(key);
        optionCity.series[0].data.push(parseInt(cityDistribution[key]));

      }
      
      init(canvasCity, optionCity);
    }).catch(er => {
      console.log(er)
    })
  },

  getCustomer() {
    let beginTime = this.data.beginTime,
        endTime = this.data.endTime;
    if (beginTime == '请输入开始时间') {
      beginTime = ''
    }
    if(endTime == '请输入截止时间') {
      endTime = ''
    }
    let param = {
      url: 'CrmUserDataCensus/companyFlowDataAnalysis',
      data: {
        isCardStaff: 0,
        departmentIds: this.properties.departmentIds,
        beginTime: beginTime,
        endTime: endTime ? endTime + ' 23:59:59' : ''
      }
    }
    fetchApi(this, param, "POST").then(res => {
      const { crmSourceData, crmSourceRate, stateData } = res.data.data;
      optionCustomer.series[0].data = [];
      optionCustomer.legend.data = [];
      optionCustomer.color = ['#FF9732', '#247CF6','#AEE388']
      var funnelMap = ['未转化(仅名片)', '名片->企微', '企微->名片'];
      optionCustomer.series[0].label.normal.formatter = "{d}%"
      optionCustomer.series[0].label.fontSize = '10'
      crmSourceData.map((item, index) => {
        optionCustomer.series[0].data.push({
          value: parseInt(crmSourceData[index]),
          name: funnelMap[index]
        })
      })
      var enterMap = ['其他入口','首页板块引导', '覆盖咨询按钮', '商城客服按钮','资讯咨询按钮'];
      optionEnterEfficiency.xAxis[0].data = enterMap;
      optionEnterEfficiency.series[0].data = stateData;
      optionEnterEfficiency.color =['#5699f2']

      this.setData({
        crmSourceData,
        crmSourceRate
      })
      init(cancavsCustomer, optionCustomer)
      init(cancavsEnterEfficiency, optionEnterEfficiency)
    })
  },
  getUserBehavior(index =0){
    index = parseInt(index);
    var param = {
      url: 'dataAnalysis/getCrmUserBehavior',
      data: {
        cardId: app.globalData.cardId,
        endTime: index > 0 ? today : '',
        beginTime: startTimes[index],
        departmentIds: this.properties.departmentIds
      }
    }

    fetchApi(this, param, "POST").then(res => {
      var eventBoard = res.data.data
      optionUserBehavior.xAxis[0].data = [];
      optionUserBehavior.series[0].data = [];
      eventBoard.map(item => {
        optionUserBehavior.xAxis[0].data.push(item.name);
        optionUserBehavior.series[0].data.push(parseInt(item.count))
      })
      init(cancavsUserBehavior, optionUserBehavior);
    }).catch(er => {
      console.log(er)
    })
  },


  }
});

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
