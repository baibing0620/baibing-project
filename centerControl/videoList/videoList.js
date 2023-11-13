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
        extConfig: app.extConfig,
        total: 0,
        list: [],
        pageSize: 20,
        pageIndex: 1,
        hasMore: false,
        loading: false
    },

    getVideoList() {
        this.data.loading = true;
        this.setData({
            loadStyle: "loading"
        })
        let params = {
            url: app.API_HOST + "card/getCardVideoInfoByCardId",
            data: {
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data.list;
            this.setData({
                list: this.data.pageIndex === 1 ? data : this.data.list.concat(data),
                hasMore: data.length >= this.data.pageSize,
                total: res.data.data.total,
                loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver",
                showStyle: 1
            });
            this.data.loading = false;
        }).catch(res => {
            console.log(res);
            this.setData({
                showStyle: 1
            })
            this.data.loading = false;
        });
    },

    toDeleteVideo(id) {
        let params = {
            url: app.API_HOST + "card/delCardVideo",
            data: {
                vid: id
            }
        }
        fetchApi(this, params).then(res => {
            console.log(res);
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
                    let videoId = e.currentTarget.dataset.videoid;

                    this.data.list.splice(index, 1);
                    this.data.total--;
                    if (this.data.total < 0) this.data.total = 0;

                    this.setData({
                        list: this.data.list,
                        total: this.data.total
                    })
                    app.globalData.refreshVideoList = true;
                    this.toDeleteVideo(id);
                    if (!this.data.token || !this.data.domain) {
                        this.getTokenAndDomain().then(e => {
                            this.deleteOnlineVideo(videoId);
                        }).catch(res => {
                            console.log(res);
                        })
                    } else {
                        this.deleteOnlineVideo(videoId);
                    }
                }
            }
        })
    },

    toNav(e) {
        const {path, id} = e.currentTarget.dataset;
        const params = {
            url: `/centerControl/${path}/${path}`,
            data: {}
        }
        if (id) params.data.id = id;
        nav(params);
    },
    
    toVideoDetail(e) {
        let params = {
            url: "/pages/videoDetail/videoDetail",
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

    init() {
        this.data.pageIndex = 1;
        this.getVideoList();
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
        if (app.globalData.videoListRefresh) {
            app.globalData.videoListRefresh = "";
            this.init();
        } else if (app.globalData.videoListRefreshData) {
            let data = app.globalData.videoListRefreshData;
            let index = this.data.list.findIndex((item) => {
                return parseInt(item.id) === parseInt(data.id);
            })
            if (index >= 0) {
                this.data.list[index] = data;
            }
            this.setData({
                list: this.data.list
            })
            app.globalData.videoListRefreshData = "";
        } else if (app.globalData.transToVideoList) {
            let set = new Set(app.globalData.transToVideoList);
            this.getRefreshData([...set]);
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