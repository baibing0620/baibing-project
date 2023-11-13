const app = getApp();
import {
    fetchApi
} from "./../../api/api.js";
import {
    showTips,
    nav,
    makePhoneCall,
    showToast
} from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle:0,
        categoryList:[],
        loadStyle:'' ,
        tabIndex: 0,
        taberStatus: true,
        switchTab: {
            tabs: [
                "个人商品分类",
                "选品商品分类"
            ],
            themeColor: '#1F94FD',
            currentIndex: 0,
            top: 0,
            position: "fixed",
        },  
    },
    onTabClick(e) {
        let index = e.detail.currentIndex
        this.setData({
            tabIndex: index,
            showStyle:0,
            categoryList:[]
        });

        getCategoryList(this, index)
 
    },
    getImageList(sysPer=0) {
        var param = {
            url: 'card/getEncouragePosterList',
            data: {
                sysPer: sysPer
            }
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data
            this.dataStore.allItem = data.posterList.slice(3)
            this.dataStore.nextItems = data.posterList
            if (sysPer){
                // data.posterList =  data.posterList.map((item)=>{
                //     item.status = 2
                //     return item
                // }) 
                if (data.posterList.length == 0){
                    this.data.poster.status = 0
                    data.posterList.push({ status: 0 })
                }else{
                    this.data.poster.status = 2
                }
            }
            this.setData({
                items: data.posterList.slice(0, 3),
                'poster.status': this.data.poster.status,
                cardInfo: data.cardInfo,
                qrCodeUrl: data.qrCodeUrl
            })
            this.initStyle()
            
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let configData = JSON.parse(options.configData)
        if(configData.isOpenSelectGoods == false && configData.isOpenManage == true && configData.cardSelectGoodsCount == 0){ // 开个人分类
            this.setData({
                taberStatus: false,
                tabIndex: 0
            })
        }else if(configData.isOpenSelectGoods == true && configData.isOpenManage == false){ // 开选品分类
            this.setData({
                taberStatus: false,
                tabIndex: 1
            })
        }
        getCategoryList(this, this.data.tabIndex)
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
            getCategoryList(this, this.data.tabIndex)
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
        getCategoryList(this,this.data.tabIndex)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
       
    },
    delRule(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        wx.showModal({
            title: '提醒',
            content: '确定删除该分类',
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    let param = {
                        url: app.API_HOST + "CardGoods/editCategory",
                        data: {
                            cid: id,
                            deleted: 1
                        }
                    }
                    fetchApi(this, param).then(res => {
                        this.data.categoryList.splice(index, 1)
                        this.setData({
                            categoryList: this.data.categoryList
                        })
                        showToast('删除成功','success')
                    }).catch((err) => {

                    });
                }
            }
        })
    },
    navAdd(){
        nav({
            url:'/centerControl/addCategory/addCategory'
        })
    },
    changeRule(e){
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        let enabled = parseInt(this.data.categoryList[index].enabled)
        let param = {
            url: app.API_HOST + "CardGoods/editCategory",
            data: {
                cid: id,
                enabled: enabled?0:1
            }
        }
        fetchApi(this, param).then(res => {
            this.data.categoryList[index].enabled = enabled ? 0 : 1
            this.setData({
                categoryList: this.data.categoryList
            })
            if (this.data.categoryList[index].enabled){
                showToast('显示成功', 'success')
            }else{
                showToast('隐藏成功', 'success')
            }
            
        }).catch((err) => {

        });
    },
    editRule(e){
        let id = e.currentTarget.dataset.id
        nav({
            url: '/centerControl/addCategory/addCategory',
            data:{
                id:id
            }
        })
    }
})
function getCategoryList(self,index) {
    let param = {
        url: app.API_HOST + ((index == 0) ? "CardGoods/getCategoryList" : 'CardGoods/getSelectedGoodsCategory'),
        data: {
           
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        if(index == 1){
            self.setData({
                categoryList: data,
                showStyle: data.length  == 0?2:1,
            })
            return ;
        }  
        var rows = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            rows.push(data[i]);
            for (var k = 0; k < item.sons.length; k++) {
                item.sons[k].name = item.sons[k].name;
                item.sons[k].parentName = item.name;
                rows.push(item.sons[k]);
            }
        }
        self.setData({
            categoryList: rows,
            showStyle: rows.length == 0 ? 2 : 1,
        })
    }).catch((err) => {
        self.setData({
            showStyle: 3,
        })
    });
}
