const app = getApp()
const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
import {
    fetchApi,
    getGlobalConfig,
    getPhoneNumber
} from '../../api/api.js';
import {
    linkPage,
    linkFunction,
    needParam,
    marketingActivitiesType
} from '../../map.js';
import {
    nav,
    makePhoneCall,
    openLocation,
    showLoading,
    showModal,
    chooseAddress,
    showExpried,
    showTips,
    showToast,
    previewImage,
    previewImageList,
    trim,
    hideLoading,
    setCurrentLoginUserCardInfo,
    deepClone 
} from '../../utils/util';
let WxParse = require('../../wxParse/wxParse.js');

export default function (index) {
    return {
        data: {
            extConfig: app.extConfig,
            pageInfo: [],
            backgroundObj: {
                type: 1
            },
            showShareModal: false,
            showLogo: 0,
            logoText: '',
            date: '',
            isDisabled: {
                componentId: false
            },
            showChooseScan: false,
            dateRegion: {},
            pickerObjIndex: {},
            cityLocateName: '',
            menuSetting: {
                "留言": {},
                "个人中心": {},
                "管理中心": {},
                "分享": {
                    image: `Editor/makeOfficialNetCodeImg`
                }
            },
            shareTitle: [],
            hasBindPhone:false,
        },
        dataStore: {
            startTime:0,
            pageId: 0,
            tplId: 0,
            pageTitle: '',
            formData: {
                componentId: 0,
                value: '',
            },
            share: '',
            imgUrl: '',
        },
        onLoad: function (options) {  
            if (options.cardId) {
                app.globalData.cardId = options.cardId || 0;
                app.globalData.fromUser = options.fromUser || 0;
            } 
            if (index == 'index1') {
                this.dataStore.pageId = app.pageId;
                this.dataStore.tplId = app.tplId;
                if (options.cardId) {
                    if (app.tabBarPath.indexOf("/pages/about/about") == -1) {
                        this.setData({
                            isFromShare: true
                        });
                    }
                } 
            } else if (index == 'index') {
                this.dataStore.pageId = options.id || app.link.id;
                this.dataStore.tplId = options.tplId || app.link.tplId;
                if (options.cardId) {
                    this.setData({
                        isFromShare: true
                    });
                }
            }
            if (index == 'index1') {
                showLogo(this);
            }
            this.setData({
                toChat: app.globalData.currentLoginUserCardInfo && app.globalData.cardId && app.globalData.cardId != 0 && app.globalData.currentLoginUserCardInfo.cardId != app.globalData.cardId
            })
            getInitData(this);
        },
        onShow() {
          wx.setNavigationBarTitle({
              title: this.dataStore.pageTitle
          })
          app.showRemind(this);
        },
        onHide() {

        },
        eventTap(e) {
            // console.log("19.56"+JSON.stringify(e))
            let eventType = e.currentTarget.dataset.eventType,
                eventParam = e.currentTarget.dataset.eventParam;
            if (needParam.indexOf(eventType) >= 0 && eventParam.length == 0) {
                showModal({
                    title: '提示',
                    content: "您未传入有效参数"
                })
                return;
            }
            if (linkPage.indexOf(eventType) >= 0) {
                if (eventType == 'webView') {
                  let url = eventParam.url
                  var urlArr = url.split('?')
                  if (urlArr[1]) {
                    let newArr = [];
                    let parameter = urlArr[1].split('&')
                    parameter.forEach(item => {
                      newArr.push(item.split('=')[0], item.split('=')[1])
                    })
                    eventParam.url = urlArr[0] 
                    eventParam.parameter = JSON.stringify(newArr)
                  }
                }
                if (eventType == 'goodsList' && eventParam.label ) {
                  eventParam.label = JSON.stringify(eventParam.label )
                }
                if (eventType == 'news' && eventParam) {
                  app.globalData.pageOption = eventParam;
                }
                    nav({
                        url: eventType == 'DIYPage' ? '/pages/index/index' : `/pages/${eventType}/${eventType}`,
                        data: eventParam
                    });
            } else if (linkFunction[eventType]) {
                if (eventType == 'appView') {
                    nav({
                        url:'/'+eventParam.url
                    })
                }else{
                    this[linkFunction[eventType]](eventParam);
                }
            }
        },
        showChooseScan() {
            this.setData({
                showChooseScan: true
            })
        },
        closechooseScanBox() {
            this.setData({
                showChooseScan: false
            })
        },
        scanCode() {
            wx.scanCode({
                success: (res) => {
                    try {
                        var path = res.path;
                        wx.navigateTo({
                            url: '/' + path
                        })
                    } catch (e) {
                        showToast('二维码不正确: ', e);
                    };
                },
                fail: (res) => {
                    console.log('扫描二维码错误: ', res)
                }
            })
        },
        scanQrcodeEnter() {
            wx.scanCode({
                success: (res) => {
                    try {
                        var path = res.path;
                        this.setData({
                            showChooseScan: false
                        });
                        wx.navigateTo({
                            url: '/' + path
                        })
                    } catch (e) {
                        showToast('二维码不正确');
                    };
                },
                fail: (res) => {
                    console.log('扫描二维码错误')
                }
            })
        },
        navEnterMenu() {
            this.setData({
                showChooseScan: false
            })
            wx.navigateTo({
                url: "/pages/scanMenu/scanMenu"
            })
        },
        showShare() {
            this.setData({
                upShareModal: true,
                showShareModal: true
            })
        },
        getPageQRCode() {
            this.setData({
                showShareModal: false
            })
            let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10);
            let path = '';
            if (index == 'index1') {
                path = `/pages/about/about?pageId=${this.dataStore.pageId}&tplId=${this.dataStore.tplId}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
            } else {
                path = `/pages/index/index?id=${this.dataStore.pageId}&tplId=${this.dataStore.tplId}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`;
            }
            let url = `${app.API_HOST}index/getQRcode?path=${encodeURIComponent(path)}&_t=${qrCodeTime}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`;
            wx.previewImage({
                urls: [url]
            });
        },
        openLocation(param) {
            let latitude = Number(param.lnglat.split(',')[1]),
                longitude = Number(param.lnglat.split(',')[0]),
                address = param.address || '';
            openLocation(latitude, longitude, address);
        },
        navigateToMiniProgram(param) {
            wx.navigateToMiniProgram({
                appId: param.id,
                fail: err => {
                    showModal({
                        title: "打开错误"
                    })
                }
            })
        },
        chooseAddress() {
            chooseAddress()
        },
        navLiveRoom (param) {
          nav({
            url: param.url
          })
        },
        navAppView(param) {
          if (app.tabBarPath.indexOf(param.url) >= 0) {
            wx.switchTab({
              url: param.url,
              fail: _ => console.error(_)
            });
            return;
          }
          if (getCurrentPages().length >= 10) {
            wx.redirectTo({
              url: param.url,
              fail: _ => console.error(_)
            })
          } else {
            wx.navigateTo({
              url: param.url,
              fail: _ => console.error(_)
            })
          }
        },
        callPhone(param) {
            makePhoneCall(param.phone);
        },
        makePhoneCall(e) {
            makePhoneCall(e.currentTarget.dataset.phone);
        },
        mapNavigation(e) {
            openLocation(Number(e.currentTarget.dataset.lat), Number(e.currentTarget.dataset.lng), e.currentTarget.dataset.address);
        },
        onShareAppMessage: function () {
            const  {imgUrl,shareTitle} = this.dataStore
            let path = '';
            if (index == 'index1') {
                path = `/pages/about/about?pageId=${this.dataStore.pageId}&tplId=${this.dataStore.tplId}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
            } else {
                path = `/pages/index/index?id=${this.dataStore.pageId}&tplId=${this.dataStore.tplId}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
            }
            return {
                // title: app.globalData.appName,
                title: shareTitle,
                path: path,
                imageUrl: imgUrl
            }
        },
        onPullDownRefresh() {
            showLoading();
            getInitData(this);
            selectBless(this)
            if (index == 'index1') {
                showLogo(this);
            }
        },
        bindDateChange(e) {
            let index = e.currentTarget.dataset.index;
            this.data.dateRegion['date' + index] = e.detail.value.replace(/-/g, '/')
            this.setData({
                dateRegion: this.data.dateRegion
            })
        },
        bindRegionChange(e) {
            let index = e.currentTarget.dataset.index
            this.data.dateRegion['region' + index] = e.detail.value.join("/")
            this.setData({
                dateRegion: this.data.dateRegion
            })
        },
        formSubmit(e) {
            let value = e.detail.value;
            let submitFB = '';
            let validateType = '';
            let pickerObjIndex = this.data.pickerObjIndex;
            let componentId = e.currentTarget.dataset.id;
            //针对input框validateType的验证
            let regx = /^1[3-9]\d{9}$/;
            let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
            let formaData = [];
            for (let i = 0; i < this.data.pageInfo.length; i++) {
                if (this.data.pageInfo[i].type == 'form' && this.data.pageInfo[i].id == e.currentTarget.dataset.id) {
                    submitFB = this.data.pageInfo[i].submitFB;
                    formaData = this.data.pageInfo[i].data;
                    break;
                }
            }
            // 图片手动加入
            for (var j = 0; j < formaData.length; j++) {
                if (formaData[j].formType == 'diyImage') {
                  var key = 'date' + componentId + '_' + j
                  value['diyImage_' + j] = '';
                  if (this.data.dateRegion[key]) {
                    let imgsStr = [];
                    this.data.dateRegion[key].map(item => {
                      if (item.url) {
                        imgsStr.push(
                          {
                            id: item.id,
                            url: item.url
                          }
                        )
                      }
                    })
                    if (imgsStr.length > 0) {
                      console.log('imgsStr', imgsStr, JSON.stringify(imgsStr))
                      value['diyImage_' + j] = JSON.stringify(imgsStr);
                    }
                  }
                }
              }
            //必填项，value为空时
            for (let item in value) {
                let index = item.split("_")
                if (formaData[index[1]].notEmpty == true && value[item] == '') {
                    showToast(formaData[index[1]].title + "不能为空", this);
                    return;
                }
            }
            for (let n = 0; n < formaData.length; n++) {
                let text = 'text_' + n;
                let region = 'region_' + n;
                let checkbox = 'checkbox_' + n;
                if (formaData[n].formType == 'singlePicker') {
                    let key = '_' + formaData[n].id,
                        pickeIndex = parseInt(pickerObjIndex[key].pickeIndex),
                        formIndex = pickerObjIndex[key].formIndex;
                    value['singlePicker_' + formIndex] = formaData[n].options[pickeIndex].name;
                }
                //针对input ，value存在的情况进行判断
                if (value[text] != '' && formaData[n].formType == 'text') {
                    validateType = formaData[n].validateType
                    if (validateType == 'phone') {
                        if (!regx.test(value[text])) {
                            showToast("手机号验证失败", this);
                            return;
                        }
                    } else if (validateType == 'email') {
                        if (!reg.test(value[text])) {
                            showToast("邮箱验证失败", this);
                            return;
                        }
                    }
                }
                //将地区数组转化为字符串形式
                if (formaData[n].formType == 'region') {
                    value[region] = value[region].join("/");
                }
                //将checkbox数组转化为字符串形式
                if (formaData[n].formType == 'checkbox') {
                    value[checkbox] = value[checkbox].join("/");
                }
            }
            let valueArr = [];
            for (let item in value) {
                let arr = {};
                let index = item.split("_")
                arr.title = formaData[index[1]].title
                arr.value = value[item]
                arr.type = formaData[index[1]].formType;
                valueArr.push(arr)
            }
            let param = {
                url: app.API_HOST + 'Form/submitForm',
                data: {
                    componentId: e.currentTarget.dataset.id,
                    tplMsgId: e.detail.formId,
                    cardId:app.globalData.cardId,
                    value: JSON.stringify(valueArr),
                }
            };
            if (this.dataStore.formData[param.data.componentId] == param.data.value) {
                showModal({
                    title: '警告',
                    content: '该表单内容已提交，请勿提交重复内容'
                });
                return;
            }
            this.data.isDisabled[param.data.componentId] = true
            this.setData({
                isDisabled: this.data.isDisabled,
            })
            fetchApi(this, param, 'post').then((res) => {
                //反馈提醒
                showModal({
                    title: '提示',
                    "content": submitFB
                });
                this.dataStore.formData[param.data.componentId] = param.data.value;
                this.data.isDisabled[param.data.componentId] = false
                this.setData({
                    isDisabled: this.data.isDisabled,
                })
            }).catch((err) => {
                console.log('err')
                this.data.isDisabled[param.data.componentId] = false
                this.setData({
                    isDisabled: this.data.isDisabled,
                })
            });
        },
        radioPickerChange(e) {
            let index = parseInt(e.detail.value),
                key = '_' + e.currentTarget.dataset.id,
                pickerObjIndex = this.data.pickerObjIndex;
            pickerObjIndex[key].pickeIndex = index;
            this.setData({
                pickerObjIndex
            })
        },
        closeShareModal() {
            this.setData({
                upShareModal: false,
            })
            setTimeout(() => {
                this.setData({
                    showShareModal: false
                })
            }, 180)

        },
        connectWifi(eventParam) {
            if (!eventParam.ssid) {
                showToast('未传入WIFI名称', this)
            }
            // if (!eventParam.bssid) {
            //     showToast('未传入Wi-Fi设备bssid', this)
            // }
            let ssid = trim(eventParam.ssid),
                bssid = trim(eventParam.bssid),
                password = trim(eventParam.password);
            wx.startWifi({
                success: function (res) {
                    showLoading({
                        title: '连接中'
                    });
                    wx.connectWifi({
                        SSID: ssid,
                        BSSID: bssid,
                        password: password,
                        success: function (res) {
                            hideLoading();
                            wx.getConnectedWifi({
                                success: function (res) {
                                    if (res.wifi.SSID == ssid) {
                                        showTips('连接成功', 'success')
                                    }
                                },
                                fail: function (err) {
                                    showModal({
                                        title: '连接失败',
                                        content: `WIFI:${ssid},密码:${password}。失败原因：您可能未开启wifi/密码有误/已连接该wifi/设备不支持`,
                                        confirmText: '复制密码'
                                    }).then(_ => {
                                        wx.setClipboardData({
                                            data: bssid,
                                        })
                                    })
                                }
                            })
                        },
                        fail: function (err) {
                            hideLoading();
                            if (err.errCode == 12006) {
                                showModal({
                                    title: '提示',
                                    content: '请打开GPRS后尝试连接',
                                })
                                return;
                            }
                            if (err.errCode == 12005) {
                                showModal({
                                    title: '提示',
                                    content: '请打开WIFI',
                                })
                                return;
                            }
                            showModal({
                                title: '连接失败',
                                content: `WIFI:${ssid},密码:${password}。失败原因：您可能未开启wifi/密码有误/已连接该wifi/设备不支持`,
                                confirmText: '复制密码'
                            }).then(_ => {
                                wx.setClipboardData({
                                    data: bssid,
                                })
                            })
                        }
                    })
                }
            })
        },
        previewImg(e) {
            let id = e.currentTarget.dataset.id, 
                pageInfo = this.data.pageInfo,
                fromType = e.currentTarget.dataset.fromType || '',
                imgUrl = e.currentTarget.dataset.url,
                imgArr = [];
            for (let i = 0; i < pageInfo.length; i++) {
                if (pageInfo[i].id == id) {
                    if (fromType == 'picture') {
                        imgArr[0] = pageInfo[i].data;

                    } else {
                        imgArr = pageInfo[i].data;
                    }

                    break;
                }
            }
            previewImageList(imgArr, 'path', imgUrl);
        },
        navCity() {
            nav({
                url: '/pages/cityLocate/cityLocate'
            })
        },
        navMiniProgram(e){
            let appid = e.currentTarget.dataset.appid
            if (appid){
                if (extConfig['MiniProgramAppIdListSetting'].indexOf(appid) ==-1){
                    showTips('小程序appId不在白名单范围内', this)
                }
            }else{
                showTips('并未设置需要跳转的小程序appId',this)
            }
        },
        getImgs(e){
            var  index = e.currentTarget.dataset.index;
            var imgs = e.detail.imgs;
            this.data.dateRegion['date' + index] = imgs;
        },
        toChat() {
            if (this.data.toChat) {
                let data = {
                    type: "official",
                    content: {
                        type: "official",
                        // id: this.dataStore.id,
                        title: this.data.title,
                        url: this.data.thumbUrl
                    }
                }
                nav({
                    url: '/pages/chat/chat',
                    data: {
                        toUid: app.globalData.cardUid,
                        readyToSend: JSON.stringify(data)
                    }
                })
            } else if (!app.globalData.cardUid) {
                this.getInfoBeforeToChat();
            }
        },
        getInfoBeforeToChat() {
            this.toGetCardInfo().then(res => {
                app.globalData.cardUid = res.data.data.admin_uid;
                this.toChat();
            }).catch(res => {
                console.log(res);
            })
        },

        toGetCardInfo() {
            return new Promise((resolve, reject) => {
                let param = {
                    url: 'card/getCardInfo',
                    data: {
                        cardId: app.globalData.cardId,
                        //fromUser: 10495
                    }
                }
                fetchApi(this, param).then(res => {
                    resolve(res);
                }).catch(res => {
                    reject(res);
                });
            })
        },
        getPhoneNumber(e) {
            getPhoneNumber(e).then(phoneNumber => {
                if (phoneNumber!='') {
                  this.setData({
                      hasBindPhone: true
                  })
                } 
                this.toChat();
              }).catch(err => {
                showTips('手机号获取失败', this)
                this.toChat();
              })

        },
        
        getUserPhoneNumber(e) {
          if (e.detail.errMsg != 'getPhoneNumber:ok') {
              return
          }
          const index1 = e.currentTarget.dataset.index1
          const index2 = e.currentTarget.dataset.index2
          getPhoneNumber(e).then(phoneNumber => {
            if (phoneNumber) {
                this.data.pageInfo[index1].data[index2].value = data.phoneNumber
                let phone = `pageInfo[${index1}].data[${index2}].value`
                this.setData({
                    [phone]: data.phoneNumber
                })
            }
          }).catch(err => {
            
          })
        },
        switchTabChange(e) {
          const { index, tabindex } = e.currentTarget.dataset;
          if (this.data.pageInfo[index].activeIndex == tabindex ) {
            return
          }
          if (this.data.pageInfo[index].tabType == 1 && this.data.pageInfo[index].picShowType == 1) {
            var totalIndex = this.data.pageInfo[index].dataAll.findIndex(e => e.tab === this.data.pageInfo[index].tabInfo[tabindex].tab)
            this.data.tolower = false
            this.dataStore.isClick = true
            this.data.pageInfo[index].isClick = true
            var toView = `pageInfo[${index}].toView`
            this.setData({
              [toView]: 'view' + index + totalIndex
            })
          }
          var activeIndex = `pageInfo[${index}].activeIndex`
          var data = `pageInfo[${index}].data`
          this.setData({
            [activeIndex]: tabindex,
            [data]: this.data.pageInfo[index].tabInfo[tabindex].info
          })
        },

        chooseTabScrollEnd(e) {
          const { index } = e.currentTarget.dataset
          this.data.tolower = true
          this.data.pageInfo[index].activeIndex = this.data.pageInfo[index].tabInfo.length - 1
          this.setData({
            pageInfo:  this.data.pageInfo
          })
        },
        chooseTabScrollStart(e) {
          const { index } = e.currentTarget.dataset
          this.data.tolower = true
          this.data.pageInfo[index].activeIndex = 0
          var str = `pageInfo[${index}].activeIndex`;
          this.setData({
            [str]: 0
          })
        },

        bindTabScroll(e) {
          // console.log(e, 'eee')
          const { index } = e.currentTarget.dataset
          let scrollLeft = e.detail.scrollLeft
          let leftRpx = scrollLeft || 0
          var { tabInfo, padding_left, padding_right, width } = this.data.pageInfo[index]
          let infoWidth = padding_left * 1 + padding_right * 1 + width * 1
          let len = 0
          let activeIndex = 0
          // console.log(leftRpx , this.data.pageInfo[index].leftRpx )
          if (leftRpx > 20) {
            //20像素防误触滚动触发
            this.data.tolower = false
          }
          if (this.data.tolower) {
            return
          }
          if (this.data.pageInfo[index].isClick) {
            this.data.pageInfo[index].isClick = false
            return
          }
          for (let i = 0; i < tabInfo.length; i++) {
            const element = tabInfo[i];
            let w = 0
            if (element.info.length == 0) {
              w = infoWidth
            } else {
              w = infoWidth * element.info.length
            }
            console.log(leftRpx, len, w)
            console.log(leftRpx >= len, leftRpx < len+w)

            if (leftRpx >= (len - 375) && leftRpx < (len+w) ) {
              activeIndex = i
            }
            len += w
          }
          this.data.pageInfo[index].leftRpx = leftRpx
          if (activeIndex != this.data.pageInfo[index].activeIndex) {
            var str = `pageInfo[${index}].activeIndex`;
            this.setData({
              [str]: activeIndex
            })
          }
        }
    }
}

function getInitData(self) {
    let param = {
        url: app.API_HOST + 'editor/getTplPageSimple',
        data: {
            tplId: self.dataStore.tplId,
            pageId: self.dataStore.pageId
        }
    }
    fetchApi(self, param).then(res => {
        let pageInfo = res.data.data.tpl,
            backgroundObj = res.data.data.page_config.BackgroundObj,
            pickerObjIndex = {};
        self.dataStore.pageTitle = res.data.data.title;
        self.dataStore.shareTitle = res.data.data.share;
        self.dataStore.imgUrl = res.data.data.img_url
        wx.setNavigationBarTitle({
            title: self.dataStore.pageTitle
        })
        wx.setNavigationBarColor({
            frontColor: res.data.data.navigationBarTextStyle === 'black' ? '#000000' : '#ffffff',
            backgroundColor: res.data.data.navigationBarBackgroundColor || '#ffffff',
        })
        if (app.globalData.currentLoginUserCardInfo.mobile) {
            self.setData({
                hasBindPhone: true
            });
        }
        let flag = 0
        for (let i = 0; i < pageInfo.length; i++) {
            if (pageInfo[i].type == 'text') {
                pageInfo[i].type = 'onlyText';
                try{
                    pageInfo[i].data.text = pageInfo[i].data.text.replace(/ /g, '　')
                }catch(err){
                    console.log(err)
                }
            }
            if (pageInfo[i].type == 'searchBox') {
                pageInfo[i].eventType = 'searchPage';
                pageInfo[i].eventParam = {
                    searchType: pageInfo[i].searchType
                };
                if (pageInfo[i].cityLocate) {
                    flag += 1;
                }
            }
            if (pageInfo[i].type == 'form') {
                for (let j = 0; j < pageInfo[i].data.length; j++) {
                    if (pageInfo[i].data[j].controlStyle == 'dropDown' && pageInfo[i].data[j].formType == 'radio') {
                        pageInfo[i].data[j].formType = 'singlePicker'
                        let key = '_' + pageInfo[i].data[j].id;
                        pickerObjIndex[key] = {
                            formIndex: j,
                            pickeIndex: 0
                        };
                    }
                }
            }
            if (pageInfo[i].type == 'vuemap') {
                if (!pageInfo[i].lnglat) {
                    // 人民广场吃炸鸡
                    pageInfo[i].lnglat = "121.481587,31.23494";
                }
                var loc = pageInfo[i].lnglat.split(',');
                pageInfo[i]['markers'] = [{
                    iconPath: "/imgs/mark_bs.png",
                    id: 1,
                    latitude: loc[1],
                    longitude: loc[0],
                    width: 19,
                    height: 33,
                    callout: {
                        content: pageInfo[i].address,
                        color: '#000',
                        fontSize: 12,
                        borderRadius: 3,
                        padding: 5,
                        display: 'ALWAYS',
                        bgColor: '#FFEC8B',
                    }
                }];
                pageInfo[i]['lat'] = loc[1];
                pageInfo[i]['lng'] = loc[0];
            }
            if (pageInfo[i].type == 'switchTab' ) {
              var dataAll = deepClone(pageInfo[i].data)
              var tabInfo = []
              pageInfo[i].tabs.forEach(e => {
                tabInfo.push({
                  tab: e,
                  info: []
                })
              })
              dataAll.forEach(e => {
                const index = pageInfo[i].tabs.indexOf(e.tab)
                if (index != -1) {
                  tabInfo[index].info.push(e)
                }
              })
              pageInfo[i].tabInfo = tabInfo.filter(_ => { return _.info.length })
              pageInfo[i].data = pageInfo[i].tabInfo[0] ? pageInfo[i].tabInfo[0].info : [] //当前tab数据
              var sortArr = []
              pageInfo[i].tabInfo.forEach(_ => {
                sortArr = sortArr.concat(_.info)
              })
              pageInfo[i].dataAll = sortArr
            }
        }
        if (flag >= 1 && !app.globalData.cityLocate) {
            self.setData({
                cityLocateName: '定位中...'
            })
            wx.getLocation({
                type: 'wgs84',
                success: function (res) {
                    let param1 = {
                        url: app.API_HOST + 'address/getCityName',
                        data: {
                            lnglat: `${res.longitude},${res.latitude}`
                        }
                    }
                    fetchApi(self, param1).then(res => {
                        self.setData({
                            cityLocateName: res.data.data.city
                        })
                        app.globalData.cityLocate = res.data.data.city
                    }).catch((err) => {

                    });
                },
                fail: function () {
                    let param2 = {
                        url: `${app.API_HOST}cityLocate/get`,
                        data: {
                        }
                    }
                    fetchApi(self, param2).then(res => {
                        console.log(res.data.data)
                        if (res.data.data.is_open == 0) {
                            showModal({
                                title: "提示",
                                content: '商家未开启城市定位，请至商品后台中开启城市定位'
                            })
                        }
                        app.globalData.cityLocate = res.data.data.default_city
                        self.setData({
                            cityLocateName: app.globalData.cityLocate
                        })
                    }).catch(err => {
                        showToast('获取默认城市失败', self)
                    })
                }
            })
        }
        self.setData({
            pageInfo,
            backgroundObj,
            pickerObjIndex
        })
    }).catch(err => console.log('err', err))
};

function showLogo(self) {
    let setLogo = function () {
        showExpried(app.globalConfig);
        self.setData({
            showLogo: app.globalConfig.open_tech_support,
            logoText: app.globalConfig.tech_support_text
        })
    }
    getGlobalConfig(self).then(res => {
        setLogo();
    }).catch(err => {
        console.log('获取配置失败: ', err)
    })
}
function selectBless(that) {
    if (that.dataStore.bless) {
        that.dataStore.bless.getOnLineActivity()
    } else {
        that.dataStore.bless = that.selectComponent('#bless')
        if (that.dataStore.bless) {
            that.dataStore.bless.getOnLineActivity()
        }
    }
}