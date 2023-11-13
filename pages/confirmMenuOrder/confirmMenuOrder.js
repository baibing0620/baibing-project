const app = getApp();
import {
  fetchApi,
  wxpay,
  getGlobalConfig
} from '../../api/api';
import {
  showLoading,
  showToast,
  getSum,
  trim,
  showModal,
  nav,
  showTips,
  getUrlParam,
  deleteWhite,
  deepClone,
  getYMD,
  getTomorrowYMD
} from '../../utils/util';
let setTimeoutClick;
Page({
  data: {
    shopOpenVipPay: 0,
    openVipCard: 0,
    discount: 10,
    balance: 0,
    tableNum: '',
    cartList: [],
    addressInfo: null,
    menuType: 0, //2：扫描点单，3：外卖点单，4：流水订单
    deliveryPrice: null,
    boxPrice: 0,
    is_open_box_money:0,
    totalMoney: 0,
    noMenuType: false,
    shopFunctionList: 0,
    coupon: {
      num: 0,
      des: '无优惠券可用',
      couponId: 0,
      statue: 'none' //none,无优惠券可用，have 有优惠券二用
    },
    tabBarList: [{
      name: '外卖',
      index: 1,
      type: 3
    }, {
      name: '扫码点单',
      index: 2,
      type: 2
    }, {
      name: '流水点单',
      index: 4,
      type: 4
    }],
    mainColor: app.extConfig.mainColor,
    open_offline_pay: 0,
    payItems: [{
      name: '微信支付',
      value: 0,
      checked: true
    }],
    isOpenCheckReceipt: false,
    timeNodeIndex: 0,
    timeNodeList: [],
    openTimePeriods: [],
    openDay: [],
    openCheckReceipt: 0,
    checkReceiptPeriod: 0
  },
  dataStore: {
    payType: 0,
    goodsList: [],
    countMoney:0
  },
  onLoad: function (options) {
    this.setData({
      options
    });
    if (app.globalConfig) {
      this.init();
    } else {
      getGlobalConfig().then(() => {
        this.init();
      })
    }
    this.getO2ODeliveryConfig()
  },
  onReady: function () {

  },
  onShow: function () {
    if (app.globalData.coupon !== null) {
      let coupon = app.globalData.coupon;
      this.setData({
        coupon: coupon,
      });
      app.globalData.coupon = null;
    }
  },

  onHide() {
    clearTimeout(setTimeoutClick);
  },

  onPullDownRefresh() {
    if (app.globalConfig) {
      this.init();
    } else {
      getGlobalConfig().then(() => {
        this.init();
      })
    }
  },

  init () {
    const {options} = this.data;
    let mainColor = this.data.mainColor;
    if (mainColor != deleteWhite(mainColor)) {
      this.setData({
        mainColor: deleteWhite(mainColor)
      })
    }
    this.dataStore.payType = this.data.payItems[0].value;
    let cartList = app.globalData.cartList,
      tableNum = app.globalData.tableNum,
      deliveryPrice = app.globalData.deliveryPrice,
      menuType = options.menuType || 0,
      noMenuType = (options.menuType == 0 || !options.menuType || options.menuType == 'undefined') ? true : false;
    let totalMoney = 0;
    let totalNum = 0;
    for (let i = 0; i < cartList.length; i++) {
      let item = {
        id: cartList[i].goodsId,
        total: cartList[i].addNum,
        optionId: cartList[i].hasOption == 1 ? cartList[i].selectedSpec.optionId : 0
      }
      this.dataStore.goodsList[i] = item;
      let goodsNum = parseInt(cartList[i].addNum);
      let goodsPrice = parseFloat(cartList[i].price);
      totalMoney += goodsNum * goodsPrice;
      totalNum += goodsNum;
    }
    app.globalData.goodsList = this.dataStore.goodsList;    
    
    if (menuType == 2) {
      if (tableNum != null) {
        this.setData({
          tableNum: tableNum
        })
      }
    }
    if (menuType == 3) {
      this.setData({
        deliveryPrice: deliveryPrice,
      });
      getAdress(this);
    }
   
      var boxPrice = !app.globalConfig.is_open_box_money || app.globalConfig.is_open_box_money==0?0: parseFloat(app.globalConfig.box_money)*getCartNum(cartList);
    // type = 11, 12, 14 都需要 setData
    this.setData({
      cartList: cartList,
      totalMoney: totalMoney,
      menuType: menuType,
      noMenuType: noMenuType,
      boxPrice:boxPrice.toFixed(2),
      is_open_box_money:parseInt(app.globalConfig.is_open_box_money) 

    });
    getPayTypeList(this);
    if (noMenuType) {
      setTopBarConfig(this)
    }
    getCouponData(this);
  },
  chooseMenuType(e) {
    this.setData({
      menuType: e.currentTarget.dataset.type
    })
    getCouponData(this);

  },
  timeChange(e) {
    console.log(e.detail.value)
    console.log(this.data.timeNodeIndex)
    this.setData({
      timeNodeIndex: e.detail.value
    })
  },
  chooseAddress() {
    let self = this;
    wx.chooseAddress({
      success: function (res) {
        var realname = res.userName,
          province = res.provinceName,
          city = res.cityName,
          area = res.countyName,
          address = res.detailInfo,
          mobile = res.telNumber,
          postCode = res.postalCode,
          fulladdress = province + city + area + address;
        var param = {
          url: app.API_HOST + 'address/addLbsAddress',
          data: {
            realname: realname,
            province: province,
            city: city,
            area: area,
            address: address,
            mobile: mobile,
            postCode: postCode
          }

        }
        fetchApi(self, param).then((resN) => {
          let data = resN.data.data;
          app.globalData.deliveryPrice = data.deliveryPrice;
          let addressId = data.addressId;
          self.setData({
            deliveryPrice: data.deliveryPrice,
            addressInfo: {
              id: addressId,
              realname: realname,
              province: province,
              city: city,
              area: area,
              address: address,
              mobile: mobile,
              fulladdress: fulladdress
            }
          })

        }).catch((err) => {
          showModal({
            title: '提示',
            showCancel: false,
            content: err.data.msg,
          })
        })

      },
      fail: function (e) {
        if (e.errMsg && !/cancel/.test(e.errMsg)) {
          showModal({
            title: '提示',
            content: '您已关闭通讯地址权限，请至个人中心重新设置通讯地址权限',
            showCancel: false
          }).then(res => {
            //wx.openSetting()
            nav({
              url: '/pages/personal/personal'
            })
          })
        }

      }
    })
  },
  getO2ODeliveryConfig() {
    let param = {
      url: app.API_HOST + 'order/getO2ODeliveryConfig',
      data: {}
    };
    fetchApi(this, param).then(res => {
      console.log(res)
      let deliveryConfig = res.data.data.deliveryConfig
      let shop = res.data.data.shop
      let isOpenCheckReceipt = false
      console.log(deliveryConfig.is_open_check_receipt == 1)
      console.log((1 & deliveryConfig.open_type)>0)
      this.data.openDay = JSON.parse(shop.open_day)
      this.data.openTimePeriods = JSON.parse(shop.open_time_periods)
      if (deliveryConfig.is_open_check_receipt == 1 && (1 & deliveryConfig.open_type)>0) {
        let openDay = JSON.parse(shop.open_day),
            now = new Date(),
            day = now.getDay()
        console.log('openDay',openDay)
        console.log('day',day)
        if (openDay.indexOf(day) != -1) {
          isOpenCheckReceipt = true
          this.data.deliveryConfig = deliveryConfig
          deliveryTime(this)
        }
      }
      console.log(deliveryConfig)
      console.log(deliveryConfig)
      this.setData({
        isOpenCheckReceipt: isOpenCheckReceipt
      })
      console.log(this.data.isOpenCheckReceipt)
    })
  },
  scanTable() {
    let self = this;
    wx.scanCode({
      success: (res) => {
        try {
          var tableNum = getUrlParam('deskNum', res.path);
          self.setData({
            tableNum: tableNum
          });
          wx.showToast({
            title: ' 扫描桌号成功',
            icon: 'success',
            duration: 500
          })
        } catch (e) {
          showTips('二维码不正确');
        };
      }
    })
  },
  payOrder(e) {
    var menuType = this.data.menuType,
        payItems = deepClone(this.data.payItems);
        if(menuType==3){
          if(this.data.totalMoney<app.globalConfig.delivery_start_price){
            showModal({
              title:'提示',
              content:`起送价为${app.globalConfig.delivery_start_price}元，您的订单低于起送价`
            })
            return;
          }
          for (var i = 0; i < payItems.length; i++) {
            if(payItems[i].value==2){
              payItems.splice(i,1);
              break;
            }
          }
        }
    if (payItems.length > 1) {
      let payListText = []
      for (let i = 0; i < payItems.length; i++) {
        payListText[i] = payItems[i].name;
      }
      let self = this
      wx.showActionSheet({
        itemList: payListText,
        itemColor: '#ff6101',
        success: function (res) {
          self.dataStore.payType = payItems[parseInt(res.tapIndex)].value;
          if (self.dataStore.payType == 3) {
            if (self.data.openVipCard == 0) {
              showModal({
                title: '提示',
                content: '您尚未激活会员卡，不能使用会员卡支付'
              }).then(_ => {
                return;
              })
            }
          }
          order(self, e)
        },
        fail: function (res) {}
      })
    } else {
      order(this, e)
    }

  },
  toCoupon() {
    var orderMoney = parseFloat(this.data.totalMoney);
    if (this.data.menuType == 3) {
      orderMoney += parseFloat(this.data.boxPrice);
    }
    nav({
      url: '/pages/chooseCoupon/chooseCoupon',
      data: {
        totalMoney: orderMoney,
        couponId: this.data.coupon.couponId
      }
    })

  },
});

function getCouponData(self) {
  var orderMoney = parseFloat(self.data.totalMoney);
  if(self.data.menuType ==3){
    orderMoney += parseFloat(self.data.boxPrice) ;
  }
  let param = {
    url: app.API_HOST + 'coupon/orderCoupons',
    data: {
      goodsInfo: JSON.stringify(self.dataStore.goodsList),
      orderMoney: orderMoney,
      filterType: '0',
    }
  };
  fetchApi(self, param, 'POST').then(res => {
    let couponList = res.data.data;
    if (couponList.length <= 0) {
      self.setData({
        coupon: {
        num: 0,
        des: '无优惠券可用',
        couponId: 0,
        statue: 'none' //none,无优惠券可用，have 有优惠券二用
        }
      });
    }else{
      self.setData({
        coupon: {
          num: couponList[0].cutdown,
          des: couponList[0].cutdown + '元',
          couponId: couponList[0].id,
          statue: 'have' //none,无优惠券可用，have 有优惠券二用
        }
      });
    }
  }).catch((e) => {
    console.log(e)
  });
}

function getAdress(self) {
  let param = {
    url: app.API_HOST + 'address/getDefaultAddressAndDeliveryPrice',
    data: {}
  };
  fetchApi(self, param).then((res) => {
    var addressInfo = res.data.data.address;
    let deliveryPrice = res.data.data.deliveryPrice;
    if (addressInfo) {
      app.globalData.deliveryPrice = deliveryPrice;
      addressInfo.fulladdress = addressInfo.province + ' ' + addressInfo.city + ' ' + addressInfo.area + ' ' + addressInfo.address;
      self.setData({
        addressInfo: addressInfo,
        deliveryPrice: deliveryPrice,
      });
    }
  }).catch((e) => {
    console.log('获取地址错误: ', e)
  });
}

function deliveryTime(self) {
  let date = new Date(),
      openTimePeriods = self.data.openTimePeriods,
      period = (self.data.deliveryConfig.check_receipt_period*60) == 0?1:(self.data.deliveryConfig.check_receipt_period*60),
      list = [],
      timeNow = date.getHours()*60 + date.getMinutes();
      console.log(openTimePeriods)
      console.log(period)
  openTimePeriods.forEach(element => {
    // console.log(element)
    let begin = element.begin,
        end = element.end,
        beginArry = begin.split(':'),
        endArry = end.split(':'),
        beginTime = beginArry[0]*60 + parseInt(beginArry[1]),
        endTime = endArry[0]*60 + parseInt(endArry[1]);
    for (let lastTime = timeNow; lastTime < endTime;) {
      if (lastTime < beginTime) {
        lastTime = beginTime
      }
      let startHour = parseInt(lastTime/60)
      let startMinute = parseInt(lastTime%60)
      let endHour = parseInt((lastTime+period)/60)
      let endMinute = parseInt((lastTime+period)%60)
      let timeNode = setnum(startHour)+ ':' +setnum2(startMinute) +'-'+ setnum(endHour)+ ':' +setnum2(endMinute)
      list.push(timeNode)
      lastTime += period
    }
  });
  // 去重
  let timeNodeList = Array.from(new Set(list))
  self.setData({
    timeNodeList: timeNodeList
  })
}

function setnum(num) {
  if (num >= 24) {
    num = num-24
  }
  if (num < 10) {
    num = '0' + num;
  }
  return num;
}

function setnum2(num) {
  if (num < 10) {
    num = '0' + num;
  }
  return num;
}

function pay(self, param, formId) {
  showLoading();
  fetchApi(self, param, 'POST').then((res) => {
    let orderId = res.data.data.id;
    app.globalData.cartList = [];
    if (self.dataStore.payType == 0) {
      console.log('cancel wx pay code');
      // 订阅消息
      const param1 = {
        url: app.API_HOST + 'order/wxpay',
        data: {
            orderId: orderId,
            formId: formId
        }
      };
      fetchApi(self, param1).then((res) => {
        const payParam = res.data.data;
        wx.requestPayment({
            'timeStamp': payParam.timeStamp,
            'nonceStr': payParam.nonceStr,
            'package': payParam.package,
            'signType': payParam.signType,
            'paySign': payParam.paySign,
            success: function (_res) {
              showToast('支付成功', 'success', 1500);
              let params = {
                url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
                data: {
                  tpl_msg_type: '1,2,3'
                }
              };
              fetchApi(self, params).then(tres => {
                console.log(tres)
                wx.requestSubscribeMessage({
                    tmplIds: tres.data.data,
                    success (sres) { },
                    fail(sres) { },
                    complete(sres) {
                      setTimeoutClick = setTimeout(function () {
                        wx.redirectTo({
                          url: "/pages/menuOrderDetail/menuOrderDetail?id=" + orderId + "&payOver=1"
                        })
                      }, 1500)
                    }
                })
              }).catch(res => {
                wx.redirectTo({
                  url: "/pages/menuOrderDetail/menuOrderDetail?id=" + orderId
                })
              })
            },
            fail: function (error) {
              wx.redirectTo({
                url: "/pages/menuOrderDetail/menuOrderDetail?id=" + orderId
              })
            }
        });
      }).catch((e) => {
        wx.redirectTo({
          url: "/pages/menuOrderDetail/menuOrderDetail?id=" + orderId
        })
      });


    } else if (self.dataStore.payType == 2) {
      showToast('支付成功', 'success', 1500);
      setTimeoutClick = setTimeout(function () {
        wx.redirectTo({
          url: "/pages/menuOrderDetail/menuOrderDetail?id=" + orderId
        })
      }, 1500)
    } else if (self.dataStore.payType == 3) {
      let paramPay = {
        url: app.API_HOST + 'order/vipCardPay',
        data: {
          orderId: orderId,
          formId: formId
        }
      }
      fetchApi(this, paramPay).then(resN => {
        showToast('支付成功', 'success', 1500);
        setTimeoutClick = setTimeout(function () {
          wx.redirectTo({
            url: "/pages/menuOrderDetail/menuOrderDetail?id=" + orderId + "&payOver=1"
          })
        }, 1500)
      }).catch(err => {
        showModal({
          title: '提示',
          content: err.data && err.data.msg ? err.data.msg : '支付错误'
        }).then(res => {

          wx.redirectTo({
            url: "/pages/menuOrderDetail/menuOrderDetail?id=" + orderId
          })
        })
      });

    }
  }).catch((err) => {
    showModal({
      title: '提示',
      content: err.data && err.data.msg ? err.data.msg : '创建订单失败'
    });
  });
}
function getPayTypeList(self) {
  let payItems = self.data.payItems;
  if (app.globalConfig.open_offline_pay == 1) {
    payItems.push({
      name: '线下支付',
      value: 2,
      checked: false
    })
  }
  let param = {
    url: app.API_HOST + 'vip/getVipOrderConfirm',
    data: {}
  }
  fetchApi(self, param).then((res) => {
    if (res.data.code == 50) {
      return;
    }
    let data = res.data.data;
    if (data.open_online_pay == 1) {
      payItems.push({
        name: '会员支付',
        value: 3,
        checked: false
      });
      self.setData({
        shopOpenVipPay: data.open_online_pay,
        openVipCard: data.open_vip_card,
        discount: data.discount,
        balance: data.card_remaining,
        payItems: payItems
      });

    }
  }).catch((err) => {
    console.log('err', err)
  });
}

function order(self, e) {
  let deliveryPrice = self.data.deliveryPrice,
    menuType = self.data.menuType,
    param = {};
  let formId = e.detail.formId;
  let goodsList = self.dataStore.goodsList;
  if (menuType == 2) {
    if (e.detail.value.tableNo == '') {
      showTips('请填写桌号');
      return;
    }
    param = {
      url: app.API_HOST + 'order/createFoodOrder',
      data: {
        remark: e.detail.value.remark,
        deskNum: trim(e.detail.value.tableNo),
        goodsList: JSON.stringify(goodsList),
        orderType: 2,
        couponId: 0 - self.data.coupon.couponId
      }
    }
  }

  if (menuType == 3) {
    let addressInfo = self.data.addressInfo;
    if (addressInfo == null) {
      showTips('请选择地址');
      return;
    }
    let checkReceiptTime = []
    if (self.data.isOpenCheckReceipt) {
      let time = self.data.timeNodeList[self.data.timeNodeIndex]
      let timeArray = time.split("-")
      let date = getYMD(new Date(), '-')
      let edate = date
      if (timeArray[0] > timeArray[1]) {
        edate = getTomorrowYMD(new Date(), '-')
      }
      checkReceiptTime = [date + ' ' + timeArray[0] + ':00', edate + ' ' + timeArray[1] + ':00']
    }
    param = {
      url: app.API_HOST + 'order/createFoodOrder',
      data: {
        remark: e.detail.value.remark,
        goodsList: JSON.stringify(goodsList),
        deliveryPrice: deliveryPrice,
        boxPrice: self.data.boxPrice,
        orderType: 3,
        couponId: 0 - self.data.coupon.couponId,
        addressId: addressInfo.id,
        checkReceiptTime: JSON.stringify(checkReceiptTime)
      }
    }

  }
  if (menuType == 4) {
    param = {
      url: app.API_HOST + 'order/createFoodOrder',
      data: {
        remark: e.detail.value.remark,
        goodsList: JSON.stringify(goodsList),
        orderType: 4,
        couponId: 0 - self.data.coupon.couponId

      }
    }
  }
  param.data['payType'] = self.dataStore.payType;

  if (self.dataStore.payType == 2) {
    showModal({
      title: '提示',
      content: '您将使用线下支付，请确定',
      showCancel: true
    }).then(() => {
      pay(self, param, formId);
    }).catch(_ => {})
  } else if (self.dataStore.payType == 3) {
    showModal({
      title: '提示',
      content: `您将使用会员卡支付，余额${self.data.balance},请确定`,
      showCancel: true
    }).then(() => {
      pay(self, param, formId);
    }).catch(_ => {})
  } else {
    pay(self, param, formId);
  }
}

function setTopBarConfig(self) {
  let tabBarList = self.data.tabBarList,
    _tabBarList = [],
    shopFunctionList = app.globalConfig.shop_function_list;
  for (let i = 0; i < tabBarList.length; i++) {
    if (shopFunctionList & tabBarList[i].index) {
      _tabBarList.push(tabBarList[i])
    }
  }
  self.setData({
    menuType: _tabBarList[0].type,
    tabBarList: _tabBarList,
  })

  if (_tabBarList[0].type == 3) {
    self.setData({
      deliveryPrice: app.globalData.deliveryPrice,
    });
    getAdress(self);
  }
}
function getCartNum(cartList){
  var num = 0;
  for(var i =0;i<cartList.length;i++){
      num +=cartList[i].addNum
  }
  return num;
}