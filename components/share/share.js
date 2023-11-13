const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        showShare: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal, changedPath) {
                if (newVal == oldVal) {
                    return
                }
                if (newVal) {
                    this.setData({
                        showShare: newVal,
                        isMask: 'mask',
                        isShare: true
                    })
                    this.getPoster()
                } else if (!newVal) {
                    this.setData({
                        showShare: newVal
                    })
                }
            }
        },
        imgCode: {
            type: null,
            value: ''
        },
        isNav: {
            type: Boolean,
            value: false
        },
        isTabbar: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isMask: '',
        isShare: false,
        showPost: false,
        QRcodeLoadIf: true,
        posterHeight: 0,
        globalData: app.globalData,
        top: 0,
        imgHeight: 810,
        isTabbar: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 图片裁剪
        getPoster() {
            let QRcode = this.data.imgCode
            console.log(QRcode)
            let that = this
            wx.getSystemInfo({
                success(res) {
                    let windowWidth = res.windowWidth
                    let windowHeight = res.windowHeight
                    let top = 0
                    if (that.properties.isNav) {
                        windowHeight = windowHeight-(app.globalData.statusBarHeight + app.globalData.getMenuButtonBoundingClientRect)
                        top = app.globalData.statusBarHeight + app.globalData.getMenuButtonBoundingClientRect
                    }
                    let rpxHeight = (750 / windowWidth) * windowHeight
                    let box = rpxHeight - 326
                    if (that.properties.isTabbar) {
                        box -= 100
                    }
                    that.setData({
                        showPost: true,
                        posterHeight: box,
                        top: top
                    })
                }
            })
        },
        qRcodeShow(e) {
            let posterScale = 1
            let posterHeight = this.data.posterHeight
            console.log('图片属性',e.detail)
            let imgHeight = (580/e.detail.width)*e.detail.height
            if (posterHeight >= (imgHeight+20)) {
            } else {
                // 缩小比率
                posterScale = posterHeight / (imgHeight+20)
            }
            // this.setData({
            //     posterScale: posterScale,
            //     imgHeight: imgHeight,
            //     // QRcodeLoadIf: false
            // })
            setTimeout(() => {
                this.setData({
                    posterScale: posterScale,
                    imgHeight: imgHeight,
                    QRcodeLoadIf: false
                })
            }, 300);
        },
        hideMask() {
            // let isShare = this.data.isShare == '' ? '' : 'un-share-box'
            this.setData({
                showShare: false,
                isMask: 'unmask',
                isShare: false,
                showPost: false,
                QRcodeLoadIf: true
            })
        },
        downloadPoster() {
            // 判断有没有权限
            let that = this
            wx.getSetting({
                success(res) {
                    console.log('这里是获取权限', res)
                    if (!res.authSetting['scope.writePhotosAlbum']) {
                        //没有权限，发起授权
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success() {
                                // 用户已经同意
                                that.savePhoto()
                            },
                            fail() {
                                console.log('用户拒绝了')
                                // 用户拒绝，设置弹窗必须通过button触发 打开设置弹窗
                                wx.showModal({
                                    title: '提示',
                                    content: '请允许小程序使用保存到相册功能，点击确定去设置',
                                    success(res) {
                                        if (res.confirm) {
                                            wx.openSetting({
                                                success() {
                                                    wx.authorize({
                                                        scope: 'scope.writePhotosAlbum',
                                                        success() {
                                                            that.savePhoto();
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    } else {//用户已授权，保存到相册
                        that.savePhoto()
                    }
                }
            })
        },
        savePhoto() {
            wx.showLoading({
                title: '下载中...',
            })
            let QRcode = this.data.imgCode
            wx.request({
                url: QRcode,
                responseType: 'arraybuffer',
                success(res) {
                    console.log(res)
                    let fileManager = wx.getFileSystemManager();//获取文件管理器
                    let filePath = wx.env.USER_DATA_PATH + '/inner.jpg';//设置临时路径
                    fileManager.writeFile({//获取到的数据写入临时路径
                        filePath: filePath,//临时路径
                        encoding: 'binary',//编码方式，二进制
                        data: res.data,//请求到的数据
                        success: function (res) {
                            wx.saveImageToPhotosAlbum({
                                filePath: filePath,
                                success(_res) {
                                    console.log(_res)
                                    wx.hideLoading()
                                    wx.showToast({
                                        title: '保存成功',
                                        icon: 'success',
                                        duration: 1000
                                    });
                                },
                                fail(_res) {
                                    wx.showToast({
                                        title: "保存失败",
                                        icon: 'none'
                                    });
                                }
                            })
                        },
                        fail: function (res) {
                            wx.showToast({
                                title: "保存失败",
                                icon: 'none'
                            });
                        },
                    });
                }
            })
        },
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            this.setData({
                isTabbar: this.properties.isTabbar
            })
        }
    },

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
        this.setData({
            isTabbar: this.properties.isTabbar
        })
    } // 此处attached的声明会被lifetimes字段中的声明覆盖
})
