
const app = getApp()

import {
  showModal,
  getHomePage,
  nav,
  showTips,
  showToast
} from '../../utils/util'

const staticRecord = {
    height: 102.5, // 决定了每个单元的绝对高度
    numberLength: 3,
}

import {
    fetchApi, checkAvatar, getGlobalConfig, checkUserInfo, getUserInfo, getUserProfile
} from '../../api/api.js'

Page({

    data: {
      image:"",
      showCover: false,
      resultVisible: false,
      isShow: false,
      activity: {
          title: '',
          activityId: '',
          description: '',
          winner: [],
          lottery_list_type: 0,
      },
      image: '',
      buttonInfo: '开始抽奖',
      record: {
          push: false,
      },
      machine: {
          transY1: 0,
          transY2: 0,
          transY3: 0,
      },
      fixOffset: 33,
      lockNow: false,
      lotteryLoading: false,
      pageIndex: 1,
      pageSize: 10,
      lotteryWinner: [],
      description_item: [],
      total: 1,
      frequency: 2, //能请求的次数
      showLottery: false,
       userProfileAble: app.globalData.userProfileAble
    },

    dataStore: {
        id: 0 ,
        options: ''
    },

    onShow() {
      
    },
    onPullDownRefresh() {
        this.onLoad(this.dataStore.options)
    },
    onShareAppMessage: function () {
        return {
            title: this.data.activity.title || '刮刮乐',
            path: `/pages/marketSlotMachine/marketSlotMachine?id=${this.dataStore.id}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}&cardId=${app.globalData.cardId }`,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },


    result: {
        result_type: 0,
        result: null,
        coupon_id: 0,
    },

    slotMachine: {
        record: {
            start: false,
            height: staticRecord.height,
            len: 10,
            num1: 9,
            num2: 9,
            num3: 9,
            transY1: 0,
            transY2: 0,
            transY3: 0,
            speed: 24,
        },
        controller: {

        },
        timer: null,
    },

    onUnload() {
        app.pageData.removePage("marketSlotMachine");
        this.slotMachine.timer && clearTimeout(this.slotMachine.timer)
    },

    onLoad(options) {
        app.pageData.setPage(this, "marketSlotMachine");
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
        const { cardId } = app.globalData
        fetchApi(this, {
            url: app.API_HOST + 'activity/get',
            data: {
                activityId: this.dataStore.id,
                cardId: cardId
            }
        }).then(resN => {
            var res = resN.data.data
            let gatther = res
            wx.setNavigationBarTitle({
                title: gatther.title || '营销活动'
            })

            gatther.winner = res.lottery_list.map((i) => {
                return {
                    name: i.name,
                    item: i.item,
                    time: i.time
                }
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
        }).catch(err => console.log('err', err))

        this.slotMachine.controller.start = function (endNums = []) {
            let record = self.slotMachine.record
            if (record.start) {
                let totalHeight = record.height * record.len
                let circleCount = Math.floor(Math.random() * 2 + 2)
                let endDis = {
                    d1: (endNums.length ? endNums[0] : record.num1) * record.height,
                    d2: (endNums.length ? endNums[1] : record.num2) * record.height,
                    d3: (endNums.length ? endNums[2] : record.num3) * record.height,
                }
                let countCirculation = {
                    i1: 1,
                    i2: 1,
                    i3: 1
                }

                function step(rkey, ckey, speed) {
                    record[rkey] -= speed
                    if (Math.abs(record[rkey]) > totalHeight) {
                        record[rkey] = record[rkey] + totalHeight
                        countCirculation[ckey]++
                    }
                }
                let count = 1
                let timer = setInterval(() => {

                    // count & clear interval
                    count++
                    if (count % 30 == 0) {
                        if (record.transY1 == -endDis.d1 && record.transY2 == -endDis.d2 && record.transY3 == -endDis.d3) {
                            self.setData({
                                buttonInfo: self.result.result
                            })
                            clearInterval(timer)
                            // modal
                            let resultTitle = self.result.result_type == '0' ? '很遗憾' : '恭喜您中奖了',
                                resultText = self.result.coupon_id=='0' ? '请联系商家领取奖品' : '请到我的优惠券页面进行查看'
                            self.setData({
                              result_prize: self.result.result,
                              result_coupon: self.result.coupon_id,
                              valide_time: self.result.valide_time
                            })
                            self.slotMachine.timer = setTimeout(() => {

                                if(self.result.result_type == 0){
                                  showModal({
                                    title: resultTitle,
                                    content: self.result.result_type == '0' ? '未中奖，请继续努力吧' : `您获得了${self.result.result}，${resultText}`,
                                    showCancel: false,
                                    complete: (res) => {
                                      if (resultTitle == '恭喜您中奖了') {
                                        self.setData({
                                          lockNow: false,
                                          lotteryLoading: false,
                                          pageIndex: 1,
                                          pageSize: 10,
                                          lotteryWinner: [],
                                          total: 1,
                                          frequency: 2 //能请求的次数
                                        })
                                        self.onLoad(options)
                                      }
                                    }
                                  })

                                }else {
                                  self.setData({
                                    resultVisible: true
                                  })
                                }
                                self.slotMachine.record.start = false
                                self.setData({
                                    buttonInfo: '开始抽奖'
                                })
                                
                            }, 1000)
                        }
                    }

                    let slowSpeed = (record.speed / 2)
                    if (countCirculation.i1 <= circleCount) {
                        step('transY1', 'i1', record.speed)
                    } else if (countCirculation.i1 < circleCount + 2) {
                        step('transY1', 'i1', slowSpeed)
                    } else {
                        if (record.transY1 == endDis.d1) return
                        let dropSpeed = (endDis.d1 + record.transY1) / slowSpeed
                        dropSpeed = dropSpeed > slowSpeed ? slowSpeed : dropSpeed < 2 ? 2 : dropSpeed
                        record.transY1 -= dropSpeed
                        record.transY1 = Math.abs(record.transY1) > endDis.d1 ? record.transY1 = -endDis.d1 : record.transY1
                    }

                    let timer2 = setTimeout(() => {
                        let slowSpeed = (record.speed / 3)
                        if (countCirculation.i2 <= circleCount) {
                            step('transY2', 'i2', record.speed)
                        } else if (countCirculation.i2 < circleCount + 2) {
                            step('transY2', 'i2', slowSpeed)
                        } else {
                            if (record.transY2 == endDis.d2) return
                            let dropSpeed = (endDis.d2 + record.transY2) / slowSpeed
                            dropSpeed = dropSpeed > slowSpeed ? slowSpeed : dropSpeed < 2 ? 2 : dropSpeed
                            record.transY2 -= dropSpeed
                            record.transY2 = Math.abs(record.transY2) > endDis.d2 ? record.transY2 = -endDis.d2 : record.transY2
                        }
                    }, 1000 / 4)

                    let timer3 = setTimeout(() => {
                        let slowSpeed = (record.speed / 4)
                        if (countCirculation.i3 <= circleCount) {
                            step('transY3', 'i3', record.speed)
                        } else if (countCirculation.i3 < circleCount + 3) {
                            step('transY3', 'i3', slowSpeed)
                        } else {
                            if (record.transY3 == endDis.d3) return
                            let dropSpeed = (endDis.d3 + record.transY3) / slowSpeed
                            dropSpeed = dropSpeed > slowSpeed ? slowSpeed : dropSpeed < 2 ? 2 : dropSpeed
                            record.transY3 -= dropSpeed
                            record.transY3 = Math.abs(record.transY3) > endDis.d3 ? record.transY3 = -endDis.d3 : record.transY3
                        }
                    }, 1000 / 3)

                    self.setData({
                        machine: {
                            transY1: record.transY1,
                            transY2: record.transY2,
                            transY3: record.transY3
                        }
                    })
                }, 1000 / 60)
            }
        }
    },
    onReachBottom() {
      if (this.data.activity.lottery_list_type == 0) {
        this.addList();
      } else {
        return
      }
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

    closeResult(){
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
      // this.setData({
      //   resultVisible: false
      // })
    },
    addList() {
      if (this.data.pageIndex > this.data.frequency) {
        return
      }
      if (this.data.activity.lottery_list_type == 0) {
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
        var frequency = Math.ceil(res.data.data.total / this.data.pageSize)
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
    onReady() {

    },
    getUseAuthorize(e) {
      console.log(e,'q12312')
      const { userInfo } = e.detail
      if (userInfo) {
        getUserInfo(this, userInfo).then(e => {
          console.log(userInfo, 'userInfo')
          this.setData({
            authorize: true
          })
          this.startMachine()
        })
      } else {
        this.setData({
          authorize: false
        })
        showTips('授权失败') 
      }
    },

    getUserProfile(e) {
        getUserProfile().then(res => {
            this.setData({
                authorize: true
            })
            this.startMachine()
        }).catch(err => {
            this.setData({
                authorize: false
            })
            showTips('授权失败')
        })
    },


    startMachine() {
      if (!this.data.activity.is_participate) { //针对积分不足进行权限控制
        showTips('积分不足，无法参与活动',this)
        return;
      } else if (this.data.activity.pay_type == 1) {  //需要消耗积分则弹积分弹框
        this.setData({
            showLottery: true
        })
        return;
      }
      this.takePartIn()
    },
    takePartIn(){
      if(!this.slotMachine.record.start) {
        this.slotMachine.record.start = true
        this.setData({
          buttonInfo: '正在抽奖',
          'record.push': true,
        })
        fetchApi(this, {
          url: app.API_HOST + 'activity/takePartIn',
          data: {
            activityId: this.dataStore.id
          }
        }).then((res) => {
          var res = res.data.data
          this.result = res
          this.result.result_type = res.result_type
          this.result.result = res.result
          this.result.coupon_id = res.coupon_id
          this.result.valide_time = res.valide_time 
          if (res.result_type == 1) {
            let initNumbers = new Array(staticRecord.numberLength).fill(Math.floor(Math.random() * 9) + 1)
            this.slotMachine.controller.start(initNumbers)
          } else {
            let initNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort((a, b) => {
              if (.5 - Math.random() > 0) {
                return a - b
              } else {
                return b - a
              }
            }).splice(0, staticRecord.numberLength)
            this.slotMachine.controller.start(initNumbers)
          }
          this.setData({
            'activity.activity_times_left': --this.data.activity.activity_times_left
          })
          this.data.activity.transmit_condition == 1 && this.takePartSucEvent()
        }).catch((err) => {
          showModal({
            content: err.data ? err.data.msg : ''
          })
        })
      }
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
      this.setData({
        image: this.data.activity.posterUrl,
        showCover: true,
        isShow:false
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
