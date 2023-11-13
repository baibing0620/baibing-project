const app = getApp(); // w
import {
  fetchApi,
  wxpay
} from '../../api/api.js';
import {
  nav,
  showLoading,
  showModal,
  getSum,
  showActionSheet,
  openLocation,
  showToast
} from '../../utils/util';
let setTimeoutClick;
Page({
  data: {
    formData: [],
    formDataId: 0,
    distance: -1,
    showStyle: 0,
    goodsItems: [],
    pickerIndex: 0,
    pickerIndex2: 0,
    goodstotalmoney: 0,
    totalMoney: 0,
    // 为不影响原来的代码新建6个数据(自营/平台商品列表 自营/平台商品价格 自营/平台(加快递)总价)
    personalGoodsItems: [],
    platformGoodsItems: [],
    personalGoodstotalmoney: 0,
    platformGoodstotalmoney: 0,
    personalTotalMoney: 0,
    platformTotalMoney: 0,
    groupGoodstotalmoney: 0,
    userInfo: false,
    options: null,
    remark: '',
    myRemark: '',
    isVirtualGoods: 0,
    deliveryType: 3,
    goodsLength: 0, 
    tabBarList: [{
      type: 3,
      name: '物流配送'
    }, {
      type: 4,
      name: '到店自提'
    }],
    coupon: {
      num: 0,
      des: '无优惠券可用',
      couponId: 0,
      statue: 'none' //none,无优惠券可用，have 有优惠券二用
    },
    vipInfo: {
      discount: 10
    },
    related_virtual_goods: '',
    reduceCouponMoney: 0,
    showMask: false,
    storeList: [],
    storeId: ''
  },
  onLoad: function (options) {
    if(!options.isGrounp) {
        options.isGrounp = 0
    }
    this.setData({
      options: options
    }); 
    getInitGoodsLength(this)
    

  },
  dataStore: {
    
    formValue:[]
  },

  onReady() {

  },
  onShow() {
    if (app.globalData.coupon !== null) {
        let coupon = app.globalData.coupon;
        this.setData({
            coupon: coupon
        });
        app.globalData.coupon = null;
        this.getReduceCoupon()
    }
    app.showRemind(this);
  },
  onHide: function () {

  },
  onUnload: function () {
    clearTimeout(setTimeoutClick)
  },

  onPullDownRefresh() {
    getInitData(this);
  },
  changeDeliveryType(e) {
    this.setData({
      deliveryType: e.currentTarget.dataset.type
    })
    if (e.currentTarget.dataset.type == 4) {
        const {
            platformGoodstotalmoney,
            personalGoodstotalmoney,
        } = this.data

        this.setData({
            totalMoney: parseFloat(personalGoodstotalmoney + platformGoodstotalmoney),
            personalTotalMoney: parseFloat(personalGoodstotalmoney),
            platformTotalMoney: parseFloat(platformGoodstotalmoney)
        })
    } else {
        this.pickExpress({ detail: { value: 0 } })
        this.pickExpressSelected({ detail: { value: 0 } })
    }
    let self = this;
    if (e.currentTarget.dataset.type == 4 && this.data.storeList.length === 0) {
      console.log('未定义')
    }
  },
  selectStore(e) {
    const { id } = e.currentTarget.dataset
    const { storeList, shopSelfLift } = this.data
    const index = storeList.findIndex(item => item.id === id)
    if (index > -1) {
      storeList.forEach(item => item.value = false)
      storeList[index].value = !storeList[index].value
    }
    const item = storeList[index]
    shopSelfLift.address = item.address_detail
    shopSelfLift.area = `${item.address_province}-${item.address_city}-${item.address_area}`
    shopSelfLift.is_open = ''
    shopSelfLift.remark = ''
    shopSelfLift.distance = item.distance
    shopSelfLift.store_name = item.store_name
    shopSelfLift.fullAddress = shopSelfLift.area.replace('-', ' ') + shopSelfLift.address

    this.setData({
      storeId: id,
      storeList,
      shopSelfLift
    })
  },
  confirmStore() {
    this.openMask()
  },
  openMap() {
    let shopSelfLift = this.data.shopSelfLift,
      lng = parseFloat(shopSelfLift.lnglat.split(',')[0]),
      lat = parseFloat(shopSelfLift.lnglat.split(',')[1]); 
    openLocation(lat, lng, shopSelfLift.fullAddress);
  },
  pickExpress(e) {
    console.log(this.data.express)
    const pickerIndex = parseInt(e.detail.value)
    const  {
      platformGoodstotalmoney,
      personalTotalMoney,
      express
    } = this.data
    const platformTotalMoney = parseFloat(Number(platformGoodstotalmoney) + Number(express[pickerIndex] ? express[pickerIndex].price : 0))
    this.setData({
      pickerIndex,
      totalMoney: parseFloat(personalTotalMoney + platformTotalMoney),
      platformTotalMoney
    });
    if (this.data.options.isGrounp ==0 && this.data.options.isBargain != 1) {
      getCouponData(this, 1, this.data.totalMoney);
    }
  },
  pickExpressSelected(e) {
    const pickerIndex2 = parseInt(e.detail.value)
    const {
      personalGoodstotalmoney,
      expressSelected,
      platformTotalMoney
    } = this.data
    const personalTotalMoney = parseFloat(Number(personalGoodstotalmoney) + Number(expressSelected[pickerIndex2] ? expressSelected[pickerIndex2].price : 0))
    this.setData({
      pickerIndex2,
      totalMoney: parseFloat(personalTotalMoney + platformTotalMoney),
      personalTotalMoney
    });
    if (this.data.options.isGrounp == 0 && this.data.options.isBargain != 1) {
      getCouponData(this, 1, this.data.totalMoney);
    }
  },
  chooseAddress() {
    let self = this;
    wx.chooseAddress({
      success: (res) => {
        let realname = res.userName,
          province = res.provinceName,
          city = res.cityName,
          area = res.countyName,
          address = res.detailInfo,
          mobile = res.telNumber,
          postCode = res.postalCode,
          fulladdress = province + city + area + address;
        let param = {
          url: app.API_HOST + 'address/addAddressWidthDefault',
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
        fetchApi(self, param).then(resN => {
          let data = resN.data.data;
          let addressId = data.id;
          self.setData({
            userInfo: {
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
          getInitData(self);
        }).catch(err => {
          showModal({
            title: '提示',
            showCancel: false,
            content: err.data.msg,
          })
        })

      },
      fail: (e) => {
        if (e.errMsg && !/cancel/.test(e.errMsg)) {
          showModal({
            title: '提示',
            content: '您已关闭通讯地址权限，请重新设置通讯地址权限'
          }).then(res => {
            wx.openSetting()
          })
        }

      }
    })
  },
  afterInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  afterInput2(e) {
    this.setData({
      myRemark: e.detail.value
    });
  },
  toCoupon() {
    nav({
      url: '/pages/chooseCoupon/chooseCoupon',
      data: {
        totalMoney: this.data.totalMoney,
        couponId: this.data.coupon.couponId
      }
    })
  },
  buyNowTimer: null,
  buyNow(e) {
    if (this.buyNowTimer) return
    this.buyNowTimer = setTimeout(() => {
      this.buyNowTimer = null
    }, 3000)
    if (this.data.options.isGrounp != 0) {
      this.createGroupOrder(e);
    } else {
      this.createOrder(e);
    }
  },
  pay(param, formId = null) {
    let that = this
    showLoading({
      title: '创建订单中'
    });
    fetchApi(this, param).then(res => {
      let order = res.data.data[0],
          orderId2 = res.data.data[1] ? res.data.data[1].id : 0
      if(this.data.formDataId>0){
        pushFormValue(this,order.id);
      }
      if (param.data.payType == 4) {
        let paramPay = {
          url: app.API_HOST + 'order/creditPay',
          data: {
            orderId: order.id,
            formId: formId
          }
        }
        let paramWx = {
            url: app.API_HOST + 'order/creditWxPay',
            data: {
                orderId: order.id,
                formId: formId
            }
        }
          if (this.data.credit_price != 0) {
              fetchApi(this, paramWx).then(resN => {
                  let data = resN.data;
                  wx.requestPayment({
                      'timeStamp': data.data.timeStamp,
                      'nonceStr': data.data.nonceStr,
                      'package': data.data.package,
                      'signType': data.data.signType,
                      'paySign': data.data.paySign,
                      'success': res => {
                          fetchApi(this, paramPay).then(resN => {
                              showToast('兑换成功', 'success', 1500);
                              setTimeoutClick = setTimeout(function () {
                                  wx.redirectTo({
                                      url: "/pages/orderDetail/orderDetail?id=" + order.id + "&payOver=1"
                                  })
                              }, 1500)
                          }).catch(err => {
                              showModal({
                                  title: '错误',
                                  content: err.data && err.data.msg ? err.data.msg : '兑换错误',
                              }).then(res => {
                                  wx.redirectTo({
                                      url: "/pages/orderDetail/orderDetail?id=" + order.id
                                  })
                              })
                          });
                      },
                      'fail': (err => {
                          wx.redirectTo({
                              url: "/pages/orderDetail/orderDetail?id=" + order.id
                          })
                      })
                  })
              }).catch(err => {
                  console.log(err);

                  showModal({
                      title: '错误',
                      content: err.data && err.data.msg ? err.data.msg : '兑换错误',
                  }).then(res => {
                      this.setData({
                          lockNow: false
                      })
                      wx.redirectTo({
                          url: "/pages/orderDetail/orderDetail?id=" + order.id
                      })
                  })
              });
          } else {
              fetchApi(this, paramPay).then(resN => {
                  showToast('兑换成功', 'success', 1500);
                  setTimeoutClick = setTimeout(function () {
                      wx.redirectTo({
                          url: "/pages/orderDetail/orderDetail?id=" + order.id + "&payOver=1"
                      })
                  }, 1500)
              }).catch(err => {
                  console.log(err);
                  showModal({
                      title: '错误',
                      content: err.data && err.data.msg ? err.data.msg : '兑换错误',
                  }).then(res => {
                      this.setData({
                          lockNow: false
                      })
                      wx.redirectTo({
                          url: "/pages/orderDetail/orderDetail?id=" + order.id
                      })
                  })
              });
          }
        
        return;
      } else if (param.data.payType == 3) {
        let paramPay = {
          url: app.API_HOST + 'order/vipCardPay',
          data: {
            orderId: order.id,
            formId: formId
          }
        }
        fetchApi(this, paramPay).then(resN => {
          showToast('支付成功', 'success', 1500);
          let url = "/pages/orderDetail/orderDetail?id=" + order.id + "&payOver=1"
          if (this.data.related_virtual_goods && this.data.related_virtual_goods.id) {
            url = '/pages/course/course?id=' + this.data.related_virtual_goods.id
          }
          setTimeoutClick = setTimeout(function () {
            that.afterPayGoto(order.id,"&payOver=1")
          }, 1500)
        }).catch(err => {
          showModal({
            title: '错误',
            content: err.data && err.data.msg ? err.data.msg : '支付错误'
          }).then(res => {
            that.afterPayGoto(order.id)
          })
        });
        return;
      }

      if (order.price == 0 && this.data.coupon.type == 3 ) {
          let couponPay = {
              url: app.API_HOST + 'order/couponPay',
              data: {
                  orderId: order.id,
                  formId: formId
              }
          }
          fetchApi(this, couponPay).then(resN => {
              showToast('支付成功', 'success', 1500);
             
              that.afterPayGoto(order.id, "&payOver=1")
          }).catch(err => {
              showModal({
                  title: '错误',
                  content: err.data && err.data.msg ? err.data.msg : '支付错误'
              }).then(res => {
                  that.afterPayGoto(order.id)
              })
          });
          return;
      }

      const param1 = {
        url: app.API_HOST + 'order/wxpay',
        data: {
            orderId: order.id,
            formId: formId,
            selectedOrderId: orderId2
        }
      };
      fetchApi(this, param1).then((res) => {
        const that = this
        const payParam = res.data.data;
        wx.requestPayment({
            'timeStamp': payParam.timeStamp,
            'nonceStr': payParam.nonceStr,
            'package': payParam.package,
            'signType': payParam.signType,
            'paySign': payParam.paySign,
            success: function (_res) {
              showToast('支付成功', 'success', 1500);
              let url = "/pages/orderDetail/orderDetail?id=" + order.id + "&payOver=1";
              if (that.data.related_virtual_goods && that.data.related_virtual_goods.id) {
                url = '/pages/course/course?id=' + that.data.related_virtual_goods.id
              }
              let params = {
                url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
                data: {
                  tpl_msg_type: '1,2,3'
                }
              };
              fetchApi(that, params).then(tres => {
                console.log(tres)
                wx.requestSubscribeMessage({
                    tmplIds: tres.data.data,
                    success (sres) { },
                    fail(sres) { },
                    complete(sres) {
                      setTimeoutClick = setTimeout(function () {
                        that.afterPayGoto(order.id,"&payOver=1")
                      }, 1500)
                    }
                })
              }).catch(error => {
                setTimeoutClick = setTimeout(function () {
                  that.afterPayGoto(order.id,"&payOver=1")
                }, 1500)
              })
            },
            fail: function (error) {
                console.log('支付失败', error)
                setTimeoutClick = setTimeout(function () {
                  that.afterPayGoto(order.id)
                }, 1500)
            }
        });
      }).catch((e) => {
        console.log('获取支付信息失败', e)
        setTimeoutClick = setTimeout(function () {
          that.afterPayGoto(order.id)
        }, 1500)
      });
      
    }).catch(err => {
      showModal({
        title: '提示',
        content: err.data && err.data.msg ? err.data.msg : '创建订单失败'
      });

    })
  },
  afterPayGoto(orderId,payover = ''){
    if(typeof(JSON.parse(this.data.options.goodsId)) === "object"){
      wx.redirectTo({
        url: "/pages/orderList/orderList"
      })
    }else{
      wx.redirectTo({
        url: "/pages/orderDetail/orderDetail?id=" + orderId + payover
      })
    }
  },
  createOrder(e) {
    let formId = e.detail.formId,
      formValue = e.detail.value,
      options = this.data.options,
      pickerIndex = parseInt(this.data.pickerIndex),
      pickerIndex2 = parseInt(this.data.pickerIndex2),
      vipInfo = this.data.vipInfo,
      realname = formValue.realname || '',
      deliveryType = this.data.deliveryType,
      mobile = formValue.mobile || '',
      isVirtualGoods = this.data.isVirtualGoods,
      storeId = this.data.storeId;
    if (isVirtualGoods != 1) {
      if (deliveryType == 4) {
        if (!realname) {
          showModal({
            title: '提示',
            content: '取货人不能为空'
          })
          return;
        }
        if (!mobile) {
          showModal({
            title: '提示',
            content: '取货人手机不能为空'
          })
          return;
        }
      }
      if ((deliveryType == 3 && !this.data.userInfo) || (deliveryType == 4 && !storeId)) {
        showModal({
          title: '提示',
          content: '地址不能为空'
        })
        return;
      }
    }
    if (this.data.formDataId) {
      var ruleForm = this.ruleForm();
      if (!ruleForm.dataRight) {
        return;
      }
      this.dataStore.formValue = ruleForm.arry;
    }
    
    let param = {
      url: app.API_HOST + 'order/createOrderNew',
      data: {
        payType: 0,
        bargainId: options.bargainId ? options.bargainId : 0,
        distributorId: options.isBargain == 1 ? 0 : app.globalData.distributorId,
        // 2019-7-2 后id = 0 应该不会在存在
        optionId: options.optionId ? options.optionId : 0,
        total: options.total ? options.total : 0,
        remark: this.data.remark,
        myRemark: this.data.myRemark,
        addressId: (deliveryType == 4 || this.data.isVirtualGoods == 1) ? 0 : this.data.userInfo.id,
        expressName: this.data.express[pickerIndex] ? this.data.express[pickerIndex].name : '',
        expressCode: this.data.express[pickerIndex] ? this.data.express[pickerIndex].code : '',
        expressPrice: this.data.express[pickerIndex] ? this.data.express[pickerIndex].price : '',
        myExpressName: this.data.expressSelected[pickerIndex2] ? this.data.expressSelected[pickerIndex2].name : '',
        myExpressCode: this.data.expressSelected[pickerIndex2] ? this.data.expressSelected[pickerIndex2].code : '',
        myExpressPrice: this.data.expressSelected[pickerIndex2] ? this.data.expressSelected[pickerIndex2].price : '',
        couponId: options.isBargain == 1 ? 0 : 0 - this.data.coupon.couponId,
        channelId: app.globalData.channelId,
        realname: realname,
        mobile: mobile,
        deliveryType: deliveryType,
        storeId: storeId
      }
    }
    console.log(this.data.options.sourceType,'this.data.options.sourceType')
    if (this.data.options.sourceType != 0) {
      param.data.sourceType= this.data.options.sourceType,
      param.data.videoId = this.data.options.videoId || 0,
      param.data.articleId = this.data.options.articleId || 0
    }
    if(typeof(JSON.parse(options.goodsId)) !== "object"){
      param.data.id = options.goodsId
    }else{
      param.data.fromGoodsId = options.goodsId 
    }
    if (options.isPoints == 1) {
      param.data.payType = 4;
      this.pay(param, formId);
    } else if (vipInfo.open_vip == 1 && vipInfo.open_online_pay == 1 && vipInfo.open_vip_card == 1) {
      showActionSheet({
        itemList: ['微信支付', '会员卡余额支付'],
        itemColor: '#ff9300'
      }).then(res => {
        param.data.payType = res.tapIndex == 1 ? 3 : 0;
        if (res.tapIndex == 1) {
          showModal({
            title: '提示',
            content: `您的会员余额为${vipInfo.card_remaining}，确定使用会员支付`,
            showCancel: true
          }).then(() => {
            this.pay(param, formId);
          }).catch(err => {})
        } else {
          this.pay(param, formId);
        }
      }).catch(err => console.log('err: ', err))
    } else {
      this.pay(param, formId);
    }
  },
  createGroupOrder(e) {
    let formId = e.detail.formId,
      formValue = e.detail.value,
      options = this.data.options,
      pickerIndex = parseInt(this.data.pickerIndex),
      pickerIndex2 = parseInt(this.data.pickerIndex2),
      realname = formValue.realname || '',
      deliveryType = this.data.deliveryType,
      mobile = formValue.mobile || '',
      isVirtualGoods = this.data.isVirtualGoods,
      storeId = this.data.storeId;
    let self = this;
    if (isVirtualGoods != 1) {
      if (deliveryType == 4) {
        if (!realname) {
          showModal({
            title: '提示',
            content: '取货人不能为空'
          })
          return;
        }
        if (!mobile) {
          showModal({
            title: '提示',
            content: '取货人手机不能为空'
          })
          return;
        }
      }
      if ((deliveryType == 3 && !this.data.userInfo) || (deliveryType == 4 && !storeId)) {
        showModal({
          title: '提示',
          content: '地址不能为空'
        })
        return;
      }
    }
    if (this.data.formDataId) {
      var ruleForm = this.ruleForm();
      if (!ruleForm.dataRight) {
        return;
      }
      this.dataStore.formValue = ruleForm.arry;
    }
    let param = {
      url: app.API_HOST + 'groupBuy/createOrder',
      data: {
        id: options.goodsId,
        gbid:options.gbid || 0,
        optionId: options.optionId ? options.optionId : '',
        total: options.total,
        remark: this.data.remark,
        myRemark: this.data.myRemark,
        addressId: (deliveryType == 4 || this.data.isVirtualGoods == 1) ? 0 : this.data.userInfo.id,
        expressName: this.data.express[pickerIndex] ? this.data.express[pickerIndex].name : '',
        expressCode: this.data.express[pickerIndex] ? this.data.express[pickerIndex].code : '',
        expressPrice: this.data.express[pickerIndex] ? this.data.express[pickerIndex].price : '',
        myExpressName: this.data.expressSelected[pickerIndex2] ? this.data.expressSelected[pickerIndex2].name : '',
        myExpressCode: this.data.expressSelected[pickerIndex2] ? this.data.expressSelected[pickerIndex2].code : '',
        myExpressPrice: this.data.expressSelected[pickerIndex2] ? this.data.expressSelected[pickerIndex2].price : '',
        channelId: app.globalData.channelId,
        realname: realname,
        mobile: mobile,
        deliveryType : deliveryType,
        distributorId: options.isBargain == 1 ? 0 : app.globalData.distributorId,
        inviter_uid: this.data.options.inviterUid ? this.data.options.inviterUid : 0,
        gbVersion: options.gbVersion ? options.gbVersion : 0,
        storeId: storeId
      }
    }
    if (this.data.options.sourceType != 0) {
      param.data.sourceType= this.data.options.sourceType,
      param.data.videoId = this.data.options.videoId || 0,
      param.data.articleId = this.data.options.articleId || 0
    }
    showLoading({
      title: '正在拼团'
    });
    fetchApi(self, param).then(res => {
      let data = res.data.data;
      if(this.data.formDataId>0){
        pushFormValue(this,data.id);
      }
      let param1 = {
        url: app.API_HOST + 'groupBuy/wxpay',
        data: {
          id: data.id,
          formId: formId
        }
      };
      fetchApi(self, param1).then(res1 => {
        let payParam = res1.data.data;
        this.transferGroupWxPay(self, payParam)
      }).catch(err => {
        showModal({
          title: '提示',
          content: err.data && err.data.msg ? err.data.msg : '支付失败',
        });

      })

    }).catch(error => {
      wx.hideLoading()
      if (error.data.code == -50) {
        showModal({
          title: '提示',
          content: error.data.msg ? error.data.msg : '创建拼团失败',
          confirmText: '返回'
        }).then(res => {
          wx.navigateBack({
            delta: 5
          })
        })
      }
    })

  },

    // 拼团微信支付单独拿出来
    transferGroupWxPay(self, payParam) {
        let isGrounp = self.data.options.isGrounp
        let options = self.data.options;
        wx.requestPayment({
            'timeStamp': payParam.timeStamp,
            'nonceStr': payParam.nonceStr,
            'package': payParam.package,
            'signType': payParam.signType,
            'paySign': payParam.paySign,
            success: (res) => {
                showToast('支付成功', 'success', 1500);
                self.setData({
                    lockNow: false
                })
                let tpl_msg_type = ''
                if (isGrounp == 3) {
                    tpl_msg_type = '5,7,15'
                } else {
                    tpl_msg_type = '3,5,7'
                }
                let params = {
                    url: app.API_HOST + 'templateMsg/getSubscriptionMessageTplIds',
                    data: {
                        tpl_msg_type: tpl_msg_type
                    }
                }
                fetchApi(self, params).then(res => {
                    wx.requestSubscribeMessage({
                        tmplIds: res.data.data,
                        success(res) { },
                        complete(res) {
                            console.log(res, '订阅消息拉起的complete')
                            if (isGrounp == 2) {
                                wx.redirectTo({
                                    url: "/pages/groupFriends/groupFriends?gid=" + options.goodsId
                                })
                            } else if (isGrounp == 3) {
                                wx.redirectTo({
                                    url: "/pages/goodsdetail/goodsdetail?goodsId=" + options.goodsId
                                })
                            } else {
                                wx.redirectTo({
                                    url: "/pages/groupOrderList/groupOrderList"
                                })
                            }
                        }
                    })
                }).catch((e) => {
                    setTimeoutClick = setTimeout(function () {
                        wx.redirectTo({
                            url: "/pages/groupOrderList/groupOrderList"
                        })
                    }, 1500)
                })
            },
            fail: function (error) {
                wx.showModal({
                    title: '提示',
                    content: '您确定要退出本次付款吗？',
                    cancelText: '放弃',
                    confirmText: '继续付款',
                    success(res) {
                        if (res.confirm) {
                            self.transferGroupWxPay(self, payParam)
                        } else if (res.cancel) {
                            wx.redirectTo({
                                url: "/pages/orderList/orderList?status=1"
                            })
                        }
                    }
                })
                self.setData({
                    lockNow: false
                })
            }
        });
    },
  //表单数据绑定 有空合并下
  inputChange(e) {
    var formData = this.data.formData,
      value = e.detail.value,
      id = e.currentTarget.dataset.id;
    for (var i = 0; i < formData.length; i++) {
      if (formData[i].id == id) {
        formData[i].value = value;
        break;
      }
    };
  },
  regionChange(e) {
    var formData = this.data.formData,
      value = e.detail.value.join('-'),
      id = e.currentTarget.dataset.id;
    for (var i = 0; i < formData.length; i++) {
      if (formData[i].id == id) {
        formData[i].value = value;
        break;
      }
    };
    this.setData({
      formData
    })
  },
  dateChange(e) {
    var formData = this.data.formData,
      value = e.detail.value,
      id = e.currentTarget.dataset.id;
    for (var i = 0; i < formData.length; i++) {
      if (formData[i].id == id) {
        formData[i].value = value;
        break;
      }
    };
    this.setData({
      formData
    })
  },
  regionRadioChange(e) {
    var formData = this.data.formData,
      index = parseInt(e.detail.value),
      id = e.currentTarget.dataset.id;
    for (var i = 0; i < formData.length; i++) {
      if (formData[i].id == id) {
        formData[i].value = formData[i].options[index].name;
        break;
      }
    };
    this.setData({
      formData
    })
  },
  radioChange(e) {
    var formData = this.data.formData,
      value = e.detail.value,
      id = e.currentTarget.dataset.id;
    for (var i = 0; i < formData.length; i++) {
      if (formData[i].id == id) {
        formData[i].value = value;
        break;
      }
    };
  },
  checkboxChange(e) {
    var formData = this.data.formData,
      value = e.detail.value.join(','),
      id = e.currentTarget.dataset.id;
    for (var i = 0; i < formData.length; i++) {
      if (formData[i].id == id) {
        formData[i].value = value;
        break;
      }
    };
  },
  ruleForm() {
    var formData = this.data.formData,
      dataRight = true,
      validateType='';
    let regx = /^1[3-9]\d{9}$/;
    let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    var arry = [];
    for (var i = 0; i < formData.length; i++) {
      arry.push({
        title:formData[i].title,
        value:formData[i].value
      })
      if (formData[i].notEmpty && !formData[i].value) {
        dataRight = false;
        showToast(`${formData[i].title}不能为空`, this);
        break;
      }
      if (formData[i].value != '' && formData[i].formType == 'text') {
        validateType = formData[i].validateType

        if (validateType == 'phone') {

          if (!regx.test(formData[i].value)) {
            dataRight = false;
            showToast("手机号格式错误", this);
            break;
          }
        } else if (validateType == 'email') {
          if (!reg.test(formData[i].value)) {
            dataRight = false;
            showToast("邮箱格式错误", this);
            break;
          }
        }
      }
    }

    return {
      dataRight:dataRight,
      arry:arry
    }
  },

    getReduceCoupon() {
        const { coupon: { num, exchange_goods, scope: { type, goodsList, cateList } }, goodsItems } = this.data;
        const couponType = this.data.coupon.type;
        let canReduceMoney = 0;
        let pcategory = cateList && goodsList.map(e => e.pcid)
        let ccategory = cateList && goodsList.map(e => e.ccid)
        let goodsIds = goodsList && goodsList.map(e => e.goodsId)
        console.log(couponType, 'couponType')
        if (couponType == 3) {
            goodsItems.filter(e => (
                exchange_goods[0].goodsId == e.goodsid
            )).forEach(e => {
                console.log(e,'qwer')
                canReduceMoney += e.productprice * 1
            })
            this.setData({ 
                reduceCouponMoney: canReduceMoney
            })
        }else {
            goodsItems.filter(e => (
                (type == 1)
                || (type == 2 && (e.ccate == 0 ? ccategory.includes(e.ccate) : pcategory.includes(e.pcate)))
                || (type == 3 && (goodsIds.includes(e.goodsid)))
            )).forEach(e => {
                canReduceMoney += e.productprice * e.total
            })
            this.setData({
                reduceCouponMoney: Math.max(Math.round((canReduceMoney - Math.max(Math.round((canReduceMoney - num) * 100) / 100, 0.01)) * 100) / 100, 0)
            })
        }
      
    },

  openMask() {
    this.setData({
      showMask: !this.data.showMask
    })
  },
  setAddress() {
    let self = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
      // 20220526 审核规则变化 如需取消定位 设置为0
        let latitude = res.latitude;
        let longitude = res.longitude;
        fetchApi(self, {
          // url: app.API_HOST + 'shopSelfLift/get',
          url: app.API_HOST + 'ShopStore/getBrandStoreList',
          data: {
            lnglat: longitude + ',' + latitude
          }
        }).then(_res => {
          let storeList = _res.data.data.map(item => {
            item.value = false
            item.fullAddress = `${item.address_province} ${item.address_city} ${item.address_area} ${item.address_detail}`
            return item
          })
          storeList.sort((a, b) => {
            return Number(a.distance) - Number(b.distance)
          })
          // 拿到距离最近的一个地点，展示
          storeList[0].value = true
          const item = storeList[0]
          const shopSelfLift = {}
          shopSelfLift.id = item.id
          shopSelfLift.address = item.address_detail
          shopSelfLift.area = `${item.address_province}-${item.address_city}-${item.address_area}`
          shopSelfLift.is_open = ''
          shopSelfLift.remark = ''
          shopSelfLift.distance = item.distance
          shopSelfLift.store_name = item.store_name
          shopSelfLift.fullAddress = shopSelfLift.area.replace('-', ' ') + shopSelfLift.address
          self.setData({
            storeId: shopSelfLift.id,
            storeList,
            shopSelfLift
          })
        }).catch(_err => {})
      },
      fail: function (err) {
        console.log(err)
      }
    })
  }
});
function getInitData(self) {
  showLoading();
  let options = self.data.options;
  let data2 = null
  if(typeof(JSON.parse(options.goodsId)) == "object"){
    data2 = {
      bargainId: options.bargainId ? options.bargainId : 0,
      id: (JSON.parse(options.goodsId).length == self.data.goodsLength) ? 0 : (options.goodsId ? (typeof(JSON.parse(options.goodsId)) === "object" ? JSON.parse(options.goodsId).join() : options.goodsId) : 0),
      optionId: options.optionId ? options.optionId : 0,
      total: options.total ? options.total : 0, 
      is_points: options.isPoints || 0,
      from: (JSON.parse(options.goodsId).length == self.data.goodsLength) ? 0 : 1
    }
  }else{
    data2 = {
      bargainId: options.bargainId ? options.bargainId : 0,
      id: options.goodsId,
      optionId: options.optionId ? options.optionId : 0,
      total: options.total ? options.total : 0,
      is_points: options.isPoints || 0,
    }
  }
  let param = {
    url: app.API_HOST + 'order/confirm',
    data: data2
  };
  fetchApi(self, param).then(res => {
    let dataConfirm = res.data.data,
      userInfo = dataConfirm.address,
      goodsItems = dataConfirm.goodsItems,
      express = dataConfirm.express,
      expressSelected = dataConfirm.expressSelected,
      vipInfo = dataConfirm.vipInfo,
      shopSelfLift = dataConfirm.shopSelfLift,
      groupGoodstotalmoney = 0,
      formData = [],
      formDataId = 0;
    if (shopSelfLift && shopSelfLift.is_open == 1) {
      shopSelfLift.fullAddress = shopSelfLift.area.replace('-', ' ') + shopSelfLift.address;
    }
    self.data.openDay = JSON.parse(dataConfirm.shop.open_day)
    self.data.openTimePeriods = JSON.parse(dataConfirm.shop.open_time_periods)
    //商品求和
    const {pickerIndex, pickerIndex2} = self.data
    const personalGoodsItems = goodsItems.filter(item => item.selected_products_type == 3)
    const platformGoodsItems = goodsItems.filter(item => item.selected_products_type == 1)
    const personalGoodstotalmoney = getSum(personalGoodsItems, 'totalprice')
    const personalGoodsTotal = parseInt(getSum(personalGoodsItems, 'total')) || personalGoodsItems.length
    const platformGoodstotalmoney = getSum(platformGoodsItems, 'totalprice')
    const platformGoodsTotal = parseInt(getSum(platformGoodsItems, 'total')) || platformGoodsItems.length
    const goodstotalmoney = parseFloat(personalGoodstotalmoney) + parseFloat(platformGoodstotalmoney)
    const platformExpressPrice = self.data.deliveryType == 4 ? 0 : parseFloat(express[pickerIndex] ? express[pickerIndex].price : 0)
    const personalExpressPrice = self.data.deliveryType == 4 ? 0 : parseFloat(expressSelected[pickerIndex2] ? expressSelected[pickerIndex2].price : 0)
    const platformTotalMoney = self.data.deliveryType == 4 ? parseFloat(platformGoodstotalmoney) : (parseFloat(platformGoodstotalmoney) + parseFloat(platformExpressPrice))
    const personalTotalMoney = self.data.deliveryType == 4 ? parseFloat(personalGoodstotalmoney) : (parseFloat(personalGoodstotalmoney) + parseFloat(personalExpressPrice))
    if (options.isGrounp !=0 ) groupGoodstotalmoney = parseFloat(goodsItems[0].groupbuy_price) * parseInt(goodsItems[0].total)
    // 求和总计
    self.setData({
      totalMoney: platformTotalMoney + personalTotalMoney,
      platformTotalMoney,
      personalTotalMoney,
      personalGoodsTotal,
      platformGoodsTotal
    })
   
    //一般商品请求优惠券
    if (app.globalData.coupon === null && options.isGrounp == 0 && options.isBargain != 1 && options.isPoints != 1) {
      app.globalData.goodsList = goodsItems.map((item, index, input) => {
        let goods = {};
        goods.id = item.goodsid;
        goods.total = item.total;
        goods.optionId = item.optionid || 0;
        return goods;
      });
      getCouponData(self, self.data.totalMoney);
    }
    // 数据处理添加地址完整
    if (userInfo && userInfo.id) {
      userInfo.fulladdress = userInfo.province + ' ' + userInfo.city + ' ' + userInfo.area + ' ' + userInfo.address;
    }
    // 添加选择快递显示数据
    let showErr = false;
    for (var i = 0; i < express.length; i++) {
      express[i].show = express[i].name + express[i].price + '元';
      if (express[i].code == '_notAllowed') {
        showErr = true;
      }
    };
    for (var i = 0; i < expressSelected.length; i++) {
      expressSelected[i].show = expressSelected[i].name + expressSelected[i].price + '元';
      if (expressSelected[i].code == '_notAllowed') {
        showErr = true;
      }
    };
    if (showErr) {
      showModal({
        title: '提示',
        content: '您所在的区域不支持任何快递'
      })
    }
    if (dataConfirm.formConfig) {
      formData = JSON.parse(dataConfirm.formConfig.config);
      formDataId = dataConfirm.formConfig.id;
    }

    // delivery_express_status   门店物流配送开启的状态
    // delivery_express_type   门店物流配送的类型值
    // delivery_self_mention_status        自提门店开启的状态
    // delivery_self_mention_type        自提门店的类型
    // default_delivery_type        默认的类型
    // open_brand_store        是否开启了门店
    const { 
      delivery_express_status,
      delivery_express_type,
      delivery_self_mention_status,
      delivery_self_mention_type,
      default_delivery_type,
      open_brand_store
    } = dataConfirm

    const tabBarList = []
    let deliveryType = 3
    if (delivery_express_status == '1') {
      tabBarList.push({ type: 3, name: '物流配送', order: 1 })
    } 
    if (delivery_self_mention_status == '1' && open_brand_store == '1') {
      tabBarList.push({ type: 4, name: '到店自提', order: 2 })
      self.setAddress()
    }

    // a - b 升序
    if (default_delivery_type == delivery_express_type) {
      deliveryType = 3
      tabBarList.sort((a, b) => {
        return a.order - b.order
      })
    } else if (default_delivery_type == delivery_self_mention_type && open_brand_store == '1') {
      deliveryType = 4
      tabBarList.sort((a, b) => {
        return b.order - a.order
      })
    }

    self.setData({
      formData: formData,
      formDataId: formDataId,
      userInfo: userInfo,
      goodsItems: goodsItems,
      // 选出个人商品
      personalGoodsItems,
      // 选出平台商品
      platformGoodsItems,
      express: express,
      expressSelected: expressSelected,
      goodstotalmoney: goodstotalmoney,
      groupGoodstotalmoney: groupGoodstotalmoney,
      platformGoodstotalmoney: platformGoodstotalmoney,
      personalGoodstotalmoney: personalGoodstotalmoney,
      vipInfo: vipInfo,
      // shopSelfLift: shopSelfLift,
      showStyle: 1,
      credit: goodsItems[0].consume_integral || 0,
      credit_price: goodsItems[0].consume_price || 0,
      isVirtualGoods: dataConfirm.is_virtual_goods || 0,
      related_virtual_goods: dataConfirm.related_virtual_goods || '',
      tabBarList,
      deliveryType
    });
  }).catch(err => {
    console.log('error', err)
    err.data.code != -101 && self.setData({
      showStyle: 3
    })
    if (err.data && err.data.msg) {
      showModal({
        title: '提示',
        content: err.data.msg
      }).then(_ => {
          err.data.code == -101 && wx.navigateBack()
      })
    }
  })
};
function getInitGoodsLength(self) {
  let param = {
    url: app.API_HOST + 'cart/get',
    data: {}
  };
  fetchApi(self, param).then(res => {
    let data = res.data.data
    self.setData({
      goodsLength: data.length
    });
    getInitData(self);
  }).catch(err => {
    console.log('error :', err)
    self.setData({
      showStyle: 3
    })
  })
}
// 返回的数据 status 获取优惠券的状态   0  可用  1 已经被使用了  2  已经过期了   3 未到使用金额
function getCouponData(self, orderMoney = 0) {
  let param = {
    url: app.API_HOST + 'coupon/orderCoupons',
    data: {
      goodsInfo: JSON.stringify(app.globalData.goodsList),
      orderMoney: orderMoney,
      filterType: '0',
    }
  };
  fetchApi(self, param, 'POST').then(res => {
    let couponList = res.data.data;
    if (couponList.length > 0) {
        self.setData({
            coupon: {
                type: couponList[0].type,
                exchange_goods: couponList[0].couponInfo.exchange_goods,
                scope: couponList[0].couponInfo.scope,
                num: couponList[0].cutdown,
                des: couponList[0].type == 3 ? '抵扣券【' + couponList[0].couponInfo.exchange_goods[0].goodsName + '】' : couponList[0].cutdown + '元',
                couponId: couponList[0].id,
                statue: 'have' //none,无优惠券可用，have 有优惠券二用
            }
        });
        self.getReduceCoupon()
    }
  }).catch((e) => {
    console.log(e)
  });
}
function pushFormValue(self,orderId){
    var param = {
      url:app.API_HOST+'form/submitFormGoods',
      data:{
        formId:self.data.formDataId,
        value:JSON.stringify(self.dataStore.formValue),
        orderId:orderId
      }
    }
    fetchApi(self, param, 'post').then(res=>{}).catch(err=>{})
}