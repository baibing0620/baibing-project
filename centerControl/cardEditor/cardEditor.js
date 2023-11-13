const app = getApp()
import { fetchApi, getCardInfo } from "./../../api/api.js"
import { showTips, nav } from "../../utils/util"
import { subscribe, disSubscribe } from './../../utils/publisher'

Page({
    /**
     * 页面的初始数据 
     */
    data: {
        showStyle: 0,
        cardId: "0",
        extConfig: app.extConfig,
        recorder: {},
        recordTime: "00 : 00",
        showTagDelete: false,
        checkBoxValue: 63,
        checkBoxSetting: [
            [{
                    label: "查看名片",
                    value: 1
                },
                {
                    label: "查看资讯",
                    value: 2
                },
                {
                    label: "购买商品",
                    value: 4
                }
            ],
            [{
                    label: "查看官网",
                    value: 8
                },
                {
                    label: "拨打电话",
                    value: 16
                },
                {
                    label: "添加微信",
                    value: 32
                },
            ]
        ],
        unload: false,
        // 表单
        name: "",
        mobile: "",
        wechat: "",
        email: "",
        company: "",
        companyAddress: [""],
        job: "",
        selfIntro: "",
        audioIntro: "",
        tags: [],
        welcome: "",
        cardShareDesc:"",
        checkbox: "",
        newTagName: "",
        lnglat: [],
        // 头像
        avatar: {
            url: "",
            progress: 0,
            status: 0, // -1 = 上传失败；0 = 未上传；1 = 正在上传；2上传完成
            errorMsg: "上传失败",
        },
        // LOGO
        logo: {
            url: "",
            progress: 0,
            status: 0, 
            errorMsg: "上传失败",
        },
        company_jc: '',
        company_bm: '',
        // 录音
        recording: false,
        record: {
            url: "",
            progress: 0,
            status: 0,
            errorMsg: "上传失败"
        },
        // 我的图片
        myImgs: [],
        imgType: 2,
        showPhoneNumber:true
    },

    dataSource: {
        open_shop_info: 1, // 是否开启了资讯版块
        open_shop_card: 1 // 是否开启了商城版块
    },
    
    refreshCardInfo: false,
    /**
     * 页面的方法
     */

    audioIntroInput(e) {
        this.setData({
            audioIntro: e.detail.value
        })
    },

    bindTagAdd(e) {
        let value = e.detail.value.replace(/(^\s*)|(\s*$)/g, "");
        if (value.length > 0) {
            this.data.tags.push({
                tagName: value,
                likeNum: 0
            });
            this.setData({
                tags: this.data.tags,
                newTagName: "",
            })
        } else {
            this.setData({
                newTagName: "",
            })
        }
    },

    bindDeleteTag(e) {

        let index = e.currentTarget.dataset.index;
        this.data.tags.splice(index, 1);
        this.setData({
            tags: this.data.tags
        })

    },

    showTagDelete() {
        this.setData({
            showTagDelete: !this.data.showTagDelete ? true : false
        })
    },

    formatCardInfo(data) {
        if (data.company_logo) {
            this.data.logo.url = data.company_logo,
                this.data.logo.status = 2
        }
        if (data.avatar_url) {
            this.data.avatar.url = data.avatar_url,
                this.data.avatar.status = 2
        }
        if (parseInt(data.has_voice) && data.voice_url.url) {
            this.data.record.url = data.voice_url.url;
            this.data.audioIntro = data.voice_url.id;
            this.data.record.status = 2;
        }
        if (data.image_list.length > 0) {
            data.image_list.map(i => {
                if (i) {
                    this.data.myImgs.push({
                        url: i,
                        status: 2
                    })
                }
            })
        }
        if (data.lnglats) {
            this.data.lnglat = data.lnglats;
        }

        var newCheckBoxSetting = this.tidyCheckBoxSetting(data);
        let address = JSON.parse(data.addresses)
        address.length == 0 && address.push("")
        this.setData({
            name: data.name,
            avatar: this.data.avatar,
            logo: this.data.logo,
            mobile: data.mobile,
            wechat: data.wechat,
            email: data.email,
            company: data.company,
            company_jc: data.company_jc,
            company_bm: data.company_bm ? data.company_bm[0] : data.company_bm,
            companyAddress: address,
            job: data.position,
            selfIntro: data.description,
            record: this.data.record,
            audioIntro: this.data.audioIntro,
            welcome: data.auto_reply_desc,
            cardShareDesc: data.card_share_desc,
            myImgs: this.data.myImgs,
            imgType: data.image_show_style ? parseInt(data.image_show_style) : 2,
            tags: data.tag || [],
            checkBoxSetting: newCheckBoxSetting,
            checkBoxValue: parseInt(data.auto_reply_func),
            cardExtInfo: data.card_ext_info,
            showPhoneNumber: parseInt(data.mobile_is_show),
            style_id: data.style_id,
            showStyle: 1,
        })
    },

    tidyCheckBoxSetting(data) {
        var funcList = {
            1: '查看名片',
            2: '查看资讯',
            4: '购买商品',
            8: '查看官网',
            16: '拨打电话',
            32: '添加微信'
        }

        if (!parseInt(data.open_shop_info)) {
            this.dataSource.open_shop_info = 0;
            delete(funcList[2]);
        }
        if (!parseInt(data.open_shop_card)) {
            this.dataSource.open_shop_card = 0;
            delete(funcList[4]);
        }

        var newCheckBoxSetting = [];
        var cnt = 0;
        var item = [];
        for (var key in funcList) {
            item.push({
                label: funcList[key],
                value: key
            });
            cnt++;
            if (cnt == 3) {
                newCheckBoxSetting.push(item);
                cnt = 0;
                item = [];
            }
        }
        if (newCheckBoxSetting.length == 1) {
            newCheckBoxSetting.push(item);
        }
        return newCheckBoxSetting;
    },

    bindSumbmit(e) {
        const { value: data } = e.detail;
        data.mobile = (data.mobile.toString()).replace(/\s/g, '');
        const datas = {
            card_id: this.data.cardId,
            name: data.name,
            avatar_url: "",
            company_logo: "",
            company_jc: data.company_jc || '',
            company_bm: data.company_bm ? [data.company_bm] : '',
            wechat: data.wechat,
            email: data.email,
            mobile: data.mobile,
            company: data.company,
            addresses: JSON.stringify(this.data.companyAddress),
            lnglats: JSON.stringify(this.data.lnglat),
            position: data.job,
            description: data.selfIntro,
            tag: JSON.stringify(this.data.tags),
            auto_reply_desc: data.welcome,
            card_share_desc: data.cardShareDesc,
            image_list: [],
            has_voice: 0,
            auto_reply_func: 0,
            voice_id: "",
            mobile_is_show:this.data.showPhoneNumber
        }
        data.checkbox.map(i => {
            datas.auto_reply_func = datas.auto_reply_func + parseInt(i);
        })
        if (this.data.avatar.status === 2) {
            datas.avatar_url = this.data.avatar.url;
        }
        if (this.data.logo.status === 2) {
            datas.company_logo = this.data.logo.url;
        }
        if (this.data.record.status === 2) {
            datas.has_voice = 1;
            datas.voice_id = this.data.audioIntro;
            datas.voice_url = this.data.record.url;
        }
        this.data.myImgs.map(i => {
            if (i.status === 2) {
                datas.image_list.push({
                    "id": i.id,
                    "url": i.url
                });
            }
        })
        datas.image_list = JSON.stringify(datas.image_list);

        // 扩展字段处理
        datas.cardExtInfo = this.data.cardExtInfo.map((i, n) => {
            i.val = data[`extension_${n}`];
            return i;
        });

        this.checkForm(datas);
    },

    checkForm(data) {
        if (!(data.name && data.name.length > 1)) {
            showTips("请填写姓名", this);
            return;
        }
        if (!(data.mobile && /^1[3-9]\d{9}$/.test(data.mobile.replace(/\s+/g, "")))) {
            showTips("请正确填写手机号", this);
            return;
        }
        // if (!(data.wechat && data.wechat.length > 1)) {
        //     showTips("请填写微信号", this);
        //     return;
        // }
        if (!(data.email && /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(data.email)) && (data.email.replace(/\s+/g, "") !== "")) {
            showTips("请正确填写邮箱", this);
            return;
        }
        if (!(data.company && data.company.length > 1)) {
            showTips("请填写公司名称", this);
            return;
        }
        if (!(data.addresses && data.addresses.length > 1 && data.addresses !='[""]')) {
            showTips("请填写公司地址", this);
            return;
        }
        else {
            data.lnglat = JSON.stringify(data.lnglat);
        }
        // ------ 扩展字段 --------
        const notComplateExt = data.cardExtInfo.filter(i => i.isMust == 1 && !i.val)
        if (notComplateExt.length > 0) {
            showTips(`请填写${notComplateExt[0].title}`, this);
            return;
        } else {
            data.cardExtInfo = JSON.stringify(data.cardExtInfo);
        }
        // ------ 扩展字段 --------
        if (!(data.description && data.description.length > 1)) {
            showTips("请填写个人介绍", this);
            return;
        }
        if (!(data.auto_reply_desc && data.auto_reply_desc.length > 1)) {
            showTips("请填写欢迎语", this);
            return;
        }
        if (data.has_voice === 1 && data.voice_id.replace(/\s+/g, "") === "") {
            showTips("请填写音频名称", this);
            return;
        }
        this.submit(data);
    },

    saveCardInfo(data) {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "card/saveCard",
                data: data
            };
            fetchApi(this, params).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    },

    setImageShowStyle() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "Card/setDefaultImageShowStyle",
                data: {
                    cardId: this.data.cardId,
                    style: this.data.imgType
                }
            };
            fetchApi(this, params).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    },

    submit(data) {
        Promise.all([this.saveCardInfo(data), this.setImageShowStyle()]).then(res => {
            wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500,
                mask: true,
                success: _ => {
                    this.refreshCardInfo = true
                    setTimeout(_ => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1500)
                }
            })
        }).catch(res => {
            console.log(res);
        })
    },

    chooseImages(number) {
        return new Promise((resolve, reject) => {
            wx.chooseImage({
                count: number,
                sizeType: ["original"],
                success: (res) => {
                    resolve(res.tempFilePaths);
                },
                fail: (res) => {
                    reject(res);
                }
            })
        })
    },
    // 选择头像
    uploadAvatar() {

        this.chooseImages(1).then((res) => {

            this.toUploadAvatar(res[0]);

        }).catch((res) => {
            console.log(res, "取消")
        })
    },
    // 选择LOGO
    uploadCompanyLogo() {

        this.chooseImages(1).then((res) => {

            this.toUploadCompanyLogo(res[0]);

        }).catch((res) => {
            console.log(res, "取消")
        })
    },
    // 上传头像
    toUploadAvatar(imgPath) {

        let avatar = this.data.avatar;
        // 开始上传

        let uploadTask = wx.uploadFile({
            url: app.API_HOST + 'card/uploadImg',
            formData: {
                token: app.globalData.token,
            },
            filePath: imgPath,
            name: 'file',
            success: (res) => {
                res.data = JSON.parse(res.data);
                if (parseInt(res.data.code) >= 0) {
                    avatar.id = res.data.data.id
                    avatar.url = res.data.data.url
                    avatar.status = 2;
                    this.setData({
                        avatar: avatar
                    })
                } else {
                    avatar.status = -1;
                    avatar.errorMsg = res.data.msg;
                    this.setData({
                        avatar: avatar
                    })
                }

            },
            fail: (res) => {
                console.log(res, "上传失败了！")
                avatar.status = -1;
                this.setData({
                    avatar: avatar
                })
            }
        })
        // 上传进度
        uploadTask.onProgressUpdate((res) => {
            if (res.progress > 0 && res.progress < 100) {
                avatar.status = 1;
                avatar.progress = res.progress;
                this.setData({
                    avatar: avatar
                })
            }
        })
    },
    // 上传LOGO
    toUploadCompanyLogo(imgPath) {

        let logo = this.data.logo;
        // 开始上传
        let uploadTask = wx.uploadFile({
            url: app.API_HOST + 'card/uploadImg',
            formData: {
                token: app.globalData.token,
            },
            filePath: imgPath,
            name: 'file',
            success: (res) => {
                res.data = JSON.parse(res.data);
                if (parseInt(res.data.code) >= 0) {
                    logo.id = res.data.data.id
                    logo.url = res.data.data.url
                    logo.status = 2;
                    this.setData({
                        logo: logo
                    })
                } else {
                    logo.status = -1;
                    logo.errorMsg = res.data.msg;
                    this.setData({
                        logo: logo
                    })
                }
            },
            fail: (res) => {
                console.log(res, "上传失败了！")
                logo.status = -1;
                this.setData({
                    logo: logo
                })
            }
        })
        // 上传进度
        uploadTask.onProgressUpdate((res) => {
            if (res.progress > 0 && res.progress < 100) {
                logo.status = 1;
                logo.progress = res.progress;
                this.setData({
                    logo: logo
                })
            }
        })
    },

    uploadMyImgs() {
        this.chooseImages(parseInt(12 - this.data.myImgs.length)).then((res) => {
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
        } else if (this.data.myImgs.length < 12) {
            this.chooseImages(1).then((res) => {
                this.toUploadMyImgs(res[0], index)
            }).catch((res) => {
                console.log(res, "取消")
            })
        }

    },

    deleteAvatar() {
        wx.showModal({
            title: '提示',
            content: '确认删除头像？',
            success: (res) => {
                if (res.confirm) {

                    this.setData({
                        avatar: {
                            url: "",
                            progress: 0,
                            status: 0,
                            errorMsg: "上传失败",
                        },
                    })

                }
            }
        })
    },
    deleteCompanyLogo() {
        wx.showModal({
            title: '提示',
            content: '确认删除企业LoGo？',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        logo: {
                            url: "",
                            progress: 0,
                            status: 0,
                            errorMsg: "上传失败",
                        },
                    })

                }
            }
        })
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
        console.log(e);
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

    startRecord() {
        wx.getSetting({
            success: (res) => {
                let recordSetting = res.authSetting["scope.record"];
                if (recordSetting === false) {
                    wx.showModal({
                        title: '提示',
                        content: '小程序没有录音权限，确认前往个人中心授权？',
                        showCancel: true,
                        confirmColor: "#ff9b1f",
                        success: function(res) {
                            if (res.confirm) {
                                nav({ url: "/pages/personal/personal" })
                            }
                        }
                    })
                } else {
                    let options = {
                        duration: 300000,
                        sampleRate: 44100,
                        numberOfChannels: 1,
                        encodeBitRate: 192000,
                        format: 'mp3',
                        frameSize: 50
                    }
                    this.data.recorder.start(options);
                }
            }
        })

    },

    stopRecord() {
        this.data.recorder.stop();
        this.setData({
            recording: false
        })
    },

    reUploadRecord() {
        if (this.data.record.url) {
            this.uploadRecord(this.data.record.url);
        } else {
            this.reRecord();
        }
    },

    reRecord() {
        this.data.record.url = "";
        this.data.record.status = 0;
        this.setData({
            record: this.data.record
        })
    },

    uploadRecord(tempFilePath) {
        this.data.record.status = 1;
        this.setData({
            record: this.data.record
        })
        let uploadTask = wx.uploadFile({
            url: app.API_HOST + 'card/uploadVoice',
            filePath: tempFilePath,
            name: 'file',
            formData: {
                token: app.globalData.token,
            },
            success: (res) => {
                res.data = JSON.parse(res.data);
                if (parseInt(res.data.code) >= 0) {
                    this.data.record.id = res.data.data.id;
                    this.data.record.url = res.data.data.url;
                    this.data.record.status = 2;
                    this.setData({
                        record: this.data.record
                    })
                } else {
                    this.data.record.status = -1;
                    this.data.record.errorMsg = res.data.msg;
                    this.setData({
                        record: this.data.record
                    })
                }
            },
            fail: (res) => {
                console.log(res, "上传失败了！")
                this.data.record.status = -1;
                this.setData({
                    record: this.data.record
                })
            }
        })
        // 上传进度
        uploadTask.onProgressUpdate((res) => {
            if (res.progress > 0 && res.progress < 100) {
                this.data.record.status = 1;
                this.data.record.progress = res.progress;
                this.setData({
                    record: this.data.record
                })
            }
        })
    },

    addressFocus(e) {
        let index = e.currentTarget.dataset.index
        let lngat =  this.data.lnglat[index]
        if (!this.data.companyAddress[index] || !(lngat && lngat[0] && lngat[1])) {
            this.getLocation(index);
        }
    },

    addressInput(e) {
        let index = e.currentTarget.dataset.index
        this.data.companyAddress[index] = e.detail.value;
        if (!e.detail.value) {
            this.getLocation(index);
        }
    },

    getLocation(e) {
        let index = e.currentTarget ? e.currentTarget.dataset.index:e
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userLocation']) {
                    wx.chooseLocation({
                        success: res => {
                            this.data.companyAddress[index] = res.address
                            this.data.lnglat[index] = [res.longitude, res.latitude]
                            this.setData({
                                companyAddress: this.data.companyAddress,
                                lnglat: this.data.lnglat
                            })
                        },
                    })
                } else if (res.authSetting['scope.userLocation'] == undefined) {
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success: () =>{
                            wx.chooseLocation({
                                success: res => {
                                    this.data.companyAddress[index] = res.address
                                    this.data.lnglat[index] = [res.longitude, res.latitude]
                                    this.setData({
                                        companyAddress: this.data.companyAddress,
                                        lnglat: this.data.lnglat
                                    })
                                }
                            })
                        }
                    })
              
                } else {
                    this.setData({
                        showopenSetting: true,
                        setttingContent: '请对地理位置授权后，重新获取定位'
                    })
                }
            },
        })
    },

    cancelSetting() {
        this.setData({
            showopenSetting: false,
        })
    },

    imgTypeChange(e) {
        let type = parseInt(e.currentTarget.dataset.type);
        if (type !== this.data.imgType) {
            this.setData({
                imgType: type
            })
        }
    },
    changeNumber(){
        this.setData({
            showPhoneNumber:this.data.showPhoneNumber==1?0:1,
            showMessage:true
        })
        setTimeout(() => {
            this.setData({
                showMessage: false
            })
        }, 2800)
        
    },
    addCompanyAddress(e){
        let companyAddress= this.data.companyAddress,
        index = e.currentTarget.dataset.index
        if(index == 0){
            if (companyAddress.length > 4) {
                return;
            }
            companyAddress.push("")
            this.data.lnglat.push([])
        }else{
            this.data.companyAddress.splice(index,1)
            this.data.lnglat.splice(index,1)
        }
        
        this.setData({
            companyAddress: this.data.companyAddress
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            cardId: app.globalData.cardId,
            recorder: wx.getRecorderManager()
        })
        subscribe('cardInfo', val => {
            try {
                this.formatCardInfo(val)
            } catch (error) {
                console.error(error)
                this.setData({
                    showStyle: 3
                })
            }
        }, this)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

        // 录音开始
        this.data.recorder.onStart((res) => {
            this.setData({
                recording: true
            })

            // 开始也计时了
            let timeSec = 0;
            let recordTimer = setInterval(() => {
                if (this.data.recording) {

                    timeSec++;
                    let sec = (timeSec % 60).toString();
                    let min = Math.floor(timeSec / 60).toString();
                    if (sec.length < 2) {
                        sec = "0" + sec
                    }
                    if (min.length < 2) {
                        min = "0" + min
                    }
                    this.setData({
                        recordTime: min + " : " + sec
                    })

                } else {
                    clearInterval(recordTimer);
                    this.setData({
                        recordTime: "00 : 00"
                    })
                }
            }, 1000)
        })

        // 录音结束
        this.data.recorder.onStop((res) => {
            if (!this.data.unload) {
                let {
                    tempFilePath
                } = res;
                this.data.record.url = tempFilePath;
                this.setData({
                    record: this.data.record,
                    recording: false
                })
                this.uploadRecord(tempFilePath);
            }
        })

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            showopenSetting: false
        })
        app.showRemind(this);
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
        if (this.data.recording) {
            this.stopRecord();
        }
        this.setData({
            unload: true
        })
        disSubscribe(this)
        this.refreshCardInfo && getCardInfo(this)
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        getCardInfo(this)
    },


})