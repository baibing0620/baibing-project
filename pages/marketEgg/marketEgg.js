const app = getApp()

import {
    fetchApi, checkAvatar, getGlobalConfig, getUserInfo, getUserProfile
} from '../../api/api.js'
import {
  showModal,
  getHomePage,
  nav,
  showToast,
  showTips
} from '../../utils/util'

Page({

  data: {
    isShow: false,
    activity: {
      title: '',
      activityId: '',
      description: '',
      winner: [],
      lottery_list_type: 2
    },
    eggAnimationIndex: -1,
    eggAwardIndex: -1,
    lotteryLoading: false,
    pageIndex: 1,
    pageSize: 10,
    lotteryWinner: [],
    total: 1,
    frequency: 2, //能请求的次数
    showLottery: false,
    description_item: [],
    userProfileAble: app.globalData.userProfileAble
  },

  egg: {
    record: {
      start: false,
    },
    timer: null
  },

  onUnload() {
    app.pageData.removePage("marketEgg");
    this.egg.timer && clearTimeout(this.egg.timer)
  },
  dataStore: {
    id: 0,
    options: ''
  },
  onShareAppMessage: function () {
    return {
      title: this.data.activity.title || '刮刮乐',
      path: `/pages/marketEgg/marketEgg?id=${this.dataStore.id}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}&cardId=${app.globalData.cardId}`
    }
  },

  onLoad(options) {
    this.dataStore.options = options

    if (options.beid) {
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
      var res = resN.data.data;
      var gatther = res;
      wx.setNavigationBarTitle({
        title: gatther.title || '营销活动'
      })

      gatther.winner = res.lottery_list.map((i) => {
        return {
          name: i.name,
          item: i.item,
          time: i.time
        }
      });
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
      });
      this.addList()
      this.data.activity.transmit_condition == 0 && this.takePartSucEvent()
    }).catch(err => console.log('err', err))
    app.pageData.setPage(this, "marketEgg");
  },
  onShow() {

  },
  onReady() {

  },
  onReachBottom() {
    console.log(123)
    if (this.data.activity.lottery_list_type == 0) {
      this.addList();
    } 
  },
  onPullDownRefresh(){
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
    // this.setData({
    //   resultVisible: false
    // })
  },
  getUseAuthorize(e) {
    console.log(e, 'q12312')
    const eggIndex = e.currentTarget.dataset.eggIndex
    console.log('****************************eggIndex',eggIndex)
    const { userInfo } = e.detail
    if (userInfo) {
      getUserInfo(this, userInfo).then(e => {
        console.log(userInfo, 'userInfo')
        this.setData({
          authorize: true
        })
        const { userInfo } = app.globalData
        this.dataStore.eggIndex = eggIndex
        if (userInfo && userInfo.avatar && checkAvatar(userInfo.avatar)) {
          if (!this.data.activity.is_participate) { //针对积分不足进行权限控制
            showTips('积分不足，无法参与活动', this)
            return;
          } else if (this.data.activity.pay_type == 1) {  //需要消耗积分则弹积分弹框
            this.setData({
              showLottery: true
            })
            return;
          }
          if (!this.egg.record.start) {
            this.takePartIn()

          }
        }
      })
    } else {
      this.setData({
        authorize: false
      })
      showTips('授权失败')
    }
  },

    getUserProfile(e) {    //新版本兼容

        getUserProfile().then(res => {
            const eggIndex = e.currentTarget.dataset.eggIndex
            console.log('****************************res', res)
            console.log('****************************eggIndex', eggIndex)
            this.setData({
                authorize: true
            })
            const { userInfo } = app.globalData
            this.dataStore.eggIndex = eggIndex
            if (userInfo && userInfo.avatar && checkAvatar(userInfo.avatar)) {
                if (!this.data.activity.is_participate) { //针对积分不足进行权限控制
                    showTips('积分不足，无法参与活动', this)
                    return;
                } else if (this.data.activity.pay_type == 1) {  //需要消耗积分则弹积分弹框
                    this.setData({
                        showLottery: true
                    })
                    return;
                }
                if (!this.egg.record.start) {
                    this.takePartIn()

                }
            }
        }).catch(err => {
            this.setData({
                authorize: false
            })
            showTips('授权失败')
        })
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
  touchEgg(e) {
    const { userInfo } = app.globalData
    this.dataStore.eggIndex = e.currentTarget.dataset.eggIndex
    if (userInfo && userInfo.avatar && checkAvatar(userInfo.avatar)) {
      if (!this.data.activity.is_participate) { //针对积分不足进行权限控制
        showTips('积分不足，无法参与活动',this)
        return;
      } else if (this.data.activity.pay_type == 1) {  //需要消耗积分则弹积分弹框
        this.setData({
          showLottery: true
        })
        return;
      }
      if (!this.egg.record.start) {
        this.takePartIn()

      }
    }
  },
  takePartIn() {
    fetchApi(this, {
      url: app.API_HOST + 'activity/takePartIn',
      data: {
        activityId: this.dataStore.id
      }
    }).then((res) => {
      var res = res.data.data
      this.egg.record.start = true
      // animation
      if ([0, 1, 2].indexOf(parseInt(this.dataStore.eggIndex)) >= 0) {
        this.setData({
          eggAnimationIndex: this.dataStore.eggIndex
        })
        if (res.result_type == 1) {
          this.setData({
            eggAwardIndex: this.dataStore.eggIndex
          })
        }
      }
      this.setData({
        result_prize: res.result,
        result_coupon: res.coupon_id,
        valide_time: res.valide_time,
        'activity.activity_times_left': --this.data.activity.activity_times_left
      })
      let resultTitle = res.result_type == '0' ? '很遗憾' : '恭喜您中奖了',

        resultText = res.coupon_id == 0 ? `您获得了${res.result},请联系商家领取奖品` : `您获得了${res.result},请到我的优惠券页面进行查看`;

      this.egg.timer = setTimeout(() => {

        if (res.result_type == 0) {
          showModal({
            title: resultTitle,
            content: res.result_type == 0 ? '未中奖，请继续努力吧' : resultText,
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
              }
            }
          })

        } else {
          this.setData({
            resultVisible: true
          })
        }


        this.egg.record.start = false
        this.setData({
          eggAnimationIndex: -1,
          eggAwardIndex: -1
        })

      }, 1200)
      this.data.activity.transmit_condition == 1 && this.takePartSucEvent()
    }).catch((err) => {
      console.log(err, 'err')
      showModal({
        content: err.data ? err.data.msg : '错误'
      })
    })
  },
  toSharing() {
    this.setData({
      isShow: !this.data.isShow
    })
  },

  close() {
    this.setData({
      isShow: false
    })
  },

  previewQRCode() {
    this.setData({
      showCover: true,
      isShow: false
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
