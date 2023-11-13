const app = getApp(); // world
import {
  fetchApi,
  addActionLog
} from '../../api/api.js';
import {
  getYMD,
  showModal,
  showTips,
  getTitleFromTabbar
} from '../../utils/util';

import editePage from '../../template/index/index.js';

let initPage = editePage('index1');

initPage.data.extConfig = app.extConfig;

initPage.previewImage = function(e) {
  let id = e.currentTarget.dataset.id;
  this.setData({
    image: this.getImageUrl(id),
    showCover: true,
  })
}

initPage.coverHide = function() {
  this.setData({
    showCover: false
  })
};

initPage.getImageUrl = function(id) {
  return `${app.API_HOST}Editor/makeOfficialNetCodeImg?token=${app.globalData.token}&beid=${app.globalData.beid}&cardId=${app.globalData.cardId}`;
}


initPage.closeNotice = function(e) {
  this.setData({
    showNotice: false
  });
  var formIdList = app.globalData.formIdList,
    len = formIdList.length;
  if (formIdList.length >= 15) {
    return;
  }
  let item = {
    formId: e.detail.formId,
    createTime: parseInt(new Date().getTime() / 1000)
  }
  if (len > 0) {
    formIdList[len - 1].createTime + 1 < parseInt(new Date().getTime() / 1000) ? app.globalData.formIdList.push(item) : '';
  } else {
    app.globalData.formIdList.push(item);
  }
}
initPage.onShow = function() {
  this.dataStore.startTime = new Date().getTime();
  wx.setNavigationBarTitle({
    title: this.dataStore.pageTitle
  })
};
initPage.onReady = function() {
  let param = {
    url: app.API_HOST + 'notice/getShopNoticeInfo',
    data: {}
  }
  fetchApi(this, param).then(res => {
    let data = res.data.data;
    if (!data.id) {
      return
    }
    let isInvalid = data.is_forever == 0 && (Date.parse(new Date()) < Date.parse(data.start_time) || Date.parse(new Date()) > Date.parse(data.end_time));
    if (isInvalid) {
      return;
    }
    if (data.show_type == 1) {
      setShow(this, data.noticeImgUrl);
      return;
    }
    try {
      let noticeInfo = wx.getStorageSync('noticeKey');
      if (!noticeInfo || noticeInfo.id != data.id) {
        setShow(this, data.noticeImgUrl);
        setStorage(data);
      } else {
        if (data.show_type == 2 && noticeInfo.openTime) {
          return;
        } else if (getYMD(new Date(noticeInfo.openTime)) != getYMD(new Date()) && data.show_type == 3) {
          setShow(this, data.noticeImgUrl);
          setStorage(data);
        }
      }
    } catch (e) {
      console.log(e)
    }

  }).catch(() => {})
}
initPage.onUnload = function() {
  addActionLog(this, {
    type: 22,
    detail: {
      duration: new Date().getTime() - this.dataStore.startTime,
    }
  })
};
initPage.onHide = function() {
  addActionLog(this, {
    type: 22,
    detail: {
      duration: new Date().getTime() - this.dataStore.startTime,
    }
  })
}
initPage.data.showNotice = false;
initPage.data.isMultiShop = app.isMultiShop;

initPage.data.noticeHeigth = 0;
Page(initPage);

function setStorage(data) {
  wx.setStorageSync("noticeKey", {
    'id': data.id,
    'isForever': data.is_forever,
    'startTime': data.start_time,
    'endTime': data.end_time,
    "showType": data.show_type,
    'noticeImgUrl': data.noticeImgUrl,
    'openTime': Date.parse(new Date())
  })
}

function setShow(self, url) {
  self.setData({
    showNotice: true,
    noticeImgUrl: url
  })
  let timeCilick = setTimeout(function() {
    clearTimeout(timeCilick);
    self.setData({
      noticeHeigth: '100%'
    })
  }, 1000);
}
