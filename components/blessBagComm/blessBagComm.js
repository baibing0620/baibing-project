const app = getApp();
import {
    fetchApi,
    getGlobalConfig,
    addActionLog
} from '../../api/api.js';
import {
    nav,
    showLoading,
    chooseAddress,
    deleteWhite,
    formatDuring,
    showTips
} from '../../utils/util';
import {
    blessBagTask
} from '../../map'
Component({
    /**
     * 组件的属性列表
     */
    externalClasses: ['about-class'],
    properties: {
        showBless: {
            type: null,
            value: 0,
            observer: function(newVal, oldVal, changedPath) {
                if (oldVal !== 0) {
                    this.showModel()
                }
            }
        },
        pageRefresh: {
            type: Number,
            value: 0,
            observer: function(newVal, oldVal, changedPath) {
                this.getOnLineActivity();
            }
        }
    },

    export () {
        return {
            getOnLineActivity: 'getOnLineActivity'
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        belssBagDialog: 0,
        blessData: '',
        blessBagTask: blessBagTask,
        blesslock: false,
    },
    attached: function(options) {
        this.data.blesslock = true
        this.getOnLineActivity()
    },
    pageLifetimes: {
        show: function() {
            if (!this.data.blesslock) {
                this.getOnLineActivity()
            }
            // 页面被展示

        },
        hide: function() {
            // 页面被隐藏
            this.setData({
                belssBagDialog: 0
            })
            this.data.blesslock = false
        },
        resize: function(size) {
            // 页面尺寸变化
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        showModel() {
            let data = this.data.blessData
            if (data.activity.has_join == 1 && data.activity.type == 2) {
                getMyCompletedTask(this, data.activity.id).then(() => {
                    if (this.data.completeTask.length >= data.activity.task.length) { //活动二查看福袋
                        this.setData({
                            belssBagDialog: 2
                        })
                    } else if (((app.globalData.currentLoginUserCardInfo &&
                            app.globalData.currentLoginUserCardInfo.cardId == app.globalData.cardId) || app.globalData.cardId <= 0) && data.activity.type == 2) {
                        // showTips('您是该名片的持有者，不能领取此红包，请至其他名片领取哦~~', this)
                        this.setData({
                            belssBagDialog: 1
                        })
                        return;
                    } else if (data.activity.join_card && app.globalData.cardId != data.activity.join_card.id) {
                        //showTips('您已经在' + data.activity.join_card.name+'的名片领取此红包，请至其名片做任务哦~~', this)
                        this.setData({
                            belssBagDialog: 1
                        })
                        return;
                    } else { //活动二探险
                        this.setData({
                            belssBagDialog: 3
                        })
                    }
                })
            }
            if (data.activity.has_join == 0) { //活动一活动二立即领取页面
                this.setData({
                    belssBagDialog: 1
                })
            } else if (data.activity.has_join == 1 && data.activity.type == 1) { //活动一成功
                nav({
                    url: '/bless/blessingBagReceiveSuccess/blessingBagReceiveSuccess',
                    data: {
                        activity: data.activity.id
                    }
                })
            }

        },
        onmyExplore(e) {
            this.setData({
                belssBagDialog: 3
            })
            this.data.blessData.activity.has_join = 1
        },
        onColse(e) {
            if (e) {
                this.setData({
                    belssBagDialog: e.detail
                })
            } else {
                this.setData({
                    belssBagDialog: 0
                })
            }
        },
        getOnLineActivity() {
            let param = {
                url: app.API_HOST + "packet/getOnLineActivity",
                data: {}
            }
            fetchApi(this, param).then(res => {
                let data = res.data.data
                if (Date.now() > new Date(data.activity.begin_time.replace(/-/g, "/")).getTime() && Date.now() < new Date(data.activity.end_time.replace(/-/g, "/")).getTime()) {
                    let task = data.activity.task ? JSON.parse(data.activity.task) : ''
                    task.map(x => {
                        if (x.detail.type == 3) {
                            return x.detail.count = formatDuring(x.detail.count)
                        }
                        if (x.detail.type == 2) {
                            return x.detail.count = x.detail.count + '次'
                        }
                    })
                    data.activity.task = task
                    this.setData({
                        blessData: data
                    })
                }
                if (data.activity.has_join == 1 && data.activity.type == 2) {
                    getMyCompletedTask(this, data.activity.id)
                }
                if (data.packet_tip_if_auto == 1){
                    try {
                        var value = wx.getStorageSync('packetTipIfAuto')
                        if (!value) {
                            try {
                                wx.setStorageSync('packetTipIfAuto', 'true')
                                this.showModel()
                            } catch (e) { }
                        }
                    } catch (e) {

                    }
                }
            }).catch((err) => {

            });
        }
    }
})

function getMyCompletedTask(that, id) {
    return new Promise(function(resolve, reject) {
        let param = {
            url: app.API_HOST + "packet/getMyCompletedTask",
            data: {
                activityId: id
            }
        }
        fetchApi(that, param).then(res => {
            let data = res.data.data
            let task = data.map(x => {
                return JSON.parse(x.type)
            })
            that.setData({
                completeTask: task
            })
            try {
                var value = wx.getStorageSync(task[0] + id)
                if (!value) {
                    try {
                        wx.setStorageSync(task[0] + id, 'true')
                    } catch (e) {}
                    that.setData({
                        showMessage: true,
                        count: formatDuring(data[0].detail.count)
                    })
                    setTimeout(() => {
                        that.setData({
                            showMessage: false
                        })
                    }, 1500)

                }
            } catch (e) {

            }
            resolve(res);
        }).catch((err) => {
            reject(err)
        });
    })
}