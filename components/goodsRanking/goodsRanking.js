

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    NumIndex: {
      type: Number,
      value: 0
    },
    DateIndex: {
      type: Number,
      value: 0
    },
    goodsData: {
      type: Object,
      value: {}
    },
    showStyle: {
      type: Number,
      value: 1
    },
    loadStyle: {
      type: String,
      value: ""
    }
  },



  /**
   * 组件的初始数据
   */
  data: {
    selectDate: ["全部时长","昨天","近7日","近15日","近30日"],
    selectNum: ["浏览量由高到低","浏览量由低到高"],
    selectGoods: ["全部商品","企业商品","个人商品"],
    topNum: false,
    topTime: false,
    topGoods: false,
    isChecked: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 点击销售量
    changeNumIndex(e) {
      let target = e.target.dataset.top;
      this.triggerEvent('changeNum',e);
      this.setData({
        NumIndex: e.detail.value,
        [target]: false
      });
    },
    // 点击全部时间
    changeDateIndex(e) {
      let target = e.target.dataset.top;
      this.triggerEvent('changeDate',e);
      this.setData({
        DateIndex: e.detail.value,
        [target]: false
      });
    },
    // 点击全部商品
    // changeGoodsIndex(e) {
    //   let target = e.target.dataset.top;
    //   if(e.detail.value != this.data.GoodsIndex && e.detail.value == 0){
    //     this.getSellMore({
    //       orderBy: this.data.orderBy,
    //       orderType: this.data.sales,
    //       pageSize: 10,
    //       start: 1,
    //       isQy: 2,
    //       beginTime: this.data.timeAgo,
    //       endTime: getNDay(0)
    //     });
    //     this.setData({
    //       isQy: "2",
    //       indexPage: 1
    //     })
    //   }else if(e.detail.value != this.data.GoodsIndex && e.detail.value == 1){
    //     this.getSellMore({
    //       orderBy: this.data.orderBy,
    //       orderType: this.data.sales,
    //       pageSize: 10,
    //       start: 1,
    //       isQy: 1,
    //       beginTime: this.data.timeAgo,
    //       endTime: getNDay(0)
    //     });
    //     this.setData({
    //       isQy: "1",
    //       indexPage: 1
    //     })
    //   }else if(e.detail.value != this.data.GoodsIndex && e.detail.value == 2){
    //     this.getSellMore({
    //       orderBy: this.data.orderBy,
    //       orderType: this.data.sales,
    //       pageSize: 10,
    //       start: 1,
    //       isQy: 0,
    //       beginTime: this.data.timeAgo,
    //       endTime: getNDay(0)
    //     });
    //     this.setData({
    //       isQy: "0",
    //       indexPage: 1
    //     })
    //   }
    //   this.setData({
    //     GoodsIndex: e.detail.value,
    //     [target]: false
    //   })
    // },

    // 改变箭头
    changDir(e) {
      let target = e.target.dataset.top;
      this.setData({
        [target]: true
      });
    },
    // picker取消时让箭头朝下
    reset(e){
      let target = e.target.dataset.top;
      this.setData({
        [target]: false,
      });
    },
    changRadio(){
      this.setData({
        isChecked: !this.data.isChecked
      });
      if(this.data.isChecked === true){
        this.triggerEvent('ChangeRadio', 1);
      }else{
        this.triggerEvent('ChangeRadio', 2);
      }
    }
  }
})
