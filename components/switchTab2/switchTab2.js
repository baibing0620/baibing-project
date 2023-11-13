// compnents/switchTab/switchTab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    props: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    nowContent: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClick(e) {
      this.data.props.currentIndex = e.currentTarget.dataset.index;
      this.setData({
        props: this.data.props,
        nowContent: this.data.props.tabs[e.currentTarget.dataset.index]
      })
      this.triggerEvent('myevent', { currentIndex: e.currentTarget.dataset.index });
    },

  },

  ready() {
    this.setData({
      nowContent: this.data.props.tabs[this.data.props.currentIndex]
    })
  }
})
