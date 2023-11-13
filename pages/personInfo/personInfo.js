import {
    fetchApi, getPhoneNumber
} from '../../api/api.js'
import {
    nav,
    showLoading,
    showModal,
    showToast
} from '../../utils/util';
const app = getApp() 

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 1,
        avatar:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('--options',options.avatar);
        if(options.avatar){
            this.setData({
                avatar: options.avatar
            })
        }
        this.getOpenCardData()
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

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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

    },

    handleInput(e) {
        const { key, index } = e.target.dataset
        const { fieldList } = this.data 
        let newFieldList = [...fieldList]
        newFieldList[index][key] = e.detail.value
        this.setData({
            fieldList: newFieldList
        })
    },
    bindGenderPickerChange(e) {
        const { value } = e.detail
        const { index } = e.target.dataset
        const { fieldList } = this.data
        let newFieldList = [...fieldList]
        newFieldList[index].index = value
        this.setData({
            fieldList: newFieldList
        })
    },

    checkboxChange(e) {
        const { value } = e.detail
        const { index } = e.target.dataset
        var { fieldList } = this.data
        console.log(value, 'vals')
        fieldList[index].val.forEach( item => {
            console.log(item.val,'item.val')
            item.checked = value.includes(item.val)
        })
        this.setData({
            fieldList
        })

    },
    bindDateChange(e) {
        console.log(e, 'e')
        const { value } = e.detail
        const { index, key } = e.target.dataset
        const { fieldList } = this.data
        fieldList[index][key] = value
        this.setData({
            fieldList
        })
    },

    getPhoneNumber(e) {
        console.log(e, 'eee')
        getPhoneNumber(e).then(res => {
            res && this.setData({ hasBindPhone: true });
            const { key, index } = e.target.dataset
            const { fieldList } = this.data
            let newFieldList = [...fieldList]
            newFieldList[index][key] = res
            this.setData({
                fieldList: newFieldList
            })
        }).catch(err => {
            wx.showToast({
                title: err,
                icon: 'none',
                mask: true,
                duration: 1500
            })
        })
    },

    getOpenCardData() {
        fetchApi(this, {
            url: app.API_HOST +  "vipNew/getShopVipOpenCardData",
            data: {
                type: 2
            }
        }).then(res => {
            const fieldList = res.data.data.list
            fieldList.forEach(item => {
                if (item.name == '姓名') {
                    item.key = 'realname'
                } else if (item.name == '手机号码') {
                    item.key = 'mobile'
                } else if (item.name == '性别') {
                    item.key = 'gender'
                } else {
                    item.key = item.id
                }
                if (item.type == '1') {
                    item.val = item.val.split(',') 
                    item.index = item.userExtentVal && item.userExtentVal.val && (item.val.findIndex(_ => _ == item.userExtentVal.val))
                } 
                if (item.type == '2') {
                    item.val = item.userExtentVal && item.userExtentVal.val || '1995-01-01'
                } 
                if (item.type == '3') {
                    item.checked = item.userExtentVal ? item.userExtentVal.val.split(',') : []
                    item.val = item.val.split(',').map(e => {
                        return {
                            val: e,
                            checked: item.checked.includes(e ) 
                        }
                    })
                }
                item[item.key] = item.userExtentVal && item.userExtentVal.val || ''
                item.exist = !!item[item.key]
            })
            this.setData({
                fieldList,
                showStyle: 1
            })
        }).catch(err => {
            this.setData({
                showStyle: 3
            })
        }) 
    },
    save() {
        const { fieldList } = this.data
        let fieldMap = {
            extend: []
        }
        let lock = false
        for(var i = 0;i< fieldList.length; i++) {
            const e = fieldList[i]
            var need_val = ''
            if (e.type == '1' && e.key !== 'gender') {
                need_val = e.index
            } else if (e.type == '3') {
                need_val = e.val.filter(item => item.checked).map(_ => _.val).join(',')
            } else if (['gender', 'mobile', 'realname'].includes(e.key) ) {
                need_val = e.key === 'gender' ? e.index : e[e.key]
            } else {
                need_val = e[e.key]
            }
            if (e.is_need == 1 && !need_val) {
                lock = true
                showModal({
                    title: '提示',
                    showCancel: false,
                    content: e.remind || (e.type == '0' ? `请填写${e.name}` : `请选择${e.name}`)
                })
                break;
            }
        }
        if(lock) {
            return
        }
        fieldList.forEach(item => {
            // type 1 单选  val 是 index
            if (item.type == '1' && item.key !== 'gender') { 
                fieldMap.extend.push({
                    config_id: item.key,
                    val: item.val[item.index] || '',
                    exist: item.exist
                })
            } else if (item.type == '3') {
                fieldMap.extend.push({
                    config_id: item.key,
                    val: item.val.filter(e => e.checked).map(_ => _.val).join(','),
                    exist: item.exist
                })
            } 
             else if (['gender', 'mobile', 'realname'].includes(item.key)) {
                const value = item.key === 'gender' ? item.val[item.index] : item[item.key]
                fieldMap[item.key] = value
                fieldMap.extend.push({
                    config_id: item.id,
                    val: value,
                    exist: item.exist 
                })
            } else {
                fieldMap.extend.push({
                    config_id: item.id,
                    val: item[item.key],
                    exist: item.exist
                })
            }
        })
        fieldMap.extend = JSON.stringify(fieldMap.extend)
        console.log(fieldMap, '==fieldMap')
        fetchApi(this, {
            url: app.API_HOST +  "vipNew/editVipInfo",
            data: {
                ...fieldMap
            }
        }).then(res => {
            showToast('保存成功', 'success', 1500);
        })
    }
})
