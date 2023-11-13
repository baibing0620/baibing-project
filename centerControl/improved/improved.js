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
    showTips,
    hideLoading,
    showToast,
    shareParam
} from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        items: [],
        opacity: 1,
        extConfig: app.extConfig,
        currentIndex: 0,
        itemLength: 3,
        cardInfo: '',
        qrCodeUrl: '',
        tabIndex: 0,
        switchTab: {
            tabs: [
                "系统海报",
                "自定义海报"
            ],
            themeColor: '#1F94FD',
            currentIndex: 0,
            top: 0,
            position: "fixed",
        },
        poster: {
            url: "",
            progress: 0,
            status: 0, // -1 = 上传失败；0 = 未上传；1 = 正在上传；2上传完成
            errorMsg: "上传失败",
        },
        isIphoneX: app.globalData.isIphoneX
    },
    dataStore: {
        index: 0,
        allItem: [],
        nextItems: []
    },
    // getImage(url) {
    //   return `${app.API_HOST}card/makeMyEncouragementPoster?cardId=${app.globalData.cardId}&imageUrl=${url}`
    // },

    onTabClick(e) {
        let index = e.detail.currentIndex
        this.setData({
            tabIndex: index
        });
        if (index == 1){
            this.getImageList(1)
        }else{
            this.getImageList()
        }
    },

    getImageList(sysPer=0) {
        var param = {
            url: 'card/getEncouragePosterList',
            data: {
                sysPer: sysPer
            }
        }
        fetchApi(this, param).then(res => {
            let data = res.data.data
            this.dataStore.allItem = data.posterList.slice(3)
            this.dataStore.nextItems = data.posterList
            if (sysPer){
                if (data.posterList.length == 0){
                    this.data.poster.status = 0
                    data.posterList.push({ status: 0 })
                }else{
                    this.data.poster.status = 2
                }
            }
            this.setData({
                items: data.posterList.slice(0, 3),
                'poster.status': this.data.poster.status,
                cardInfo: data.cardInfo,
                qrCodeUrl: data.qrCodeUrl
            })
            this.initStyle()
            
        })
    },

    initStyle() {
        let items = this.data.items;
        try{
            items[0].transform = "";
            items[1].transform = "scale(.95, .95) translate(0 , 42.5rpx);";
            items[2].transform = "scale(.9, .9) translate(0 , 85rpx)";
        }catch(e){

        }
        this.setData({
            items: this.data.items,
            transition: '0.8s'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getImageList();
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        setTimeout(() => {
            this.initStyle();
        }, 300)
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

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

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.getImageList();
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

    },
    // 海报json配置
    palette() {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
            path = encodeURIComponent(`pages/home/home?${shareParam()}`),
            qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}`
        const { avatar_url, mobile, company, position, name } = this.data.cardInfo,
              image_url = this.data.items[0].image_url
        return{
            "width": "750px",
            "height": "1000px",
            "background": "#ffffff",
            "views": [
                {
                    "type": "image",
                    "url": `${image_url}?imageView2/1/w/694/h/725`, //主图
                    "css": {
                        "width": "750px",
                        "height": "784px",
                        "top": "0px",
                        "left": "0px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "image",
                    "url": qrcode, //太阳码
                    "css": {
                        "width": "170px",
                        "height": "170px",
                        "top": "810px",
                        "left": "564px",
                        "rotate": "0",
                        "borderRadius": "0",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                  "type": "rect",
                  "css": {
                    "background": "#ffffff",
                    "width": "78px",
                    "height": "78px",
                    "top": "856px",
                    "left": "610px",
                    "rotate": "0",
                    "borderRadius": "500px",
                    "shadow": "",
                    "color": "#ffffff"
                  }
                },
                {
                    "type": "image",
                    "url": avatar_url,   //太阳码中头像
                    "css": {
                        "width": "60px",
                        "height": "60px",
                        "top": "866px",
                        "left": "619px",
                        "rotate": "0",
                        "borderRadius": "1000px",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "aspectFill"
                    }
                },
                {
                    "type": "text",
                    "text": position,
                    "css": {
                        "color": "#ff9b1f",
                        "background": "rgba(0,0,0,0)",
                        "width": "320px",
                        "height": "42.89999999999999px",
                        "top": "826px",
                        "left": `${name.length*43+60}px`,
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "30px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "43.290000000000006px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": name,
                    "css": {
                        "color": "#333333",
                        "background": "rgba(0,0,0,0)",
                        "width": "500px",
                        "height": "57.19999999999999px",
                        "top": "816px",
                        "left": "40px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "40px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "57.72000000000001px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": company,
                    "css": {
                        "color": "#666666",
                        "background": "rgba(0,0,0,0)",
                        "width": "500px",
                        "height": "42.89999999999999px",
                        "top": "932px",
                        "left": "40px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "30px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "43.290000000000006px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": mobile,
                    "css": {
                        "color": "#666666",
                        "background": "rgba(0,0,0,0)",
                        "width": "500px",
                        "height": "42.89999999999999px",
                        "top": "885px",
                        "left": "40px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "30px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "43.290000000000006px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                }
            ]
        }
    },
    eventGetImage(e) {
        this.download(e.detail.path)
    },
    saveImageToPhotosAlbum(){
        if (this.data.tabIndex == 1 && this.data.poster.status == 0) {
            showTips('请先上传完图片之后在保存', this);
            return;
        } else if (!this.data.items[0].id) {
            showTips('无保存链接', this);
            return;
        }
        showLoading({
            title: '正在保存'
        });
        this.setData({
            palette: this.palette()
        })
    },
    download(qrShareCardUrl) {
        wx.saveImageToPhotosAlbum({
            filePath: qrShareCardUrl,
            success(res) {
                showToast('保存成功', 'success')
            },
            fail:(err)=> {
                hideLoading()
                console.log('error: ', err)
                wx.getSetting({
                    success:(resSetting)=> {
                        if (!resSetting.authSetting['scope.writePhotosAlbum']) {
                            this.setData({
                                showopenSetting: true,
                                setttingContent: '需要您的授权才可以保存图片'
                            })
                        }
                    },
                    fail(err) {
                        console.log('error: ', err)
                    }
                })

            }
        })
    },
    switch () {
        // 未上传海报后切换
        if (this.data.tabIndex == 1 && this.data.poster.status == '0'){
            showTips('请先上传图片后在进行操作', this)
            return
        }
        let items = this.data.items
        //将海报变成海量数据
        if (this.dataStore.allItem.length == 0){
            this.dataStore.allItem = this.dataStore.nextItems
        }
        let array = this.dataStore.allItem.slice(0, 1)
        items = items.concat(array)
        this.dataStore.allItem = this.dataStore.allItem.slice(1)
       try{
           items[0].transform = "scale(1.2) translateX(-1100rpx) skewX(-35deg)";
           items[1].transform = "";
           items[2].transform = "scale(.95, .95) translate(0 , 42.5rpx)";
           items[3].transform = "scale(.9, .9) translate(0 , 85rpx)";

       }catch(e){
           
       }
        this.setData({
            disabled: true,
            transition: '.5s',
            items: items,
            'poster.status': 2
        })
        items.shift()


        setTimeout(() => {
            this.setData({
                items: items,
                transition: '0',
                disabled: false,
                'poster.status': 2
            })
        }, 500)

    },
    cancelSetting() {
        this.setData({
            showopenSetting: false
        })
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

    upload() {
        this.dataStore.id = ''
        this.chooseImages(1).then((res) => {
            this.toUpload(res[0]);
        }).catch((res) => {
            console.log(res, "取消")
        })
    },

    toUpload(imgPath) {

        let poster = this.data.poster;
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
                    poster.id = res.data.data.id
                    poster.url = res.data.data.url
                    poster.status = 2;
                    this.setData({
                        poster: poster
                    })
                    this.uploadPersonalEnPoster()
                } else {
                    poster.status = -1;
                    poster.errorMsg = res.data.msg;
                    this.setData({
                        poster: poster
                    })
                }

            },
            fail: (res) => {
                console.log(res, "上传失败了！")
                poster.status = -1;
                this.setData({
                    poster: poster
                })
            }
        })
        // 上传进度
        uploadTask.onProgressUpdate((res) => {
            if (res.progress > 0 && res.progress < 100) {
                poster.status = 1;
                poster.progress = res.progress;
                this.setData({
                    poster: poster
                })
            }
        })
    },
    uploadPersonalEnPoster(){
        let params = {
            url: app.API_HOST + "Card/uploadPersonalEnPoster",
            data: {
                imgId: this.data.poster.id,
                id:this.dataStore.id
            }
        }
        fetchApi(this, params).then(res => {
            this.getImageList(1)
        }).catch(res => {
            console.log(res);
        })
    },
    reUpload(e) {
        this.dataStore.id = e.currentTarget.dataset.id
        this.chooseImages(1).then((res) => {
            this.toUpload(res[0]);
        }).catch((res) => {
            console.log(res, "取消")
        })
    },
    addImg(){
        this.setData({
            'poster.status':0,                                                                                                                   
        })
    },
    del(e){
        let id = e.currentTarget.dataset.id
        wx.showModal({
            title: '提醒',
            content: '确定删除该海报',
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    let params = {
                        url: app.API_HOST + "Card/delPersonalEnPoster",
                        data: {
                            id: id
                        }
                    }
                    fetchApi(this, params).then(res => {
                        this.getImageList(1)
                    }).catch(res => {
                        console.log(res);
                    })
                }
            }
        })
    }
})