// pages/index1/index1.js
const app = getApp()
import {
    addActionLog
} from '../../api/api.js';
import {
    getYMD,
    showModal,
    showTips
} from '../../utils/util';

import editePage from '../../template/index/index.js';


let initPage = editePage('index');
initPage.onShow = function () {
    this.dataStore.startTime = new Date().getTime();
    wx.setNavigationBarTitle({
        title: this.dataStore.pageTitle
    })
};
initPage.onUnload = function () {
    addActionLog(this, {
        type: 48,
        detail: {
            name: this.dataStore.pageTitle,
            duration: new Date().getTime() - this.dataStore.startTime,
        }
    })
};
initPage.onHide = function () {
    addActionLog(this, {
        type: 48,
        detail: {
            name: this.dataStore.pageTitle,
            duration: new Date().getTime() - this.dataStore.startTime,
        }
    })
}

Page(initPage);