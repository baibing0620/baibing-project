const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { showToast, nav } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        x:0,
        y:0,
        goodList: [],
        showStyle: 0,
        isIphoneX: app.globalData.isIphoneX
    },
    dataStore:{
        y:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getGoodsList()
        // 拖拽功能的低版本兼容处理
        if (!wx.canIUse('movable-view.bindchange')) {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用拖拽功能，请升级到最新微信版本后重试。'
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
        if (app.globalData.refresh){
            app.globalData.refresh = false;
            this.getGoodsList()
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
        this.getGoodsList()
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
    onChange(e){
        let index = e.currentTarget.dataset.index
        let _y = e.detail.y
        this.dataStore.y = _y
    },
    touchEnd(e){
        let index = e.currentTarget.dataset.index
        let y = this.dataStore.y
        let _index = Math.round(y / 68)
        if (_index < this.data.goodList.length && y !== ''){
            this.data.goodList[index] = this.data.goodList.splice(_index, 1, this.data.goodList[index])[0]
            this.setData({
                goodList: this.data.goodList
            })
            this.setList()
        }else{
            this.setData({
                y:0
            })
        }
        this.dataStore.y = ''
    },
    getGoodsList(){
        let params = {
          url: app.API_HOST + "Card/getCardRecommendInformationList",
            data: {}
        }
        fetchApi(this, params).then(res => {
          this.data.goodList = res.data.data.goodsInfo
          let goodsId = this.data.goodList.map( item => {
            return item.goodsId
          })
          this.setData({
             showStyle: this.data.goodList.length == 0 ? 2 : 1,
             goodList: this.data.goodList,
             goodsId: goodsId
          })
        }).catch(err => {
            console.log(err)
            this.setData({
                showStyle: 3
            })
        })
    },
    setList(){
        let list = this.data.goodList.map(item=>{
            return item.id
        })
        let params = {
          url: app.API_HOST + "card/setRecommendInformation",
            data: {
              cardId: app.globalData.cardId,
              goodsId: list.join(",")
            }
        }
        fetchApi(this, params).then(res => {
            
        }).catch(err => {
            console.log(err)
        })
    },
    delList(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        wx.showModal({
            title: '提醒',
            content: '确定删除该推荐资讯',
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    let params = {
                      url: app.API_HOST + "Card/delRecommendInformation",
                        data: {
                            goodsId: id,
                            cardId: app.globalData.cardId
                        }
                    }
                    fetchApi(this, params).then(res => {
                        this.data.goodList.splice(index, 1)
                        this.setData({
                            goodList:this.data.goodList
                        })
                        showToast('删除成功', 'success')
                        app.globalData.refresh = true
                    }).catch(err => {
                        console.log(err)
                    })
                }
            }
        })
    },
    addList(){
        nav({
          url:'/centerControl/chooseRecommendedInfo/chooseRecommendedInfo',
            data:{}
        })
    }
})