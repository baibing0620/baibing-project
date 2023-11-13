import { nav } from '../../utils/util';
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isOpenCredit: {
            type: null,
            value: '0'
        },
        goodsList: {
            type: null,
            value: ''
        },
        searchType: {
            type: null,
            value: 1
        },
        is_credit: {
            type: String,
            optionalTypes:[String, Number],
            value: ''
        }
    },

    data: {

    },

    methods: {
        goodsnav(e) {
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
        },
    }
})