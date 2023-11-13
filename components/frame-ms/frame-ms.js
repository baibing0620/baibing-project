Component({
  properties: {
    height: {
      type: String,
      value: '50rpx'
    },
    reverse: {
      type: Boolean,
      value: false
    },
  },
  data: {
    list: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  },
  attached() {
    if (this.data.reverse) {
      this.setData({
        list: this.data.list.reverse()
      });
    }
  }
})