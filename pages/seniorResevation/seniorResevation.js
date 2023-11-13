const app = getApp();
import { fetchApi, addActionLog } from '../../api/api';
import { showLoading, getYMD, showToast, nav, previewImageList } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrls: [],
        days: [],
        briefIntroduction: "",
        briefIntroductionover: "",
        showlast: false,
        title: '',
        extConfig: app.extConfig,
    },
    dataStore: {
        dateCalendar: [],
        reservableTime: [],
        goodsId: '',
        startTime: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.dataStore.goodsId = options.goodsId || 0
        getAppointmentItemGood(this)
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            this.setData({
                isFromShare: true
            });
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.dataStore.startTime = new Date().getTime();
        this.setData({
            chooseday: app.globalData.chooseDay?app.globalData.chooseDay.replace(/2018\//g, "").replace(/\//g, '-'):''
        })

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        addActionLog(this, {
            type: 34,
            detail: {
                id: this.dataStore.goodsId,
                duration: new Date().getTime() - this.dataStore.startTime,
                name: this.data.title
            }
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        addActionLog(this, {
            type: 34,
            detail: {
                id: this.dataStore.goodsId,
                duration: new Date().getTime() - this.dataStore.startTime,
                name: this.data.title
            }
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        getAppointmentItemGood(this);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.title,
            path: `/pages/seniorResevation/seniorResevation?goodsId=${this.dataStore.goodsId}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
        }
    },
    showData() {
        this.setData({
            showlast: !this.data.showlast
        })
    },
    chooseDay(e) {
        let index = e.currentTarget.dataset.index,
            toDayView = e.currentTarget.id,
            days = this.data.days;
        app.globalData.chooseDay = days[index].date
        this.setData({
            chooseday: days[index].day,
            days: days,
            // toDayView:toDayView
        })
    },
    navCalendar() {
        nav({
            url: '/pages/calendar/calendar',
            data: {
                startDay: this.data.startDay,
                endDay: this.data.endDay,
                dateCalendar: JSON.stringify(this.dataStore.dateCalendar),
                reservableTime: JSON.stringify(this.dataStore.reservableTime)
            }
        })
    },
    navSeniorDetail(e) {
        nav({
            url: '/pages/seniorResevationDetail/seniorResevationDetail',
            data: {
                appointmentItemid: e.currentTarget.dataset.id,
                goodsId: this.dataStore.goodsId
            }
        })
    },
    resevation(e) {
        nav({
            url: '/pages/confirmSeniorResevationOrder/confirmSeniorResevationOrder',
            data: {
                appointmentItemid: e.currentTarget.dataset.id,
                goodsId: this.dataStore.goodsId
            }
        })
    },
    previewImage(e) {
        let url = e.currentTarget.dataset.url
        previewImageList(this.data.imgUrls, 'imgUrl', url)
    }
})
//返回周几
function getWeek(date) {
    let day = parseInt(date);
    switch (day) {
        case 0:
            return '周天'
            break;
        case 1:
            return '周一'
            break;
        case 2:
            return '周二'
            break;
        case 3:
            return '周三'
            break;
        case 4:
            return '周四'
            break;
        case 5:
            return '周五'
            break;
        case 6:
            return '周六'
            break;
        case 7:
            return '周天'
            break;
        default:
            return '错误';
    }
}

function getDate(self, data) {
    let days = data.map(function (item, index, arry) {
        item.date = item.day
        item.day = item.day.replace(/2018\//g, "").replace(/\//g, '-');
        item.week = getWeek(item.week);
        if (index == 0) {
            item.isActive = true;
        }
        return item
    });
    app.globalData.chooseDay = days[0].date
    self.setData({
        days: days,
        chooseday: days[0].day
    });
}

function getAppointmentItemGood(self) {
    showLoading()
    let param = {
        url: `${app.API_HOST}appointment/getAppointmentGoodsById`,
        data: {
            id: self.dataStore.goodsId
        }
    }
    fetchApi(self, param).then((res) => {

        let data = res.data.data
        let introduce = data.introduce
        let showData = introduce.substr(0, 79)
        let hideData = introduce.substr(79)
        wx.setNavigationBarTitle({
            title: data.title,
        })
        self.setData({
            imgUrls: data.banner,
            title: data.title,
            briefIntroduction: showData,
            briefIntroductionover: hideData,
            appointmentItemList: data.appointmentItemList
        })
        let timeArry = data.reservable_time
        let deleValue = timeArry.pop()
        timeArry.unshift(deleValue)
        self.dataStore.reservableTime = timeArry
        intDate(self, parseInt(data.reservable_days), timeArry)

    }).catch((e) => { console.log(e) });
}
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function intDate(self, day, time) {
    let nowDate = new Date(),
        nowYear = nowDate.getFullYear(),
        nowMonth = nowDate.getMonth(),
        today = nowDate.getDate();
    let endDate = new Date(nowYear, nowMonth, today + day),
        endYM = new Date(endDate.getFullYear(), endDate.getMonth());
    let dates = [];
    for (let i = nowMonth; new Date(nowYear, i) <= endYM; i++) {
        let item = [];
        let monthDays = new Date(nowYear, i + 1, 0).getDate(); //获取该月天数  +1
        for (let j = 1; j <= monthDays; j++) {
            let _year = new Date(nowYear, i).getFullYear(),
                _month = new Date(nowYear, i).getMonth() + 1; //获取该月月份 +1
            let day = [_year, _month, j].map(formatNumber).join('/')

            item.push(day.toString())
            dates.push(day.toString());
        }
        // fillDay(item);
        // dates.push(item);
        self.dataStore.dateCalendar.push(item)
    }
    let startDay = `${nowYear}/${nowMonth + 1}/${today}`,
        endDay = `${endDate.getFullYear()}/${endDate.getMonth() + 1}/${endDate.getDate()}`;
    let abelday = dates.map(function (item, index, arry) {
        if (new Date(item).getTime() >= new Date(startDay).getTime() && new Date(item).getTime() <= new Date(endDay).getTime()) {
            return item
        }
    })
    let finalDay = []
    for (let i = 0; i <= abelday.length; i++) {
        if (abelday[i] != undefined && time[new Date(abelday[i]).getDay()] != 0) {
            finalDay.push(abelday[i])
        }
    }
    let dateArray = []
    for (let i = 0; i < finalDay.length; i++) {
        let dateObj = {}
        dateObj.day = finalDay[i]
        dateObj.week = new Date(finalDay[i]).getDay()
        dateArray.push(dateObj)
    }
    if (dateArray.length > 0) {
        getDate(self, dateArray)
        self.setData({ dates, startDay, endDay })
    }

}