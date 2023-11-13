const app = getApp();
import { fetchApi, addActionLog } from '../../api/api.js';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        id: 5,
        data: {},
        currentTabIndex: 0,
        hasBindPhone: false,
        loadAnimationWithPageLoad: true,
        showStyle: 0,
        loadStyle: 'loading'
    },

    store: {
        pageIndex: 1,
        pageSize: 10,
        likeRequesting: false
    },

    handleValueChange(e) {
        const { value } = e.detail;
        const { index } = e.currentTarget.dataset;
        const { form_config } = this.data.data;
        form_config[index].value = value;
        this.setData({
            'data.form_config': form_config
        });
    },

    handlePickerChange(e) {
        const { value } = e.detail;
        const { index } = e.currentTarget.dataset;
        const { form_config } = this.data.data;
        const { options } = form_config[index];
        form_config[index].valueData = value;
        form_config[index].value = options[value].name;
        this.setData({
            'data.form_config': form_config
        });
    },

    handleCheckGroupClick(e) {
        const { index, itemindex } = e.currentTarget.dataset;
        const { form_config } = this.data.data;
        const { options } = form_config[index];
        const { checked } = options[itemindex];
        form_config[index].options[itemindex].checked = !checked;
        form_config[index].value = options.filter(i => i.checked).map(i => i.name).join(',');
        this.setData({
            'data.form_config': form_config
        });
    },

    handleRegionChange(e) {
        const { value } = e.detail;
        const { index } = e.currentTarget.dataset;
        const { form_config } = this.data.data;
        form_config[index].valueData = value;
        form_config[index].value = value.join(' ');
        this.setData({
            'data.form_config': form_config
        });
    },

    getFormDetail() {
        const { id } = this.data;
        const params = {
            url: 'ServiceGoods/getForm',
            data: {
                formId: id
            }
        }
        fetchApi(this, params).then(res => {
            const { data } = res.data;
            if (!data.form_config) {
                wx.showModal({
                    title: '提示',
                    content: '预约表单不存在或已删除，请联系客服！',
                    confirmColor: '#1f94fd',
                    success: _ => {
                        wx.navigateBack({
                            delta:1
                        });
                    }
                })
                return;
            }
            try {
                data.form_config = JSON.parse(data.form_config);
            } catch (err) {
                console.log('error: ', err);
            }
            this.setData({
                data,
                showStyle: 1
            });
        }).catch(err => {
            console.log('error: ', err);
            this.setData({
                showStyle: 3
            });
        })
    },

    handleSubmit() {
        const { form_config } = this.data.data;
        const notAllow = form_config.find(i => i.notEmpty && !i.value);
        if (notAllow) {
            wx.showToast({
                title: notAllow.tipText || '请完成表单填写',
                icon: 'none',
                duration: 1500
            });
            return;
        }
        const data = form_config.map(i => {
            return {
                title: i.title,
                comment: i.value
            }
        });
        this.submit(data);
    },

    submit(data) {
        const { id, service_id, service_name} = this.data;
        const params = {
            url: 'ServiceGoods/addServiceFormValues',
            data: {
                form_id: id,
                service_id,
                values: JSON.stringify(data)
            }
        }
        fetchApi(this, params).then(res => {
            wx.showToast({
                title: '预约成功',
                icon: 'success',
                duration: 1500
            });
            addActionLog(this, {
                type: 43, 
                detail: {
                    name: service_name
                }
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1
                });
            }, 1500)
        }).catch(err => {
            console.log('error: ', err);
        })
    },

    init() {
        this.getFormDetail();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const { id, service_id, service_name } = options;
        if (id && service_id) {
            this.data.id = id;
            this.data.service_id = service_id;
            this.data.service_name = service_name
            this.init();
        } else {
            wx.showModal({
                title: '提示',
                content: '参数异常，请重新尝试！',
                confirmColor: '#1f94fd',
                success: _ => {
                    wx.navigateBack({
                        delta:1
                    });
                }
            })
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
        this.init();
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
    }
})