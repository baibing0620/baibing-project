const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { showTips, nav } from "../../utils/util";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        myImgs: [],
        detailImgs:[],
        descData:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let saveGoodsData = app.globalData.saveGoodsData,
            goods_banner = saveGoodsData.goods_banner || [],
           goods_detail_pic = saveGoodsData.goods_detail_pic || []
            goods_banner.forEach(item => {
                item.status = 2
            })
            goods_detail_pic.forEach(item => {
                item.status = 2
            })
            this.setData({
                descData: saveGoodsData.desc || '',
                myImgs: goods_banner,
                detailImgs: goods_detail_pic
            })
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    uploadMyImgs() {
        this.chooseImages(parseInt(6 - this.data.myImgs.length)).then((res) => {
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
                    console.log(res, "上传结束了！")
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
                // console.log("上传进度", res.progress)
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
        } else if (this.data.myImgs.length < 6) {
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
    uploadDetailImgs() {
        this.chooseImages(9).then((res) => {
            let imgs = res.map(imgUrl => {
                return {
                    url: imgUrl,
                    progress: 0,
                    status: 0,
                    errorMsg: "上传失败",
                }
            })

            this.setData({
                detailImgs: this.data.detailImgs.concat(imgs)
            })

            // 开始上传
            this.data.detailImgs.map((img, index) => {

                this.toUploadDetailImgs(img.url, index);

            })

        }).catch((res) => {
            console.log(res, "取消")
        })

    },

    toUploadDetailImgs(imgPath, index) {
        let img = this.data.detailImgs[index];
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
                        this.data.detailImgs[index] = img;
                        this.setData({
                            detailImgs: this.data.detailImgs
                        })
                    } else {
                        img.status = -1;
                        img.errorMsg = res.data.msg;
                        this.data.detailImgs[index] = img;
                        this.setData({
                            detailImgs: this.data.detailImgs
                        })
                    }
                },
                fail: (res) => {
                    console.log(res, "上传失败了！")
                    img.status = -1;
                    this.data.detailImgs[index] = img;
                    this.setData({
                        detailImgs: this.data.detailImgs
                    })
                }
            })

            // 上传进度
            uploadTask.onProgressUpdate((res) => {
                if (res.progress < 100 && res.progress > 0) {
                    this.data.detailImgs[index].progress = res.progress;
                    this.setData({
                        detailImgs: this.data.detailImgs
                    })
                }
            })
        }
    },

    reUploadDetailImgs(e) {

        let index = e.currentTarget.dataset.index;
        let imgPath = this.data.detailImgs[index].url;
        this.data.detailImgs[index].status = 0;
        if (imgPath) {
            this.toUploadDetailImgs(imgPath, index);
        } else{
            this.chooseImages(1).then((res) => {
                this.toUploadDetailImgs(res[0], index)
            }).catch((res) => {
                console.log(res, "取消")
            })
        }

    },

    deleteDetailImgs(e) {

        wx.showModal({
            title: '提示',
            content: '确认删除图片？',
            success: (res) => {
                if (res.confirm) {

                    let index = e.currentTarget.dataset.index;
                    this.data.detailImgs.splice(index, 1);
                    this.setData({
                        detailImgs: this.data.detailImgs
                    })

                }
            }
        })

    },

    previewDetailImgs(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        let currentImg = this.data.detailImgs[index];
        if (currentImg.url && parseInt(currentImg.status) === 2) {
            let urls = [];
            this.data.detailImgs.map(img => {
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
    descInput(e) {
        this.setData({
            descData: e.detail.value
        })
    },
    nextSteps() {
        if (this.data.descData.trim() == '') {
            showTips('请输入商品描述', this)
            return;
        }
        let myImgs = this.data.myImgs.map(item=>{
            return { id: item.id, url:item.url}
        })
        let detailImgs = this.data.detailImgs.map(item => {
            return { id: item.id, url: item.url }
        })
        let saveGoodsData = app.globalData.saveGoodsData
        saveGoodsData.description = this.data.descData 
        saveGoodsData.goods_banner = myImgs
        saveGoodsData.thumb_id = this.data.myImgs[0]?this.data.myImgs[0].id:''
        saveGoodsData.goods_detail_pic = detailImgs
        nav({
            url: "/centerControl/promotionSettingsGoods/promotionSettingsGoods"
        })
    },
    backSteps() {
        wx.navigateBack({
            delta: 1,
        })
    }
})