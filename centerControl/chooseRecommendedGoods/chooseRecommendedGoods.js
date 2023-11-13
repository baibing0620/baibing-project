const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { nav, showToast, showLoading, chooseAddress, deleteWhite, getNDay } from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        extConfig: app.extConfig,
        value: "",
        name: "",
        pageIndex: 1,
        pageSize: 10,
        disabled: false
    },
    dataStore: {
        _list: []
    },
    select(e) {
        let selectIndex = parseInt(e.currentTarget.dataset.index);
        let list = this.data.list;
        list[selectIndex].selected = !list[selectIndex].selected
        this.setData({
            list: list
        })
    },

    getList(type = '') {
        this.getGoodsList().then((res1) => {
            if (!this.data.loading) {
                this.data.loading = true;
                this.setData({
                    loadStyle: "loading"
                })
                let params = {
                  url: app.API_HOST + "category/goodsList",
                    data: {
                        pageIndex: this.data.pageIndex,
                        pageSize: this.data.pageSize,
                        cid: 0,
                        search: this.data.name
                    }
                }
              let choose = res1.map(item => {
                    return item.id
                })
                fetchApi(this, params).then(res2 => {
                    let _data = res2.data.data.map(item => {
                        if (choose.indexOf(item.id) != -1) {
                            item.selected = true
                        } else {
                            item.selected = false
                        }
                        return item
                    })
                    this.data.list = this.data.list.concat(_data)
                    if (type != 'search') {
                        this.dataStore._list = this.data.list   //防止搜索污染list
                    }

                    this.setData({
                        showStyle: this.data.list.length == 0 ? 2 : 1,
                        list: this.data.list,
                        hasMore: res2.data.data.length >= this.data.pageSize,
                        loadStyle: res2.data.data.length >= this.data.pageSize ? "loadMore" : "loadOver"
                    });

                    this.data.loading = false;
                }).catch(res => {
                    this.setData({
                        showStyle: 3
                    })
                    this.data.loading = false;
                });
            }
        })

    },

    bindInput(e) {
        this.data.value = e.detail.value;
    },

    search() {
        this.data.name = this.data.value.replace(/^\s+|\s+$/g, '');
        this.data.list = [];
        this.data.pageIndex = 1;
        this.getList('search');
    },

    confirm() {
        let data = [];
        this.dataStore._list.map(i => {
            if (i.selected) {
                data.push(i.id)
            }
        })
        this.data.list.map(i => {
            if (i.selected) {
                data.push(i.id)
            }
        })
        this.addHomeGoods([...new Set(data)])
    },
    addHomeGoods(goodsId) {
        this.setData({
            disabled: true
        })
        let params = {
          url: app.API_HOST + "card/setRecommendGoods",
            data: {
              cardId: app.globalData.cardId,
              goodsId: goodsId.join(",")
            }
        }
        fetchApi(this, params).then(res => {
            showToast('添加成功', 'success')
            app.globalData.refresh = true;
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
        }).catch(res => {
            this.setData({
                disabled: false
            })
        });
    },
    getGoodsList() {
        return new Promise((resolve, reject) => {
            let params = {
              url: app.API_HOST + "Card/getCardRecommendGoodsList",
                data: {
                  cardId: app.globalData.cardId,
                  cid: 0,
                  search: this.data.name
                  
                }
            }
            fetchApi(this, params).then(res => {
              let data = res.data.data.goodsInfo
              let goodsId = data.map(item => {
                return item.id
              })
              this.setData({
                goodsId: goodsId
              })
                resolve(data)
            }).catch(err => {
                reject(err)
            })
        })
    },
    init() {
        this.setData({
            list: [],
            value: "",
        });
        this.data.name = "";
        this.data.pageIndex = 1;
        this.getList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init();
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
        if (this.data.hasMore) {
            this.data.pageIndex++;
            this.getList();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})