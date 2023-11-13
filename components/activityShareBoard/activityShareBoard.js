import { nav, showTips } from '../../utils/util'

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        openTransmit: null,
        openCreditTransfer: null,
        activityId: String,
        activity:{
            type: Object,
            value: {},
            observer: function (newVal, oldVal, changedPath) {
                const { activity: { end_time } } = this.data;
                if (end_time) {
                    const isEndTime = Date.now() > new Date(end_time.replace(/-/g, '/')).getTime()
                    this.setData({
                        isEndTime
                    }) 
                }
            }
        }
    },
    externalClasses: ['my-board',,'my-btn', 'share-name','share-num'],
    
    /**
     * 组件的初始数据
     */
    data: {

    },
   /**
     * 组件的方法列表
     */
    methods: {
        handleToTransfor() {
            const { activityId, isEndTime } = this.data
            if(isEndTime) {
                showTips('活动已到期')
                return ;
            } 
            nav({
                url: '/pages/creditTransToActivity/creditTransToActivity',
                data: { activityId }
            })
        },
        activityShare(){
            const { isEndTime } = this.data
            isEndTime && showTips('活动已到期')
        }
    }
})
