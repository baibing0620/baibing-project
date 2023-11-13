const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
import {
  nav,
} from '../../utils/util';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blessData:{
      type:null,
      value:{}
    }
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    showTip:'',
    recevieData: {}
  },
  ready: function () {
    getMyReceiveCount(this)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    closeBless(){
      var myEventDetail = 0
      this.triggerEvent('colse', myEventDetail)
    },
    noClose(){},
    navRule(){
      nav({
        url: '/bless/blessingBagRules/blessingBagRules',
        data: {
         
        }
      })
    },
    immediatelyReceive(){
      let param = {
        url: app.API_HOST + "packet/joinActivity",
        data: {
          activityId: this.data.blessData.activity.id
        }
      }
      fetchApi(this, param).then(res => {
        this.navBless()
      }).catch((err) => {
        this.setData({
          showTip: err.data.msg
        })
      });
    },
    immediatelyExplore(){
      let data = this.data.blessData
      if ((app.globalData.currentLoginUserCardInfo &&
        app.globalData.currentLoginUserCardInfo.cardId == app.globalData.cardId) || app.globalData.cardId <= 0) {
        this.setData({
          showTip:"您是该名片的持有者，不能领取此福袋，请至其他名片领取哦~~"
        })
        return;
      }
      else if (data.activity.has_join == 1 && data.activity.type == 2 && (data.activity.join_card && app.globalData.cardId != data.activity.join_card.id)){
        this.setData({
          showTip: '您已经在' + data.activity.join_card.name + '的名片领取此福袋，请至其名片做任务哦~~'
        })
        return;
      }
      let param = {
        url: app.API_HOST + "packet/joinActivity",
        data: {
          activityId: data.activity.id
        }
      }
      fetchApi(this, param).then(res => {
        this.triggerEvent('myExplore', true)
      }).catch((err) => {
        this.setData({
          showTip: err.data.msg
        })
      });
    },
    navBless(){
      nav({
        url: '/bless/blessingBagReceiveSuccess/blessingBagReceiveSuccess',
        data: {
          activity: this.data.blessData.activity.id
        }
      })
    }
  }
})
function getMyReceiveCount(self) {
    let param = {
        url: app.API_HOST + "packet/getMyReceiveCount",
        data: {
            activityId: self.properties.blessData.activity.id
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data
        self.setData({
            recevieData: data
        })
    }).catch((err) => {

    });
}