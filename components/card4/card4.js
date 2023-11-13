import { disSubscribe, subscribe } from './../../utils/publisher'

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        
    },
    /**
     * 组件的初始数据
     */
    data: {
        cardInfo: {},
    },
    /**
     * 组件的方法列表
     */
    methods: {
        
    },

    lifetimes: {
        attached() {
            subscribe('cardInfo', val => {
                const cardInfo = { ...val }
                try {
                    const { addresses, mobile, mobile_is_show } = cardInfo
                    Object.assign(cardInfo, {
                        address: JSON.parse(addresses),
                        mobile: mobile_is_show==1 ? mobile : mobile.replace(mobile.substring(3, 7), '****')
                    })
                } catch (error) {
                    console.error(error)
                }
                this.setData({ cardInfo })
            }, `card4_${this['__wxExparserNodeId__']}`)
        },

        detached() {
            disSubscribe(`card4_${this['__wxExparserNodeId__']}`)
        }
    },

    pageLifetimes: {

    }
})
