const app = getApp();
import {
  showLoading,
  
  showToast,
  showTips
} from '../../utils/util';
import { getToken}from '../../api/api.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    len:{
      type: Number, 
      value:1, 
    },
    imgs:{
      type:Array,
      value:[],
    },
    paddingLR:{
      type: String, 
      value:'0_0', 
      observer:function(newVal){
        var val = newVal.split('_');
        var left = val[0]?parseInt(val[0]):0;
        var right = val[1]?parseInt(val[1]):0;
        var boxWidth = 750 - Math.floor((left+right) * 2);
        var img3Width = Math.floor((boxWidth-40)/3)
        this.setData({
          boxWidth:boxWidth,
          img3Width:img3Width
        })
      }
    }
   
  },

  /**
   * 组件的初始数据
   */
  data: {
    
    boxWidth:750,
    img3Width:200,
    showGetUserInfo:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    pickImgs(){
      if (!app.globalData.token) {

        getToken(this).then(_=>{
          this.openImg();
        });
       
      }else{
        this.openImg();
      }
    },
    openImg() {
      let self = this,
      len = this.data.len,
      initIndex = this.data.imgs.length;
      wx.chooseImage({
        count: len - initIndex, // 限制最大长度为9
        success: function (res) {
          let tempFilePaths = res.tempFilePaths.map((url) => {
            return {
              uploadStyle: 'start',
              id: 0,
              // sizeType: ['compressed'],
              filePath: url
            }
          }),
            uploadTask = [],
            progress = [];
          self.setData({
            imgs: self.data.imgs.concat(tempFilePaths)
          })
          let imgs = self.data.imgs;
          for (let i = 0; i < imgs.length; i++) {
            if (i < initIndex) {
              uploadTask[i] = '';
            } else {
              console.log(app.globalData.token,1)
              uploadTask[i] = wx.uploadFile({
                url: app.API_HOST + 'bbs/uploadImg',
                formData: {
                  token: app.globalData.token
                },
                filePath: imgs[i].filePath,
                name: 'file',
                success: function (res) {
                  res.data = JSON.parse(res.data)
                  if (res.data.code >= 0) {
                    imgs[i].uploadStyle = 'success';
                    imgs[i].id = res.data.data.id;
                    imgs[i].url = res.data.data.url
                    self.setData({
                      imgs
                    })
                  } else {
                    showToast(res.data.msg, self);
                  }
                },
                fail: function (res) {
                  imgs[i].uploadStyle = 'fail';
                  self.setData({
                    imgs
                  })
                }
              });
              uploadTask[i].onProgressUpdate((res) => {
                progress[i] = res.progress;
                self.setData({
                  progress
                })
              })
            }
          }
          self.triggerEvent('getImgs', {imgs:self.data.imgs})
        }

      })
    },
    uploadAgain(e) {
      let index = e.currentTarget.dataset.index,
        imgs = this.data.imgs,
        progress = this.data.progress,
        self = this;

      imgs[index].uploadStyle = 'start';
      this.setData({
        imgs
      })
      let uploadTask = wx.uploadFile({
        url: app.API_HOST + 'bbs/uploadImg',
        formData: {
          token: app.globalData.token,
        },
        filePath: imgs[index].filePath,
        name: 'file',
        success: function (res) {
          res.data = JSON.parse(res.data)
          if (res.data.code >= 0) {
            imgs[index].uploadStyle = 'success';
            imgs[index].id = res.data.data.id
            self.setData({
              imgs
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              success: function (res) {
                imgs[index].uploadStyle = 'fail';
                self.setData({
                  imgs
                })
              }
            })
          }
        },
        fail: function (res) {
          imgs[index].uploadStyle = 'fail';
          self.setData({
            imgs
          })
        }
      });
      uploadTask.onProgressUpdate((res) => {
        progress[index] = res.progress;
        self.setData({
          progress
        })
      })

    },
    //查看大图
    previewImage(e) {
      let index = parseInt(e.currentTarget.dataset.index),
        imgs = this.data.imgs.map(item => {
          return item.url
        });
      wx.previewImage({
        urls: imgs,
        current: imgs[index]
      })
    },
    longtap(e) {
      let that = this;
      let imgs = that.data.imgs;
      let index = e.currentTarget.dataset.index
      wx.showModal({
        title: '提示',
        content: '确定要删除此图片吗？',
        success: function (res) {
          if (res.confirm) {
            imgs.splice(index, 1);
          } else if (res.cancel) {
            return false;
          }
          that.triggerEvent('getImgs', {imgs:that.data.imgs})
          that.setData({
            imgs
          });
        }
      })
    },
  }
})
