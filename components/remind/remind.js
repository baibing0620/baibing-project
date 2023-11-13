const app = getApp();
import { fetchApi } from '../../api/api';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    content: String,
    coustom: {  //自定义顶部栏
        type:String,
        value:'',
        observer:function(val,oldVal){
            this.setData({
                bottom: app.globalData.statusBarHeight + app.globalData.getMenuButtonBoundingClientRect
            })
        }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.setData({
        show: false
      })
      app.globalData.needToShowRemind= false;
      let params = {
        url: app.API_HOST + "card/isTipShow",
        data: {
          uid: app.globalData.uid
        }
      }
      fetchApi(this, params).then(res => {
        console.log(res);
      }).catch(res => {
        console.log(res);
      })
    }
  }
})
