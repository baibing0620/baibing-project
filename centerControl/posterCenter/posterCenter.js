const app = getApp();
import { fetchApi, getCardInfo, getEffectiveCardId } from '../../api/api.js';
import { shareParam, nav } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
*/
  data: {
    mainColor: app.extConfig.themeColor,
    extConfig: app.extConfig,
    showStyle: 0,
    posterList: [],
    posterName: "",
    pageIndex: 1,
    pageSize: 15,
    image: "",
    hasMore: true,
    showCover: false,
    loading: false,
    categoryList: [],
    actvieIndex: "1",
    loadStyle: '',
    dataStore: {
      barTitle: '',
      pageIndex: 1,
      startTime: '',
      bless: '',
    },
    // 2020-03-04 p_type 分类的t_id
    p_type: ''
  },
  getPosterNameList(){
    wx.request({
      url: `${app.API_HOST}posterType/showType`,
      data: {
        beid: app.globalData.beid,
        token: app.globalData.token,
        Page: 1
      },
      success: res=> {
        this.setData({
          actvieIndex:res.data.data.list[0].t_id
        })
        this.setData({
          categoryList: res.data.data.list
        })
        this.getPosterList()
      }
    })
  },
  getPosterList( name = "" ) {
    if (!this.data.loading) {
      this.data.loading = true;
      this.data.hasMore = false;
      let params = {
        url: app.API_HOST + "Card/getPosterFodderList",
        data: {
          pageIndex: this.data.pageIndex,
          pageSize: this.data.pageSize,
          p_type: this.data.p_type||this.data.categoryList[0].t_id
        }
      }
      if (name) {
        params.data.posterName = name.replace(/(^\s*)|(\s*$)/g, "");
      }
      fetchApi(this, params).then(res => {
        this.setData({
          showStyle: 1,
          posterList: this.data.pageIndex>1?this.data.posterList.concat(res.data.data):res.data.data,
          hasMore: res.data.data.length >= this.data.pageSize,
          loadStyle: res.data.data.length >= this.data.pageSize ? "loadMore" : "loadOver"
        })
        this.data.loading = false;
      }).catch(res => {
        console.log(res);
        this.setData({
          showStyle: 3
        })
        this.data.loading = false;
      })
    }
  },
  activeTopTap(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
        actvieIndex: index,
        loadStyle: '',
        pageIndex: 1,
        p_type: index,
    })
    this.getPosterList()
  },
  bindInput(e) {
    this.setData({
      posterName: e.detail.value
    })
  },

  search() {
    this.data.pageIndex = 1;
    this.setData({
      posterList: []
    })
    this.getPosterList(this.data.posterName);
  },

  previewImage(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      showCover: true,
      palette: this.palette(item)
    })

  },

  coverHide() {
    this.setData({
      showCover: false
    })
  },
  palette(item){
    let { image_url, zoom, shift, style, applet_url, copywrite} = item,
    { avatar_url} = this.data.cardInfo,
    { stageHeight, stageWidth, top, left} = JSON.parse(shift),
    rate, qrOffset, qrCodeDiameter, membanDiameter, qrAvaOffset, xSum, ySum, chamfered, avatarDiameter, qshift,
    qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
    path = encodeURIComponent(`${applet_url}${applet_url.indexOf('?') > -1 ?'&':'?'}${shareParam()}`),
    qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}&is_hyaline=true`;
    const scale = Math.min(1000 / Number(stageHeight), 700 / Number(stageWidth))
    const stageTop = top;
    const stageLeft = left;

    //小程序码缩放量
      zoom = zoom || 100;
      //前台展示比例
      rate = style == 3 ? scale : (750 / 375);
      //蒙版图与二维码偏移量
      qrOffset = 6 * zoom / 100;
      //小程序码直径
      qrCodeDiameter = (zoom - (qrOffset * 2)) * rate;
      left = (parseInt(style == 3 ? stageLeft : left) + qrOffset) * rate;
      top = (parseInt(style == 3 ? stageTop : top) + qrOffset) * rate;
      //头像与头像蒙版图偏移量
      qrAvaOffset = 1;
      //员工头像覆盖小程序头像
      membanDiameter = qrCodeDiameter / 2 - (qrAvaOffset * 2);
      xSum = left + (membanDiameter / 2) + qrAvaOffset;
      ySum = top + (membanDiameter / 2) + qrAvaOffset;
      //计算头像蒙版边长
      chamfered = (membanDiameter + qrAvaOffset) / 2;
      avatarDiameter = Math.sqrt(chamfered * chamfered / 2) * 2;
      qshift = (qrCodeDiameter / 2 - avatarDiameter) / 2;
    let map = {
      // 样式二配置
      2: {
        "width": "900px",
        "height": "1200px",  //外层盒子大小
        "background": "",
        "views": [
          {
            "type": "image",
            "url": `${image_url}`,    //封面
            "css": {
              "width": "900px",
              "height": '1000px',  //内层图片大小
              "top": "0px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "text",
            "text": copywrite,
            "css": {
              "color": "#333333",
              "background": "rgba(0,0,0,0)",
              "width": "500px",
              "height": "86.96999999999998px",
              "bottom": "100px",
              "left": "32px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "",
              "shadow": "",
              "padding": "0px",
              "fontSize": "30px",
              "fontWeight": "bold",
              "maxLines": "2",
              "lineHeight": "43.290000000000006px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          },
          {
            "type": "image",
            "url": qrcode,
            "css": {
              "width": "156px",
              "height": "156px",
              "bottom": "50px",
              "left": "664px",
              "rotate": "0",
              "borderRadius": "250px",
              "borderWidth": "",
              "borderColor": "",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "image",
            "url": "https://facing-1256908372.file.myqcloud.com/image/20200512/f22e57e2ce5ae071.png",
            "css": {
              "width": '70px',
              "height": '70px',
              "bottom": "93px",
              "left": '707px',
              "rotate": "0",
              "borderRadius": "500px",
              "shadow": ""
            }
          },
          {
            "type": "image",
            "url": `${avatar_url}`,
            "css": {
              "width": "60px",
              "height": "60px",
              "bottom": "98px",
              "left": "712px",
              "rotate": "0",
              "borderRadius": "250px",
              "borderWidth": "",
              "borderColor": "",
              "shadow": "",
              "mode": "scaleToFill"
            }
          }
        ]
      },
      1: {
        "width": "900px",
        "height": "1200px",
        "background": "",
        "views": [
          {
            "type": "image",
            "url": `${image_url}`,   //封面
            "css": {
              "width": "900px",
              "height": "1200px",
              "top": "0px",
              "left": "0px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "image",
            "url": 'https://facing-1256908372.file.myqcloud.com/image/20200512/f22e57e2ce5ae071.png',   //小程序码蒙版
            "css": {
              "width": `${qrCodeDiameter + (qrOffset * 2)}px`,
              "height": `${qrCodeDiameter + (qrOffset * 2)}px`,
              "top": `${top - qrOffset}px`,
              "left": `${left - qrOffset}px`
            }
          },
          {
            "type": "image",
            "url": qrcode,
            "css": {
              "width": `${qrCodeDiameter}px`,
              "height": `${qrCodeDiameter}px`,
              "top": `${top}px`,
              "left": `${left}px`
            }
          },
          {
            "type": "image",
            "url": "https://facing-1256908372.file.myqcloud.com/image/20200512/f22e57e2ce5ae071.png",   //覆盖小程序头像蒙版
            "css": {
              "width": `${membanDiameter}px`,
              "height": `${membanDiameter}px`,
              "top": `${ySum}px`,
              "left": `${xSum}px`,
              "rotate": "0",
              "borderRadius": "500px",
              "shadow": ""
            }
          },
          {
            "type": "image",
            "url": `${avatar_url}`,
            "css": {
              "width": `${avatarDiameter}px`,
              "height": `${avatarDiameter}px`,
              "top": `${ySum + qshift}px`,
              "left": `${xSum + qshift}px`,
              "rotate": "0",
              "borderRadius": "250px",
              "borderWidth": "",
              "borderColor": "",
              "shadow": "",
              "mode": "scaleToFill"
            }
          }
        ]
      }
    };
    return map[style]
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if (!~~app.globalData.cardId || app.globalData.cardId != app.globalData.currentLoginUserCardInfo.cardId) {
      try {
        const { cardId, myCardId } = await getEffectiveCardId()
        app.globalData.cardId = myCardId || cardId || ''
        if (!~~app.globalData.cardId) throw Error('无可用名片')
        if (!~~myCardId) {
          nav({
            url: app.tabBarPath[0]
          })
          return
        }
      } catch (error) {
        console.error(error)
        wx.reLaunch({
          url: '/pages/cardList/cardList'
        })
        return
      }
    }

    this.data.pageIndex = 1;
    this.getPosterNameList();
    // getCardInfo().then(data => {
    //   this.data.cardInfo = data
    // })
    // 直接获取 全局名片数据，调用请求会修改标题头
    this.data.cardInfo = app.globalData.cardInfo;
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
    app.showRemind(this);
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
    this.data.pageIndex = 1;
    this.data.hasMore = true;
    this.setData({
      posterList: [],
      posterName: ""
    })
    this.getPosterList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.data.pageIndex++;
      this.getPosterList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  showOpenSetting(e) {
    this.setData({
        showopenSetting: e.detail.showopenSetting,
        setttingContent: e.detail.setttingContent
    })
  },

  cancelSetting() {
    this.setData({
        cancelAuth: true
    })
  },
  _cancelAuth() {
    this.setData({
      cancelAuth: false
    })
  },
})