// centerControl/buttWeChatTransform/buttWeChatTransform.js
const app = getApp();
import * as echarts from '../../centerControl/ec-canvas/echarts';
import {
  fetchApi,
  getPhoneNumber,
  addActionLog,
  getUserInfo
} from '../../api/api';
import {
  showLoading,
  previewImageList,
  nav,
  makePhoneCall,
  showToast,
  showTips,
} from '../../utils/util';

var optionCustomer = {
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
    data: ['未转化(仅名片)', '名片->企微', '企微->名片']
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
    labelLine: {
      length: 5,
      lineStyle: {
        color: '#ccc'
      },
    },
    data: [],
  }]
};

var optionEnterEfficiency = {
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

let cancavsCustomer, cancavsEnterEfficiency


Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    getMenuButtonBoundingClientRect: app.globalData.getMenuButtonBoundingClientRect,
    beginTime: '请输入开始时间',
    endTime: '请输入截止时间',
    ec: {},
    requireCardId: ''
  },
  dataStore: {
    requireCardId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '',
    })
    console.log(options,'options')
    // this.dataStore.departmentIds = options.departmentIds || ''
    this.dataStore.requireCardId = options.cardId || ''
    this.setData({
      requireCardId: options.cardId || ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    cancavsCustomer = this.selectComponent('#mychart-customer');
    cancavsEnterEfficiency = this.selectComponent('#mychart-enter-efficiency');
    this.getCustomer()
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
  navBack() {
    wx.navigateBack({
      
    })
  },
  bindStartChange(e) {
    console.log(e, 'qwer')
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
  getCustomer() {
    let beginTime = this.data.beginTime,
      endTime = this.data.endTime;
    if (beginTime == '请输入开始时间') {
      beginTime = ''
    }
    if (endTime == '请输入截止时间') {
      endTime = ''
    }
    let param = {
      url: 'CrmUserDataCensus/companyFlowDataAnalysis',
      data: {
        isCardStaff: this.dataStore.requireCardId ? 0 : 1,
        requireCardId: this.dataStore.requireCardId,
        // departmentIds: this.dataStore.departmentIds,
        beginTime: beginTime,
        endTime: endTime ? endTime + ' 23:59:59' : ''
      }
    }
    fetchApi(this, param, "POST").then(res => {
      const { crmSourceData, crmSourceRate, stateData } = res.data.data;
      optionCustomer.series[0].data = [];
      optionCustomer.legend.data = [];
      optionCustomer.color = ['#FF9732', '#247CF6', '#AEE388']
      var funnelMap = ['未转化(仅名片)', '名片->企微', '企微->名片'];
      optionCustomer.series[0].label.normal.formatter = "{d}%"
      optionCustomer.series[0].label.fontSize = '10'
      crmSourceData.map((item, index) => {
        optionCustomer.series[0].data.push({
          value: parseInt(crmSourceData[index]),
          name: funnelMap[index]
        })
      })
      var enterMap = ['其他入口','首页板块引导', '覆盖咨询按钮', '商城客服按钮', '资讯咨询按钮'];
      optionEnterEfficiency.xAxis[0].data = enterMap;
      optionEnterEfficiency.series[0].data = stateData;
      optionEnterEfficiency.color = ['#5699f2']

      this.setData({
        crmSourceData,
        crmSourceRate
      })
      init(cancavsCustomer, optionCustomer)
      init(cancavsEnterEfficiency, optionEnterEfficiency)
    })
  },
})

function init(canvasDom, option) {
  canvasDom.init((canvas, width, height) => {
    console.log(canvas,'canvas')
    // 获取组件的 canvas、width、height 后的回调函数
    // 在这里初始化图表
    let chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
    chart.setOption(option)
  });
};
