const app = getApp();
import {
    fetchApi,
} from '../../api/api.js';
import {
    nav,
    showTips
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        windowHeight: 0,
        extConfig: app.extConfig,
        total: 0,
        list: [],
        pageSize: 20,
        pageIndex: 1,
        hasMore: false,
        loading: false,
        operationId: 0,
        goodsInfo: '秋冬挚爱V致IN唇色演绎百风格',
        img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1583771782253&di=d1f8152925dfb4ed195ae0679751be50&imgtype=0&src=http%3A%2F%2Fimage.it168.com%2Fn%2F640x480%2F3%2F3530%2F3530861.jpg'
    },

    slideButtonTap() {},

    getVideoList() {
        this.data.loading = true;
        this.setData({
            loadStyle: "loading"
        })
        let params = {
            // url: app.API_HOST + "card/getCardVideoInfoByCardId",
            url: app.API_HOST + "ShortVideo/getShortVideoList",
            data: {
                type: 1,
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            if (res.data.data.shortVideoList) {
                let data = res.data.data.shortVideoList;
                this.setData({
                    list: this.data.pageIndex === 1 ? data : this.data.shortVideoList.concat(data),
                    hasMore: data.length >= this.data.pageSize,
                    total: res.data.data.total,
                    loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver",
                    showStyle: 1
                });
            } else {
                let data = []
                this.setData({
                    list: this.data.pageIndex === 1 ? data : this.data.shortVideoList.concat(data),
                    hasMore: data.length >= this.data.pageSize,
                    total: res.data.data.total,
                    loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver",
                    showStyle: 1
                });
            }
            
            this.data.loading = false;
        }).catch(res => {
            console.log(res);
            this.setData({
                showStyle: 1
            })
            this.data.loading = false;
        });
    },

    videoOperation(e) {
        let id = e.currentTarget.dataset.id
        console.log(id)
        if (id == this.data.operationId) {
            this.setData({
                operationId: 0
            })
        } else {
            this.setData({
                operationId: id
            })
        }
    },

    toDeleteVideo(id) {
        let params = {
            url: app.API_HOST + "ShortVideo/delShortVideo",
            data: {
                id: id
            }
        }
        fetchApi(this, params).then(res => {
            console.log(res);
            showTips('删除成功', this);
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    getTokenAndDomain() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "videoApp/getToken",
                data: {}
            }
            fetchApi(this, params).then(res => {
                this.data.token = res.data.data.token;
                this.data.domain = res.data.data.domain;
                resolve(res.data.data);
            }).catch(res => {
                reject(res);
            })
        })
    },

    deleteOnlineVideo(id) {
        let params = {
            url: this.data.domain + "/video/video/delete",
            data: {
                video_id: id,
                token: this.data.token
            }
        }
        this.request(params).then(res => {
            console.log(res);
        }).catch(res => {
            console.log(res);
        })
    },

    request(params) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: params.url,
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: params.data,
                success: (res) => {
                    if (res.data.code >= 0) {
                        resolve(res);
                    } else if (res.data.code == -10) {
                        wx.showModal({
                            title: '提示',
                            content: res.data && res.data.msg ? res.data.msg : 'error',
                            success: function (res) {
                                if (res.confirm) {
                                    page.setData({
                                        showGetUserInfo: true
                                    })
                                    page.getUserInfo = function (e) {
                                        page.setData({
                                            showGetUserInfo: false
                                        })
                                        if (!e.detail.userInfo) {
                                            showTips('授权失败');
                                            return
                                        }
                                        let userInfo = e.detail.userInfo;
                                        login(userInfo).then(res => {
                                            wx.navigateBack({
                                                delta: 5
                                            })
                                        })
                                    }
                                } else if (res.cancel) {
                                    reject('用户点击取消')
                                }
                            }
                        });
                    } else if (res.data.code == -100) {
                        wx.showModal({
                            title: '提示',
                            content: res.data && res.data.msg ? res.data.msg : 'error',
                            showCancel: false,
                            success: (res) => {
                                if (res.confirm) {
                                    reject('code=100');
                                }
                            }
                        })
                        reject('code=-100');
                    } else if (res.statusCode == 500 || res.statusCode == 404) {
                        reject('服务器开小差了');
                    } else {
                        reject(res);
                    }
                },
                fail: (res) => {
                    reject(res);
                }
            })
        })
    },

    deleteVideo(e) {

        wx.showModal({
            title: '提醒',
            content: '确认删除视频？',
            confirmColor: "#ff9b1f",
            success: (res) => {
                if (res.confirm) {
                    let index = parseInt(e.currentTarget.dataset.index);
                    let id = e.currentTarget.dataset.id;
                    // let videoId = e.currentTarget.dataset.videoid;
                    this.data.list.splice(index, 1);
                    this.data.total--;
                    if (this.data.total < 0) this.data.total = 0;
                    this.setData({
                        list: this.data.list,
                        total: this.data.total
                    })
                    // app.globalData.refreshVideoList = true;
                    this.toDeleteVideo(id);
                    // if (!this.data.token || !this.data.domain) {
                    //     this.getTokenAndDomain().then(e => {
                    //         // this.deleteOnlineVideo(videoId);
                    //     }).catch(res => {
                    //         console.log(res);
                    //     })
                    // } else {
                    //     // this.deleteOnlineVideo(videoId);
                    // }
                }
            }
        })
    },

    toNav(e) {
        this.setData({
            operationId: 0
        })
        const {path, id} = e.currentTarget.dataset;
        const params = {
            url: `/shortVideo/${path}/${path}`,
            data: {}
        }
        if (id) params.data.id = id;
        nav(params);
    },
    
    toVideoDetail(e) {
        let params = {
            url: "/shortVideo/shortvideoDetail/shortvideoDetail",
            data: {
                id: e.currentTarget.dataset.id
            }
        }
        nav(params);
    },

    getRefreshData(ids) {
        let params = {
            url: app.API_HOST +　"card/getCardVideoInfoByVidArr",
            data: {
                vids: JSON.stringify(ids)
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            data.map(i => {
                let index = this.data.list.findIndex((item) => {
                    return parseInt(item.id) === parseInt(i.id);
                });
                this.data.list[index] = i;
            });
            this.setData({
                list: this.data.list
            });
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    delVideoOperation() {
        this.setData({
            operationId: 0
        });
    },

    strSplice (str) {
        if (str.length >= 12) {
            return str.substring(0, 10) + '...'
        } else {
            return str
        }
    },

    init() {
        this.data.pageIndex = 1;
        this.getVideoList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    windowHeight: res.windowHeight
                })
            },
            fail: (res) => {
                
            }
        })
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
        
        if (app.globalData.videoListRefresh) {
            app.globalData.videoListRefresh = "";
            this.init();
        } else if (app.globalData.videoListRefreshData) {
            this.init();
            app.globalData.videoListRefreshData = "";
        } else if (app.globalData.transToVideoList) {
            this.init();
            if (app.globalData.refreshVideoList) {
                app.globalData.transToVideoList = "";
            }
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
        this.init();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (!this.data.loading) {
            this.data.pageIndex++;
            this.getVideoList();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})