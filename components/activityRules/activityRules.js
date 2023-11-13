// components/activityRules/activityRules.js
const app = getApp(); // world

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: Boolean,
        time: String,
        goodsName: String,
        miniNumber: String,
        winNumber: String,
        lotteryGroupType: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        activeTime: "",
        endTime: "",
        shop: ""
    },

    /**
     * 组件的方法列表
     */
    methods: {
        close() {
            this.setData({
                show: false
            })
        }
    },
    lifetimes: {
        attached() {
            let shop = app.name;
            let time = '';
            try {
                console.log(this.properties.time,'this.properties.time')
                console.log(this.properties.time.split("~"), 'this.properties.time.split("~")')

                time = this.properties.time.split("~");
                // ios 上面 new Date() 中的时间，不支持以 - 分隔符，只支持 / 
                var date = new Date(time[1].replace(/-/g, '/'));
                var month = date.getMonth() + 1;
                var day = date.getDate()
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();

                var endTimeStr = `${month}月${day}日${hours}点`;
                if (minutes != '0') {
                    endTimeStr += `${minutes}分`;
                }
                if (seconds != '0') {
                    endTimeStr += `${seconds}秒`;
                }
                this.setData({
                    activeTime: time.join(' - '),
                    endTime: endTimeStr,
                    shop: shop
                })
    
            } catch(e) {
                console.log(e)
            }
        }
    }
})
