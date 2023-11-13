// components/image/image.js
Component({
    /**
     * 组件的属性列表
     */
    properties: { 
        src: String,
        mode: {
            type: String,
            value: 'aspectFill'
        },
        placeholder: {
            type: Boolean,
            value: false
        },
        cropImg: {
            type: Boolean,
            value: true
        },
        lazyLoad: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isLoadOver: false,
        url: '',
        ready: false
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
        handleLoadOver (e) {
            this.setData({
                isLoadOver: true
            })
            this.triggerEvent('handleLoadOver', e.detail)
        },

        formatImageUrl(src) {
            const { cropImg, mode } = this.data
            wx.createSelectorQuery().in(this).select('#layout').boundingClientRect(rect => {
                try {
                    const { height, width } = rect
                    const { windowWidth } = wx.getSystemInfoSync()
                    const ratio = 750 / windowWidth
                    const h = height * ratio
                    const w = width * ratio
                    this.setData({
                        ...(cropImg && src ? { url: mode !== 'aspectFill' ? `${src}?imageView2/2/w/${w}` : `${src}?imageView2/1/w/${w}/h/${h}`} : { url: src })
                    })
                    this.triggerEvent('handleResize', { height: h, width: w })
                } catch(err) {
                    this.setData({
                        url: src
                    })
                }
            }).exec()
        }
    },

    lifetimes: {
        ready() {
            this.data.ready = true
            setTimeout(_ => this.formatImageUrl(this.data.src), 100)
        }
    }
})
