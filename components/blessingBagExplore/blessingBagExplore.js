import {
  nav
} from '../../utils/util';
import {
  blessBagTask
} from '../../map'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blessData:{
      type:null,
      value:{}
    },
    completeTask:{
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    blessBagTask: blessBagTask
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
    immediatelyExplore(){
      //完成探险
      if (this.properties.blessData.activity.task.length == this.properties.completeTask.length){
        var myEventDetail = 2
        this.triggerEvent('colse', myEventDetail)
      }else{
        var myEventDetail = 0
        this.triggerEvent('colse', myEventDetail)
      }
    }
  }
})
