const app = getApp();
import {
  addActionLog,
  fetchApi
} from '../../api/api';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: 'normal'
    },
    src: {
      type: String,
      value: '',
      observer: "setSrc"
    },
    title: String,
    color: String,
    themeColor: String,
    backgroundColor: String,
    slideColor: String,
    playCount: {
      type: String,
      value: "0",
      observer(newVal) {
        console.log(newVal, "newVal");
        if (newVal.search("万") === -1) {
          let total = parseInt(newVal);
          console.log(total);
          if (total < 10000) {
            this.setData({
              count: total
            })
          } else {
            total = total / 10000;
            let arr = total.toString().split(".");
            if (arr.length > 1 && arr[1].length > 1) {
              this.setData({
                count: total.toFixed(1) + "万"
              })
              return;
            } else {
              this.setData({
                count: total + "万"
              })
              return;
            }
          }
        } else {
          this.setData({
            count: total
          })
        }
      }
    },
    cardId: String,
    dontNeedCount: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    audioLength: 0,
    currentTime: 0,
    audioLength_show: "00:00",
    currentTime_show: "00:00",
    progressChanging: false,
    playing: false,
    buttonStyle: "播放",
    count: 0,
    needCount: true
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 播放
    audioPlay() {
      if (this.audioCtx.src && this.data.ready) {
        if (this.data.init) {
         if (this.data.type == 'normal'){
             addActionLog(this, {
                 type: 10,
             });
         }
          if (this.data.needCount){
            !this.data.dontNeedCount && this.addPlayCount();
          }
        }
        this.audioCtx.play();
      } else {
        let timer = setInterval(() => {
          if (this.audioCtx.src && this.data.ready) {
            clearInterval(timer);
            if (this.data.init) {
              addActionLog(this, {
                type: 10,
              });
              if (this.data.needCount) {
                !this.data.dontNeedCount && this.addPlayCount();
              }
            }
            this.audioCtx.play();
          }
        }, 100)
      }
    },

    // 暂停
    audioPause() {
      this.audioCtx.pause();
    },

    // 停止
    audioStop() {
      this.audioCtx.stop();
    },

    // 跳转
    audioSeek(value) {
      this.audioCtx.seek(value);
    },

    // 设置播放链接
    setSrc(src, oldsrc) {
      if (this.audioCtx && src !== oldsrc) {
        console.log("播放链接切换了");
        this.audioCtx.src = src;
        this.audioStop();
        this.setData({
          currentTime: 0,
          currentTime_show: "00:00",
        });
        if (this.data.buttonStyle !== "播放") {
          setTimeout(() => {
            this.audioPlay();
          }, 500)
        }
      }
    },

    // 获取播放时间
    getTime() {
      if (!this.data.progressChanging) {
        this.setData({
          currentTime: parseInt(this.audioCtx.currentTime),
          audioLength: parseInt(this.audioCtx.duration),
          currentTime_show: this.formateTime(this.audioCtx.currentTime),
          audioLength_show: this.formateTime(this.audioCtx.duration)
        })
      }
    },

    // 进度条拖动完毕
    progressChange(e) {
      let value = parseInt(e.detail.value);
      this.audioSeek(value);
      this.data.progressChanging = false;
    },

    // 进度条正在拖动
    progressChanging(e) {
      this.data.progressChanging = true;
      this.setData({
        currentTime_show: this.formateTime(parseInt(e.detail.value))
      })
    },

    // 格式化显示时间
    formateTime(seconds) {
      let makeItDouble = (num) => {
        if (parseInt(num) < 10) {
          return `0${num}`;
        } else {
          return `${num}`;
        }
      };
      let min = makeItDouble(Math.floor(seconds / 60));
      let sec = makeItDouble(Math.floor(seconds % 60));
      return `${min}:${sec}`;
    },

    // 初始化
    audioInit() {
      this.audioCtx = wx.createInnerAudioContext();
      this.audioCtx.src = this.data.src || "";
      this.data.type == 'tiny' && (this.audioCtx.loop = true); //真机调式：营销活动须自动且循环播放
      this.audioCtx.onTimeUpdate(() => {
        this.getTime();
      });

      this.audioCtx.onSeeked(() => {
        this.audioPause();
        this.audioPlay();
      });

      // 可以播放
      this.audioCtx.onCanplay(() => {
        console.log("可以播放了")
        this.data.ready = true;
        if (this.data.type != "tiny" && !this.data.init) {
          if (this.audioCtx.volume !== 0) {
            this.audioCtx.volume = 0;
          }
          this.audioPlay();
          let timer = setInterval(() => {
            console.log(this.audioCtx.duration,"等待获取长度")
            if (this.audioCtx.duration !== 0) {
              clearInterval(timer);
              this.data.init = true;
              this.audioStop();
              this.audioCtx.volume = 1;
              this.setData({
                audioLength: this.audioCtx.duration,
                audioLength_show: this.formateTime(this.audioCtx.duration)
              })
            }
          }, 100)
        } else if (this.data.type == "tiny") {  //营销活动直接播放(适配ios)
            this.data.init = true;
            this.audioPlay();
        }
      });

      // 播放事件
      this.audioCtx.onPlay(() => {
        console.log("播放");
        if (this.data.init) {
          this.setData({
            buttonStyle: "暂停",
          })
        }
      });

      // 暂停事件
      this.audioCtx.onPause(() => {
        console.log("暂停");
        this.setData({
          buttonStyle: "播放"
        })
        this.data.needCount = false;
      });

      // 停止事件
      this.audioCtx.onStop(() => {
        console.log("停止");
        this.setData({
          buttonStyle: "播放",
          currentTime: 0,
          currentTime_show: "00:00",
        })
        this.data.needCount = true;
      });

      // 播放结束事件
      this.audioCtx.onEnded(() => {
        console.log("播放结束");
        this.setData({
          buttonStyle: "播放",
          currentTime: 0,
          currentTime_show: "00:00",
        })
        // this.audioStop();
        this.data.needCount = true;
      });

      // 加载事件
      this.audioCtx.onWaiting(() => {
        console.log("加载中");
        this.setData({
          buttonStyle: "播放",
          // ready: false
        })
      });

      // 错误事件
      this.audioCtx.onError((res) => {
        console.log("错误");
        this.setData({
          buttonStyle: "播放",
          ready: false
        });
        console.log(res.errMsg);
        console.log(res.errCode);
      })
    },

    // 上报播放次数
    addPlayCount() {
      this.setData({
        playCount: parseInt(this.data.playCount) + 1
      })
      let params = {
        url: "Card/addVoicePlayCount",
        data: {
          cardId: this.data.cardId,
          count: 1
        }
      }
      fetchApi(this, params).then(res => {
        console.log(res);
        this.data.count = 0;
      }).catch(res => {
        console.log(res);
      });
    }
  },

  ready() {
    this.audioInit();
  },

  detached() {
    if (this.data.buttonStyle !== "播放") {
      this.audioStop();
    }
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    hide() {
      if (this.data.buttonStyle !== "播放") {
        this.audioStop();
      }
    },
    show(){
       this.data.type == 'tiny' &&  this.audioPlay() //营销活动底部栏切换自动播放
    }
  },
});