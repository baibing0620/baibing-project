const app = getApp()

import { fetchApi, checkAvatar, getGlobalConfig, getUserInfo, getUserProfile } from '../../api/api.js'
import {
  cropImgWH, showModal, getHomePage, nav, showToast, showTips
} from '../../utils/util'

Page({

    data: {
        isShow: false,
        activity: {
            title: '',
            activityId: '',
            description: '',
            items: [],
            winner: [],
            lottery_list_type: 2
        },
        description_item: [],
        wheel: {
            singleAngle: 0,
            mode: 0,
            deg: 0,
            
        },
        lotteryLoading: false,
        pageIndex: 1,
        pageSize: 10,
        lotteryWinner: [],
        lotteryWinner1:[
          {name:'多喝热水',item:'打老虎',time:'2018-1-10'},
          {name:'多喝热水',item:'打老虎',time:'2018-1-10'},
          {name:'多喝热水',item:'打老虎',time:'2018-1-10'},
          {name:'多喝热水',item:'打老虎',time:'2018-1-10'},
          {name:'多喝热水',item:'打老虎',time:'2018-1-10'},
        ],
        total: 1,
        frequency: 2, //能请求的次数
        showLottery:false,
        userProfileAble: app.globalData.userProfileAble
    },
    dataStore: {
      id: 0,
      options: ''
    },
    onShareAppMessage: function () {
      return {
        title: this.data.activity.title || '刮刮乐',
        path: `/pages/marketWheel/marketWheel?id=${this.dataStore.id}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}&cardId=${app.globalData.cardId }`, 
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    },
    wheel: {
        record: {
            start: false,
            areaNumber: 8,
            awardNumber: 0,
            singleAngle: 0,
            speed: 16,
            mode: 2,
        },
        result: {
            result: '',
            result_type: 0,
            coupon_id: 0,
        },
        controller: {

        },
        timer: null,
    },
    onShow() {
      
    },
    onUnload () {
        app.pageData.removePage("marketWheel");
        this.wheel.timer && clearTimeout(this.wheel.timer)
    },

    onLoad (options) {
      app.pageData.setPage(this, "marketWheel");
      this.dataStore.options = options
      console.log('options',options)
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
        fetchApi(this, {
            url: app.API_HOST + 'activity/get',
            data: {
                activityId: this.dataStore.id,
            }
        }).then(resN => {
            var res = resN.data.data
            let gather = res
            console.log('gathergather',gather)
            wx.setNavigationBarTitle({
                title: gather.title || '营销活动'
            })

            // wash data - winner
            gather.winner = res.lottery_list.map((i) => {
                return {name: i.name, item: i.item, time: i.time}
            })
            gather.lottery_list = []

            // wash data - itemlist
            let itemsArray = [],
                canPushAward = false,
                indexCount = -1
                while (gather.items.length) {
                    canPushAward = !canPushAward
                    indexCount ++
                    if (canPushAward && gather.items.length) {
                        let awardItem = (gather.items.splice(0,1))[0]
                        indexCount <= 7
                            ?   itemsArray.push(awardItem)
                            :   itemsArray[(indexCount % 8) + 1] = awardItem
                    } else {
                        indexCount <= 7
                        &&
                        itemsArray.push({
                            id: -1,
                            title: '继续努力',
                            // 根据背景颜色放置不同颜色笑脸
                            thumb_url: indexCount % 2 == 0
                                ? 'https://facing-1256908372.file.myqcloud.com//image/20171209/fa432c34f7e31029.png'
                                : 'https://facing-1256908372.file.myqcloud.com//image/20171209/fefecfa9aa28bd17.png'
                        })
                    }
                }
            gather.items = itemsArray.map((i) => { i.thumb_url = cropImgWH(i.thumb_url, 80, 80); return i })    // wash data - imageWH
            gather.is_participate = res.is_participate||''
            gather.credit = res.credit||0

            let description_item = gather.description_item ? JSON.parse(gather.description_item) : [];
            if (description_item.length == 0) {
              if (gather.description) {
                description_item.push({
                  type: 'text',
                  content: gather.description
                });
              }
            }
            this.setData({
              description_item: description_item,
                activity: {
                    ...gather
                }
            })
            this.addList();
            this.data.activity.transmit_condition == 0 && this.takePartSucEvent()
        }).catch(err => console.log('err',err))

        let self = this;

        // init wheel initial function
        this.wheel.controller.init = function () {
            let record = self.wheel.record
            record.singleAngle = 360 / record.areaNumber
            self.setData({
                wheel: {
                    singleAngle: record.singleAngle,
                    mode: record.mode
                }
            })
        }

        // init wheel start function
        this.wheel.controller.start = function (endNumber = 0) {
            let record = self.wheel.record
            record.awardNumber = endNumber
            if (record.start) {
                let endAngle = (record.awardNumber - 1) * record.singleAngle + record.singleAngle / 2 + 360
                let totalAngle = (Math.floor( Math.random() * 4 ) + 4) * 360
                let fixAngle = 0,
                    deg = 0

                let timer = setInterval(() => {
                    let distance = Math.abs(deg-totalAngle)
                    if (!(deg > totalAngle)) {
                        deg += record.speed
                    } else {
                        fixAngle = (endAngle + totalAngle - deg) / record.speed
                        fixAngle = fixAngle > record.speed ? record.speed : fixAngle < 1 ? 1 : fixAngle
                        deg += fixAngle

                        if (deg >= endAngle + totalAngle) {
                            deg = endAngle + totalAngle
                            clearInterval(timer)
                            // modal
                            self.setData({
                              result_prize: self.wheel.result.result,
                              result_coupon: self.wheel.result.coupon_id,
                              valide_time: self.wheel.result.valide_time
                            })
                            let resultTitle = self.wheel.result.result_type == '0' ? '很遗憾' : '恭喜您中奖了',
                                resultText = self.wheel.result.coupon_id==0 ? '请联系商家领取奖品' : '请到我的优惠券页面进行查看';
                            self.wheel.timer = setTimeout(() => {
                                if (self.wheel.result.result_type == '0') {
                                  showModal({
                                    title: resultTitle,
                                    content: self.wheel.result.result_type == '0' ? '未中奖，请继续努力吧' : `获得${self.wheel.result.result},${resultText}`,
                                    showCancel: false,
                                    complete: (res) => {
                                      self.setData({
                                        lockNow: false
                                      })
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
                               
                                record.start = false
                            }, 1000)
                        }
                    }
                    self.setData({
                        wheel: {
                            singleAngle: record.singleAngle,
                            deg: deg,
                            mode: record.mode
                        }
                    })
                }, 1000/60)
            }
        }
    },

    onReady () {
        this.wheel.controller.init()
    },
    onPullDownRefresh() {
        this.onLoad(this.dataStore.options)
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
        console.log('activity/getLotteryList',res)
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
    start () {
        const { userInfo } = app.globalData
        if (userInfo && userInfo.avatar && checkAvatar(userInfo.avatar)){
        if (this.data.lockNow) {
          return
        }
        if (!this.data.activity.is_participate){ //针对积分不足进行权限控制
            showTips('积分不足，无法参与活动',this)
            return ;
        } else if (this.data.activity.pay_type == 1){  //需要消耗积分则弹积分弹框
            this.setData({
                showLottery:true
            })
            return ;
        }
        this.takePartIn()
      }
    },
    getUseAuthorize(e) {
      console.log(e, 'q12312')
      const eggIndex = e.currentTarget.dataset.eggIndex
      const { userInfo } = e.detail
      if (userInfo) {
        getUserInfo(this, userInfo).then(e => {
          console.log(userInfo, 'userInfo')
          this.setData({
            authorize: true
          })
          // const { userInfo } = app.globalData
          this.dataStore.eggIndex = eggIndex
          this.start()
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
            const eggIndex = e.currentTarget.dataset.eggIndex
            this.setData({
                authorize: true
            })
            this.dataStore.eggIndex = eggIndex
            this.start()
        }).catch(err => {
            this.setData({
                authorize: false
            })
            showTips('授权失败')
        })
    },

    takePartIn(){
        this.setData({
            lockNow: true
        })
        if(this.data.lockNow) {
            fetchApi(this, {
                url: app.API_HOST + 'activity/takePartIn',
                data: {
                    activityId: this.dataStore.id
                }
            }).then((res) => {
                var res = res.data.data
                this.wheel.record.start = true
                this.wheel.result.result = res.result
                this.wheel.result.result_type = res.result_type
                this.wheel.result.coupon_id = res.coupon_id
                this.wheel.result.valide_time = res.valide_time
                let initNumber = res.result_type == 1
                    ? this.data.activity.items.findIndex(i => res.result == i.title) + 1
                    // : [2,4,6,8].sort((a,b)=>{if (.5-Math.random()>0) {return a-b} else {return b-a}}).splice(0, 1)
                    : this.data.activity.items.map((x, index) => {
                        return x.id == -1 ? index + 1 : 0
                    }).filter(x => x).sort((a, b) => { if (.5 - Math.random() > 0) { return a - b } else { return b - a } }).splice(0, 1)
                this.wheel.controller.start(initNumber)
                this.data.activity.transmit_condition == 1 && this.takePartSucEvent()
                this.setData({
                    'activity.activity_times_left': --this.data.activity.activity_times_left
                })
            }).catch((err) => { showModal({ content: err.data ? err.data.msg : '' }) })
        }
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
    closeActivity(){
        this.setData({
            showLottery:false
        })
    },
    instantLotteryActivity(){
        this.takePartIn()
        this.closeActivity()
    }
})
