const app = getApp()

import {
  fetchApi, checkAvatar, getGlobalConfig, getUserInfo
} from '../../api/api.js'
import {
    showModal,getHomePage,
    nav,
    showToast,
    showTips
} from '../../utils/util'

const staticRecord = {
    canvasHeight: 210,
    canvasWidth: 610,
}

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
        canvas: {
            width: staticRecord.canvasWidth,
            height: staticRecord.canvasHeight,
        },
        content: {
            left: '0'
        },
        scratch: {
            class: '',
            resultMessage: '',
            buttonInfo: '点击开始刮奖'
        },
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
    onShow(){
     
    },
    onShareAppMessage: function () {
        return {
            title: this.data.activity.title || '刮刮乐',
            path: `/pages/marketScratch/marketScratch?id=${this.dataStore.id}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}&cardId=${app.globalData.cardId }`,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },
    scratch: {
        result: {},
        canvas: { // canvas基本信息
            id: 'scratch',
            width: staticRecord.canvasWidth,
            height: staticRecord.canvasHeight,
        },
        mask: { // canvas遮罩层
            image: '',
            color: '#fff',
        },
        brush: { // canvas笔刷相关
            shape: 'rectangle',
            radius: 1,
            minRadius: 1,
            maxRadius: 25,
            accumulateTime: 1,
        },
        content: { // 刮刮乐内容
            image: null,
            text: '一等奖',
            color: '#fff'
        },
        record: { // canvas计算相关
            start: false,
            minx: Number.MAX_VALUE,
            miny: Number.MAX_VALUE,
            maxx: Number.MIN_VALUE,
            maxy: Number.MIN_VALUE,
            lastx: 0,
            lasty: 0,
            lastDistance: 0,
            accumulateTime: 1,
        },
        controller: { // canvas控制器
        },
        timer: null,
    },

    onUnload() {
        app.pageData.removePage("marketScratch");
        this.scratch.timer && clearTimeout(this.scratch.timer)
    },

    onLoad(options) {
        app.pageData.setPage(this, "marketScratch");
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
        }).then(res => {
            let gatther = res.data.data
            wx.setNavigationBarTitle({
                title: gatther.title || '营销活动'
            })

            gatther.winner = gatther.lottery_list.map((i) => {
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
          console.log(description_item,'description_itemdescription_itemdescription_itemdescription_item')
            this.setData({
                description_item: description_item,
                activity: {
                    ...gatther
                }
            })
            this.addList();
            this.data.activity.transmit_condition == 0 && this.takePartSucEvent()
        }).catch(err => console.log(err))
        this.scratch = Object.assign(this.scratch, {
            mask: {
                // image: 'https://facing-1256908372.file.myqcloud.com//image/20171207/4f0c1dc8af92040f.jpg',
            }
        })
        this.scratch.mask.color = '#cccccc'
        this.setData({
            'content.left': `calc( 50% - ${this.data.canvas.width/2+'rpx'} )`
        })

        this.scratch.controller.init = function (data) {
            self.canvas = wx.createCanvasContext(data.canvas.id)
            self.canvas.clearRect(0, 0, data.canvas.width, data.canvas.height)
            if (data.mask.image) {
                wx.downloadFile({
                    url: data.mask.image,
                    success: (res) => {
                        self.canvas.drawImage(res.tempFilePath, 0, 0, data.canvas.width, data.canvas.height)
                        self.canvas.draw()
                    },
                    error: () => {
                        setMask()
                    }
                })
            } else {
                setMask()
            }
            self.setData({
                'scratch.class': ''
            })

            function setMask() {
                self.canvas.setFillStyle(data.mask.color)
                self.canvas.fillRect(0, 0, data.canvas.width, data.canvas.height)
                self.canvas.draw()
            }
        }

        this.scratch.controller.selectRectangle = function (x, y) {
            let brush = self.scratch.brush,
                record = self.scratch.record

            // calc rectangle
            let x1 = x - brush.radius / 2 > 0 ? x - brush.radius / 2 : 0,
                y1 = y - brush.radius / 2 > 0 ? y - brush.radius / 2 : 0
            record.minx = record.minx < x1 ? record.minx : x1
            record.miny = record.miny < y1 ? record.miny : y1
            record.maxx = record.maxx > x1 ? record.maxx : x1
            record.maxy = record.maxy > y1 ? record.maxy : y1

            // calc distance
            let distance = Math.sqrt(Math.pow(x1 - record.lastx + y1 - record.lasty, 2))
            if (distance < record.lastDistance) {
                brush.radius > brush.minRadius && brush.radius--
            }
            record.lastx = x1
            record.lasty = y1
            record.lastDistance = distance

            // calc radius
            if (brush.radius < brush.maxRadius) {
                record.accumulateTime--
                    if (brush.radius < brush.maxRadius && !record.accumulateTime) {
                        brush.radius++
                            record.accumulateTime = brush.accumulateTime
                    }
            }

            return [x1, y1, brush.radius]
        }


        this.scratch.controller.clearRectangle = function (canvas, e) {
            let x = e.touches[0].x,
                y = e.touches[0].y
            let pos = self.scratch.controller.selectRectangle(x, y)
            canvas.clearRect(pos[0], pos[1], pos[2], pos[2])
            canvas.draw(true)
        }

        this.scratch.controller.removeMask = function () {
            self.setData({
                'scratch.class': 'none'
            })
            setTimeout(() => {
                self.canvas.clearRect(0, 0, staticRecord.canvasWidth, staticRecord.canvasHeight)
                self.canvas.draw(true)
            }, 550)

            self.setData({
              result_prize: self.scratch.result.message,
              result_coupon: self.scratch.result.coupon_id,
              valide_time: self.scratch.result.valide_time
            })
            let resultTitle = self.scratch.result.type == '0' ? '很遗憾' : '恭喜您中奖了',
                resultText = self.scratch.result.coupon_id == '0' ? '请联系商家领取奖品' : '请到我的优惠券页面进行查看'
            self.scratch.timer = setTimeout(() => {
                if (self.scratch.result.type == '0' ) {
                  showModal({
                    title: resultTitle,
                    content: self.scratch.result.type == '0' ? '未中奖，请继续努力吧' : `获得${self.scratch.result.message},${resultText}`,
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
                  self.scratch.controller.init(self.scratch)
                } else {
                  self.setData({
                    resultVisible: true
                  })
                }
               
                self.scratch.record.start = false
                console.log(self.scratch.record.start,'===>remove')
            }, 1200)



        }
      //this.addList();
    },

    onReady() {
        console.log('onReady')

        this.scratch.controller.init(this.scratch)
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
      this.scratch.controller.init(this.scratch)
      this.onLoad(this.dataStore.options)
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
    startScratch() {
        let scratch = this.scratch
        if (!scratch.record.start) {
            let self = this
            fetchApi(this, {
                url: app.API_HOST + 'activity/takePartIn',
                data: {
                    activityId: self.dataStore.id
                }
            }).then((res) => {
                var res = res.data.data

                self.setData({
                    'scratch.resultMessage': res.result_type == '0' ? '很遗憾，未中奖' : res.result
                })
                self.scratch.result = {
                    type: res.result_type,
                    message: res.result,
                    coupon_id: res.coupon_id,
                    valide_time: res.valide_time
                }
                scratch.record.start = true
                self.setData({
                    'scratch.buttonInfo': '直接查看结果',
                    'activity.activity_times_left': --self.data.activity.activity_times_left
                })
                self.data.activity.transmit_condition == 1 && self.takePartSucEvent()
            }).catch((err) => {
                showModal({
                  content: err.data ? err.data.msg : ''
                })
            })
        } else {
            this.scratch.controller.removeMask()
        }
    },

    touchStart(e) {
        let scratch = this.scratch
        const { userInfo } = app.globalData
        if (!userInfo || !userInfo.avatar || !checkAvatar(userInfo.avatar)) { 
          this.setData({
            showGetUserInfo: true,
            shopImg: app.globalData.shopImg
          })
          return
        } 

        if (!scratch.record.start&&!this.data.activity.is_participate) { //针对积分不足进行权限控制
            showTips('积分不足，无法参与活动',this)
            return;
        } else if (!scratch.record.start && this.data.activity.pay_type == 1) {  //需要消耗积分则弹积分弹框
            this.setData({
                showLottery: true
            })
            return;
        }
        if (scratch.record.start) {
          if (scratch.brush.shape === 'rectangle') {
            scratch.controller.clearRectangle(this.canvas, e)
          }
        } else {
            this.startScratch()
        }
    },

    touchMove(e) {
        let scratch = this.scratch
        if (scratch.record.start) {
            if (scratch.brush.shape === 'rectangle') {
                scratch.controller.clearRectangle(this.canvas, e)
            }
        }
    },

    touchEnd(e) {
        let scratch = this.scratch,
            record = this.scratch.record
        console.log(record.maxx, record.miny, record.maxy, record.miny, scratch.canvas)
        if (scratch.record.start) {
            // calc brush radius
            scratch.brush.radius = scratch.brush.minRadius || 1
            // calc endtime
            if (record.maxx - record.miny > .25 * scratch.canvas.width &&
                record.maxy - record.miny > .2 * scratch.canvas.height) {
                this.scratch.controller.removeMask()
            }
        }
    },
    toSharing(){
        this.setData({
          isShow:!this.data.isShow
        })
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
        this.startScratch()
        this.closeActivity()
      }

})