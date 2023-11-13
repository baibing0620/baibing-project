const app = getApp();
const VodUploader = require('../../utils/vod-wx-sdk-v2');
import {
    fetchApi,
    getGlobalConfig,
    // getCanIUseGetUserProfile
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
        showStyle: 0,
        title: "",
        token: "",
        domain: "",
        typeArray: [],
        typeMap: [{
                title: "企业短资讯",
                id: 1
            },
            {
                title: "企业视频动态",
                id: 2
            }
        ],
        typeIndex: 0,
        textLength: 0,
        n_num: 0,
        myImgs: [],
        video: {
            url: "",
            progress: 0,
            status: 0,
            errorMsg: "上传失败",
            progress: 0
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
        isIphoneX: app.globalData.isIphoneX,
        signKey:'',
        v_fileName: "",
        v_videoFile: null,
        v_coverFile: null,
        v_progress: 0,
        v_uploader: null,
    },
    reset() {
      this.setData({
          v_fileName: "",
          v_videoFile: null,
          v_coverFile: null,
          v_progress: 0,
          v_uploader: null,
      })
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

    textInput(e) {
        let value = e.detail.value;
        let n_num = value.split("\n").length - 1;
        n_num < 0 ? n_num = 0 : "";
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
                        this.setData({
                            video: this.data.video
                        })
                        // resolve(res.tempFilePath);
                        resolve(res);
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
          if (!this.data.signKey||this.data.signKey!=0) {
            // if (!this.data.token || !this.data.domain) {
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
        if (this.data.video.status = -1) {
            this.data.video.status = 0;
            this.uploadVideo();
        }
    },

    toUploadVideo(path) {
      var self = this
      var stampTime = Date.parse(new Date()) / 1000
      const uploader = VodUploader.start({
          mediaFile: path,
          getSignature: function(callback){
              callback(self.data.signKey)
          },
          mediaName: stampTime.toString, //选填，视频名称，强烈推荐填写(如果不填，则默认为“来自小程序”)
          // coverFile: self.data.v_coverFile, // 选填，视频封面
          progress: result=> {
            wx.hideLoading();
            self.setData({
              v_progress: parseInt(result.percent * 100)
            }) 
            wx.showLoading({
              title: "上传中 " + result.percent * 100 + "%"
            });
          },
          finish: result=> {
            wx.hideLoading();
            wx.showModal({
              title: "上传成功",
              content:'',
              //   "fileId:" + result.fileId + "\nvideoName:" + result.videoName,
              showCancel: false
            });
            self.reset();
            this.setData({
              video: result,
             'video.status': 2
            })
            this.data.video.duration = path.duration
            this.setData({
              video: this.data.video,
            })
          },
          error: result=> {
              wx.hideLoading();
              wx.showModal({
                title: "上传失败",
              //   content: JSON.stringify(result),
                content: '',
                showCancel: false
              });
            },
        });
  },
    /*
    飞流方式
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
                    console.log(res, "上传结束了！");

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
*/
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
                            success: function(res) {
                                if (res.confirm) {
                                    page.setData({
                                        showGetUserInfo: true
                                    })
                                    page.getUserInfo = function(e) {
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
                        this.deleteOnlineVideo(this.data.video.id);
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

    uploadMyImgs() {
        this.chooseImages(parseInt(9 - this.data.myImgs.length)).then((res) => {
            let imgs = res.map(imgUrl => {
                return {
                    url: imgUrl,
                    progress: 0,
                    status: 0,
                    errorMsg: "上传失败",
                }
            })

            this.setData({
                myImgs: this.data.myImgs.concat(imgs)
            })

            // 开始上传
            this.data.myImgs.map((img, index) => {

                this.toUploadMyImgs(img.url, index);

            })

        }).catch((res) => {
            console.log(res, "取消")
        })

    },

    toUploadMyImgs(imgPath, index) {
        let img = this.data.myImgs[index];
        if (img.status === 0) {
            img.status = 1;
            let uploadTask = wx.uploadFile({
                url: app.API_HOST + 'card/uploadImg',
                formData: {
                    token: app.globalData.token,
                },
                filePath: img.url,
                name: 'file',
                success: (res) => {
                    res.data = JSON.parse(res.data);
                    if (parseInt(res.data.code) >= 0) {
                        img.id = res.data.data.id;
                        img.url = res.data.data.url;
                        img.status = 2;
                        this.data.myImgs[index] = img;
                        this.setData({
                            myImgs: this.data.myImgs
                        })
                    } else {
                        img.status = -1;
                        img.errorMsg = res.data.msg;
                        this.data.myImgs[index] = img;
                        this.setData({
                            myImgs: this.data.myImgs
                        })
                    }
                },
                fail: (res) => {
                    console.log(res, "上传失败了！")
                    img.status = -1;
                    this.data.myImgs[index] = img;
                    this.setData({
                        myImgs: this.data.myImgs
                    })
                }
            })

            // 上传进度
            uploadTask.onProgressUpdate((res) => {
                if (res.progress < 100 && res.progress > 0) {
                    this.data.myImgs[index].progress = res.progress;
                    this.setData({
                        myImgs: this.data.myImgs
                    })
                }
            })
        }
    },

    reUploadMyImgs(e) {

        let index = e.currentTarget.dataset.index;
        let imgPath = this.data.myImgs[index].url;
        this.data.myImgs[index].status = 0;
        if (imgPath) {
            this.toUploadMyImgs(imgPath, index);
        } else if (this.data.myImgs.length < 9) {
            this.chooseImages(1).then((res) => {
                this.toUploadMyImgs(res[0], index)
            }).catch((res) => {
                console.log(res, "取消")
            })
        }

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

    previewMyImgs(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        let currentImg = this.data.myImgs[index];
        if (currentImg.url && parseInt(currentImg.status) === 2) {
            let urls = [];
            this.data.myImgs.map(img => {
                if (img.url && parseInt(img.status) === 2) {
                    urls.push(img.url);
                }
            })
            wx.previewImage({
                current: currentImg.url,
                urls: urls
            })
        }
    },

    deleteVideoCover() {
        wx.showModal({
            title: '提醒',
            content: '确认删除封面',
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
              url: app.API_HOST + "videoApp/getSignature",
              data: {
                  beid:app.globalData.beid,
                  token:app.globalData.token
              }
          }
          fetchApi(this, params).then(res => {
              this.setData({
                  signKey:res.data.data
              })
              resolve(res.data.data);
          }).catch(res => {
              reject(res);
          })
      })
  },

    /* 飞流方式
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
    */

    getCommunityGroup() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "XLFCommunity/getCommunityGroup",
                data: {}
            }
            fetchApi(this, params).then(res => {
                resolve(res.data.data);
            }).catch(res => {
                this.setData({
                    showStyle: 3
                })
                reject(res);
            })
        })
    },

    getTypeSetting() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "XLFCommunity/getGroupSettingWithPostType",
                data: {}
            }
            fetchApi(this, params).then(res => {
                let arr = res.data.data;
                let newArr = []
                this.data.typeMap.map(i => {
                    if (arr.includes(i.id)) {
                        newArr.push(i);
                    }
                })
                resolve(newArr);
            }).catch(res => {
                this.setData({
                    showStyle: 3
                })
                reject(res);
            })
        })
    },

    submit(e) {
        let data = {
            title: e.detail.value.title.replace(/(^\s*)|(\s*$)/g, ""),
            content: e.detail.value.content,
            type: this.data.typeArray[parseInt(e.detail.value.type)].id,
            groupId: [],
            ifPublic: this.data.isPublic ? 1 : 0
        }
        this.data.groups.map(i => {
            if (i.checked) {
                data.groupId.push(i.id);
            }
        })
        if (data.title.length < 1) {
            showTips("请填写标题", this);
            return "";
        }
        if (data.content.replace(/(^\s*)|(\s*$)/g, "") < 1) {
            showTips("请填写内容", this);
            return "";
        }
        if (data.type === 1) {
            data.imageList = [];
            this.data.myImgs.map(i => {
                if (i.status === 2) {
                    data.imageList.push(i.id);
                }
            })
            data.imageList = JSON.stringify(data.imageList);
        } else {
            if (this.data.video.status === 2) {
                data.videoUrl = this.data.video.videoUrl;
                data.videoLength = this.data.video.duration;
                // data.videoId = this.data.video.id;
                data.videoId = this.data.video.fileId;
                data.fileId = this.data.video.fileId;
                data.file_url = this.data.video.videoUrl;
            } else if (this.data.video.status === 0) {
                showTips("请上传视频", this);
                return "";
            } else {
                showTips("请等待视频上传完成", this);
                return "";
            }
            if (this.data.videoCover.status === 2) {
                data.videoCover = this.data.videoCover.url;
            } else if (this.data.video.status === 0) {
                showTips("请上传视频封面", this);
                return "";
            } else {
                showTips("请等待封面上传完成", this);
                return "";
            }
        }
        if (data.groupId.length < 1) {
            showTips("请选择需要发布的小组", this);
            return "";
        } else {
            data.groupId = JSON.stringify(data.groupId);
        }
        this.publishCommunityPost(data);
    },

    publishCommunityPost(data) {
        let params = {
            url: app.API_HOST + "XLFCommunity/publishCommunityPost",
            data: data
        }
        fetchApi(this, params).then(res => {
            this.data.submit = true;
            app.globalData.refresh = true;
            wx.showToast({
                title: '发布成功',
                icon: 'success',
                duration: 1500,
                mask: true,
                success: function(res) {
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1500)
                },
            })
        }).catch(res => {
            console.log(res);
        })
    },

    init() {
        Promise.all([this.getCommunityGroup(), this.getTypeSetting()]).then(res => {
            if (res[1].length > 0 && res[0].length > 0) {
                this.data.showStyle = 1;
            } else {
                this.data.showStyle = 2;
            }
            this.setData({
                groups: res[0],
                typeArray: res[1],
                showStyle: this.data.showStyle
            })

        }).catch(res => {
            console.log(res);
        })
    },

    networkFaildRealod() {
        this.setData({
            showStyle: 0
        })
        this.init();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        this.init();
    },

    closeVideo() {
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
      // getCanIUseGetUserProfile()
      // this.setData({
      //   canIUseGetUserProfile: app.globalData.canIUseGetUserProfile
      // })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        if (this.data.video.id && !this.data.submit) {
            this.deleteOnlineVideo(this.data.video.id);
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.init();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})