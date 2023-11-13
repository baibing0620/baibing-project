const app = getApp();
import { fetchApi } from '../../api/api';
import { nav, setCurrentLoginUserCardInfo, showTips, showToast,deepClone } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        talkList: [],
        activeIndex:-1,
        showMyTalkToast:false,
        showStyle:0,
        edit:0,
        talkContent:'',
        disabled:false,
    isIphoneX: app.globalData.isIphoneX
    },
    dataStore:{
        talkData:[],
        pageIndex: 1,
        pageSize: 8,
        editIndx:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getMyWordsLibrary(this)
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
        if (app.globalData.refresh) {
            app.globalData.refresh = false;
            getMyWordsLibrary(this)
        }
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
        getMyWordsLibrary(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return;
        }
        this.setData({
            loadStyle: ''
        })
         getMyWordsLibrary(this,true)
    },
    showTalk() {
    
        this.setData({
            showMyTalkToast:true,
            edit: 0,
            talkContent:''
        })
    },
    show(){
        this.setData({
            showMyTalkToast: true
        })
    },
    hideTalk(){
        this.setData({
            showMyTalkToast: false
        })
    },
    addTalk(e){
        this.setData({
            disabled: true
        })
        let talkInfo = e.detail.value.talkInfo
        if (talkInfo.trim() == ''){
            this.setData({
                disabled: false
            })
            return;
        }
        let params = {
            url: app.API_HOST + 'Chat/addMyWordsLibrary',
            data: {
                content: talkInfo
            }

        };
        if(this.data.edit){
            params.url = app.API_HOST + 'Chat/updateMyWordsLibrary',
            params.data.id = this.dataStore.talkData[this.dataStore.editIndx].id
        }
        fetchApi(this, params).then(res => {
            this.hideTalk()
            let data = res.data.data
            let obj= {
                id: !this.data.edit?data: this.dataStore.talkData[this.dataStore.editIndx].id,
                content: talkInfo.length > 92 ? talkInfo.substring(0, 92) + '...' : talkInfo
            }
            if(this.data.edit){
                this.data.talkList.splice(this.dataStore.editIndx, 1, obj)
                this.dataStore.talkData.splice(this.dataStore.editIndx, 1,{
                    id: this.dataStore.talkData[this.dataStore.editIndx].id,
                    content: talkInfo
                })

            }else{
                this.data.talkList.unshift(obj)
                this.dataStore.talkData.unshift({
                    id:  data,
                    content: talkInfo
                })
            }
            this.setData({
                talkList: this.data.talkList
            })
           
            if (this.data.edit) {
                showToast('话术编辑成功', 'success')
            } else {
                showToast('话术新增成功', 'success')
            }
            this.setData({
                disabled: false
            })
        }).catch((err) => {
            console.log('error: ', err)
            this.hideTalk()
            this.setData({
                disabled: false
            })
        }); 
    },
    showText(e){
        let activeIndex = e.currentTarget.dataset.index
        this.data.talkList[activeIndex] = deepClone(this.dataStore.talkData[activeIndex]) 
        this.setData({
            talkList: this.data.talkList,
            activeIndex: activeIndex
        })
    },
    hideText(e){
        let activeIndex = e.currentTarget.dataset.index
        this.data.talkList[activeIndex].content = this.data.talkList[activeIndex].content.substring(0, 92) + '...'
        this.setData({
            talkList: this.data.talkList,
            activeIndex: -1
        })
    },
    delMyTalk(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        wx.showModal({
            title: '提醒',
            content: '确定删除该话术',
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    var params = {
                        url: app.API_HOST + 'Chat/delMyWordsLibrary',
                        data: {
                            id: id
                        }

                    };
                    fetchApi(self, params).then(res => {
                        this.data.talkList.splice(index, 1)
                        this.setData({
                            talkList: this.data.talkList
                        })
                        showToast('删除成功', 'success')
                    }).catch((err) => {

                    });
                }
            }
        })
    },
    editRule(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        this.dataStore.editIndx = index
        this.setData({
            showMyTalkToast: true,
            edit:1,
            talkContent: this.dataStore.talkData[index].content
        })

    },
    changeContent(e){
    }
})
function getMyWordsLibrary(self, isGetMore = false) {
    if (!isGetMore) {
        self.dataStore.pageIndex = 1;
    }
    let params = {
        url: app.API_HOST + 'Chat/getMyWordsLibrary',
        data: {
            pageSize: self.dataStore.pageSize,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex
        }

    };
    fetchApi(self, params).then(res => {
        if (isGetMore) { self.dataStore.pageIndex++ };
        let data = res.data.data
        let dataStore = deepClone(data)
        self.dataStore.talkData = isGetMore ? self.data.talkList.concat(dataStore) : dataStore
        let lsit = data.map(item => {
            if (item.content.length > 92) {
                item.content = item.content.substring(0, 92) + '...'
                return item
            }
            return item
        })
        self.setData({
            loadStyle: data.length < self.dataStore.pageSize ? 'loadOver' : 'loadMore',
            talkList: isGetMore ? self.data.talkList.concat(data) : data,
        })
       
        self.setData({
            showStyle: self.data.talkList.length == 0 ? 2 : 1
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3
        })
    });
}