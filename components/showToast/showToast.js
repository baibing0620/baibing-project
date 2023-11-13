// components/showToast/showToast.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: '赠送积分'
        },
        placeholder: {
            type: String,
            value: '输入需要赠送的积分数量'
        },
        btnVal: {
            type: String,
            value: '确认赠送'
        },
        value: String,
        poster: {
            type: Number,
            value: 0
        },
        tip: {
            type: String,
            value: ''
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        isShow: true,
        value:''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleHide() {
            this.setData({
                isShow: false
            })
            this.triggerEvent('colse')
        },

        handleInputChange(e) {
            this.setData({
                value: e.detail.value
            })
        },

        getValue(e){
            console.log(this.data.value,9999)
            this.triggerEvent('getValue', this.data.value)
        }
    }
})
