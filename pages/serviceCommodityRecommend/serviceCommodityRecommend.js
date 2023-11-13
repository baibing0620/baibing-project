const app = getApp();
import { fetchApi, getToken, addActionLog } from '../../api/api.js';
import { nav } from '../../utils/util.js';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        showStyle: 0,
        category: [],
        swiperContent: [],
        recommendList: [],
        showSwiper: false,
        loadStyle: 'loading'
    },

    store: {
        pageIndex: 1,
        pageSize: 10,
    },

    handleNavigate(e) {
        const { page } = e.currentTarget.dataset;
        nav({ url: page });
    },

    handleNavToDetail(e) {
        const { id } = e.currentTarget.dataset;
        nav({
            url: '/pages/serviceCommodityDetail/serviceCommodityDetail',
            data: {
                id
            }
        });
    },

    getCategoryDetail() {
        const { id } = this.data;
        const params = {
            url: 'ServiceGoods/getGroupOne',
            data: {
                groupId: id
            }
        }
        fetchApi(this, params).then(res => {
            const { data } = res.data;
            const { car_img_url, service_group } = data;
            if (!data) {
                wx.showModal({
                    title: '提示',
                    content: '当前分类不存在',
                    confirmColor: '#1f94fd',
                    success: _ => {
                        wx.navigateBack({
                            delta: 1
                        });
                    }
                })
                return;
            }
            this.setData({
                showSwiper: false,
                categoryDetail: data,
                showStyle: 1
            });
            wx.setNavigationBarTitle({
                title: service_group
            });
            if (car_img_url.length < 1) return;
            setTimeout(() => {
                this.setData({
                    showSwiper: true,
                });
            }, 300);
        }).catch(err => {
            this.setData({
                showStyle: 3
            });
            console.log('error: ', err);
        });
    },

    getRecommend() {
        const { id } = this.data;
        this.setData({
            loadStyle: 'loading'
        });
        const { pageIndex, pageSize } = this.store;
        const params = {
            url: 'ServiceGoods/getGoodsAll',
            data: {
                groupId: id,
                pageIndex,
                pageSize
            }
        }
        fetchApi(this, params).then(res => {
            const { data: { info } } = res.data;
            const { recommendList } = this.data;
            this.setData({
                recommendList: (pageIndex == 1 ? [] : recommendList).concat(info),
                loadStyle: info.length < pageSize ? 'loadOver' : 'loadMore'
            });
        }).catch(err => {
            this.setData({
                showStyle: 3,
                loadStyle: 'loadMore'
            });
            console.log('error: ', err);
        })
    },

    getConfig() {
        const params = {
            url: 'ServiceFieldConfig/getConfig',
            data: {}
        }
        fetchApi(this, params).then(res => {
            const {group_field} = res.data.data;
            this.setData({
                group_field
            });
        }).catch(err => {
            console.log('error: ', err);
        })
    },

    init() {
        this.store.pageIndex = 1;
        this.getCategoryDetail();
        this.getRecommend();
        this.getConfig();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const { cardId, fromUser, id } = options;
        id && (this.data.id = id);
        cardId && (app.globalData.cardId = cardId);
        fromUser && (app.globalData.fromUser = fromUser);
        cardId && (this.setData({
            isFromShare: true
        }));
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
        this.setData({
            startTime: new Date().getTime()
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        const { id, categoryDetail: { service_group }, startTime} = this.data
        // 事件上报
        addActionLog(this, {
            type: 40, 
            detail: {
                id,
                name: `${service_group || '服务分类'}`,
                duration: new Date().getTime() - startTime,
            }
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        const { id, categoryDetail: { service_group }, startTime} = this.data
        // 事件上报
        addActionLog(this, {
            type: 40, 
            detail: {
                id,
                name: `${service_group || '服务分类'}`,
                duration: new Date().getTime() - startTime,
            }
        })
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
        const { loadStyle } = this.data;
        if (loadStyle != 'loadMore') return;
        this.store.pageIndex++;
        this.getRecommend();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const { cardId, uid } = app.globalData;
        const { id, categoryDetail: { description } } = this.data;
        const shareData = {
            title: description,
            path: `/pages/serviceCommodityRecommend/serviceCommodityRecommend?cardId=${cardId}&fromUser=${uid}&id=${id}`,
        }
        // 事件上报
        addActionLog(this, {
            type: 45, 
            detail: {
                id,
                name: `${service_group || '服务分类'}`,
                duration: new Date().getTime() - startTime,
            }
        })
        return shareData;
    }
})