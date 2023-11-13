import {
  nav,
} from '../../utils/util';
const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
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
    recevieData:{}
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
    checkBlessBag(){
      this.setData({
        belssBagDialog: 0
      })
      nav({
        url: '/bless/blessingBagReceiveSuccess/blessingBagReceiveSuccess',
        data: {
          activity:this.data.blessData.activity.id
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