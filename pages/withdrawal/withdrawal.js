const app = getApp();
import {
    fetchApi,
    getPhoneNumber
} from '../../api/api';
import {
    showTips,
    showLoading,
    hideLoading,
    nav,
    showModal
} from '../../utils/util';
import { bank } from '../../map.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        label: "",
        balance: 0,
        value: "",
        loading: true,
        showPoundage: false,
        showShareBless: false,
        title: ['名片正在开展福袋活动', '分享福袋活动赚取分享金', '福袋任务正在进行中'],
        content: ['马上参与活动领取福袋 -> 即可提现', '分享给好友 -> 共享福袋 -> 即可提现', '继续任务 -> 领取福袋 -> 即可提现'],
        btnContent: ['立即参与 >', '立即分享 >', '马上继续 >'],
        hasBindPhone: false,
        withdraw_type: '',
        withdrawOptions: [],
        withdrawtype: {
            '微信': '0',
            '支付宝': '1',
            '银行卡': '2',
        },
        withdrawIndex: 0,
        bankMapIndex: 0,
        account: ''
    },

    dataStore: {
        bless: false
    },

    // 输入
    bindInput(e) {
        // 处理金额
        let value = e.detail.value;
        this.data.value = value;
        let balanceNow = parseFloat(this.data.balance || 0) - parseFloat(value || 0);
        this.setData({
            balanceNow: balanceNow > 0 ? balanceNow.toFixed(2) : 0,
            inputValue: parseFloat(value || 0)
        });
        if (value === "00") {
            return "0"
        };
        if (value === ".") {
            return "0."
        };
        if (parseFloat(value) > this.data.balance) {
            // return this.data.balance
            value = this.data.balance
            this.setData({
                value: this.data.balance
            });
        };
        let arr = value.split(".");
        if (arr.length <= 2) {
            let bool = arr[1] ? arr[1].length > 2 : false;
            if (bool) {
                arr[1] = arr[1].substring(0, 2);
                return arr.join(".");
            }
        } else {
            return arr.slice(0, 2).join(".");
        }
        if (parseFloat(value) > 0 && parseFloat(value) <= parseFloat(this.data.balance) && parseFloat(value) >= parseFloat(this.data.withdraw_cash_limit_money)) {
            this.setData({
                loading: false,
            })
        }
        else {
            this.setData({
                loading: true
            })
        }
    },
    // 全部提现
    bindAll() {
        let loading = true;
        if (parseFloat(this.data.balance) >= parseFloat(this.data.withdraw_cash_limit_money)) {
            loading = false
        };
        this.setData({
            value: this.data.balance,
            loading: loading
        })
    },

    // picker选择打款方式
    bindWayChange(e) {
        console.log(e ,'ee')
        this.setData({
            account: '',
            withdrawIndex: e.detail.value
        })
    },

    bindBankChange(e) {
        this.setData({
            bankMapIndex: e.detail.value
        })
    },
    bindAccountChange(e) {
        this.setData({
            account: e.detail.value
        })
    },

    // 提交表单
    bindSubmit() {
        if (this.data.withdraw_type == 1) {
            // wx.showModal({
            //     title: '提醒',
            //     content: '目前，商户暂未通过腾讯付款至零钱能力的审核，请与员工联系，进行提现金额的结算',
            //     showCancel: false,
            //     success: (res) => {
            //         if (res.confirm) {
                    
            //         }
            //     },
            // })
            if (!this.data.loading) {
                this.setData({
                    loading: true
                });
                let money = this.data.value;
                if (money.substr(money.length - 1, 1) === ".") {
                    money = money.substring(0, money.length - 1);
                }
                if(this.data.account == '') {
                    showTips( this.data.withdrawOptions[this.data.withdrawIndex].name + "号不能为空");
                    return
                }
                let patrn = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
                if (patrn.exec(money) && parseFloat(money) > 0 && parseFloat(money) <= parseFloat(this.data.balance)) {
                    if (money >= parseFloat(this.data.withdraw_cash_limit_money)) {
                        this.withdraw(money);
                    } else {
                        this.setData({
                            loading: false
                        });
                        showTips("小于最小金额");
                    }
                } else {
                    this.setData({
                        loading: false
                    });
                    showTips("请检查提现金额");
                }
            }
        } else {
            if (!this.data.loading) {
                this.setData({
                    loading: true
                });
                let money = this.data.value;
                if (money.substr(money.length - 1, 1) === ".") {
                    money = money.substring(0, money.length - 1);
                }
                let patrn = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
                if (patrn.exec(money) && parseFloat(money) > 0 && parseFloat(money) <= parseFloat(this.data.balance)) {
                    if (money >= parseFloat(this.data.withdraw_cash_limit_money)) {
                        this.withdraw(money);
                    } else {
                        this.setData({
                            loading: false
                        });
                        showTips("小于最小金额");
                    }
                } else {
                    this.setData({
                        loading: false
                    });
                    showTips("请检查提现金额");
                }
            }
        }

    },

    // 发起提现请求
    withdraw(money) {
        const { label } = this.data.withdrawOptions[this.data.withdrawIndex]
        let params = {
            url: app.API_HOST + "UserWallet/addWithdraw",
            data: {
                price: money,
                withdraw_meth: this.data.withdraw_type == 1 ?  label : '',
                account: JSON.stringify({ account: this.data.account, bank: label == 3 ? this.data.bankMap[this.data.bankMapIndex] : '' })
            }
        }
        fetchApi(this, params).then(res => {
            wx.showToast({
                title: '申请成功',
                icon: 'success',
                duration: 1500,
                mask: true,
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1
                });
            }, 1500)
        }).catch(err => {
            this.setData({
                loading: false
            });
        });
    },

    // 手续费
    showPoundage() {
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.init();
    },

    init() {
        Promise.all([this.getWithdrawConfig(), this.getWallet()]).then(res => {
            //全部金额小于可提现金额
            getOnLineActivity(this, res[1], res[0])
        })

        this.showPoundage();
        if (app.globalData.currentLoginUserCardInfo.mobile) {
            this.setData({
                hasBindPhone: true
            });
        }
        var params = {
            url: app.API_HOST + 'config/get',
            data: {}
        };
        fetchApi(this, params).then(res => {
            this.setData({
                withdraw_type: res.data.data.withdraw_type
            })
        }).catch(err => {

        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.init();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: `邀您一起领名片福袋，快快来拆`,
            imageUrl: 'https://facing-1256908372.file.myqcloud.com//image/20180921/ccd09cdc7220c895.jpg',
            path: `/pages/home/home?cardId=${app.globalData.cardId}&beid=${app.globalData.beid}&fromUser=${app.globalData.uid}`,
        }
    },

    navBless() {
        nav({
            url: "/pages/home/home"
        })
        app.globalData.showBless = !app.globalData.showBless
    },

    getWallet() {
        return new Promise((resolve, reject) => {
            showLoading();
            let params = {
                url: app.API_HOST + "UserWallet/getWallet"
            }

            fetchApi(this, params).then(res => {
                let balance = parseFloat(res.data.data.balance.card_remaining).toFixed(2);
                this.setData({
                    balance: balance || 0,
                })
                resolve(balance);
            }).catch(err => {
                console.log("err")
                reject(err);
            });
        })
    },

    getWithdrawConfig() {
        return new Promise((resolve, reject) => {
            let param = {
                url: app.API_HOST + "userWallet/getWithdrawConfig",
                data: {}
            }

            fetchApi(this, param).then(res => {
                let data = res.data.data
                let limit = JSON.parse(data.withdraw_time_limit)
                switch (limit.unit) {
                    case 'day':
                        limit.unit = '日'
                        break;
                    case 'week':
                        limit.unit = '周'
                        break;
                    case 'month':
                        limit.unit = '月'
                        break;
                    case 'year':
                        limit.unit = '年'
                        break;
                }

                var withdrawtype = (data.withdraw_meth || '1').split(',')
                withdrawtype.includes('1') && this.data.withdrawOptions.push({ name: '微信', label: '1'} )
                withdrawtype.includes('2') && this.data.withdrawOptions.push({ name: '支付宝', label: '2' })
                withdrawtype.includes('3') && this.data.withdrawOptions.push({ name: '银行卡', label: '3' })
                this.setData({
                    withdraw_cash_limit_money: data.withdraw_limit,
                    withdraw_cash_poundage: data.withdraw_poundage,
                    withdraw_need_check_time: data.withdraw_need_check_time,
                    withdraw_time_limit: limit,
                    label: data.open_remit == 1 ? '提现至微信零钱' : '线下打款方式',
                    withdrawOptions: this.data.withdrawOptions,
                    bankMap: bank
                })
                resolve(res.data.data);
            }).catch((err) => {
                reject(err);
            });
        })
    },

    getPhoneNumber(e) {
        getPhoneNumber(e).then(phoneNumber => {
            if (phoneNumber!='') {
              this.setData({
                  hasBindPhone: true
              })
            } else {
            }
            this.bindSubmit()
          }).catch(err => {
            showTips('手机号获取失败', this)
            this.bindSubmit()
          })
    },

})

function getOnLineActivity(that, balance, withdraw) {
    let param = {
        url: app.API_HOST + "packet/getOnLineActivity",
        data: {}
    }
    fetchApi(that, param).then(res => {
        let data = res.data.data
        let task = data.activity.task ? JSON.parse(data.activity.task) : ''
        data.activity.task = task
        if (parseFloat(balance) < parseFloat(withdraw.withdraw_limit)) {
            that.setData({
                showShareBless: true,
                value: '余额不足',
                inputDisabled: true
            })
        }
        if (data.activity.has_join == 0) { //活动一二立即参与领取福袋
            that.setData({
                type: 0
            })
        } else if (data.activity.has_join == 1 && data.activity.type == 1) { //活动一立即分享
            that.setData({
                type: 1
            })
        } else if (data.activity.has_join == 1 && data.activity.type == 2) {
            getMyCompletedTask(that, data.activity.id).then(() => {
                if (that.data.completeTask.length >= data.activity.task.length) { //活动二立即分享
                    that.setData({
                        type: 1
                    })
                } else { //活动二继续探险
                    that.setData({
                        type: 2
                    })
                }
            })
        }
    }).catch((err) => {

    });

}

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