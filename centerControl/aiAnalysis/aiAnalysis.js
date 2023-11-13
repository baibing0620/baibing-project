const app = getApp();
import * as echarts from '../../centerControl/ec-canvas/echarts';
import {
  fetchApi
} from "./../../api/api.js";
import {
  showTips,
  formatDuring,
  showLoading
} from "../../utils/util";

var optionBar = {
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
      show:true
    },
    axisLine:{
      lineStyle:{
        color: '#999'
      }
    },
    axisLabel:{
      fontSize:10,
      interval:0,
      rotate:30,
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
var optionFunnel = {
  animation: false,
  calculable: true,
  legend: {
    data: ['展现','点击','访问','咨询','订单'],
    bottom:0
  },
  color:['#d8f4ff','#b1eaff','#89dfff'],
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
        formatter:function(obj){
         
          return formatDuring(obj.value)
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
var optionPie = {
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
    data: ['对产品感兴趣','对资讯感兴趣','对我感兴趣','对公司感兴趣']
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
        formatter: '{d}%',
      },

    },
    labelLine:{
      length:5,
      lineStyle: {
        color: '#ccc'
      },
      
    },
    data: [
    ],
  }]
};
let canvasBar, canvasFunnel, canvasPie;

Page({


  data: {
    ec: {},
    crmId:0,
    pageDuration:[],
    extConfig: app.extConfig,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.crmId = options.crmId;
    this.data.cardId = options.cardId || app.globalData.cardId;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    canvasBar = this.selectComponent('#mychart-dom-bar');
    canvasFunnel = this.selectComponent('#mychart-dom-funnel');
    canvasPie = this.selectComponent('#mychart-dom-pie');

    // init(canvasFunnel, optionFunnel0);
    getInitData(this)
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

  onPullDownRefresh: function () {
    getInitData(this)
  },



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

function getInitData(self) {
  var param = {
    url: 'CrmUserDataCensus/crmUserCensus',
    data: {
      cardId: self.data.cardId,
      crmId: self.data.crmId
    }
  }
  showLoading();
  fetchApi(self, param).then(res => {
    var data = res.data.data;
    var crmUserDraw = data.crmUserDraw;
    var eventBoard = data.eventBoard;
    var eventAnalysis = data.eventAnalysis;
    var gender = ['保密','男','女'];
    crmUserDraw.gender = gender[parseInt(crmUserDraw.gender)];
    self.setData({
      pageDuration: data.pageDuration,
      crmUserDraw: crmUserDraw
    })
    //柱状图
    optionBar.xAxis[0].data = [];
    optionBar.series[0].data = [];
    eventBoard.map(item => {
      optionBar.xAxis[0].data.push(item.eventName);
      optionBar.series[0].data.push(parseInt(item.total))
    })
    //饼图
    var pieMap = {
      goods: '对产品感兴趣',
      news: '对资讯感兴趣',
      card: '对我感兴趣',
      company: '对公司感兴趣'
    }
    var optionPieData = [];
    for (var key in pieMap) {
      optionPieData.push({
        value: parseInt(crmUserDraw[key]/1000),
        name: pieMap[key]
      })
      
    }
    optionPie.series[0].data = optionPieData;
    //漏斗图
    var funnelMap={
      allDuration:'行为总时长',
      searchDuration:'浏览时长',
      chatDuration:'聊天时长'
    };
    optionFunnel.series[0].data = [];
    optionFunnel.legend.data=[];
    for(var key in eventAnalysis){
      optionFunnel.legend.data.push(funnelMap[key]);
      optionFunnel.series[0].data.push({
        value:parseInt(eventAnalysis[key]),
        name:funnelMap[key]
      })
    }
    init(canvasBar, optionBar);
    init(canvasPie, optionPie);
    init(canvasFunnel,optionFunnel);

  }).catch(err => {

  })
}