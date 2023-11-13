// components/image/image.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        value: String,
        confirmText: {
            type: String,
            value: '确定'
        },
        cancelText: {
            type: String,
            value: '取消'
        },
        placeholder: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        
    },

    observers: {
        'src': function(val) {
            this.data.ready && this.formatImageUrl(val)
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleInput (e) {
            const { value } = e.detail
            this.setData({
                value
            })
            this.triggerEvent('input', { value })
        },

        handleClick (e) {
            const { type } = e.target.dataset
            switch (type) {
                case 'confirm':
                    this.handleConfirm()
                    break
                case 'cancel':
                    this.handleCancel()
                    break
                default:
                    return
            }
        },
        
        handleConfirm () {
            const { value } = this.data
            this.triggerEvent('confirm', { value })
        },

        handleCancel () {
            this.triggerEvent('cancel', {})
        }
    },

    lifetimes: { }
})
