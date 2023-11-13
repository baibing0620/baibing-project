const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { showTips, showToast ,previewImage} from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        replayImg: {
            url: "",
            progress: 0,
            status: 0, // -1 = 上传失败；0 = 未上传；1 = 正在上传；2上传完成
            errorMsg: "上传失败",
            id: 0,
            width: '',
            height: ''
        },
        categoryTitle:"",
        categoryStatus: ["展示","隐藏"],
        checkIndex:0,
        categorySort:'',
        pushEnable:false,
        id: '',
        categoryLevel:['一级分类','二级分类'],
        levelIndex:0,
        parentList:[],
        parentIndex:-1
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if(options.id){
            this.data.id=options.id||0
            this.setData({
                id:this.data.id
            })
            getCategoryDetail(this)
        }
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
        getCategoryDetail(this);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    uploadAvatar() {

        this.chooseImages(9).then((res) => {
            wx.getImageInfo({
                src: res[0],
                success: (res) => {
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
    deleteImgs() {
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
    changeTitle(e){
        this.setData({
            categoryTitle: e.detail.value 
        })
    },
    changeSort(e){
        this.setData({
            categorySort: e.detail.value
        })
    },
    chooseCategoryStatus(e){
        this.setData({
            checkIndex: e.currentTarget.dataset.index
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
    previewImage(e) {
        previewImage(e)
    },
    addCategory(e){
        let categoryTitle = e.detail.value.categoryTitle
        let categorySort = e.detail.value.categorySort      
        if (categoryTitle.trim() == ''){
            showTips('请填写分类名称',this)
            return;
        }
        if (categorySort.trim() == ''){
            showTips('请输入分类排序', this)
            return;
        }
        if (!this.data.replayImg.id ||  this.data.replayImg.id == 0){
            showTips('请上传类别封面', this)
            return;
        }
        if (this.data.levelIndex != 0&&this.data.parentIndex == -1){
            showTips('请选择父级分类', this)
            return;
        }
        this.setData({
            pushEnable:true
        })
        let param = {
            url: app.API_HOST + "CardGoods/add",
            data: {
                name: categoryTitle,
                thumb_id: this.data.replayImg.id,
                displayorder: categorySort,
                enabled:this.data.checkIndex == 1?0:1,
                parentid:this.data.levelIndex == 0?0:this.data.parentList[this.data.parentIndex].id
            }
        }
        if(this.data.id){
            param.url = app.API_HOST + "CardGoods/editCategory"
            param.data.cid = this.data.id
        }
        fetchApi(this, param).then(res => {
            if (this.data.id){
                showToast('编辑成功', 'success')
            }else{
                showToast('添加成功', 'success')
            }
            app.globalData.refresh = true
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1500)
        }).catch((err) => {
            this.setData({
                pushEnable: false
            })
        });
    },
    changeCategoryLevel(e){
        this.setData({
            levelIndex:e.detail.value
        })
        this.getGoodsFatherCategory()
    },
    setParent(e) {
        this.setData({
            parentIndex: e.detail.value
        })
    },
    getGoodsFatherCategory(){
      return new Promise((resolve,reject)=>{
            let param = {
                url: app.API_HOST + "CardGoods/getCardFatherCategory",
                data: {
                }
            }
            fetchApi(this, param).then(res => {
                let data = res.data.data.filter(item=>item.id != this.data.id)
                this.setData({
                    parentList: data
                })
                resolve(data)
            }).catch((err) => {
                reject(err)
            }); 
        })
        
    }
})
function getCategoryDetail(self){
    let param = {
        url: app.API_HOST + "CardGoods/CategoryDetail",
        data: {
            cid:self.data.id
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        let replayImg={
            url: data.thumb_url,
            status:2,
            id: data.thumb_id
        }
        self.setData({
            categoryTitle: data.name,
            replayImg: replayImg,
            checkIndex: data.enabled == 1?0:1,
            categorySort: data.displayorder,
            parentid: data.parentid
        })
        self.getGoodsFatherCategory().then((data)=>{
            data.forEach((item, index) => {
                if (item.id == self.data.parentid) {
                    self.data.parentIndex = index
                }
            })
            self.setData({
                parentIndex: self.data.parentIndex,
                levelIndex: self.data.parentid == 0 ? 0 : 1
            })
        })
    }).catch((err) => {
       console.log(err,111)
    });
}