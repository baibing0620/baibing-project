const app = getApp()

import { fetchApi, checkAvatar, getGlobalConfig,  getUserInfo } from '../../api/api.js'
import {
  showModal, getHomePage, showToast, showTips,
  nav } from '../../utils/util'

Page({

    data: {
      isShow: false,
        activity: {
            title: '',
            activityId: '',
            description: '',
            winner: []
        },
        shake: {
            animation: false,
            resultMessage: '',
        },
        lockNow: false,
        lotteryLoading: false,
        pageIndex: 1,
        pageSize: 10,
        lotteryWinner: [],
        description_item: [],
        total: 1,
        frequency: 2, //能请求的次数
        showLottery: false
    },
    dataStore: {
      id: 0,
      options: ''
    },
    onShareAppMessage: function () {
      return {
        title: this.data.activity.title || '刮刮乐',
        path: `/pages/marketShake/marketShake?id=${this.dataStore.id}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}&cardId=${app.globalData.cardId }`,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }

    },
    onShow() {
      
    },
    shake: {
        audio: null,
        record: {
            shakeThreshold: 50,
            start: true,
            lastX: 0,
            lastY: 0,
            lastZ: 0,
            lastUpdate: 0,
            accumulateTime: 0,
        },
        controller: {

        },
        timer: null,
    },

    onUnload () {
        app.pageData.removePage("marketShake");
        wx.offAccelerometerChange()
        this.shake.timer && clearTimeout(this.shake.timer)
    },

    onLoad (options) {
        app.pageData.setPage(this, "marketShake");
        this.dataStore.options = options
        if(options.beid){
            app.globalData.beid = options.beid;
        }
        if (options.fromUser) {
          app.globalData.fromUser = options.fromUser || 0;
          this.setData({
            fromShare: true,
            transfer_user: options.fromUser
          });
        }
        if (options.cardId) {
          app.globalData.cardId = parseInt(options.cardId || 0);
        }
        this.dataStore.id = options.id || app.activityId;
        let self = this;
        fetchApi(this, {
            url: app.API_HOST + 'activity/get',
            data: {
                activityId: this.dataStore.id,
            }
        }).then(resN => {
            var res = resN.data.data
            let gatther = res
            wx.setNavigationBarTitle({
                title: gatther.title || '营销活动'
            })

            gatther.winner = res.lottery_list.map((i) => {
                return {name: i.name, item: i.item, time: i.time}
            })
            gatther.lottery_list = []
            let description_item = gatther.description_item ? JSON.parse(gatther.description_item) : [];
              if (description_item.length == 0) {
                if (gatther.description) {
                  description_item.push({
                    type: 'text',
                    content: gatther.description
                  });
                }
            }
            this.setData({
              description_item: description_item,
              activity: {
                  ...gatther
              }
            })
            this.addList();
            this.data.activity.transmit_condition == 0 && this.takePartSucEvent()
        }).catch(err => console.log('err',err))

        // init shake update function
        this.shake.controller.update = function () {
            self.setData({
                'shake.animation': true
            })
            setTimeout(() => {
                self.shake.record.accumulateTime --
                if (!self.shake.record.accumulateTime) {
                    self.setData({
                        'shake.animation': false
                    })
                }
            }, 2000)
        }

        // init shake initial function
        this.shake.audio = wx.createInnerAudioContext()
        this.shake.audio.src = 'https://v.takecloud.cn/video/audio/url/uid/6/aid/d458Ww%2BcR2RjAiXhOas9NYDmn4eQihiexhT0CHBE8uBO'
        this.shake.controller.init = function () {
            let record = self.shake.record
            wx.onAccelerometerChange((res) => {
                let curTime = new Date().getTime(),
                    timeInterval = curTime - record.lastUpdate
                if (timeInterval > 100) {
                    let curX = res.x,
                        curY = res.y,
                        curZ = res.z
                    let speed = Math.abs(curX + curY + curZ - record.lastX - record.lastY - record.lastZ) / timeInterval * 10000
                    if (speed > record.shakeThreshold && record.start) {
                      const { userInfo } = app.globalData
                      if (userInfo && userInfo.avatar && checkAvatar(userInfo.avatar)) {

                        if (!self.data.activity.is_participate) { //针对积分不足进行权限控制
                            showTips('积分不足，无法参与活动',self)
                            return;
                        } else if (self.data.activity.pay_type == 1) {  //需要消耗积分则弹积分弹框
                            
                            self.setData({
                                showLottery: true
                            })
                            return;
                        }
                        self.takePartIn()
                      }else {
                        self.setData({
                          showGetUserInfo: true,
                          shopImg: app.globalData.shopImg
                        })
                        return
                      }

                    }
                    record.lastUpdate = curTime
                    record.lastX = curX
                    record.lastY = curY
                    record.lastZ = curZ
                }
            })
        }
       
    },
    getUserInfo(e) {
      const { userInfo } = e.detail
      if (userInfo) {
        getUserInfo(this, userInfo).then(e => {
          console.log('授权成功')
          this.setData({
            showGetUserInfo: false,
          })
        })
      } else {
        this.setData({
          showGetUserInfo: false,
        })
        showTips('授权失败')
      }
     
    },
    noLogin() {
      this.setData({
        showGetUserInfo: false
      })
    },

    takePartIn(){
        let record = this.shake.record
        fetchApi(this, {
            url: app.API_HOST + 'activity/takePartIn',
            data: {
                activityId: this.dataStore.id
            }
            }).then((res) => {
                this.shake.audio.play()
                record.start = false
                this.shake.controller.update()
                record.accumulateTime++
                var res = res.data.data
                // modal

                this.setData({
                    result_prize: res.result,
                    result_coupon: res.coupon_id,
                    valide_time: res.valide_time,
                    'activity.activity_times_left': --this.data.activity.activity_times_left
                })
                let resultTitle = res.result_type == '0' ? '很遗憾' : '恭喜您中奖了',
                    resultText = res.coupon_id == '0' ? '请联系商家领取奖品' : '请到我的优惠券页面进行查看';
                this.shake.timer = setTimeout(() => {
                    if (res.result_type == '0') {
                        showModal({
                            title: resultTitle,
                            content: res.result_type == '0' ? '未中奖，请继续努力吧' : `您获得了${res.result},${resultText}`,
                            showCancel: false,
                            complete: (res) => {
                                if (resultTitle == '恭喜您中奖了') {
                                    this.setData({
                                        lockNow: false,
                                        lotteryLoading: false,
                                        pageIndex: 1,
                                        pageSize: 10,
                                        lotteryWinner: [],
                                        total: 1,
                                        frequency: 2 //能请求的次数
                                    })
                                    this.onLoad(options)
                                }
                            }
                        })
                    } else {
                        this.setData({
                            resultVisible: true
                        })
                    }
                    this.shake.record.start = true
                }, 2100)
                this.data.activity.transmit_condition == 1 && this.takePartSucEvent()
            }).catch((err) => {
                console.log(err,'=err')
                showModal({
                    content: err.data ? err.data.msg : ''
                })
            })
    },
    onReachBottom() {
      this.addList();
    },
    onPullDownRefresh() {
        this.onLoad(this.dataStore.options)
    },

    takePartSucEvent() {
      const { activity: { id: activity_id }, transfer_user } = this.data
      if (!transfer_user || transfer_user == app.globalData.uid) return
      fetchApi(this, {
        url: 'activity/takePartSucEvent',
        data: {
          activity_id,
          transfer_user
        }
      }).then(_ => _)
    },

    closeResult() {
      this.setData({
        resultVisible: false,
        lockNow: false,
        lotteryLoading: false,
        pageIndex: 1,
        pageSize: 10,
        lotteryWinner: [],
        total: 1,
        frequency: 2 //能请求的次数
      })
      this.onLoad(this.dataStore.options)
    },
    addList() {
      if (this.data.pageIndex > this.data.frequency) {
        return
      }
      if (this.data.lottery_list_type == 0) {
        this.setData({
          lotteryLoading: true
        })
      }
      fetchApi(this, {
        url: app.API_HOST + 'activity/getLotteryList',
        data: {
          activityId: this.dataStore.id,
          pageSize: this.data.pageSize,
          pageIndex: this.data.pageIndex
        }
      }).then(res => {
        var data = res.data.data.data;
        var total = res.data.data.total;
        var frequency = Math.ceil(res.data.data.total / this.data.pageSize) == 0 ? 1 : Math.ceil(res.data.data.total / this.data.pageSize)
        var newPageIndex = this.data.pageIndex;
        var concatArr;
        if (data.length < this.data.pageSize) {
          concatArr = this.data.lotteryWinner.concat(data);
          concatArr = concatArr.concat(this.data.activity.winner)
          newPageIndex++
        } else {
          concatArr = this.data.lotteryWinner.concat(data)
          newPageIndex++
        }
        this.setData({
          lotteryWinner: concatArr,
          pageIndex: newPageIndex,
          frequency: frequency,
          lotteryLoading: false
        })
      })
    },
    onReady () {
        this.shake.controller.init()
    },
    
  toSharing(){
    this.setData({
      isShow:!this.data.isShow
    })
  },

  close(){
    this.setData({
      isShow: false
    })
  },

  previewQRCode(){
    this.getImageInfo(this.data.activity.posterUrl)
    this.setData({
      showCover: true,
      isShow:false
    })
  },

  getImageInfo(QRcode) {
    wx.getImageInfo({
      src: QRcode,
      success: (res) => {
        this.setData({
          image: res.path
        })
      }, fail: (err) => {
        this.getImageInfo(QRcode)
      }
    })
  },

  navHomePage() {
    nav({
      url: getHomePage()
    })
  },

  coverHide() {
    this.setData({
      showCover: false
    })
  },
  closeActivity() {
    this.setData({
      showLottery: false
    })
  },
  instantLotteryActivity() {
    this.takePartIn()
    this.closeActivity()
  }

})
