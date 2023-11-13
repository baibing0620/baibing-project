// components/awardResultsDailog.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        result_prize:{
            type: null,
            value: '--'
        },
        result_coupon:{
            type: null,
            value: 0
        },
        valide_time:{
            type: null,
            value: '--'
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
        closeResult(){
            this.triggerEvent('close')
        }
    }
})
