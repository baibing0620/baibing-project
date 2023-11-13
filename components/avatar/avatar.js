// components/avatar/avatar.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        src: {
            type: String,
            value: ''
        },
        name: {
            type: String,
            value: ''
        },
        icon: {
            type: String,
            value: 'icon-ren1-copy'
        },
        lazyLoad: {
            type: Boolean,
            value: false
        }
    },

    observers: {
        'name': function(val) {
            this.setData({
                firstName: val.substring(0, 1)
            })
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        firstName: '',
        isLoadOver: false,
        fontSize: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleLoadOver() {
            this.setData({
                isLoadOver: true
            })
        },

        handleResize(e) {
            const { height, width } = e.detail
            this.setData({
                fontSize: 116 / 186 * Math.min(height, width)
            })
        }
    }
})
