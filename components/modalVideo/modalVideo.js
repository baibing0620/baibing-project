const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    frontColor: app.extConfig.navigationBarColor == 'white' ? '#ffffff' : '#000000',
    backgroundColor: app.extConfig.navigationBarBC ,

  },
  ready() {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    close(){
      let self = this;
      wx.setNavigationBarColor({
        frontColor: self.data.frontColor,
        backgroundColor: self.data.backgroundColor,
        animation: {
          duration: 50,
          timingFunc: 'easeIn'
        }
      })
      this.triggerEvent('closeMe', {})
    }
  }
})