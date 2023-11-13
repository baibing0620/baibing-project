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
        searchValue: '',
        category: [],
        swiperContent: [],
        recommendList: [],
        showSwiper: false,
        loadStyle: 'loading',
        startTime: 0,
        menuSetting: {
            "留言": {
                dontNeedToGetTotal: true
            },
            "个人中心": {},
            "管理中心": {}
        },
    },

    store: {
        pageIndex: 1,
        pageSize: 10,
    },

    handleInput (e) {
        const { value } = e.detail;
        this.setData({
            searchValue: value
        });
    },

    handleDelete () {
        this.setData({
            searchValue: ''
        });
    },

    handleSearch () {
        const { searchValue } = this.data;
        nav({
            url: '/pages/serviceCommoditySearchResult/serviceCommoditySearchResult',
            data: {
                searchValue
            }
        });
    },

    handleNaviToCategoryDetail(e) {
        const { id } = e.currentTarget.dataset;
        nav({
            url: '/pages/serviceCommodityRecommend/serviceCommodityRecommend',
            data: {
                id
            }
        })
    },

    handleNavigate(e) {
        const {page} = e.currentTarget.dataset;
        nav({url: page})
    },

    handleNavToDetail (e) {
        const { id } = e.currentTarget.dataset;
        nav({
            url: '/pages/serviceCommodityDetail/serviceCommodityDetail',
            data: {
                id
            }
        });
    },

    getSwiperContent() {
        const params = {
            url: 'CarouselImage/getCarouselImage',
            data: {
                status: 3
            }
        }
        fetchApi(this, params).then(res => {
            const { info } = res.data.data;
            this.setData({
                showSwiper: false,
                swiperContent: info || []
            });
            setTimeout(() => {
                this.setData({
                    showSwiper: true
                });
            }, 300);
        }).catch(err => {
            console.log('error: ', err);
        });
    },

    getCategory () {
        const params = {
            url: 'ServiceGoods/getGroupAll',
            data: {}
        }
        fetchApi(this, params).then(res => {
            const { data: { info, total }} = res.data;
            this.setData({
                categoryTotal: total,
                category: this.formatCategory(info),
                showStyle: 1
            });
        }).catch(err => {
            console.log('error: ', err);
            this.setData({
                showStyle: 3
            });
        })
    },

    formatCategory(category) {
        const format = (category, n) => {
            const arr = [];
            const length = Math.ceil(category.length / n);
            for (let i = 0; i < length; i ++) {
                const start = n * i;
                const end = start + n;
                arr.push(category.slice(start, end));
            }
            return arr;
        }
        return format(category, 8)
    },

    getRecommend () {
        this.setData({
            loadStyle: 'loading'
        });
        const {pageIndex, pageSize} = this.store;
        const params = {
            url: 'ServiceGoods/getRecommendGoodsAll',
            data: {
                pageIndex,
                pageSize
            }
        }
        fetchApi(this, params).then(res => {
            const { data: { info }} = res.data;
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
            const { recommend_field, group_field } = res.data.data;
            this.setData({
                recommend_field,
                group_field
            });
            wx.setNavigationBarTitle({
                title: recommend_field || '推荐'
            })
        }).catch(err => {
            console.log('error: ', err);
        })
    },

    init() {
        this.store.pageIndex = 1;
        this.getCategory();
        this.getRecommend();
        this.getSwiperContent();
        this.getConfig();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const { cardId, fromUser } = options;
        cardId && (app.globalData.cardId = cardId);
        fromUser && (app.globalData.fromUser = fromUser);
        cardId && app.tabBarPath.indexOf("/pages/serviceCommodityList/serviceCommodityList") == -1&& (this.setData({
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
        const { recommend_field, startTime } = this.data
        // 事件上报
        addActionLog(this, {
            type: 38,
            detail: {
                name: `${recommend_field || '服务'}`,
                duration: new Date().getTime() - startTime,
            }
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        const { recommend_field, startTime } = this.data
        // 事件上报
        addActionLog(this, {
            type: 38, 
            detail: {
                
                name: `${recommend_field || '服务'}`,
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
        this.store.pageIndex ++;
        this.getRecommend();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const { cardId, uid } = app.globalData;

        const { recommend_field, startTime} = this.data;
        const shareData = {
            title: recommend_field,
            path: `/pages/serviceCommodityList/serviceCommodityList?cardId=${cardId}&fromUser=${uid}`,
        }
        // 事件上报
        addActionLog(this, {
            type: 46, 
            detail: {
                name: `${recommend_field || '推荐'}`,
                duration: new Date().getTime() - startTime,
            }
        })
        return shareData;
    }
})