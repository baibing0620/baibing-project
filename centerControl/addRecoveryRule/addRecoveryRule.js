const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
    nav,
    setCurrentLoginUserCardInfo,
    showTips,
    showToast,
    previewImage,
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        matchingRelation: ['包含', '等于'],
        matchingIndex: 0,
        contentType: ['文字', '图片'],
        typeIndex: 0,
        replayImg: {
            url: "",
            progress: 0,
            status: 0, // -1 = 上传失败；0 = 未上传；1 = 正在上传；2上传完成
            errorMsg: "上传失败",
            id:'',
            width:'',
            height:''
        },
        replayInfo:'',
        keywords:[],
        words:'',
        disabled:false,
        pressIndex: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.id){
            this.setData({
                id: options.id || 0
            })
            getCustomerServiceById(this)
        }
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
        const {id} = this.data;
        if (id){
            getCustomerServiceById(this);
        }
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
    changeRelation(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            matchingIndex: index
        })
    },
    changeType(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            typeIndex: index
        })
    },
    uploadAvatar() {

        this.chooseImages(1).then((res) => {
            wx.getImageInfo({
                src: res[0],
                success:(res)=> {
                    this.data.replayImg.width = res.width
                    this.data.replayImg.height = res.height
                }
            })
            this.toUploadAvatar(res[0]);

        }).catch((res) => {
            console.log(res, "取消")
        })
    },

    toUploadAvatar(imgPath) {

        let replayImg = this.data.replayImg;
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
                    replayImg.id = res.data.data.id
                    replayImg.url = res.data.data.url
                    replayImg.status = 2;
                    this.setData({
                        replayImg: replayImg
                    })
                } else {
                    replayImg.status = -1;
                    replayImg.errorMsg = res.data.msg;
                    this.setData({
                        replayImg: replayImg
                    })
                }
            },
            fail: (res) => {
                console.log(res, "上传失败了！")
                replayImg.status = -1;
                this.setData({
                    replayImg: replayImg
                })
            }
        })
        // 上传进度
        uploadTask.onProgressUpdate((res) => {
            if (res.progress > 0 && res.progress < 100) {
                replayImg.status = 1;
                replayImg.progress = res.progress;
                this.setData({
                    replayImg: replayImg
                })
            }
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
    deleteAvatar() {
        wx.showModal({
            title: '提示',
            content: '确认删除图片？',
            success: (res) => {
                if (res.confirm) {

                    this.setData({
                        replayImg: {
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
    changeContent(e) {
        this.setData({
            replayInfo: e.detail.value
        })
    },
    AddRecoveryRule(){
        this.setData({
            disabled:true
        })
        let reply_type= parseInt(this.data.typeIndex) + 1
        let replayInfo= this.data.replayInfo
        if (this.data.keywords.length == 0){
            showTips('匹配关键字段至少要有一个哦', this)
            this.setData({
                disabled: false
            })
            return;
        }
        if (reply_type == 1){
            if (replayInfo.trim() == ''){
                showTips('回复文字内容不能为空哦',this)
                this.setData({
                    disabled: false
                })
                return;
            }
        }else{
            if (this.data.replayImg.id == '' || this.data.replayImg.id == 0){
                showTips('请上传回复图片哦', this)
                this.setData({
                    disabled: false
                })
                return;
            }
        }
        var params = {
            url: app.API_HOST + 'Chat/addCustomerService',
            data: {
                relation: parseInt(this.data.matchingIndex) +1,
                keywords:this.data.keywords,
                reply_type: reply_type,
                reply_content:reply_type == 1?this.data.replayInfo:"",
                imgId: reply_type == 2 ?this.data.replayImg.id:'',
                width: reply_type == 2 ?this.data.replayImg.width:'',
                height: reply_type == 2 ?this.data.replayImg.height:''
            }

        };
        if(this.data.id){
            params.url = app.API_HOST + 'Chat/updateCustomerService'
            params.data.id = this.data.id
        }
        fetchApi(self, params).then(res => {
            showToast('规则添加成功','success')
            app.globalData.refresh = true;
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
            this.setData({
                disabled: false
            })
        }).catch((err) => {
            this.setData({
                disabled: false
            })
        });
    },
    addKeyWords(e){
        let value = e.detail.value
        if (value.trim() == ''){
            return
        }
        if (this.data.keywords.indexOf(value) == -1){
            this.data.keywords.push(value)
        }else{
            showTips('和已有的关键字段重复，请重新输入新的关键字段',this)
            return;
        }
       
        this.setData({
            keywords: this.data.keywords,
            words:'',
            pressIndex:0
        })
    },
    previewImage(e){
        previewImage(e)
    },
    showDeleteTag() {
        this.setData({
            pressIndex: !this.data.pressIndex ? 1 : 0
        })
    },
    hideDeleteTag(){
        this.setData({
            pressIndex: 0
        })
    },
    deleteTag(e){
        let index = e.currentTarget.dataset.index
        this.data.keywords.splice(index,1)
        this.setData({
            keywords: this.data.keywords
        })
    }
})
function getCustomerServiceById(self){
    var params = {
        url: app.API_HOST + 'Chat/getCustomerServiceById',
        data: {
            id: self.data.id
        }

    };
    fetchApi(self, params).then(res => {
        let data = res.data.data
        let reply_type = parseInt(data.reply_type) - 1
        let replayImg = {
            url: data.reply_img_url,
            id: data.reply_img_id,
            width: data.reply_img_width,
            height: data.reply_img_height,
            status: reply_type ==1?2:0
        }
        self.setData({
            matchingIndex: parseInt(data.relation)-1 ,
            keywords: JSON.parse(data.keywords),
            typeIndex: reply_type,
            replayInfo: data.reply_content,
            replayImg: replayImg
        })
    }).catch((err) => {
       console.log('error: ', err)
    });
}