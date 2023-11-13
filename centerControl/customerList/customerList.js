const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    nav,
    makePhoneCall,
    showToast,
    showActionSheet
} from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        customerList: [],
        diyConfig: app.extConfig,
        is_open_credit: false,
        keywords:'',
        statusList: [{
            user_status: '全部',
            status_id: 0
        }],
        statusIndex:0,
        typeIndex:0,
        typeList: [{ title: '最新互动', status: 0 }, { title: '最多互动', status: 1}],
        showStyle: 0,
        loadStyle: 'loadMore',
        orderType:'',
        giveModel:false,
        customerStatusIndex: 0,
        isShowTextareaDialog: false
    },
    dataStore: {
        pageSize: 10,
        pageIndex: 1,
        customer:'',
        clickIndex:'',
        publicInformation: {
            crm_id: '',	
            crm_uid: '',
        },
        lock:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.data.cardId = options.cardId || 0;
        this.data.uid = options.uid || 0;
        this.setData({
            isAdmin: !this.data.cardId
        });
        getData(this);
        this.getRootSetting()
        this.getShopCreditSetting()
        this.getUserStatus()
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
        app.showRemind(this);
        if(this.dataStore.customer){
            this.getUserInfo()
        }
        //getData(this);
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
        getData(this);
        this.getRootSetting()
        this.getShopCreditSetting()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
        getData(this, true);
    },
    getShopCreditSetting() {
        fetchApi(this, {
            url: "config/get",
            data: {}
        }).then(res => this.setData({
            is_open_credit: res.data.data.is_open_credit == 1
        }))
    },
    search(e){
        getData(this);
    },
    bindKeywords(e){
        this.data.keywords = e.detail.value;
    },
    changeType(){
        var itemList = this.data.typeList.map(item => {
            return item.title
        })
        var self = this;
        wx.showActionSheet({
            itemList: itemList,
            success: function (res) {
                self.dataStore.pageIndex = 1;
                self.setData({
                    typeIndex: parseInt(res.tapIndex),
                    orderType:''
                });
                getData(self);
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
    },
    changeStatus(){
        var itemList = this.data.statusList.map(item=>{
            return item.title
        })
        var self = this;
        wx.showActionSheet({
            itemList: itemList,
            success: function (res) {
            self.setData({
                statusIndex : parseInt(res.tapIndex)
            });
                getData(self);
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
    },
    changeRate(){
        this.dataStore.pageIndex = 1;
        this.setData({
            orderType: this.data.orderType == 'desc' ? 'asc' : 'desc',
            typeIndex:0
        })
        getData(this);
    },
    toDetail(e){
        var index = parseInt(e.currentTarget.dataset.index);
        var customer = this.data.customerList[index];
        this.dataStore.customer = customer;
        this.dataStore.clickIndex = index;
        let params = {
            url:'/pages/clueDetail/clueDetail',
            data:{
                crmId: customer.id,
                crmUid: customer.uid,
                admin_uid: this.data.uid,
                percent: customer.cooperRate
            }
        }
        let cardId = parseInt(this.data.cardId || 0);
        if (cardId) params.data.cardId = cardId;
        nav(params);
    },
    makeCall(e){
        makePhoneCall(e.currentTarget.dataset.number)
    },
    toChat(e) {
        let data = e.currentTarget.dataset.item
        let index = e.currentTarget.dataset.index
        this.data.customerList[index].unReadMsgCount_count = 0
        this.setData({
            customerList: this.data.customerList
        });

        nav({
            url: '/pages/chat/chat',
            data: {
                toUid: data.uid,
                toUserName: data.name || data.member.nickname
            }
        });
    },
    getUserInfo() {
        let params = {
            url: app.API_HOST + "crmUser/getCrmUserInfo",
            data: {
                crm_id: this.dataStore.customer.id
            }
        }
        fetchApi(this, params).then(res => {
            this.data.customerList[this.dataStore.clickIndex] = res.data.data
            this.setData({
                customerList: this.data.customerList
            })
        }).catch(res => {
            console.log(res);
        })
    },
    presentationPoints(e){
        this.setData({
            giveModel: true
        })
        this.dataStore.toUserId = e.currentTarget.dataset.uid
    },
    closeModel() {
        this.setData({
            giveModel: false
        })
    },
    onGetvalue(e) {
        let value = e.detail
        if (this.dataStore.lock) return;
        this.dataStore.lock = true
        if (value.trim() == '') {
            showTips('请输入转赠积分', this)
            return;
        }
        let param = {
            url: app.API_HOST + 'userCredit/giftUserCreditByCard',
            data: {
                credit: value,
                toUserId: this.dataStore.toUserId
            }
        }
        fetchApi(this, param).then(res => {
            showToast('赠送积分成功', 'success')
            this.closeModel()
            this.dataStore.lock = false
        
        }).catch(err => { this.dataStore.lock = false })
    
    },
    getRootSetting() {
        let param = {
            url: app.API_HOST + 'card/getCardInfo',
            data: {
                cardId: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data
            this.setData({
                privilege: data.privilege || ''
            })
        })
    },
    getUserStatus() {
        let params = {
            url: app.API_HOST + "CrmUser/getUserStatus",
        }
        fetchApi(this, params).then(res => {
            let statusList = this.data.statusList.concat(res.data.data)
            this.setData({
                statusList: statusList,
            })
            // console.log(this.data.statusList)
        }).catch(res => {
            console.log(res);
        })
    },
    bindPickerChange(e) {
        // console.log(e.detail.value)
        this.setData({
            customerStatusIndex: e.detail.value
        })
        var self = this;
        getData(self);
    },

    handleCloseTextareaDialog() {
        this.setData({
            isShowTextareaDialog: false
        })
    },

    handleShowTextareaDialog(data) {
        const { id: crm_id, uid: crm_uid } = data
        Object.assign(this.dataStore.publicInformation, {
            crm_id,
            crm_uid
        })
        this.setData({
            isShowTextareaDialog: true
        })
    },

    addPublicInformation(e) {
        const { value: content } = e.detail
        const { crm_id, crm_uid } = this.dataStore.publicInformation
        fetchApi(this, {
            url: 'CrmUser/addPublicInformation',
            data: {
                crm_id,
                crm_uid,
                content
            }
        }).then(_ => {
            showToast('添加成功', 'none')
        })
        this.handleCloseTextareaDialog()
    },

    handleOpenMenu(e) {
        const { dataset } = e.currentTarget
        const menuConfig = [
            { label: '添加信息', func: this.handleShowTextareaDialog }
        ]
        showActionSheet({
            itemList: menuConfig.map(e => e.label)
        }).then(e => {
            menuConfig[e.tapIndex].func(dataset)
        })
    }
})

function getData(self, isGetMore = false) {
    var customerList = self.data.customerList,
    statusList = self.data.statusList,
    typeList = self.data.typeList,
    customerStatusIndex = parseInt(self.data.customerStatusIndex) ,
    typeIndex = parseInt(self.data.typeIndex) ;
    if (!isGetMore){
        self.dataStore.pageIndex =1;
    }
    let param = {
        url: 'crmUser/getCrmUserList',
        data: {
            card_id: self.data.cardId || app.globalData.cardId,
            pageSize: self.dataStore.pageSize,
            interact: typeList[typeIndex].status,
            nickname: self.data.keywords,
            status: statusList[customerStatusIndex].status_id,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
            cooper_order: self.data.orderType
        }
    };
    fetchApi(self, param).then((res) => {
        if (isGetMore) {
            self.dataStore.pageIndex++
        }
        let data = res.data.data.info;
        self.setData({
            loadStyle: data.length < self.dataStore.pageSize ? 'loadOver' : 'loadMore',
            customerList: isGetMore ? self.data.customerList.concat(data) : data,
            total: res.data.data.total
        })
        self.setData({
            showStyle: self.data.customerList.length == 0 ? 2 : 1
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });

};
