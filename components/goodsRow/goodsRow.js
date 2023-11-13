// components/goodsRow/goodsRow.js
import {
  nav
} from '../../utils/util';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsList: {
      type: null,
      value: ''
    },
    searchType: {
      type: null,
      value: 1
    }
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
    toGoodsDetail(e) {
      if (this.data.searchType == 2) {
        nav({
          url: '/pages/foodsDetail/foodsDetail',
          data: {
            id: e.currentTarget.dataset.goodsId
          }
        })
      } else {
        nav({
          url: '/pages/goodsdetail/goodsdetail',
          data: {
            'goodsId': e.currentTarget.dataset.goodsId
          }
        })
      }

    }
  }
})