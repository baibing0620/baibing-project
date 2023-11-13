import {
    showModal
} from '../../utils/util';
let _w = 0,
  _pixelRatio=1,
  _h = 0;
const app = getApp();
Page({
    data: {
        url: '',
        originUrl:''
    },
    onLoad: function (options) {
        if (!wx.canIUse('web-view')) {
            showModal({
                title: '提示',
                content: '您的微信版本过低，暂不支持网页组件',
                confirmText: '返回'
            }).then(() => {
                wx.navigateTo()
            });
            return;
        }
       let _url = options.url || app.link.url
        let url = '';
        if (_url) {
          url = _url;

          if (options.parameter) {
            url += '?'
            let parameter = JSON.parse(options.parameter)
            for (var i = 0; i < parameter.length - 1; i += 2) {
              if (i == 0) {
                url += `${parameter[i]}=${parameter[i + 1]}`
              } else {
                url += `&${parameter[i]}=${parameter[i + 1]}`
              }
            }
          }
          this.data.originUrl = _url;
          
        } 
        else if (options.goodsId) {

          wx.hideShareMenu();

            _h = options._h||0;
            _w = options._w||0;
            _pixelRatio = options._pixelRatio||1;
          if (_h==0){
            try {
              var res = wx.getSystemInfoSync()

              _w = res.windowWidth,
              _h = res.windowHeight;
              _pixelRatio = res.pixelRatio;

            } catch (e) {
              showModal({
                title: '提示',
                content: '获取手机尺寸失败，请返回重新进入',
              }).then(_=>{wx.navigateBack()})
              return;
            }
          }
            let paramUrl = `?token=${app.globalData.token}&beid=${app.globalData.beid}&goodsId=${options.goodsId}&optionId=${options.optionId}&total=${options.total}&_w=${_w}&_h=${_h}&goodsName=${options.goodsName}&_pixelRatio=${_pixelRatio}&time=${new Date().getTime()}`;
            if (options.optionName) {
                paramUrl += `&optionName=${options.optionName}`
            }
            if(options.to=='choose'){
                url = `${app.API_HOST.replace('api/','')}/addon/diyH5/index.html#/choose/${paramUrl}`
            }else{
                url = `${app.API_HOST.replace('api/','')}/addon/diyH5/index.html#/${paramUrl}`
            }
           
        }
        if (!(/^http/.test(url))){
          url = `https://${url}`
        }
        url = `${url}`
        this.setData({
          url: encodeURI(url)
        })
    },
    onReady: function () {
      
    },
    onShow: function () {

    },
    onHide: function () {

    },
    onShareAppMessage: function (res) {
      var src = {};
      var urlArr = this.data.url.split('?')
      if (urlArr[1]) {
        let newArr = [];
        let parameter = urlArr[1].split('&')
        parameter.forEach(item => {
            newArr.push(item.split('=')[0], item.split('=')[1])
        })
        src.url = urlArr[0]
        src.parameter = JSON.stringify(newArr)
      } else {
        src.url = this.data.url
        src.parameter = ''
      }
      return {
        title:'',
        path: `pages/webView/webView?url=${src.url}&parameter=${src.parameter}`
      }
    }
})