const app = getApp()

import { fetchApi, getGlobalConfig, checkAvatar, getUserInfo} from '../../api/api.js'
import { cropImgWH, showModal, getHomePage, nav, showTips, showToast } from '../../utils/util'

Page({

    data: {
      isShow: false,
        activity: {
            title: '',
            activityId: '', 
            description: '',
            items: [],
            winner: [],
            lottery_list_type:2
        },
        fruitMachine: {
            result: 0,
            index: 0,
        },
        lockNow: false,
        lotteryLoading:false,
        pageIndex:1,
        pageSize:10,
        lotteryWinner:[],
        description_item: [],
        total: 1,
        frequency: 2, //能请求的次数
        showLottery: false
    },
    dataStore: {
      id: 0,
      options:''
    },
    onShow(){
     
    },
    onShareAppMessage: function () {
      return {
        title: this.data.activity.title || '刮刮乐',
        path: `/pages/marketFruitMachine/marketFruitMachine?id=${this.dataStore.id}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}&cardId=${app.globalData.cardId }`,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    },
    fruitMachine: {
        record: {
            start: false,
            len: 8,
            ret: 1,
            speed: 80,
        },
        controller: {

        },
        timer: null,
    },

    onUnload () {
        app.pageData.removePage("marketFruitMachine");
        this.fruitMachine.timer && clearTimeout(this.fruitMachine.timer)
    },

    onLoad (options) {
      this.dataStore.options = options
      app.pageData.setPage(this, "marketFruitMachine");
      console.log('iotions.id',options.id) 
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
            let gather = res
            wx.setNavigationBarTitle({
                title: gather.title || '营销活动'
            })
            

            // wash data - winner
            {
                gather.winner = res.lottery_list.map((i) => {
                    return {name: i.name, item: i.item, time: i.time}
                })
                gather.lottery_list = []
            }
            
           // wash data - itemlist
            // {
            //     let itemsArray = [],
            //         canPushAward = false,
            //         indexCount = -1
            //     while (itemsArray.length < 8) {
            //         canPushAward = !canPushAward
            //         indexCount ++
            //         if (canPushAward && gather.items.length) {
            //             let awardItem = (gather.items.splice(0,1))[0]
            //             itemsArray.push(awardItem)
            //         } else {
            //             itemsArray.push({
            //                 title: '继续努力',
            //                 thumb_url: 'https://facing-1256908372.file.myqcloud.com//image/20171208/24fa1e0310da58d0.png',
            //             })
            //         }
            //     }
            //     gather.items = itemsArray.map((i) => { i.thumb_url = cropImgWH(i.thumb_url, 100, 60); return i })    // wash data - imageWH
            // }

         // wash data - itemlist
          let itemsArray = [],
            canPushAward = false,
            indexCount = -1
          while (gather.items.length) {
            canPushAward = !canPushAward
            indexCount++
            if (canPushAward && gather.items.length) {
              let awardItem = (gather.items.splice(0, 1))[0]
              indexCount <= 7
                ? itemsArray.push(awardItem)
                : itemsArray[(indexCount % 8) + 1] = awardItem
            } else {
              indexCount <= 7
                &&
                itemsArray.push({
                  title: '继续努力',
                  thumb_url: 'https://facing-1256908372.file.myqcloud.com//image/20171208/24fa1e0310da58d0.png',
                })
            }
          }
          gather.items = itemsArray.map((i) => { i.thumb_url = cropImgWH(i.thumb_url, 100, 60); return i })    // wash data - imageWH

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
            this.addList()
            this.data.activity.transmit_condition == 0 && this.takePartSucEvent()
        }).catch(err => console.log('err',err))

        // init fruiteMachine start function
        this.fruitMachine.controller.start = function (awardNumber) {
            let record = self.fruitMachine.record
                record.ret = +awardNumber
            if (record.start) {
                let range = Math.floor(Math.random() * 2 + 2)
                let count = 0
                !(function interval(self) {
                    setTimeout(() => {
                        count ++
                        if (count != (range+1) * record.len + record.ret) {
                            interval(self)
                        } else {
                            record.start = false

                            // modal
                            self.setData({
                              result_prize: self.fruitMachine.result,
                              result_coupon: self.fruitMachine.coupon_id,
                              valide_time: self.fruitMachine.valide_time
                            })
                            let resultTitle = self.fruitMachine.result_type == '0' ? '很遗憾' : '恭喜您中奖了',
                                resultText =  self.fruitMachine.coupon_id=='0' ? '请联系商家领取奖品' : '请到我的优惠券页面进行查看'
                            self.fruitMachine.timer = setTimeout(() => {
                                if (self.fruitMachine.result_type == '0') {
                                  showModal({
                                    title: resultTitle,
                                    content: self.fruitMachine.result_type == '0' ? '未中奖，请继续努力吧' : `获得${self.fruitMachine.result},${resultText}`,
                                    complete: (res) => {
                                      console.log(resultTitle);
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
                               
                            }, 1000)     
                        }
                        self.setData({
                            fruitMachine: {
                                index: count % 8 === 0 ? 8 : count % 8
                            }
                        })
                    }, record.speed)
                })(self)
            }
        }
 
    },
    onReady() {
    },
    onPullDownRefresh() {
        this.onLoad(this.dataStore.options)
    },
    onReachBottom(){
      if(this.data.activity.lottery_list_type == 0){
        this.addList();
      }else{
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
      if (this.data.activity.lottery_list_type == 0){
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
    getUseAuthorize(e) {
      console.log(e, 'q12312')
      const { userInfo } = e.detail
      if (userInfo) {
        getUserInfo(this, userInfo).then(e => {
          console.log(userInfo, 'userInfo')
          this.setData({
            authorize: true
          })
          this.start()
        })
      } else {
        this.setData({
          authorize: false
        })
        showTips('授权失败')
      }
    },
    start () {
        if (this.data.lockNow) {
          return
        }
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
        this.setData({
            lockNow: true
        })
        if (this.data.lockNow) {
            fetchApi(this, {
                url: app.API_HOST + 'activity/takePartIn',
                data: {
                    activityId: this.dataStore.id
                }
            }).then((res) => {
                this.fruitMachine.record.start = true;
                var res = res.data.data;
                this.fruitMachine.result_type = res.result_type;
                this.fruitMachine.result = res.result;
                this.fruitMachine.coupon_id = res.coupon_id;
                this.fruitMachine.valide_time = res.valide_time
                let initNumber = res.result_type == 1
                    // ? this.data.activity.items.findIndex(i => res.result == i.title) + 1
                    // : [2,4,6,0].sort((a,b)=>{if (.5-Math.random()>0) {return a-b} else {return b-a}}).splice(0, 1)
                    ? this.data.activity.items.findIndex(i => res.result == i.title) + 1
                    : this.data.activity.items.map((x, index) => {
                        return x.id == -1 ? index + 1 : 0
                    }).filter(x => x).sort((a, b) => { if (.5 - Math.random() > 0) { return a - b } else { return b - a } }).splice(0, 1)
                console.log(initNumber);
                this.fruitMachine.controller.start(initNumber)
                this.data.activity.transmit_condition == 1 && this.takePartSucEvent()
                this.setData({
                    'activity.activity_times_left': --this.data.activity.activity_times_left
                })
            }).catch((err) => {
                this.setData({
                    lockNow: false
                })
                showModal({ content: err.data.msg })
            })
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
