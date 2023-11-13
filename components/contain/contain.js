import { nav } from '../../utils/util'

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: ''
        },

        icon: {
            type: String,
            value: ''
        },

        url: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        
    },

    observers: {
        
    },

    /**
     * 组件的方法列表
     */
    methods: {
        navigate(e) {
            const { url } = this.data 
            nav({
                url,
                data: {}
            })
        },
    }
})
