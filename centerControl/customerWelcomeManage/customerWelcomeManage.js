// centerControl/customerWelcomeManage/customerWelcomeManage.js
const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { showTips, showToast,showModal, previewImage } from "../../utils/util";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    welcomesText: '',
    replayImg: {
      url: "",
      progress: 0,
      status: 0, // -1 = 上传失败；0 = 未上传；1 = 正在上传；2上传完成
      errorMsg: "上传失败",
      id: 0,
      width: '',
      height: ''
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCardInfo()
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
  changeValue(e) {
    console.log(e);
    const value = e.detail.value;
    this.setData({
      welcomesText: value
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
  uploadAvatar() {

    this.chooseImages(1).then((res) => {
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
  deleteImgs() {
    if(!this.data.replayImg.url) {
      return
    }
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
  saveInfo() {
    if (!this.data.welcomesText) {
      showModal({
        title: '提示',
        content: '请填写客户欢迎语'
      })
      return
    }
    if (!this.data.replayImg.url) {
      showModal({
        title: '提示',
        content: '请选择图片'
      })
      return
    }
    let param = {
      url: 'Card/setWelcomes',
      data: {
        welcomesText: this.data.welcomesText,
        img: this.data.replayImg.url
      }
    }
    fetchApi(this, param).then(res => {
      showToast('保存成功','success')
      console.log(123456)
    })
  },
  getCardInfo () {
    let param = {
      url: 'Card/getCardInfo',
      data: {
        
      }
    }
    fetchApi(this, param).then(res => {
      console.log(res.data.data,'res.data.data')
      let data = res.data.data;
      this.setData({
        ['replayImg.url']: data.welcomes_img,
        welcomesText: data.welcomes_text
      })
      if(data.welcomes_img) {
        this.setData({
          ['replayImg.status']: 2,
        })
      }
    })
  }
})