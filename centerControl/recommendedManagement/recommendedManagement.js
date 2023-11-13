const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { showToast ,nav } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getData()
        this.getGoodsData()
        this.getInfoData()
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
            app.globalData.refresh = false
            this.getData()
            this.getGoodsData()
            this.getInfoData()
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
        this.getData()
        this.getGoodsData()
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
    getData(){
        let params = {
            url: app.API_HOST + "card/getHomeGoodsConfig",
            data: {}
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data
            this.setData({
                showStyle: 1,
                home_rec: parseInt(data.home_rec)?true:false,
                home_module: data.home_module,
                home_goods_num: data.home_goods_num
            })
        }).catch(res => {
            console.log(res);
            this.setData({
                showStyle: 3
            })
        })
    },
    getGoodsData () {
      let params = {
        url: app.API_HOST + 'Card/getCardGoodsRecommendConfig',
        data: {
          cardId: app.globalData.cardId
        }
      }
      fetchApi(this, params).then(res => {
        var data = res.data.data
        this.setData({
          showStyle: 1,
          goodsId: data.id,
          goods_rec: Number(data.is_open)? true : false,
          goods_module: data.module_name,
          goods_num: data.count
        })
      })
    },
    getInfoData(){
      let params = {
        url: app.API_HOST + 'Card/getCardInformationRecommendConfig',
        data: {
          cardId: app.globalData.cardId
        }
      }
      fetchApi(this, params).then(res => {
        var data = res.data.data
        this.setData({
          showStyle: 1,
          infoId: data.id,
          info_rec: Number(data.is_open) ? true : false,
          info_module: data.module_name,
          info_num: data.count
        })
      })
    },
    recommdedSwitch(e){
        let params = {
            url: app.API_HOST + "card/setHomeRec",
            data: {
                home_rec: e.detail.value?1:0,
            }
        }
        fetchApi(this, params).then(res => {
            showToast('设置成功','success')
        }).catch(res => {
            
        })
    },
  recommdedGoodsSwitch(e) {
    let params = {
      url: app.API_HOST + "Card/setCardGoodsRecommendIsOpen",
      data: {
        cardId: app.globalData.cardId,
        isOpen: e.detail.value? 1 : 0
      }
    }
    fetchApi(this, params).then(res => {
      showToast('设置成功', 'success')
    }).catch(res => {

    })
  },
  recommdedInfoSwitch(e) {
    let params = {
      url: app.API_HOST + "Card/setCardInformationRecommendIsOpen",
      data: {
        cardId: app.globalData.cardId,
        isOpen: e.detail.value? 1 : 0
      }
    }
    fetchApi(this, params).then(res => {
      showToast('设置成功', 'success')
    }).catch(res => {

    })
  },
    navPage(e){
      let that = this
        let url = e.currentTarget.dataset.page
        nav({
            url: `/centerControl/${url}/${url}`,
            data:{
                cardId: app.globalData.cardId,
                name: this.data.home_module,
                goodsModuleName: this.data.goods_module,
                infoModuleName: this.data.info_module
            }
        })
    }
})