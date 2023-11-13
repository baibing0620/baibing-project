const app = getApp();
import { fetchApi, getGlobalConfig, addActionLog } from '../../api/api.js';
import { nav, showLoading, chooseAddress, deleteWhite, formatDuring, showToast, showTips} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        myGoodsList:[],
        showStyle:0,
        loadStyle:'loadMore',
        diyConfig: app.extConfig,
        statusList: [{
            title: '全部状态',
            status: 0
        }, {
            title: '未上架',
            status: 1
        }, {
            title: '已上架',
            status: 2
        }, {
            title: '已下架',
            status: 3
        }, {
            title: '已售罄',
            status: 4
            }],
        statusIndex: 0,
        typeIndex: 0,
        typeList: [{ title: '全部类型', status: 0 }, { title: '秒杀', status: 1 }, { title: '拼团', status: 2 }, { title: '砍价', status: 3 }, { title: '无促销', status: 4 }],
        categoryIndex: 0,
        categoryList: [{ title: '全部分类', status: 0 }],
        keywords: '', 
        isIphoneX: app.globalData.isIphoneX
    },
    dataStore: {
        pageIndex: 1
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getCategoryList(this)
        
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
        this.dataStore.pageIndex = 1
        getGoodsList(this)
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
        this.dataStore.pageIndex = 1
        getGoodsList(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return
        }
        this.setData({
            loadStyle: 'showLoading'
        })
        getGoodsList(this, true);
    },

    changeType() {
        var itemList = this.data.typeList.map(item => {
            return item.title
        })
        wx.showActionSheet({
            itemList: itemList,
            success: res=> {
                this.dataStore.pageIndex = 1;
                this.setData({
                    typeIndex: parseInt(res.tapIndex)
                });
                getGoodsList(this);
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
    },
    changeStatus() {
        var itemList = this.data.statusList.map(item => {
            return item.title
        })
        wx.showActionSheet({
            itemList: itemList,
            success: res => {
                this.setData({
                    statusIndex: parseInt(res.tapIndex)
                });
                getGoodsList(this);
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
    },
    changeCategory(e){
        let value = e.detail.value
        this.setData({
            categoryIndex: value
        })
        getGoodsList(this);
    },
    bindKeywords(e) {
        this.data.keywords = e.detail.value;
    },
    search(e) {
        getGoodsList(this);
    },
    navAdd() {
        app.globalData.saveGoodsData={}
        nav({
            url: '/centerControl/basicInfoGoods/basicInfoGoods'
        })
    },
    delRule(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        if (this.data.myGoodsList[index].status == 1){
            showTips('请下架该商品后，在尝试删除',this)
            return;
        }
        wx.showModal({
            title: '提醒',
            content: '确定删除该商品',
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    let param = {
                        url: app.API_HOST + "CardGoods/delGoods",
                        data: {
                            goodsId: id
                        }
                    }
                    fetchApi(this, param).then(res => {
                        this.data.myGoodsList.splice(index, 1)
                        this.setData({
                            myGoodsList: this.data.myGoodsList
                        })
                        showToast('删除成功', 'success')
                    }).catch((err) => {

                    });
                }
            }
        })
    },
    changeSale(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        let param = {
            url: app.API_HOST + "CardGoods/stopSale",
            data: {
                goodsId: id
            }
        }
        if (this.data.myGoodsList[index].status != 1){
            param.url = app.API_HOST + "CardGoods/startSale"
        }
        fetchApi(this, param).then(res => {
            if (this.data.myGoodsList[index].status == 1){
                showToast('下架成功', 'success')
            }else{
                showToast('上架成功', 'success')
            } 
            this.data.myGoodsList[index].status = this.data.myGoodsList[index].status==1?2:1
            this.setData({
                myGoodsList: this.data.myGoodsList
            })
        }).catch((err) => {

        });
    },
    editRule(e){
        let id = e.currentTarget.dataset.id
        let param = {
            url: app.API_HOST + "CardGoods/detail",
            data: {
                goodsId: id
            }
        }
        fetchApi(self, param).then(res => {
            let data = res.data.data;
            app.globalData.saveGoodsData = data
            nav({
                url:'/centerControl/basicInfoGoods/basicInfoGoods'
            })
        }).catch((err) => {
           
        });
    }
})

function getGoodsList(self, isGetMore = false) {
    let param = {
        url: app.API_HOST + "CardGoods/goodsList",
        data: {
            isQy: 0,
            name: self.data.keywords,
            status: self.data.statusIndex - 1,
            promote: self.data.typeIndex - 1,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
            pageSize: 6,
            cid: self.data.categoryList[self.data.categoryIndex].status,
            from: '2'
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        if (isGetMore) { self.dataStore.pageIndex++ };
        self.setData({
            myGoodsList: isGetMore ? self.data.myGoodsList.concat(data) : data,
            loadStyle: data.length < 6 ? 'loadOver' : 'loadMore',
        })
        self.setData({
            showStyle: self.data.myGoodsList.length == 0 ? 2 : 1,
        })

    }).catch((err) => {
        self.setData({
            showStyle: 3,
        })
    });
}
function getCategoryList(self) {
    let param = {
        url: app.API_HOST + "CardGoods/getCategoryList",
        data: {
            ifMyGoods: 1
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        let categoryList = data.map(item => {
            let obj = {}
            obj.status = item.id
            obj.title = item.name
            return obj
        })
        self.setData({
            categoryList: self.data.categoryList.concat(categoryList)
        })
    }).catch((err) => {

    });
}