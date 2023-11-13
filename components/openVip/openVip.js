import { nav } from "../../utils/util";

// components/openVip/openVip.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    vipPrice:{
      type: null,
      value: ''
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
    toMembershipCard(){
      nav({
        url:'/pages/membershipCard/membershipCard'
      })
    }
  }
})
