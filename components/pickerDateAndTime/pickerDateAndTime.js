const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
var checkMonth = date.getMonth();
var checkDay = date.getDate() - 1
//获取年
for (let i = date.getFullYear(); i <= date.getFullYear() + 200; i++) {
    years.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
    if (i < 10) {
        i = "0" + i;
    }
    months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
    if (i < 10) {
        i = "0" + i;
    }
    days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
    if (i < 10) {
        i = "0" + i;
    }
    hours.push("" + i);
}
//获取分钟
for (let i = 0; i < 60; i++) {
    if (i < 10) {
        i = "0" + i;
    }
    minutes.push("" + i);
}

Component({
    properties: {
        placeholder: {
            type: null,
            value: ''
        },
        time: {
            type: null,
            value: ''
        }
    },
    data: {
        multiArray: [years, months, days, hours, minutes],
        multiIndex: [0, checkMonth, checkDay, 0, 0],
        choose_year: '',
    },
    attached: function () {
        //设置默认的年份
        this.setData({
            choose_year: this.data.multiArray[0][0]
        })
    },
    methods: {
        //获取时间日期
        bindMultiPickerChange: function (e) {
            this.setData({
                multiIndex: e.detail.value
            })
            const index = this.data.multiIndex;
            const year = this.data.multiArray[0][index[0]];
            const month = this.data.multiArray[1][index[1]];
            const day = this.data.multiArray[2][index[2]];
            const hour = this.data.multiArray[3][index[3]];
            const minute = this.data.multiArray[4][index[4]];
            var time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute
            this.triggerEvent('change', {
                time: time,
                //成功时的回调
                success: () => {
                    this.setData({
                        time: time
                    })
                },
                //失败的回调
                error: function () {
                    console.log("时间选择失败")
                }
            });
        },
        //监听picker的滚动事件
        bindMultiPickerColumnChange: function (e) {
            //获取年份
            if (e.detail.column == 0) {
                let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
                let num = parseInt(this.data.multiIndex[1]) + 1;
                this.setData({
                    choose_year: choose_year
                })
                this.getTime(num)
            }
            if (e.detail.column == 1) {
                let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
                this.getTime(num)

            }
            var data = {
                multiArray: this.data.multiArray,
                multiIndex: this.data.multiIndex
            };
            data.multiIndex[e.detail.column] = e.detail.value;
            this.setData(data);
        },
        getTime(num) {
            let temp = [];
            if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
                for (let i = 1; i <= 31; i++) {
                    if (i < 10) {
                        i = "0" + i;
                    }
                    temp.push("" + i);
                }

                this.setData({
                    ['multiArray[2]']: temp
                });
            } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
                for (let i = 1; i <= 30; i++) {
                    if (i < 10) {
                        i = "0" + i;
                    }
                    temp.push("" + i);
                }
                this.setData({
                    ['multiArray[2]']: temp
                });
            } else if (num == 2) { //判断2月份天数
                let year = parseInt(this.data.choose_year);
                if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
                    for (let i = 1; i <= 29; i++) {
                        if (i < 10) {
                            i = "0" + i;
                        }
                        temp.push("" + i);
                    }
                    this.setData({
                        ['multiArray[2]']: temp
                    });
                } else {
                    for (let i = 1; i <= 28; i++) {
                        if (i < 10) {
                            i = "0" + i;
                        }
                        temp.push("" + i);
                    }
                    this.setData({
                        ['multiArray[2]']: temp
                    });
                }
            }
        }
    }
})

