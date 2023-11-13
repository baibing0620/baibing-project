const app = getApp();
import {
    fetchApi,
    getGlobalConfig
} from '../../api/api.js';
import {
    nav,
    showLoading,
    chooseAddress,
    deleteWhite,
    showTips
} from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        extConfig: app.extConfig,
        style: true,
        showStyle: 0,
        title: "",
        content: "",
        token: "",
        domain: "",
        textLength: 0,
        n_num: 0,
        video: {
            url: "",
            progress: 0,
            status: 0,
            errorMsg: "上传失败",
        },
        videoCover: {
            url: "",
            progress: 0,
            status: 0,
            errorMsg: "上传失败"
        },
        groups: [],
        isPublic: true,
        submit: false,
        havaGoods: false
    },

    groupCheck(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        this.data.groups[index].checked = !this.data.groups[index].checked;
        this.setData({
            groups: this.data.groups
        })
    },

    isPublicCheck() {
        this.setData({
            isPublic: !this.data.isPublic
        })
    },

    titleInput(e) {
        let value = e.detail.value;
        this.data.title = value;
    },

    textInput(e) {
        let value = e.detail.value;
        let n_num = value.split("\n").length - 1;
        n_num < 0 ? n_num = 0 : "";
        this.data.content = value;
        this.setData({
            textLength: e.detail.value.length,
            n_num: n_num
        })
    },

    bindPickerChange(e) {
        let value = parseInt(e.detail.value);
        this.setData({
            typeIndex: value
        });
    },

    chooseImages(number) {
        return new Promise((resolve, reject) => {
            wx.chooseImage({
                count: number,
                sizeType: ["compressed"],
                success: (res) => {
                    resolve(res.tempFilePaths);
                },
                fail: (res) => {
                    reject(res);
                }
            })
        })
    },

    chooseVideo() {
        return new Promise((resolve, reject) => {
            wx.chooseVideo({
                sourceType: ["album", "camera"],
                compressed: true,
                camera: "back",
                maxDuration: "60",
                success: (res) => {
                    let duration = parseInt(res.duration);
                    if (duration < 180) {
                        let sec = parseInt(duration % 60);
                        let min = parseInt(duration / 60);
                        if (sec < 10) {
                            sec = `0${sec}`
                        }
                        if (min < 10) {
                            min = `0${min}`
                        }
                        this.data.video.time = `${min}:${sec}`;
                        this.data.video.duration = duration;
                        this.data.video.width = res.width;
                        this.data.video.height = res.height;
                        this.setData({
                            video: this.data.video
                        })
                        resolve(res.tempFilePath);
                    } else {
                        this.setData({
                            "video.errorMsg": "所选视频长度大于3分钟",
                            "video.status": -1
                        })
                    }
                },
                fail: (res) => {
                    reject(res);
                }
            })
        })
    },

    uploadVideo() {
        this.chooseVideo().then(res => {
            if (!this.data.token || !this.data.domain) {
                this.getTokenAndDomain().then(e => {
                    this.toUploadVideo(res);
                }).catch(res => {
                    console.log(res);
                })
            } else {
                this.toUploadVideo(res);
            }
        }).catch(res => {
            console.log(res);
        })
    },

    reUploadVideo() {
        if (this.data.video.status == -1) {
            this.data.video.status = 0;
            this.uploadVideo();
        }
    },

    toUploadVideo(path) {
        let video = this.data.video;
        video.url = path;
        if (video.status === 0) {
            this.data.video.status = 1;
            let uploadTask = wx.uploadFile({
                url: this.data.domain + "/video/video/upload",
                formData: {
                    token: this.data.token,
                },
                filePath: path,
                name: 'file',
                success: (res) => {
                    res.data = JSON.parse(res.data);
                    if (parseInt(res.data.code) >= 0) {
                        this.data.video.status = 3;
                        this.data.video.id = res.data.data.id;
                        this.setData({
                            video: this.data.video
                        })
                        this.videoTranscode(res.data.data.id);
                    } else {
                        video.status = -1;
                        video.errorMsg = res.data.msg;
                        this.setData({
                            video: video
                        })
                    }
                },
                fail: (res) => {
                    video.status = -1;
                    this.setData({
                        video: this.data.video
                    })
                }
            })

            // 上传进度
            uploadTask.onProgressUpdate((res) => {
                if (res.progress < 100 && res.progress > 0) {
                    video.progress = res.progress;
                    video.status = 1;
                    this.setData({
                        video: video
                    })
                }
            })
        }
    },

    videoTranscode(id) {
        this.transcodeTimer = setInterval(() => {
            this.checkVideoTranscodeResult(id);
        }, 3000)
    },

    checkVideoTranscodeResult(id) {
        let params = {
            url: this.data.domain + "/video/video/detail",
            data: {
                video_ids: [id],
                token: this.data.token,
            }
        }
        this.request(params).then(res => {
            let data = res.data.data[0];
            if (data.status == 3) {
                clearInterval(this.transcodeTimer);
                this.data.video.status = 2;
                this.data.video.url = data.url;
                this.setData({
                    video: this.data.video
                })
            }
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

    deleteVideo() {
        wx.showModal({
            title: '提醒',
            content: '是否删除视频',
            success: (res) => {
                if (res.confirm) {
                    if (this.data.video.id) {
                        if (!this.data.token || !this.data.domain) {
                            this.getTokenAndDomain().then(e => {
                                this.deleteOnlineVideo(this.data.video.id);
                            }).catch(res => {
                                console.log(res);
                            })
                        } else {
                            this.deleteOnlineVideo(this.data.video.id);
                        }
                    } else {
                        this.data.video.status = 0;
                        this.setData({
                            video: this.data.video
                        })
                    }
                }
            }
        })
    },

    deleteOnlineVideo(id) {
        if (this.transcodeTimer) {
            clearInterval(this.transcodeTimer);
        }
        let params = {
            url: this.data.domain + "/video/video/delete",
            data: {
                video_id: id,
                token: this.data.token
            }
        }
        this.request(params).then(res => {
            this.data.video.status = 0;
            this.setData({
                video: this.data.video
            })
        }).catch(res => {
            console.log(res);
        })
    },

    uploadVideoCover() {
        this.chooseImages(1).then((res) => {
            let image = res[0];
            this.toUploadVideoCover(image);
        }).catch(res => {
            console.log(res);
        })
    },

    toUploadVideoCover(path) {
        let cover = this.data.videoCover;
        cover.url = path;
        if (cover.status === 0) {
            let uploadTask = wx.uploadFile({
                url: app.API_HOST + 'card/uploadImg',
                formData: {
                    token: app.globalData.token,
                },
                filePath: path,
                name: 'file',
                success: (res) => {
                    res.data = JSON.parse(res.data);
                    if (parseInt(res.data.code) >= 0) {
                        this.setData({
                            videoCover: {
                                id: res.data.data.id,
                                url: res.data.data.url,
                                status: 2
                            }
                        })
                    } else {
                        cover.status = -1;
                        cover.errorMsg = res.data.msg;
                        this.setData({
                            videoCover: cover
                        })
                    }
                },
                fail: (res) => {
                    cover.status = -1;
                    this.setData({
                        videoCover: this.data.cover
                    })
                }
            })

            // 上传进度
            uploadTask.onProgressUpdate((res) => {
                if (res.progress < 100 && res.progress > 0) {
                    cover.progress = res.progress;
                    this.setData({
                        videoCover: cover
                    })
                }
            })
        }
    },

    reUploadVideoCover() {
        this.toUploadVideoCover(this.data.videoCover.url);
    },

    deleteMyImgs(e) {
        wx.showModal({
            title: '提示',
            content: '确认删除图片？',
            success: (res) => {
                if (res.confirm) {

                    let index = e.currentTarget.dataset.index;
                    this.data.myImgs.splice(index, 1);
                    this.setData({
                        myImgs: this.data.myImgs
                    })

                }
            }
        })

    },

    deleteVideoCover() {
        wx.showModal({
            title: '提醒',
            content: '重新上传封面？',
            showCancel: true,
            confirmColor: '#fd9a33',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        videoCover: {
                            url: "",
                            progress: 0,
                            status: 0,
                            errorMsg: "上传失败"
                        },
                    })
                }
            }
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

    uploadCardVideo(data) {
        let url = this.data.id ? "card/editCardVideo" : "card/uploadCardVideo";
        let params = {
            url: app.API_HOST + url,
            data: data
        }
        this.data.id && ( params.data.vid = this.data.id );
        fetchApi(this, params).then(res => {
            this.data.submit = true;
            app.globalData.refreshVideoList = true;     // 名片页刷新
            if (this.data.id) {
                if (!res.data.data.id) res.data.data.id = this.data.id;
                app.globalData.videoListRefreshData = res.data.data;
            } else {
                app.globalData.videoListRefresh = true;     // 列表页刷新
            }
            wx.showToast({
                title: this.data.id ? "编辑成功" : "上传成功"
            });
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                });
                this.posting = false;
            }, 1500);
        }).catch(() => {
            this.posting = false;
        })
    },

    submit() {
        let data = {
            title: this.data.title.replace(/(^\s*)|(\s*$)/g, ""),
            content: this.data.content,
        }
        if (data.title.length < 1) {
            showTips("请填写视频标题", this);
            return "";
        }
        if (data.content.replace(/(^\s*)|(\s*$)/g, "") < 1) {
            showTips("请填写分享语", this);
            return "";
        }
        if (this.data.video.status === 2) {
            data.videoUrl = this.data.video.url;
            data.duration = this.data.video.duration;
            data.videoId = this.data.video.id;
            data.width = this.data.video.width;
            data.height = this.data.video.height;
        } else if (this.data.video.status === 0) {
            showTips("请上传视频", this);
            return "";
        } else {
            showTips("请等待视频上传完成", this);
            return "";
        }
        if (this.data.videoCover.status === 2) {
            data.imageId = this.data.videoCover.id;
            data.imageUrl = this.data.videoCover.url;
        } else if (this.data.video.status === 0) {
            showTips("请上传视频封面", this);
            return "";
        } else {
            showTips("请等待封面上传完成", this);
            return "";
        }
        if (!this.posting) {
            this.posting = true;
            this.uploadCardVideo(data);
        }
    },

    getCardVideoInfo() {
        let params = {
            url: app.API_HOST + "card/getCardVideoInfoByVid",
            data: {
                vid: this.data.id
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data.this;
            this.setData({
                title: data.video_title,
                content: data.video_content,
                textLength: data.video_content.length,
                video: {
                    id: data.video_id,
                    url: data.video_url,
                    width: parseInt(data.video_width),
                    height: parseInt(data.video_height),
                    duration: this.timeToNumber(data.video_duration),
                    status: 2,
                    errorMsg: "上传失败",
                },
                videoCover: {
                    id: data.video_image_id,
                    url: data.video_image_url,
                    status: 2,
                    errorMsg: "上传失败",
                },
                showStyle: 1
            })
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                showStyle: -1
            })
        })
    },

    init() {
        if (this.data.id) {
            wx.setNavigationBarTitle({
                title: "视频编辑"
            })
            this.getCardVideoInfo();
        } else {
            this.setData({
                showStyle: 1
            });
            wx.setNavigationBarTitle({
                title: "视频上传"
            })
        }
    },

    networkFaildRealod() {
        this.setData({
            showStyle: 0
        })
        this.init();
    },

    timeToNumber(string = "00:00") {
        let arr = string.split(":");
        let min = parseInt(arr[0]);
        let sec = parseInt(arr[1]);
        return min * 60 + sec;
    },

    havaGoodsChange(e) {
        this.setData({
            havaGoods: e.detail.value
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.id) {
            this.setData({
                id: parseInt(options.id),
            });
        }
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
        if (app.globalData.videoShowStyle) {
            this.setData({
                style: app.globalData.videoShowStyle == 1 ? true : false
            })
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
        if (this.data.video.id && !this.data.submit && !this.data.id) {
            this.deleteOnlineVideo(this.data.video.id);
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        init();
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

    }
})