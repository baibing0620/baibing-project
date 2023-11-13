const app = getApp();
import {
    fetchApi,
    getGlobalConfig
} from '../../api/api';
import {
    showTips,
    showToast,
    nav
} from '../../utils/util';
Page({
 
    /**
     * 页面的初始数据
     */
    data: {
        themeColor: app.extConfig.themeColor,
        array: ['未知', '18岁以下', '18~30岁', '31~50岁', '51~70岁', '70岁以上'],
        sexArray: ['保密', '男', '女'],
        tag: [],
        customData: {
            card_id: '',
            disabled: false
        },
        index: '',
        sexIndex: '',
        pressIndex: 0,
        region: [],

    },
    dataStore: {
        crmId: '',
        lock:false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.dataStore.crmId = options.crmId
        getStaffFuncManageSetting(this)
        getCrmData(this)
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
        app.showRemind(this);
        if (this.dataStore.lock) {
             getTagData(this)
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
      this.dataStore.lock = true
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        getStaffFuncManageSetting(this)
        getCrmData(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    bindBirthdayChange(e) {
        this.setData({
            birthday: e.detail.value
        })
    },
    bindPickerChange(e) {
        this.setData({
            index: e.detail.value
        })
    },
    bindSexChange(e) {
        this.setData({
            sexIndex: e.detail.value
        })
    },
    bindRegionChange: function (e) {
        this.setData({
            region: e.detail.value
        })
    },
    addTag(e) {
        if (!e.detail.value) {
            return;
        }
        if (this.data.tag) {
            if (this.data.tag.indexOf(e.detail.value) != -1) {
                showTips("客户有过此标签啦，重新换一个吧", this);
                return;
            }
        }
        let param = {
            url: `crmUser/addCrmUserTag`,
            data: {
                crm_id: this.dataStore.crmId,
                tag: e.detail.value
            }
        }
        fetchApi(this, param).then(res => {
            this.data.tag.push(e.detail.value)
            this.setData({
                addTag: '',
                tag: this.data.tag
            })
        }).catch(err => {
            console.log(err)
        })
    },
    navTag() {
        nav({
            url: '/centerControl/systemTags/systemTags',
            data: {
                crmId: this.dataStore.crmId
            }
        })
    },
    forbiddenChange() {
        if (!this.data.customData.disabled) {
            this.setData({
                'customData.disabled': false
            })
            wx.showModal({
                title: '提示',
                content: '开启后，用户将会被禁止进入该名片，同时不会收到该名片的各类通知~',
                confirmText: '立即禁用',
                success: (res) => {
                    if (res.confirm) {
                        this.disabledCrmUserOrNotById(1).then(()=>{
                            this.setData({
                                'customData.disabled': true
                            })
                        })
                    } else if (res.cancel) {

                    }
                }
            })
        } else {
            this.disabledCrmUserOrNotById(0).then(()=>{
                this.setData({
                    'customData.disabled': false
                })
            })
        }

    },
    formSubmit(e) {
        let value = e.detail.value
        let regx = /^1[3-9]\d{9}$/;
        if (value.phone != '' && !regx.test(value.phone.trim())) {
            showTips("手机号验证失败", this);
            return;
        }
        let param = {
            url: `crmUser/saveCrmUserInfo`,
            data: {
                name: value.customerName,
                company: value.company,
                phone: value.phone.trim(),
                email: value.email,
                remark: value.remark,
                age: value.age,
                crm_id: this.dataStore.crmId,
                city: value.city,
                gender: value.gender,
                birthday: value.birthday
            }
        }
        fetchApi(this, param).then(res => {
            showToast('编辑成功', 'success')
            //getCrmData(this)
            app.globalData.refresh = true;
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
        }).catch(err => {
            console.log(err)
        })
    },
    disabledCrmUserOrNotById(disabled) {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "CrmUser/disabledCrmUserOrNotById",
                data: {
                    crmId: this.dataStore.crmId,
                    disabled: disabled
                }
            }
            fetchApi(self, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    },
})

function getCrmData(self) {
    let param = {
        url: `crmUser/getCrmUserInfo`,
        data: {
            crm_id: self.dataStore.crmId,
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data
        data.disabled = data.disabled == 1 ? true : false
        self.setData({
            customData: data,
            index: data.age,
            sexIndex: data.gender,
            birthday: data.birthday,
            region: data.city.join(","),
            tag: data.tag ? JSON.parse(data.tag) : [],
        })
    }).catch(err => {
        console.log(err)
    })
}
function getTagData(self) {
    let param = {
        url: `crmUser/getCrmUserInfo`,
        data: {
            crm_id: self.dataStore.crmId,
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data
        data.disabled = data.disabled == 1 ? true : false
        self.setData({
            'customData.tags': data.tags,
        })
    }).catch(err => {
        console.log(err)
    })
}
function getStaffFuncManageSetting(self) {
    let params = {
        url: app.API_HOST + "config/getStaffFuncManageSetting",
        data: {}
    }
    fetchApi(self, params).then(res => {
        self.setData({
            crmlimit: res.data.data.crm_limit_open
        })
    }).catch(res => {

    })
}