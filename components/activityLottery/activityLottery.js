const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        requiredIntegral:{
            type:Number,
            value:0
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        credit:0
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getUserCreditInfo() {
            let params = {
                url: app.API_HOST + 'userCredit/getUserCreditInfo',
                data: {}
            };
            fetchApi(this, params).then(res => {
                this.setData({
                    credit: res.data.data.credit
                })
            }).catch(err => {
                console.log('error: ', err)
            });
        },
        closeActivity(){
            this.triggerEvent('closeActivity')
        },
        instantLotteryActivity(){
            this.triggerEvent('instantLottery')
        }
    },
    attached: function () {
       this.getUserCreditInfo()
    },
})
