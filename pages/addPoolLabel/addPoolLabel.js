const app = getApp();
import {
    fetchApi,
    getGlobalConfig
} from '../../api/api';
import {
    showTips,
    showToast,
    deepClone
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tagList: [],
        myTag: [],
        _myTag: [],
        tagList1:[],
        tagList2:[],
        pressIndex: 0,
        num:0,
        showInput: false,
        disabled:false,
        isIphoneX: app.globalData.isIphoneX,
        label_ids: [],
        mylabel_ids: [],
    },
    dataStore: {
        crmUid: 0,
        tag_id: [],
        tags: [],
        tagList: [],
        myTag: [],
        messageTag:[],
        mymessageTag:[],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            options
        });
        this.init();
    },

    init() {
        const {options} = this.data;
        this.dataStore.crmUid = options.crmId || 0
        this.dataStore.tag_id = JSON.parse(options.tag_id) || []
        //推送消息标签
        if (options.message == 'push') {
            getMessageTags(this)
            if(app.globalData.messagePushTag.length !=0){
                getUserCount(this)
            }
            this.setData({
                push: true
            })
        } else {
            //客户标签
            getTagData(this)
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

    },
    showDeleteTag(e) {
        if (this.data.push) {
            return
        }
        this.setData({
            pressIndex: !this.data.pressIndex ? 1 : 0
        })
    },
    addTag(e) {
        if (!e.detail.value) {
            return;
        }
        if (this.data.myTag) {
            for (let i in this.data.myTag) {
                if (this.data.myTag[i].name == e.detail.value) {
                    showTips("客户有过此标签啦，重新换一个吧", this);
                    return;
                }
            }
        }
        let param = {
            url: `ExternalCustom/addCardTag`,
            data: {
                tag_name: e.detail.value,
                card_id: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            console.log(res)
            let id = res.data.data.id
            let tag = {
                id: id,
                crm_user_tag_id: 0,
                flag: 1,
                name: e.detail.value,
                is_select: 0,
                type: 0
            }
            this.data.myTag.push(tag)
            // this.dataStore.myTag[id] = deepClone(tag) 
            this.setData({
                addTag: '',
                showInput: false,
                myTag: this.data.myTag
            })
        }).catch(err => {
            console.log(err)
        })
    },
    deleteTag(e) {
        let delTag = e.currentTarget.dataset.tagid
        let index = e.currentTarget.dataset.index
        let param = {
            url: `ExternalCustom/delCardTag`,
            data: {
                tag_id: delTag,
                card_id: app.globalData.cardId,
            }
        }
        fetchApi(this, param).then(res => {
            // delete this.data.myTag[delTag]
            this.data.myTag.splice(index,1)
            this.setData({
                myTag: this.data.myTag
            })
            app.globalData.refresh = true;
        }).catch(err => {
            console.log(err)
        })
    },
    tagActive(e) {
        this.dataStore.messageTag = []
        let item = e.currentTarget.dataset.item
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        this.data.label_ids.indexOf(id)==-1?this.data.label_ids.push(id):this.data.label_ids.splice(index,1)
        this.data.tagList1.map((item1,i)=>{
            if (item.name == this.data.tagList1[i].name) {
                this.data.tagList1[i].is_select = this.data.tagList1[i].is_select ? 0 : 1
            }
            this.dataStore.messageTag.push(this.data.tagList1[i])
        })
        this.setData({
            tagList1: this.data.tagList1,
            label_ids: this.data.label_ids,
        })
        if (this.data.push) {
            getUserCount(this)
        }
    },
    myTagActive(e) {
        this.dataStore.mymessageTag = []
        let item = e.currentTarget.dataset.item
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        this.data.mylabel_ids.indexOf(id)==-1?this.data.mylabel_ids.push(id):this.data.mylabel_ids.splice(index,1)
        for (let i in this.data.myTag) {
            if (item.name == this.data.myTag[i].name) {
                this.data.myTag[i].is_select = this.data.myTag[i].is_select ? 0 : 1
            }
            this.dataStore.mymessageTag.push(this.data.myTag[i])
        }
        this.setData({
            myTag: this.data.myTag,
            mylabel_ids: this.data.mylabel_ids,
        })
        if (this.data.push) {
           getUserCount(this)
        }
    },
    saveTag() {
        this.setData({
            disabled:true
        })
        this.dataStore.tags = []
        //比对标签是否发生变化
        // for (let i in this.data.tagList) {
        //     for (let j in this.data.tagList[i]) {
        //         if (this.data.tagList[i][j].is_select != this.dataStore.tagList[i][j].is_select) {
        //             this.dataStore.tags.push(this.data.tagList[i][j])
        //         }
        //     }
        // }
        // for (let i in this.data.myTag) {
        //     if (this.data.myTag[i].is_select != this.dataStore.myTag[i].is_select) {
        //         this.dataStore.tags.push(this.data.myTag[i])
        //     }
        // }
        if (this.data.push) {
            for (let i in this.dataStore.tags) {
                if (this.dataStore.tags[i].is_select == 1){
                    app.globalData.messagePushTag.push(this.dataStore.tags[i])
                }
                for (let j in app.globalData.messagePushTag) {
                    if (this.dataStore.tags[i].is_select != app.globalData.messagePushTag[j].is_select && app.globalData.messagePushTag[j].id == this.dataStore.tags[i].id && app.globalData.messagePushTag[j].type == this.dataStore.tags[i].type ) {
                        app.globalData.messagePushTag.splice(parseInt(j),1)
                    }
                }
            }
            app.globalData.refresh = true
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
            return;
        }
        let tag_ids = this.data.label_ids.concat(this.data.mylabel_ids); 
        console.log(tag_ids)
        let param = {
            url: `ExternalCustom/tagging`,
            data: {
                tag_ids: tag_ids.toString()||'0',
                t_uid: this.dataStore.crmUid,
                card_id: app.globalData.cardId
            }
        }
        fetchApi(this, param).then(res => {
            showToast('保存成功', 'success')
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
        }).catch(err => {
            console.log(err)
        })
    },
    hideDeleteTag() {
        this.setData({
            pressIndex: 0
        })
    },
    addNewTag() {
        this.setData({
            showInput: true
        })
    }
})
function getTagData(that) {
    let param = {
        // url: `crmUser/getCrmUserTagWithMap`,
        url: `ExternalCustom/showCardTag`,
        data: {
          card_id: app.globalData.cardId
        }
    }
    fetchApi(that, param).then(res => {
        // let commData = res.data.data
        // let _myTag = commData[0] instanceof Array ? {} : commData[0]   //我的标签无数据时后台返回[]，将其转化为{}
        // that.data.myTag = _myTag
        // that.dataStore.myTag = deepClone(_myTag)
        // delete commData[0]
        // that.data.tagList = commData
        // that.dataStore.tagList = deepClone(commData)
        that.setData({
            myTag: res.data.data[1],
            _myTag: res.data.data[1],
            tagList1: res.data.data[0],
            tagList2: res.data.data[1],
        })
        that.dataStore.tag_id.map((item,index)=>{
            that.data.myTag.map((e,i)=>{
                if(item==e.id){
                    that.data.mylabel_ids.push(e.id)
                    e.is_select=1
                }
            })
        })
        that.dataStore.tag_id.map((item,index)=>{
            that.data.tagList1.map((e,i)=>{
                if(item==e.id){
                    that.data.label_ids.push(e.id)
                    e.is_select=1
                }
            })
        })
        that.setData({
            myTag: that.data.myTag,
            _myTag: that.data.myTag,
            tagList1: that.data.tagList1,
            tagList2: that.data.tagList1,
            mylabel_ids: that.data.mylabel_ids,
            label_ids: that.data.label_ids,
        })
    }).catch(err => {
        console.log(err)
    })
}
function getMessageTags(that) {
    let param = {
        url: `msgPush/getTags`,
        data: {

        }
    }
    // fetchApi(that, param).then(res => {
    //     let commData = res.data.data
    //     that.data.myTag = commData[0]
    //     delete commData[0]
    //     that.data.tagList = commData
    //     if (app.globalData.messagePushTag) {
    //         for (let key in app.globalData.messagePushTag) {
    //             for (let i in that.data.tagList) {
    //                 for (let j in that.data.tagList[i]) {
    //                     if (that.data.tagList[i][j].id == app.globalData.messagePushTag[key].id && that.data.tagList[i][j].type == app.globalData.messagePushTag[key].type) {
    //                         that.data.tagList[i][j].is_select = app.globalData.messagePushTag[key].is_select
    //                     }
    //                 }
    //             }
    //             for (let i in that.data.myTag) {
    //                 if (that.data.myTag[i].id == app.globalData.messagePushTag[key].id && that.data.myTag[i].type == app.globalData.messagePushTag[key].type) {
    //                     that.data.myTag[i].is_select = app.globalData.messagePushTag[key].is_select
    //                 }
    //             }
    //         }
    //     }
    //     that.dataStore.myTag = deepClone(that.data.myTag)
    //     that.dataStore.tagList = deepClone(commData)
    //     that.setData({
    //         myTag: that.data.myTag,
    //         tagList: that.data.tagList
    //     })
    // }).catch(err => {
    //     console.log(err)
    // })
}

function getUserCount(self) {

    let param = {
        url: `msgPush/getUserCount`,
        data: {
            tags: self.dataStore.messageTag.concat(self.dataStore.mymessageTag).length != 0 ? self.dataStore.messageTag.concat(self.dataStore.mymessageTag): app.globalData.messagePushTag
        }
    }
    // fetchApi(self, param).then(res => {
    //     self.setData({
    //         num: res.data.data
    //     })
    // }).catch(err => {
    //     console.log(err)
    // })
}
