const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite, getNDay } from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        extConfig: app.extConfig,
        EnterpriseList:[],
        myList:[]

    },
    dataStore: {
        from: '',
        getAllTalk: []

    },
    select(e) {
        let selectIndex = parseInt(e.currentTarget.dataset.index); 
        let idx = parseInt(e.currentTarget.dataset.idx); 
        let type = parseInt(e.currentTarget.dataset.type);
        let myList = this.data.myList;
        let EnterpriseList = this.data.EnterpriseList;
        if (type == 1){
            myList.library[selectIndex].selected = !myList.library[selectIndex].selected
            this.setData({
                myList: myList
            })
            if (myList.library[selectIndex].selected) {
                this.dataStore.getAllTalk.push({
                    from_user: app.globalData.uid,
                    sending: true,
                    selected: myList.library[selectIndex].selected,
                    content: {
                        type: "text",
                        id: myList.library[selectIndex].id,
                        content: myList.library[selectIndex].content
                    }
                })
            }
            this.dataStore.getAllTalk.forEach((item,index)=>{
                if (item.content.id == myList.library[selectIndex].id && item.selected != myList.library[selectIndex].selected){
                    this.dataStore.getAllTalk.splice(index,1)
                }
            })
        }else{
            EnterpriseList[idx].library[selectIndex].selected = !EnterpriseList[idx].library[selectIndex].selected
            this.setData({
                EnterpriseList: EnterpriseList
            })
            if (EnterpriseList[idx].library[selectIndex].selected) {
                this.dataStore.getAllTalk.push({
                    from_user: app.globalData.uid,
                    sending: true,
                    selected: EnterpriseList[idx].library[selectIndex].selected,
                    content: {
                        type: "text",
                        id: EnterpriseList[idx].library[selectIndex].id,
                        content: EnterpriseList[idx].library[selectIndex].content
                    }
                })
            }
            this.dataStore.getAllTalk.forEach((item, index) => {
                if (item.content.id == EnterpriseList[idx].library[selectIndex].id && item.selected != EnterpriseList[idx].library[selectIndex].selected) {
                    this.dataStore.getAllTalk.splice(index, 1)
                }
            })
        }
    },

    getList() {
        let params = {
            url: app.API_HOST + "Chat/getWordsLibraryOnUse",
            data: {}
        }
        fetchApi(this, params).then(res => {
            this.setData({
                showStyle: 1
            })
            let data = res.data.data
            data.forEach(item=>{

            })
            this.setData({
                myList : data[0]
            })
            data.shift()
            this.setData({
                EnterpriseList:data
            })
        }).catch(res => {
            this.setData({
                showStyle: 3
            })
        });
    },
    
    // bindInput(e) {
    //     this.data.value = e.detail.value;
    // },

    // search() {
    //     this.data.name = this.data.value.replace(/^\s+|\s+$/g, '');
    //     this.data.name ? this.data.searchType = 1 : this.data.searchType = 0;
    //     this.data.list = [];
    //     this.pageIndex = 1;
    //     this.getList();
    // },

    confirm() {
        app.globalData.transData_chat = this.dataStore.getAllTalk
        app.globalData.transData_chat.formSelect = 'talkLibrary'
        wx.navigateBack({
            delta: 1,
        });
    },
    navAddMyTalk(){
        nav({
            url:'/centerControl/myTalkLibrary/myTalkLibrary'
        })
    },
    init() {
        this.setData({
            value: "",
        });
        this.data.name = "";
        this.pageIndex = 1;
        this.getList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.from == 'messagePush') {
            this.dataStore.from = options.from
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
        this.init();
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
        if (this.data.hasMore) {
            this.data.pageIndex ++;
            this.getList();
        }
    }
})