import {
  showLoading,
  hideLoading,
  showTips,
  showToast
} from '../../utils/util';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    themeColor: String,
    src: {
      type: null,
      observer() {
        if ((getCurrentPages().pop() || {}).route=='centerControl/posterCenter/posterCenter'){  //素材海报特殊处理
          this.setData({
            ready: false,
            shareUrl: ''
          })
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    ready: false,
    shareUrl:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    ready(e){
      this.setData({
        ready: true
      })
    },
    eventGetImage(e){
      this.setData({
        shareUrl: e.detail.path
      })
    },
    close() {
      this.triggerEvent('close', true);
    },

    save() {
      let url = this.data.shareUrl;
      
      let _this = this;
      if (!url) {
        showTips('无下载链接');
        return;
      }
      wx.saveImageToPhotosAlbum({
        filePath: url,
        success(res) {
          showToast('保存成功', 'success')
        },
        fail(err) {
          wx.getSetting({
            success(resSetting) {
              if (!resSetting.authSetting['scope.writePhotosAlbum']) {
                _this.triggerEvent('showSetting', { showopenSetting: true, setttingContent: '需要您的授权才可以保存图片' })
              }
            },
            fail(err) {
              console.log(err)
            }
          })

        }
      })
    }
    }
  
})
