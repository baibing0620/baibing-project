import extConfig from './../extConfig'

const app = getApp()

export function formatTime(date, sep = '/') {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(formatNumber).join(sep) + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export function formatTime2(date, sep = '/') {
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return formatNumber(month) + '月' + formatNumber(day) + '日' + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

//获取距离当天N天（N可正可负）日期  yyyy-mm-dd 00:00:00
export function getNDay(n) {
    var date = new Date();
    var year, month, day;
    date.setDate(date.getDate() + n);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
    var s = [year, month, day].map(formatNumber).join('-') + ' 00:00:00';
    return s;
};

export function formatDuring(mss) {
    mss = mss / 1000;
    var secondTime = parseInt(mss); // 秒
    var minuteTime = 0; // 分
    var hourTime = 0; // 小时
    if (secondTime > 60) { //如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if (minuteTime > 60) {
            //获取小时，获取分钟除以60，得到整数小时
            hourTime = parseInt(minuteTime / 60);
            //获取小时后取佘的分，获取分钟除以60取佘的分
            minuteTime = parseInt(minuteTime % 60);
        }
    }
    var result = "" + parseInt(secondTime) + "秒";

    if (minuteTime > 0) {
        result = "" + parseInt(minuteTime) + "分" + result;
    }
    if (hourTime > 0) {
        result = "" + parseInt(hourTime) + "时" + result;
    }
    return result;
}

//返回年月日
export function getYMD(date, split = '/') {
    var year = date.getFullYear();
    var month = parseInt(date.getMonth()) + 1;
    var day = date.getDate();
    month = formatNumber(month);
    day = formatNumber(day);
    return [year, month, day].join(split)
}

//返回明天的年月日
export function getTomorrowYMD(date, split = '/') {
    var year = date.getFullYear();
    var month = parseInt(date.getMonth());
    var day = date.getDate() + 1;
    var tday = new Date(year, month, day);
    return getYMD(tday,split);
}

export function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

// 显示自定义警告
export function showTips(msg, page = 'app', time = 1500, type = 'warn') {
    if (page == 'app') {
        wx.showToast({
            mask: true,
            title: msg || 'error',
            image: '/imgs/waring.png',
            icon: 'loading',
            duration: time
        });
    } else {
        page.setData({
            showSelfToast: true,
            errorMsg: msg || 'error',
            modalBoxType: type
        });
        var expressTime = setTimeout(function () {
            clearTimeout(expressTime);
            page.setData({
                showSelfToast: false,
                modalBoxType: ''
            });
        }, time);
    }
}

export function showToast(msg, icon = 'loading', time = 1500) {
    wx.showToast({
        mask: true,
        title: msg,
        icon: icon,
        duration: time
    });
}

export function showLoading(obj = {
    title: '加载中'
}) {
    obj.mask = true;
    wx.showLoading(obj)
}

export function hideLoading() {
    wx.hideLoading();
}

// 裁剪图片
export function cropImgWH(url, width, height) {
    if (!url) return '';
    height = parseFloat(height.toFixed(2));
    width = parseFloat(width.toFixed(2));
    var cropUrl = url + '?imageView2/1/w/' + width + '/h/' + height;
    return cropUrl;
}

export function cropImgWHOfList(list, key, w, h) {
    list = list.map(function (item, index, input) {
        item.cropThumb = cropImgWH(item[key], w, h);
        return item
    })
    return list;
}

export function cropImgWOfList(list, key, w) {
    list = list.map(function (item, index, input) {
        if (key == '') {
            item = cropImgW(item, w);
        } else {
            item.cropThumb = cropImgW(item[key], w);
        }
        return item
    })
    return list;
}

export function cropImgW(url, width) {
    if (!url) return '';
    width = parseFloat(width.toFixed(2));
    var cropUrl = url + '?imageView2/2/w/' + width;
    return cropUrl;
}

export function previewImage(e) {
    let url = e.currentTarget.dataset.previewUrl;
    url = cropImgW(url, 1200);
    wx.previewImage({
        urls: [url]
    })
};

export function previewImageList(list, key, currentUrl = '') {
    let imgList = list.map(function (item, index, input) {
        if (!key) {
            return cropImgW(item, 1200);
        } else {
            return cropImgW(item[key], 1200);
        }
    });
    wx.previewImage({
        urls: imgList,
        current: currentUrl != '' ? cropImgW(currentUrl, 1200) : ''
    })
};

export function showExpried(config) {
    if (config == null) {
        return;
    } else if (config.enable == 0) {
        wx.showModal({
            title: '提示',
            showCancel: false,
            content: '该店铺已关闭,请联系管理员',
            success: function (res) {
            }
        })
    } else if (config.expired == 1) {
        wx.showModal({
            title: '提示',
            showCancel: false,
            content: '该店铺已到期,请联系管理员',
            success: function (res) {
            }
        })
    }
}

/**
 * 格式化的数字反格式化
 * @param String str 被格式化的数字
 * @return float 去除千分位分隔符之后的数字
 */
export function numDeFormat(str) {
    str += '';
    var num = str.replace(/,/g, '');
    return parseFloat(num, 10);
}

// 总计函数
export function getSum(List, key) {
    var total = 0;
    for (var i = 0; i < List.length; i++) {
        total += numDeFormat(List[i][key]);
    };
    return total;
}

//拨打电话
export function makePhoneCall(phone, func = () => { }) {
    if (!phone) {
        wx.showModal({
            title: '提示',
            confirmText: '确定',
            content: '未设置号码',
            success: function (res) {
            }
        })
        return;
    }
    wx.makePhoneCall({
        phoneNumber: phone, //仅为示例，并非真实的电话号码,
        fail: (res) => {
            if (res.errMsg == "makePhoneCall:fail cancel") {
                return;
            }
            wx.showModal({
                title: '是否复制号码',
                confirmText: '复制',
                content: phone,
                success: function (res) {
                    if (res.confirm) {
                        wx.setClipboardData({
                            data: phone,
                            success: function (res) {
                                showTips('复制成功')
                            }
                        })
                    }
                }
            })
        },
        success: func
    })
}

// 打开地址管理
export function chooseAddress() {
    let self = this;
    wx.chooseAddress({
        success: function (res) { },
        fail: function (e) {
            wx.getSetting({
                success: (res) => {
                    if (!res.authSetting['scope.address']) {
                        showModal({
                            title: '提示',
                            content: '您已关闭通讯地址权限，请至个人中心重新设置通讯地址权限',
                            showCancel: true
                        }).then(_ => {
                            nav({
                                url: '/pages/personal/personal'
                            })
                            // wx.openSetting({
                            //   success: (ress) => {
                            //     wx.chooseAddress();
                            //   }
                            // })
                        })
                    }
                }
            })
        }
    })
}

// 打开地理位置
export function openLocation(latitude, longitude, address = '') {
    wx.openLocation({
        latitude: latitude,
        longitude: longitude,
        address: address,
        // scale: 18,
        fail: () => {
            showToast('打开失败')
        }
    })
}

function type(obj) {
    var toString = Object.prototype.toString;
    var map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    };
    return map[toString.call(obj)];
}

export function deepClone(data) {
    let t = type(data),
        o, i, ni;

    if (t === 'array') {
        o = [];
    } else if (t === 'object') {
        o = {};
    } else {
        return data;
    }

    if (t === 'array') {
        for (i = 0, ni = data.length; i < ni; i++) {
            o.push(deepClone(data[i]));
        }
        return o;
    } else if (t === 'object') {
        for (i in data) {
            o[i] = deepClone(data[i]);
        }
        return o;
    }
}

// 去除左右所有空格
export function trim(str) {
    if (str) {
        str = str.replace(/(^\s*)|(\s*$)/g, "");
    } else {
        str = ''
    }
    return str;
}

//跳转
export function nav(param) {
    if (app.tabBarPath.indexOf(param.url) >= 0) {
      //不带tab页面跳转方式
      if (param.url.indexOf("mall/mall") > 0) {
        wx.redirectTo({
          url: param.url,
          fail: _ => {
              wx.switchTab({
                url: param.url,
                fail: _ => console.error(_)
              });
              console.error(_)
            }
        });
      }else{
        wx.switchTab({
          url: param.url,
          fail: _ => console.error(_)
        });
      }
        return;
    }
    let str = '',
        url = '';
    if (param.data) {
        for (let key in param.data) {
            str += `&${key}=${param.data[key]}`;
        }
        //传参中参数带有?将其变为中文？避免参数拦截
        if (str.indexOf('?') != -1) {
            str = str.replace(/\?/g, '？')
        }
        str = str.replace(/^&/, '?');
    }
    url = param.url + str;
    if (getCurrentPages().length >= 10) {
        wx.redirectTo({
            url: url,
            fail: _ => console.error(_)
        })
    } else {
        wx.navigateTo({
            url: url,
            fail: _ => console.error(_)
        })
    }
}

//
export function getUrlParam(key, str) {
    var paths = str.split('?');
    for (var i = 1; i < paths.length; i++) {
        var params = paths[i].split('&');
        for (var j = 0; j < params.length; j++) {
            var tmp = params[j].split('=');
            if (tmp[0] == key) {
                return tmp[1];
            }
        }
    }
    return ''
}

export function getUrlAndParam(str) {
    var paths = str.split('?'),
        param = {};
    for (var i = 1; i < paths.length; i++) {
        var item = paths[i].split('&');
        for (var j = 0; j < item.length; j++) {
            var tmp = item[j].split('=');
            var key = tmp[0];
            param[key] = tmp[1];
        }
    }
    return {
        url: paths[0],
        param: param
    }

}

function wxPromisify(fn, obj = {}) {
    let wxPromise = new Promise((resolve, reject) => {
        obj.success = (res) => {
            resolve(res)
        }
        obj.fail = (res) => {
            reject(res)
        }

        fn(obj)
    })
    return wxPromise;
}

//取消不做任何处理
export function showModal(obj = {
    title: '提示',
    content: '这是一个模态弹窗',
    fail: () => {
        console.log('模态框弹出失败')
    }
}) {
    let wxShowModal = new Promise((resolve, reject) => {
        obj.showCancel = obj.showCancel ? obj.showCancel : false
        obj.success = (res) => {
            if (res.confirm) {
                resolve(res)
            } else if (res.cancel) {
                reject(res)
            }
        }
        wx.showModal(obj);
    })
    return wxShowModal;
}

export function showActionSheet(obj) {
    return wxPromisify(wx.showActionSheet, obj);
}

export function shareParam() {
    if (app.isMultiShop == 1) {
        return `beid=${app.globalData.beid}&pageId=${app.pageId}&tplId=${app.tplId}`
    }
    return `beid=${app.globalData.beid}&cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
}

export function getHomePage() {
    let homePage = app.HOMEPAGE_URL;
    return homePage;
}

export function inputMoney(value) {
    value = value.toString();
    //先把非数字的都替换掉，除了数字和. 
    value = value.replace(/[^\d\.]/g, '');
    //必须保证第一个为数字而不是. 
    value = value.replace(/^\./g, '0.');
    //保证只有出现一个.而没有多个. 
    value = value.replace(/\.{2,}/g, '.');
    //保证.只出现一次，而不能出现两次以上 
    value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
    //只能输入两个小数
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    return value;
}

//颜色兼容
export function deleteWhite(origionColor, setColor = '') {
    if (/#/.test(origionColor) && origionColor.length == 7) {
        let R = origionColor.substring(1, 3),
            G = origionColor.substring(3, 5),
            B = origionColor.substring(5, 7);
        let r = parseInt(`0x${R}`) >= 239,
            g = parseInt(`0x${G}`) >= 239,
            b = parseInt(`0x${B}`) >= 239;
        if (r && g && b) {
            return setColor
        }
    }
    return origionColor

}

/**
 * 设置登录时候和名片相关的全局数据
 */
export function setCurrentLoginUserCardInfo(obj = {}, needResetLoginCache = false) {

    app.globalData.currentLoginUserCardInfo['update_time'] = new Date().getTime()
    const key = `userInfo${app.globalData.beid}`
    let data = {}
    try {
        data = wx.getStorageSync(key) || {}
    } catch (e) {
        console.error(e)
    }
    app.globalData.uid = obj.id || data.id || ''
    app.globalData.userInfo = Object.assign(data, clearObject(obj))
    app.globalData.userInfo['nickName'] = obj.nickname || data.nickName || ''
    app.globalData.currentLoginUserCardInfo['cardId'] = obj.cardId || data.cardId || ''
    app.globalData.currentLoginUserCardInfo['mobile'] = obj.mobile || data.mobile || ''
    app.globalData.currentLoginUserCardInfo['hasAuthorized'] = obj.hasAuthorized || data.hasAuthorized || ''
    // 刷新缓存内容
    const { userInfo, currentLoginUserCardInfo } = app.globalData
    needResetLoginCache && wx.setStorage({
        key,
        data: {
            id: app.globalData.uid,
            ...userInfo,
            ...currentLoginUserCardInfo
        },
        success: function () {
            console.log('cache user info success')
        },
        fail: function () {
            console.error('cache user info fail')
        }
    })

    function clearObject(object) {
        let result = {}
        for (let key in object) {
            const value = object[key]
            if (typeof value === 'undefined') continue
            result[key] = value
        }
        return result
    }
}

// 判断微信版本号
export function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])
        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}

export function getTitleFromTabbar (page) {
    const tabbars = Object.values(extConfig['tabBarSetting'])
    const { text } = tabbars.find(x => ~x.pagePath.replace(/[\\]/g,'').indexOf(page.route)) || {}
    return text || ''
}

export function query(params = {}) {
    const { cardId, uid: fromUser } = app.globalData
    const data = Object.assign({
        cardId,
        fromUser
    }, params)
    return `?${Object.keys(data).map(key => `${key}=${data[key]}`).join('&')}`
}