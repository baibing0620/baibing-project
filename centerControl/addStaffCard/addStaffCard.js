const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
    showTips,
    showToast,
    nav
} from '../../utils/util';
import { messagePath } from '../../map'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pushTag: [],
        index: -1,
        number:0,
        staffId:''
    },
    dataStore:{
        edit:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.edit){
            this.setData({
                hideNumber:true
            })
            this.dataStore.edit = true
            wx.setNavigationBarTitle({
                title: '编辑员工信息',
            })
        }
        if(options.staffId){
            this.data.staffId = options.staffId
        }
        this.init()
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
        this.init()
    },
    init(){
        this.getDepartmentInfo()
        if(!this.data.hideNumber){
            this.getCanUseCardCount()
        }
    
       
    },
    openCard(e) {
        let value = e.detail.value
        let params={}
        if (value.name == ''){
            showTips('请输入姓名', this)
            return;
        } else if (this.data.index == -1) {
            showTips('请选择部门', this)
            return;
        } else if (value.position == '') {
            showTips('请输入职位', this)
            return;
        } else if (value.mobile == '') {
            showTips('请输入手机号', this)
            return;
        }
        if (this.dataStore.edit){
            params = {
                url: app.API_HOST + "CardManage/editStaff",
                data: {
                    ...value,
                    departmentId: this.data.pushTag[this.data.index].id,
                    staffId:this.data.staffId
                }
            }
        }else{
            params = {
                url: app.API_HOST + "CardManage/addStaff",
                data: {
                    ...value,
                    departmentId: this.data.pushTag[this.data.index].id
                }
            }
        }
        fetchApi(this, params).then(res => {
            showToast(`${this.dataStore.edit ? '编辑成功' : '开通成功'}`, 'success')
            app.globalData.refresh = true;
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
        }).catch(res => {

        })
    },
    bindPickerChange(e) {
        let value = e.detail.value
        this.setData({
            index: value
        })
    },
    getDepartmentInfo(){
        let params = {
            url: app.API_HOST + "CardManage/getDepartmentInfo",
            data: {
                
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data.map(item=>{
                return {id:item.id,name:item.name}
            })
           this.setData({
               pushTag:data
           })
           if (this.data.staffId) {
              this.getStaffInfo()
           }
        }).catch(res => {

        })
    },
    getCanUseCardCount(){
        const param = {
            url: app.API_HOST + "cardManage/getCanUseCardCount",
            data: {}
        }
        fetchApi(this, param).then(res => {
            this.setData({
                number: res.data.data
            })
        }).catch(err => {

        })
    },
    getStaffInfo(){
        let param = {
            url: app.API_HOST + "cardManage/getStaffInfo",
            data: {
                staff_id: this.data.staffId,
            }
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data
            let departmentIndex = this.data.pushTag.findIndex(item=>{
                return item.id == data.departmentInfo.id
            })
            this.setData({
                ...data,
                index:departmentIndex
            })
        }).catch((err) => {

        });
    }
})

