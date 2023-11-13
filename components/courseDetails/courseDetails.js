import { nav } from '../../utils/util';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    detail: { 
      type: Object, 
      value:{
        title:12
      }, 
      
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    toDetail(){
      nav({
        url:'/pages/course/course',
        data:{
          id:this.data.detail.id
        }
      })
    }
  }
})

