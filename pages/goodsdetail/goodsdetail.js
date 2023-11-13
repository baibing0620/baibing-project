// 拿到全局应用程序实例
const app = getApp(); // world
import {
    cutdownTime,
    cutdownTime2,
    cutdownTime3,
    cutdownTime4,
    cutdownTime5
} from '../../comm/time.js';
import {
    fetchApi,
    getGlobalConfig,
    getPhoneNumber,
    addActionLog,
    getUserInfo,
    getCardInfo,
    checkAvatar
} from '../../api/api.js';
import {
    nav,
    showLoading,
    showModal,
    showToast,
    showTips,
    previewImageList,
    shareParam,
    getHomePage,
    previewImage,
    setCurrentLoginUserCardInfo,
    makePhoneCall,
    formatTime2,
    openLocation
} from '../../utils/util';
let timeCutdown = 0;
let groupTimeCutdown = 0;
let groupTimePrivateCutdown = 0;
let privateGroupTimeCutdown = 0;
let timeNewGroupdown = 0;
let groupSwiper = 0;
let _w = 0;
let _h = 0;
let _pixelRatio = 0;
let flag = false
Page({
    data: {
        videoSrc: '',
        extConfig: app.extConfig,
        playUrl: 'https://facing-1256908372.file.myqcloud.com//image/20180322/268ac785eb953f36.png',
        customization: '',
        showStyle: 0,
        bargainDialog: false,
        banners: [],
        hasBindPhone: false,
        goods_share_language: '',
        share_words: '',
        goods: {
            title: '',
            price: '',
            marketPrice: '',
            sales: '',
            desc: [],
            istime: 0,
        },
        showModalService: false,
        tags: [],
        desType: 1,
        playVideo: false,
        detail: [],
        menuActiveType: 0,
        goodsThumb: '',
        allOptions: [],
        options: [],
        showDialog: false,
        buyNum: 1,
        addCartPrice: 0,
        addCartStocks: 0,
        weight: 0,
        selectedOptionId: 0,
        open_custom_service: 0,
        optionDesc: [],
        times: [],
        saleState: {
            canBuy: 1,
            reason: "可正常售卖"
        },
        hasForm: 0,
        isGroupBuy: 0,
        groupBuyPrice: 0,
        groupBuyLimitNum: 0,
        groupBuyNum: 0,
        groupBuyDeadline: 0,
        winPrizeNum: 0, // 中奖人数
        openGiveCoupon: 0, // 赠送优惠券
        showWinPerson: false,// 公开大团中奖列表
        showUnWin: false,// 小团中奖列表
        lotterygbid: 0, // 分享得到的团id
        showActivityRules: false,
        is_bargain: 0,
        bargain_now_price: -1,
        bargain_price: 0,
        bragain_limit_num: 0,
        checkCommentType: 'all',
        comments: [],
        commentTotal: {},
        loadStyle: 'loadMore',
        isFrom: '',
        isCollect: 0,
        optionDescType: 0,
        image: "",
        showCover: false,
        goods_chat_model_change: false,
        has_add_wechat: false,
        isIphoneX: app.globalData.isIphoneX,
        sourceType: 0,
        videoId: 0,
        articleId: 0,
        swiperContent: [],
        swiperShow: false,
        is_put_in_points_mall: '',
        consume_integral: '',
        consume_price: '',
        can_get_credit: '',
        customIndex: 1,
        isMask: '',
        bgcolor: '#f2f8ff'
    },
    dataStore: {
        goodsId: 0,
        pageIndex: 1,
        limitIos: 0
    },
    swiperBindchange(e) {
        this.setData({
            customIndex: (e.detail.current + 1)
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

    loginTimer: null,

    onLoad(options) {
        this.setData({
            inviterUid: options.fromUser ? options.fromUser : 0,
            lotterygbid: options.gbid ? options.gbid : 0,
            goodsId: parseInt(options.goodsId || options.id)
        })
        if (app.globalConfig) {
            this.dataStore.limitIos = app.globalConfig.open_ios
            this.setData({
                goods_chat_model_change_main: app.globalConfig.goods_chat_model_change,
                staff_func_control: app.globalConfig.staff_func_control
            })
            this.getStaffFuncManageSetting();
        } else {
            getGlobalConfig(self).then(res => {
                this.dataStore.limitIos = res.data.data.open_ios
                this.setData({
                    goods_chat_model_change_main: app.globalConfig.goods_chat_model_change,
                    staff_func_control: app.globalConfig.staff_func_control
                })
                this.getStaffFuncManageSetting();
            }).catch(_ => {})
        }
        if (options.cardId) {
            app.globalData.cardId = options.cardId || 0;
            app.globalData.fromUser = options.fromUser || 0;
            this.setData({
                isFromShare: true
            })
        }
        if (app.globalData.currentLoginUserCardInfo.mobile) {
            this.setData({
                hasBindPhone: true
            });
        }
        if (app.globalData.uid) {
            const {
                cardId,
                currentLoginUserCardInfo: {
                    cardId: myCardId
                },
                userInfo: {
                    avatar
                }
            } = app.globalData
            this.setData({
                toChat: cardId && cardId != 0 && myCardId != cardId,
                getAuthorInfo: !checkAvatar(avatar)
            })
        } else {
            this.loginTimer && (clearInterval(this.loginTimer))
            this.loginTimer = setInterval(() => {
                if (!app.globalData.uid) return
                clearInterval(this.loginTimer)
                const {
                    cardId,
                    currentLoginUserCardInfo: {
                        cardId: myCardId
                    },
                    userInfo: {
                        avatar
                    }
                } = app.globalData
                this.setData({
                    toChat: cardId && cardId != 0 && myCardId != cardId,
                    getAuthorInfo: !checkAvatar(avatar)
                })
            }, 300)

        }

        timeCutdown = 0;
        this.dataStore.goodsId = parseInt(options.goodsId || options.id || app.link.id);
        if (options.isFrom) {
            this.setData({
                isFrom: options.isFrom
            })
        }
        if (options.sourceType) {
            this.setData({
                sourceType: options.sourceType,
                videoId: options.videoId || 0,
                articleId: options.articleId || 0
            })
        }

        getInitData(this);
        if (_w == 0) {
            try {
                var res = wx.getSystemInfoSync();
                _w = res.windowWidth,
                    _h = res.windowHeight;
                _pixelRatio = res.pixelRatio;
                if (res.system.indexOf('iOS') != -1) {
                    flag = true
                }
            } catch (e) {

            }
        }
        getCardInfo().then(data => {
            this.data.cardInfo = data
        })
    },
    onShow() {
        this.dataStore.startTime = new Date().getTime();
        app.showRemind(this);
        this.getSwiperContent()
    },
    onUnload: function() {
        addActionLog(this, {
            type: 16,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime,
                id: this.dataStore.goodsId,
                name: this.data.goods.title
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        addActionLog(this, {
            type: 16,
            detail: {
                duration: new Date().getTime() - this.dataStore.startTime,
                id: this.dataStore.goodsId,
                name: this.data.goods.title
            }
        })
    },
    onReachBottom() {
        if (this.data.menuActiveType != 2 || this.data.loadStyle == 'loadOver' || this.data.isOpenComment == 0) {
            return;
        }
        this.setData({
            loadStyle: 'loading'
        })
        getComment(this, this.data.checkCommentType, true);
    },
    onPullDownRefresh() {

        if (app.globalConfig) {
            this.dataStore.limitIos = app.globalConfig.open_ios
        } else {
            getGlobalConfig(self).then(res => {
                this.dataStore.limitIos = res.data.data.open_ios
            }).catch(_ => {})
        }

        getInitData(this);
        this.getSwiperContent()
    },
    //分享

    getShareParams: function (type = 1) { 
        let query = '';
        query = `goodsId=${this.dataStore.goodsId}&${shareParam()}`;
        if (this.data.lotteryGroup) {
            // 私密团抽奖团带上团id
            query += `&gbid=${this.data.gbid}`
        }
        let { share_image, share_words } = this.data;
        let title = '';
        let imageUrl = '';

        if (share_words) {
            title = share_words;
        } else {
            // title = this.data.good.title;
        }
        if (share_image) {
            imageUrl = share_image;
        } else if (!this.data.invitationGroup) {
            imageUrl = this.data.banners[0]?  this.data.banners[0].url + '?imageView2/1/w/300/h/300' : '';
        }
        if (type == 1) {
            if (this.data.invitationGroup) {
                // 邀请参团
                return {
                    title: title,
                    imageUrl: imageUrl,
                    path: '/pages/groupFriends/groupFriends?' + query + `&gbId=${this.data.privateGroupList[0].gbid}&gid=${this.dataStore.goodsId}`
                }
            } else {
                return {
                    title: title,
                    imageUrl: imageUrl,
                    path: '/pages/goodsdetail/goodsdetail?' + query
                }
            }
        } else {
            return {
                title: title,
                imageUrl: imageUrl,
                query: query
            }
        }
    },
    onShareAppMessage: function() {
        addActionLog(this, {
            type: 14,
            detail: {
                id: this.dataStore.id,
                name: this.data.goods.title
            }
        })
        return this.getShareParams(1);
    },

    toContent(e) {
      nav({
        url: '/pages/contentDetail/contentDetail',
        data: {
          id: e.currentTarget.dataset.id
        }
      })
    },

    toGoods(e) {
      this.dataStore.goodsId = e.currentTarget.dataset.id
      getInitData(this)
    },

    handleNavToDetail(e) {
      const { id } = e.currentTarget.dataset;
      nav({
        url: '/pages/serviceCommodityDetail/serviceCommodityDetail',
        data: {
          id
        }
      });
    },

    previewDesImg(e) {
        previewImage(e)
    },

    showServiceBox(e) {
        this.setData({
            showModalService: true
        })
    },
    closeServiceBox(e) {
        this.setData({
            showModalService: false
        })
    },
    showVideo(e) {
        let src = e.currentTarget.dataset.src;
        this.setData({
            playVideo: true,
            videoSrc: src
        })
    },
    closeVideo() {
        this.setData({
            playVideo: false
        })
    },
    // 函数
    toggleCartPanel(e) {
        if (this.data.saleState.canBuy == 1) {
            if (app.globalConfig.open_customization_category == 1 && this.data.customization) {
                nav({
                    url: '/pages/webView/webView',
                    data: {
                        to: 'choose',
                        goodsId: this.dataStore.goodsId,
                        optionId: 0,
                        total: this.data.buyNum,
                        goodsName: this.data.goods.title,
                        optionName: '',
                        _w: _w,
                        _h: _h,
                        _pixelRatio: _pixelRatio
                    }
                });
                return;
            }

            let type = e.currentTarget.dataset.type
            let toCart = false
            let toBuy = false
            if (typeof type === "string" && type == '1') {
                // 购买
                toBuy = true
            } else if (typeof type === "string" && type == '0') {
                // 加入购物车
                toCart = true
            } else {
                toBuy = false
                toCart = false
            }
            this.setData({
                purchaseBox: true,
                isMask: 'mask',
                bargainDialog: false,
                isgroup: false,
                toBuy: toBuy,
                toCart: toCart
            });
        }

    },
   
    toShowBargainDialog() {
        if (this.data.saleState.canBuy != 1) {
            return
        }
        if (this.data.bargain_now_price == -1) {
            this.setData({
                showDialog: !this.data.showDialog,
                bargainDialog: true
            })
        } else {
            nav({
                url: '/pages/bargainDetail/bargainDetail',
                data: {
                    goodsId: this.dataStore.goodsId
                }
            })
        }
    },
    exchangeGoods() {
        if (this.data.buyNum > this.data.addCartStocks) {
            showModal({
                title: '提示',
                content: '库存不足,请调整购买数量'
            })
            return
        }
        if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
            showModal({
                title: '提示',
                content: '请选择商品的相应的规格。'
            })
        } else {
            this.setData({
                showDialog: false
            });
            nav({
                url: '/pages/confirmOrder/confirmOrder',
                data: {
                    goodsId: this.dataStore.goodsId,
                    optionId: this.data.selectedOptionId,
                    total: this.data.buyNum,
                    videoId: this.data.videoId,
                    sourceType: this.data.sourceType,
                    articleId: this.data.articleId,
                    isPoints: 1
                }
            })
        }
    },
    bargainNow() {
        if (this.data.addCartStocks <= 0) {
            showModal({
                title: '提示',
                content: '库存不足',
            })
            return
        }
        if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
            showModal({
                title: '提示',
                content: '请选择商品的相应的规格。',
            })
        } else {
            let param = {
                url: app.API_HOST + 'bargain/createBargain',
                data: {
                    goodsId: this.dataStore.goodsId,
                    optionId: this.data.selectedOptionId,
                    videoId: this.data.videoId,
                    sourceType: this.data.sourceType,
                    articleId: this.data.articleId
                }
            }
            fetchApi(this, param).then(res => {
                this.setData({
                    showDialog: false,
                    bargainDialog: true
                });
                nav({
                    url: '/pages/bargainDetail/bargainDetail',
                    data: {
                        goodsId: this.dataStore.goodsId,
                        bargainId: res.data.data.bargainId
                    }
                })
            })
        }

    },
    selectSpecItem(e) {
        let specId = e.target.dataset.specId,
            itemId = e.target.dataset.itemId,
            options = this.data.options,
            goodsThumb = this.data.goodsThumb,
            addCartPrice = this.data.addCartPrice,
            addCartStocks = this.data.addCartStocks,
            weight = this.data.weight,
            selectedOptionId = this.data.selectedOptionId,
            allOptions = this.data.allOptions;
        let selectedItems = [];

        for (let i = 0; i < options.length; i++) {
            if (parseInt(options[i].id) == parseInt(specId)) {
                for (let j = 0; j < options[i].items.length; j++) {
                    let item = options[i].items[j];
                    if (parseInt(item.id) == parseInt(itemId)) {
                        options[i].items[j].isSelected = true;
                    } else {
                        options[i].items[j].isSelected = false;
                    }
                }
            }
        }


        for (let i = 0; i < options.length; i++) {
            for (let j = 0; j < options[i].items.length; j++) {
                let item = options[i].items[j];
                if (item.isSelected) {
                    selectedItems.push(parseInt(item.id));
                }
            }
        }
        let selectedItemsStr = selectedItems.sort(function(a, b) {
            return a - b
        }).join('_');


        for (let i = 0; i < allOptions.length; i++) {
            let specs = allOptions[i].specs;
            if (specs == selectedItemsStr) {
                addCartPrice = allOptions[i].productprice;
                addCartStocks = allOptions[i].stock;
                weight = allOptions[i].weight;
                selectedOptionId = allOptions[i].id;
                goodsThumb = allOptions[i].option_thumb_url;
                break;
            }
        }

        this.setData({
            options: options,
            addCartPrice: addCartPrice,
            addCartStocks: addCartStocks,
            selectedOptionId: selectedOptionId,
            goodsThumb: goodsThumb,
            weight: weight

        });
    },
    changeBuyNum(e) {
        if (!e.detail.value) {
            showModal({
                title: '提示',
                content: '购买数量不能为空',
            }).then(_ => {
                this.setData({
                    buyNum: this.data.buyNum
                });
            })
            return;
        }
        let num = parseInt(e.detail.value);
        if (num > this.data.addCartStocks) {
            showModal({
                title: '提示',
                content: '购买数量不能大于库存',
            }).then(_ => {
                this.setData({
                    buyNum: this.data.buyNum
                });
            })

        } else if (num <= 0) {
            showModal({
                title: '提示',
                content: '添加到购物车中的商品数量不能小于1',
            }).then(_ => {
                this.setData({
                    buyNum: 1
                });
            })
        } else if (this.data.isgroup && num > 1) {
            showModal({
                title: '提示',
                content: '拼团商品只能购买一件',
            }).then(_ => {
                this.setData({
                    buyNum: this.data.buyNum
                });
            })
        } else {
            this.setData({
                buyNum: num
            });
        }
    },
    changeCartGoodsNum: function(e) {
        let type = e.target.dataset.type,
            num = this.data.buyNum;
        if (type == 'plus') {
            if (num >= this.data.addCartStocks) {
                showModal({
                    title: '提示',
                    content: '购买数量不能大于库存',
                }).then(_ => {})
            } else if (this.data.isgroup) {
                showModal({
                    title: '提示',
                    content: '拼团商品只能购买一件',
                }).then(_ => { })
            } else {
                num++;
            }
        } else {
            if (num == 1) {
                showModal({
                    title: '提示',
                    content: '添加到购物车中的商品数量不能小于1',
                }).then(_ => {})
            } else {
                num--;
            }
        }
        this.setData({
            buyNum: num
        });
    },
    addToCart: function() {
        if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
            showModal({
                title: '提示',
                content: '请选择商品的相应的规格。'
            })
        } else {
            let params = {
                url: app.API_HOST + 'cart/add',
                data: {
                    beid: app.globalData.beid,
                    goodsId: this.dataStore.goodsId,
                    optionId: this.data.selectedOptionId,
                    total: this.data.buyNum
                }
            };

            fetchApi(this, params).then(res => {
                this.hideMask()
            });
        }
    },
    buyNow() {
        if (this.data.isVirtualGoods == 1 && this.dataStore.limitIos == 1) {
            if (flag) {
                showModal({
                    title: '提示',
                    content: '商家未开启iOS系统用户可购买设置'
                })
                return
            }
        }
        if (this.data.buyNum > this.data.addCartStocks) {
            showModal({
                title: '提示',
                content: '库存不足,请调整购买数量'
            })
            return
        }
        if (this.data.options.length > 0 && this.data.selectedOptionId == 0) {
            showModal({
                title: '提示',
                content: '请选择商品的相应的规格。'
            })
        } else {
            this.setData({
                showDialog: false
            });
            let optionId = this.data.selectedOptionId;
            if (this.data.customization) {
                let optionName = '';
                if (optionId > 0) {
                    for (var i = 0; i < this.data.allOptions.length; i++) {
                        if (this.data.allOptions[i].id == optionId) {
                            optionName = this.data.allOptions[i].title;
                            break;
                        }
                    }
                }
                nav({
                    url: '/pages/webView/webView',
                    data: {
                        goodsId: this.dataStore.goodsId,
                        optionId: optionId,
                        total: this.data.buyNum,
                        goodsName: this.data.goods.title,
                        optionName: optionName,
                        _w: _w,
                        _h: _h,
                        _pixelRatio: _pixelRatio
                    }
                })
            } else {
                nav({
                    url: '/pages/confirmOrder/confirmOrder',
                    data: {
                        goodsId: this.dataStore.goodsId,
                        optionId: optionId,
                        total: this.data.buyNum,
                        videoId: this.data.videoId,
                        sourceType: this.data.sourceType,
                        articleId: this.data.articleId
                    }
                })
            }

        }
    },
    toMycart() {
        nav({
            url: '/pages/myCart/myCart'
        })
    },
    toMycollection() {
        let param = {
            url: app.API_HOST + 'goods/likeGoods',
            data: {
                goodsId: this.dataStore.goodsId
            }
        }
        if (this.data.isCollect == 1) {
            param.url = app.API_HOST + 'goods/unLikeGoods'
        }
        fetchApi(this, param).then(res => {
            this.setData({
                isCollect: this.data.isCollect ? 0 : 1
            });
            showToast(res.data.msg, this, 1500, 'success');
        }).catch((err) => {
            console.log('err',err);
        });


    },
    toCourse() {
        let related_virtual_goods = this.data.related_virtual_goods;
        if (!related_virtual_goods || !related_virtual_goods.id) {
            showToast('暂未关联id');
            return;
        }
        nav({
            url: '/pages/course/course',
            data: {
                id: related_virtual_goods.id
            }
        })
    },
    tapChange(e) {
        let index = parseInt(e.currentTarget.dataset.type);
        this.setData({
            menuActiveType: index,
        });
        if (index == 2 && this.data.comments.length == 0) {
            getComment(this, this.data.checkCommentType, false);
        }

    },
    tapCommentChange(e) {
        let type = e.currentTarget.dataset.type;
        this.dataStore.pageIndex = 1;
        this.setData({
            checkCommentType: type,
            loadStyle: 'loadMore',
        });
        getComment(this, this.data.checkCommentType, false)
    },
    previewImage(e) {
        let imgIndex = parseInt(e.currentTarget.dataset.imgIndex),
            banners = this.data.banners;
        previewImageList(banners, 'url', banners[imgIndex].url);
    },
    previewDetailImage(e) {
        let imgIndex = parseInt(e.currentTarget.dataset.index),
            detailImgs = this.data.detailImgs;
        previewImageList(detailImgs, 'url', detailImgs[imgIndex].url)
    },

    getPhoneNumber(e) {
        getPhoneNumber(e).then(res => {
            res && this.setData({
                hasBindPhone: true
            })
            this.toChat()
        }).catch(err => {
            wx.showToast({
                title: err,
                icon: 'none',
                mask: true,
                duration: 1500
            })
            setTimeout(() => {
                this.toChat()
            }, 1500)
        })
    },

    toChat() {
        const {
            cardId,
            currentLoginUserCardInfo: {
                cardId: myCardId
            }
        } = app.globalData
        if (cardId && cardId != 0 && myCardId != cardId) {
            let data = {
                type: "readyToSend",
                content: {
                    type: "shop",
                    id: this.data.goods.id,
                    price: this.data.goods.price,
                    title: this.data.goods.title,
                    url: this.data.goodsThumb
                }
            };
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

    previewQRCode() { 
        this.setData({
            showCover: true,
            palette: this.palette()
        })
    },
    // 海报json配置
    palette() {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
            path = encodeURIComponent(`/pages/goodsdetail/goodsdetail?goodsId=${this.dataStore.goodsId}&distributorId=${app.globalData.uid}&${shareParam()}`),
            qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}`
        const {
            title,
            price,
            sales,
            marketPrice
        } = this.data.goods, {
            name,
            position,
            company,
            mobile,
            avatar_url
        } = this.data.cardInfo
        return {
            "width": "750px",
            "height": "1190px",
            "background": "#ffffff",
            "views": [{
                    "type": "image",
                    "url": `${avatar_url}?imageView2/1/w/200/h/200`, //头像
                    "css": {
                        "width": "120px",
                        "height": "120px",
                        "top": "34px",
                        "left": "45px",
                        "rotate": "0",
                        "borderRadius": "250px",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "text",
                    "text": name,
                    "css": {
                        "color": "#1D2023",
                        "background": "rgba(0,0,0,0)",
                        "width": "280px",
                        "height": "45.199999999999996px",
                        "top": "54px",
                        "left": "184px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "40px",
                        "fontWeight": "bold",
                        "maxLines": "1",
                        "lineHeight": "44.400000000000006px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": position,
                    "css": {
                        "color": "#919599",
                        "background": "rgba(0,0,0,0)",
                        "width": "560px",
                        "height": "31.639999999999997px",
                        "top": "108px",
                        "left": "184px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "28px",
                        "fontWeight": "normal",
                        "maxLines": "2",
                        "lineHeight": "31.080000000000002px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": mobile, //手机号
                    "css": {
                        "color": "#F29C4B",
                        "background": "rgba(0,0,0,0)",
                        "width": "194px",
                        "height": "33.9px",
                        "top": "65px",
                        "left": "510px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "30px",
                        "fontWeight": "normal",
                        "maxLines": "2",
                        "lineHeight": "33.300000000000004px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "image",
                    "url": `${ this.data.banners[0].url }?imageView2/1/w/750/h/750`, //主图
                    "css": {
                        "width": "660px",
                        "height": "660px",
                        "top": "180px",
                        "left": "45px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "aspectFill"
                    }
                },
                {
                    "type": "text",
                    "text": title,
                    "css": {
                        "color": "#1D2023",
                        "background": "rgba(0,0,0,0)",
                        "width": "382px",
                        "height": "104.36399999999999px",
                        "top": "887px",
                        "left": "44px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "36px",
                        "fontWeight": "bold",
                        "maxLines": "2",
                        "lineHeight": "51.94800000000001px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": "￥", //￥
                    "css": {
                        "color": "#FF3333",
                        "background": "rgba(0,0,0,0)",
                        "width": "30px",
                        "height": "22.599999999999998px",
                        "top": "1019px",
                        "left": "43px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "20px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "22.200000000000003px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "image",
                    "url": qrcode, //二维码
                    "css": {
                        "width": "209px",
                        "height": "208px",
                        "top": "859px",
                        "left": "493px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "image",
                    "url": "https://facing-1256908372.file.myqcloud.com//image/20200413/6bce772cb5ddeb61.png", //素材
                    "css": {
                        "width": "678px",
                        "height": "69px",
                        "top": "1084px",
                        "left": "24.00000439453089px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "mode": "scaleToFill"
                    }
                },
                {
                    "type": "text",
                    "text": price, //价格
                    "css": {
                        "color": "#FF3333",
                        "background": "rgba(0,0,0,0)",
                        "width": "220px",
                        "height": "45.199999999999996px",
                        "top": "1000px",
                        "left": "60px",
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "40px",
                        "fontWeight": "normal",
                        "maxLines": "1",
                        "lineHeight": "44.400000000000006px",
                        "textStyle": "fill",
                        "textDecoration": "none",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                },
                {
                    "type": "text",
                    "text": marketPrice, //市场价
                    "css": {
                        "color": "#999999",
                        "background": "rgba(0,0,0,0)",
                        "width": "200px",
                        "height": "37.18000000000001px",
                        "top": "1010px",
                        "left": `${price.length*22+72}px`, //市场价位置与原价保持一定距离
                        "rotate": "0",
                        "borderRadius": "",
                        "borderWidth": "",
                        "borderColor": "#000000",
                        "shadow": "",
                        "padding": "0px",
                        "fontSize": "26px",
                        "fontWeight": "normal",
                        "maxLines": "2",
                        "lineHeight": "37.51800000000001px",
                        "textStyle": "fill",
                        "textDecoration": "line-through",
                        "fontFamily": "",
                        "textAlign": "left"
                    }
                }
            ]
        }

    },
    coverHide() {
        this.setData({
            showCover: false
        })
    },

    navHomePage() {
        nav({
            url: getHomePage()
        })
    },
    getUseAuthorize(e) {
        const {
            userInfo
        } = e.detail
        const {
            method
        } = e.currentTarget.dataset
        if (userInfo) {
            getUserInfo(this, userInfo).then(e => {
                this.setData({
                    getAuthorInfo: false
                })
                switch (method) {
                    case 'toGroupBuy':
                        this.toGroupBuy()
                        break;
                    case 'toShowBargainDialog':
                        this.toShowBargainDialog()
                        break;
                    default:
                        this.toggleCartPanel()
                }
            })
        } else {
            showTips('授权失败')
        }
    },
    getSwiperContent() {
        const params = {
            url: 'CarouselImage/getCarouselImage',
            data: {
                status: 1
            }
        }
        fetchApi(this, params).then(res => {
            const {
                info
            } = res.data.data;
            let list = info.filter(i => i.link_live_type.indexOf('3') != -1)
            let swiperContent = list.filter(ele => {
                if (ele.link_type == 0) {
                    return ele.shopGoods && ele.shopGoods.status == 1
                } else if (ele.link_type == 3) {
                    return ele.live_name != ''
                } else if (ele.link_type == 4) {
                    return ele.shopPage
                } else {
                    return ele.event_param
                }
            })
            this.setData({
                swiperContent: swiperContent,
                swiperShow: false
            });
            setTimeout(() => {
                this.setData({
                    swiperShow: swiperContent.length > 0
                });
            }, 300)
        }).catch(err => {
            console.log('error: ', err);
        });
    },
    handleSwiperClick(e) {
        console.log(e)
        const {
            linkType,
            roomId,
            url,
            eventparam
        } = e.currentTarget.dataset;
        switch (parseInt(linkType)) {
            case 3:
                wx.navigateTo({
                    url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}`
                })
                break
            case 5:
                this.navigateToMiniProgram(eventparam)
                break
            case 6:
                let latitude = Number(eventparam.lnglat.split(',')[1]),
                    longitude = Number(eventparam.lnglat.split(',')[0]),
                    address = eventparam.address || '';
                openLocation(latitude, longitude, address);
                break
            case 7:
                nav({
                    url: '/pages/contentDetail/contentDetail',
                    data: {
                        id: eventparam.id
                    }
                })
                break
            case 8:
                this.navigateToWebView(eventparam)
                break
            case 9:
                nav({
                    url: `/pages/${eventparam.eventType}/${eventparam.eventType}`,
                    data: {
                        id: eventparam.id
                    }
                })
                break
            case 10:
                makePhoneCall(eventparam.phone);
                break
            case 11:
                nav({
                    url: '/pages/couponDetail/couponDetail',
                    data: {
                        id: eventparam.id
                    }
                })
                break
            case 12:
                nav({
                    url: '/pages/goodsList/goodsList',
                    data: eventparam
                })
                break
            default:
                nav({
                    url
                })
        }
    },

    navigateToWebView(eventParam) {
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
        nav({
            url: '/pages/webView/webView',
            data: eventParam
        });
    },
    navigateToMiniProgram(param) {
        wx.navigateToMiniProgram({
            appId: param.id,
            path: param.path || '',
            fail: err => {
                showModal({
                    title: "打开错误"
                })
            }
        })
    },
    showOpenSetting(e) {
        this.setData({
            showopenSetting: e.detail.showopenSetting,
            setttingContent: e.detail.setttingContent
        })
    },

    cancelSetting() {
        this.setData({
            showopenSetting: false,
        })
    },

    viewGroupList() {
        wx.navigateTo({
            url: '/pages/groupList/groupList?goodsId=' + JSON.stringify(this.dataStore.goodsId) + '&canBuy=' + this.data.saleState.canBuy
        })
    },

    getStaffFuncManageSetting() {
        let params = {
            url: app.API_HOST + "config/getStaffFuncManageSetting",
            data: {}
        }
        fetchApi(this, params).then(res => {
            let {
                goods_chat_model_change_main,
                staff_func_control
            } = this.data;
            this.setData({
                goods_chat_model_change: staff_func_control == 1 ? res.data.data.goods_chat_model_change : goods_chat_model_change_main,
                has_add_wechat: res.data.data.has_add_wechat == 1 ? true : false
            });
        }).catch(res => {
            console.log('error: ', res);
        })
    },
    navAddWechat() {
        nav({
            url: '/centerControl/addentErpriseWechat/addentErpriseWechat',
            data: {
                status: 3
            }
        })
    },
    toGroupBuy(e) {
        let isGroupBuy = this.data.isGroupBuy
        let lotteryGroupType = this.data.lotteryGroupType
        let gbId = e.currentTarget.dataset.gbId;
        if (this.data.saleState.canBuy != 1 && isGroupBuy != 3) {
            return
        };
        if (isGroupBuy == 2) {
            // 私密团
            if (this.data.privateGroupList && this.data.privateGroupList.length > 0) {
                if (this.data.privateGroupStatus == 2 || this.data.privateGroupStatus == 0) {
                    // 邀请开团,走普通的邀请
                    this.showShare()
                } else {
                    // 邀请参团
                    this.data.invitationGroup = true
                    this.showShare()
                }
            } else {
                // 开私密团
                // getUserUnifiedAuthorization(this)
                this.setData({
                    isgroup: true,
                    isMask: 'mask',
                    purchaseBox: true,
                    bargainDialog: false
                })
                return
            }
        } else if (isGroupBuy == 3 && lotteryGroupType == 1) {
            // 抽奖大团
            if (this.data.groupbuytimes[0].timeType == 1 || (this.data.groupbuytimes[0].timeType == 2 && this.data.userJoin)) {
                //邀请参团
                this.data.invitationGroup = false
                this.showShare()
                return
            } else if (this.data.groupbuytimes[0].timeType == 3) {
                // 查看中奖名单
                this.winningList()
                return
            }
            // 判断头像昵称
            // getUserUnifiedAuthorization(this)
            this.setData({
                isgroup: true,
                isMask: 'mask',
                purchaseBox: true,
                bargainDialog: false
            })
        } else if (isGroupBuy == 3 && lotteryGroupType == 2) {
            if (this.data.groupbuytimes[0].timeType == 1) {
                return
            } else if (this.data.groupbuytimes[0].timeType == 2) {
                if (this.data.userJoin) {
                    if (this.data.waitLottery) {
                        this.data.lotteryGroup = false
                    } else {
                        this.data.lotteryGroup = true
                    }
                    this.showShare()
                    return
                }
                // 判断头像昵称
                // getUserUnifiedAuthorization(this)
                this.setData({
                    isgroup: true,
                    isMask: 'mask',
                    purchaseBox: true,
                    bargainDialog: false
                })
            }
        } else if (gbId) {
            // 有，则为参团
            nav({
                url: '/pages/groupDetail/groupDetail',
                data: {
                    gid: this.dataStore.goodsId,
                    gbVersion: 1,
                    gbid: gbId
                }
            });
        } else if (this.data.hasGroup) {
            // 有，则为查看团
            nav({
                url: '/pages/groupDetail/groupDetail',
                data: {
                    gid: this.dataStore.goodsId,
                    gbVersion: 1,
                    gbid: this.dataStore.gbid
                }
            });
        } else {
            // 开团
            this.setData({
                isgroup: true,
                isMask: 'mask',
                purchaseBox: true,
                bargainDialog: false
            })
        }
    },

    hideMask() {
        this.setData({
            isMask: 'unmask',
            isService: false,
            purchaseBox: false,
            showPost: false,
            showCouponBox: false,
            invitationGroup: false,
            showWin: false
        })
    },
    groyupNow() {
        let total = this.data.buyNum,
            selectedOptionId = this.data.selectedOptionId;
        if (this.data.buyNum > this.data.addCartStocks) {
            showModal({
                title: '提示',
                content: '库存不足,请调整购买数量'
            })
            return
        }
        if (this.data.options.length > 0 && selectedOptionId == 0) {
            showModal({
                title: '提示',
                content: '请选择商品的相应的规格。'
            })
        } else {
            this.setData({
                showDialog: false
            });
            let gbid = 0
            if (this.data.isGroupBuy == 3 && this.data.lotteryGroupType == 2) {
                // 小团
                if (this.data.lotterygbid != 0) {
                    // 分享的
                    if (!this.data.waitLottery && !this.data.userJoin) {
                        // 参团
                        gbid = this.data.lotterygbid
                    }
                }
            }
            nav({
                url: '/pages/confirmOrder/confirmOrder',
                data: {
                    goodsId: this.dataStore.goodsId,
                    gbVersion: 1,
                    gbid: gbid,
                    isGrounp: this.data.isGroupBuy,
                    optionId: selectedOptionId,
                    total: total,
                    inviterUid: this.data.inviterUid
                } 
            })
        }
    },
    invitationFriends() {
        if ( this.data.privateGroupStatus == 2 || this.data.privateGroupStatus == 0) {
            // 邀请开团,走普通的邀请
            this.data.invitationGroup = false
            this.showShare()
        } else if (this.data.isGroupBuy == 3 && this.data.lotteryGroupType == 1) {
            // 抽奖大团的邀请
            this.data.invitationGroup = false
            this.showShare()
        } else if (this.data.isGroupBuy == 3 && this.data.lotteryGroupType == 2) {
            if (!this.data.userJoin) {
                // 参团或者开团
                this.setData({
                    isgroup: true,
                    isMask: 'mask',
                    purchaseBox: true,
                    bargainDialog: false
                })
                return
            }
            // 抽奖小团的分享需要把团id分享出去
            if (this.data.waitLottery) {
                this.data.lotteryGroup = false
            } else {
                this.data.lotteryGroup = true
            }

            this.showShare()
        } else {
            // 邀请参团
            this.data.invitationGroup = true
            this.showShare()
        }
    },
    showShare() {
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10);
        let QRcode = `${app.API_HOST}goods/getQRcode?goodsId=${this.dataStore.goodsId}&distributorId=${app.globalData.uid}&${shareParam()}&_t=${qrCodeTime}&invitorId=${app.globalData.uid}`;
        if (this.data.lotteryGroup) {
            QRcode += `&gbid=${this.data.gbid}`
        }
        this.setData({
            QRcode: QRcode,
            showShare: true
        })
    },
    winningList() {
        if (this.data.isGroupBuy == 3 && this.data.lotteryGroupType == 1) {
            this.setData({
                showWinPerson: true
            })
        } else {
            this.setData({
                showUnWin: true
            })
        }
    },
    // 展示活动规则
    showGroupRule() {
        this.setData({
            showActivityRules: true
        })
    },
    
    // 邀请排行榜
    groupLeaderboard() {
        nav({
            url: '/pages/groupHelpRanking/groupHelpRanking',
            data: {
                goodsId: this.dataStore.goodsId,
                gbid: this.data.gbid,
                end_time: this.data.endTime,
            }
        })
    },

    toOrder() {
        nav({
            url: '/pages/orderList/orderList'
        })
    },
    
});
// 加载数据
function getInitData(self) {
    let renderPage = function() {
        self.setData({
            open_custom_service: app.globalConfig.funcList.open_custom_service,
            open_qr_code: app.globalConfig.funcList.open_qr_code,
            isOpenComment: app.globalConfig.comments_config.isComment
        });
        getGoodsData(self);
    }
    if (app.globalConfig) {
        renderPage();
    } else {
        getGlobalConfig(self).then(res => {
            renderPage()
        }).catch(err => {
            console.log('初始化失败: ', err);
            self.setData({
                showStyle: 3
            })
        });
    }
}

function getGoodsData(self) {
    showLoading();
    let params = {
        url: app.API_HOST + 'goods/detail',
        data: {
            id: self.dataStore.goodsId,
            channelId: app.globalData.channelId,
            is_points: self.data.isFrom == 'integralMall' ? 1 : 0
        }
    };

    fetchApi(self, params).then((data) => {
        clearInterval(timeCutdown);
        clearInterval(groupTimePrivateCutdown);
        let datas = data.data.data,
            tags = [],
            vipInfo,
            optionDesc = [],
            banners = datas.thumb.banners,
            goodsThumb = datas.thumb.thumb.url,
            detailImgs = datas.thumb.detail,
            saleState = datas.saleState;

        let goods = {
            id: datas.id,
            title: datas.title,
            price: datas.price,
            marketPrice: datas.marketPrice,
            sales: datas.sales,
            desc: datas.desc ? datas.desc.split('\n') : [],
            istime: datas.istime,
            total: datas.total
        }

        let sdata = formatTime2(new Date(datas.timestart * 1000))
        let times = [{
            startTime: sdata,
            timeend: datas.timeend,
            timestart: datas.timestart,
            timeShown: '',
            timeActive: 'bc-c',
            hasRemind: true,
            timeType: 0,
            day: 0,
            hr: 0,
            min: 0,
            sec: 0
        }];
        wx.setNavigationBarTitle({
            title: goods.title
        })
        if (datas.tags) {
            tags = JSON.parse(datas.tags)
        }
        let types = [];
        if (datas.hasOption == 1) {
            types = datas.specs.types;
            for (let i = 0; i < types.length; i++) {
                for (let j = 0; j < types[i].items.length; j++) {
                    types[i].items[j].isSelected = false;
                }
            }
        }
        if (datas.has_vip_price == 1) {
            vipInfo = {
                hasVipPrice: datas.has_vip_price,
                vipPrice: datas.vip_price,
                userIsVip: datas.current_user_is_vip
            }
        } else {
            vipInfo = null
        }
        var optionDescType = 0;
        try {
            optionDesc = JSON.parse(datas.optionDesc);
            //判断是否为obj 和存在imgID
            let isNeedObj = typeof(optionDesc) == 'object' && ('imgId' in optionDesc);
            if (isNeedObj) {
                optionDesc = optionDesc.imgUrl;
                optionDescType = '1';
            } else {
                if (datas.optionDesc != '') {
                    optionDesc = datas.optionDesc.split("\n");
                }
            }
        } catch (err) {
            if (datas.optionDesc != '') {
                optionDesc = datas.optionDesc.split("\n");
            }
        }
        let nowTime = parseInt(new Date().getTime() / 1000);
        cutdownTime(nowTime, times);

        var can_get_credit = ''
        if (datas.is_open_credit == 1 && datas.is_consumption_get_credit == 1) {
            if (datas.creditGoods) {
                can_get_credit = datas.creditGoods.credit
            } else {
                if (datas.isGroupBuy != 0) {
                    can_get_credit = Math.ceil(datas.groupBuyPrice * datas.consumption_get_credit)
                } else if (datas.is_bargain == 1) {
                    can_get_credit = Math.ceil(datas.bargain_price * datas.consumption_get_credit)
                } else if (datas.is_put_in_points_mall == 1) {
                    can_get_credit = Math.ceil(datas.consume_price * datas.consumption_get_credit)
                } else {
                    can_get_credit = Math.ceil(datas.price * datas.consumption_get_credit)
                }
            }
        }

        self.setData({
            optionDescType: optionDescType,
            isCollect: datas.isLiked ? parseInt(datas.isLiked) : 0,
            tags: tags,
            showStyle: 1,
            banners: banners,
            goods: goods,
            detailImgs: detailImgs,
            goodsThumb: goodsThumb,
            options: types,
            desType: datas.type,
            allOptions: datas.hasOption ? datas.specs.options : [],
            addCartStocks: datas.total,
            addCartPrice: datas.price,
            optionDesc: optionDesc,
            times: times,
            saleState: saleState,
            isGroupBuy: datas.isGroupBuy ? datas.isGroupBuy : 0,
            groupBuyPrice: datas.groupBuyPrice ? datas.groupBuyPrice : 0,
            groupBuyLimitNum: datas.groupBuyLimitNum ? datas.groupBuyLimitNum : 0,
            groupBuyNum: datas.groupBuyNum ? datas.groupBuyNum : 0,
            groupBuyDeadline: datas.groupBuyDeadline ? datas.groupBuyDeadline : 0,
            lotteryGroupType: datas.lottery_group_type ? datas.lottery_group_type : 0,
            winPrizeNum: datas.win_prize_num ? datas.win_prize_num : 0, // 中奖人数
            groupbuyTime: datas.groupbuy_time,
            is_bargain: datas.is_bargain ? datas.is_bargain : 0,
            bargain_now_price: datas.bargain_now_price ? datas.bargain_now_price : 0,
            bargain_price: datas.bargain_price ? datas.bargain_price : 0,
            bragain_limit_num: datas.bragain_limit_num ? datas.bragain_limit_num : 0,
            costCredit: datas.costCredit || 0,
            vipInfo: vipInfo,
            weight: datas.weight,
            hasForm: datas.hasForm || 0,
            customization: datas.customization || '',
            //商品分享语
            goods_share_language: datas.goods_share_language,
            share_words: datas.share_words,
            is_put_in_points_mall: datas.is_put_in_points_mall,
            consume_integral: datas.consume_integral || '',
            consume_price: datas.consume_price || '',
            is_consumption_get_credit: datas.is_consumption_get_credit,
            can_get_credit,
            open_recommend: datas.open_recommend,
            recommend_title: datas.recommend_title,
            recommend_type: datas.recommend_type,
            recommend_detail: datas.recommend_detail,
        });
        self.setData({
            isVirtualGoods: datas.is_virtual_goods,
            related_virtual_goods: datas.related_virtual_goods || '',
            has_virtual_goods_order: datas.has_virtual_goods_order || 0,

        })

        // 加载拼团 0关闭 1公共团 2私密团 3抽奖团
        if (datas.isGroupBuy > 0) {
            // 是拼团，展示时间
            let nowGroupTime = parseInt(new Date().getTime() / 1000);
            let groupbuyTime = datas.groupbuy_time.split('~')
            let gsdata = formatTime2(new Date(groupbuyTime[0].replace(/-/g, "/")))
            let groupbuytimes = [{
                startTime: gsdata,
                timeend: parseInt(new Date(groupbuyTime[1].replace(/-/g, "/")).getTime() / 1000),
                timestart: parseInt(new Date(groupbuyTime[0].replace(/-/g, "/")).getTime() / 1000),
                timeShown: '',
                hasRemind: true,
                timeType: 0,
                day: 0,
                hr: 0,
                min: 0,
                sec: 0
            }];
            cutdownTime5(nowGroupTime, groupbuytimes);
            if (groupbuytimes[0].timeType != 3) {
                groupTimePrivateCutdown = setInterval(function () {
                    nowGroupTime++;
                    var hasFinishAll = cutdownTime5(nowGroupTime, groupbuytimes);
                    self.setData({
                        groupbuytimes: groupbuytimes
                    })
                    if (hasFinishAll) {
                        clearInterval(groupTimePrivateCutdown);
                        setTimeout(function () {
                            if (datas.isGroupBuy == 3) {
                                // 抽奖团得重新查询
                                getInitData(self)
                            }
                        }, 2000)
                    }
                }, 1000);
            }
            self.setData({
                groupbuytimes: groupbuytimes,
                endTime: groupbuyTime[1]
            })
        }
        if (datas.isGroupBuy == '2') {
            // 私密团
            getUserGroupBuyByGoods(self)
        } else if (datas.isGroupBuy == '1') {
            // 普通团
            getGoodsGroupBuyList(self)
            getGoodsGroupBuyUserTotal(self)
        } else if (datas.isGroupBuy == '3' && datas.lottery_group_type == 1) {
            // 抽奖大团
            if (self.data.groupbuytimes[0].timeType == 3) {
                // 抽奖大团结束了
                getGroupBuyId(self)
            } else {
                getGoodsGroupBuyUserTotal(self)
                getUserGroupBuyByGoods(self)
            }
        } else if (datas.isGroupBuy == '3' && datas.lottery_group_type == 2) {
            // 抽奖小团
            if (self.data.groupbuytimes[0].timeType == 3) {
                // 抽奖小团结束了
                getGroupBuyId(self)
            } else {
                getPrivateGroupBuyId(self)// 查询小团参与人数
                getGoodsGroupBuyUserTotal(self)
                getUserGroupBuyByGoods(self)
            }
        }

        // }
        if (app.globalConfig.comments_config.isComment == 1) {
            datas.comments.rate = (datas.comments.good / datas.comments.all).toFixed(2) * 100;
            self.setData({
                commentTotal: datas.comments
            })
        }

        getGroupBuyDetail(self)
        timeCutdown = setInterval(function() {
            nowTime++;
            var hasFinishAll = cutdownTime(nowTime, times);
            self.setData({
                times: times
            })

            if (hasFinishAll) {
                clearInterval(timeCutdown);
            }

        }, 1000);
    }).catch(err => {
        self.setData({
            showStyle: 3
        });
        console.log('error', err)
    });

};


// 抽奖私密团的参团团数
function getPrivateGroupBuyId(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGroupBuyId',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        // console.log('团信息', res.data.data)
        let data = res.data.data
        let total = data.total // 私密团参团团数
        self.setData({
            privateGroupTotal: total
        })
    }).catch(err => { })
}

// 抽奖团查询团id
function getGroupBuyId(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGroupBuyId',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data
        let gbid = data.gbid
        let total = data.total // 这个团参团人数
        let condition = data.groupStatus // 是否达到抽奖条件
        self.setData({
            gbid: gbid,
            groupTotal: total,
            winningTotal: data.winningTotal,
            isCondition: condition
        })
        if (gbid == 0) {
            // 没有团信息
            self.setData({
                privateGroupList: [],
                currentHeadcount: 0,
                userJoin: false,
                waitLottery: false
            })
        } else {
            // 查询团信息
            getGroupBuyOverDetail(self, gbid)
        }
    }).catch(err => { console.log(err ,'errrrr') })
}

// 获取拼团总人数
function getGoodsGroupBuyUserTotal(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGoodsGroupBuyUserTotal',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data
        self.setData({
            groupPeopleTotal: data
        })
    }).catch((err) => { });
}
// 获取拼团列表
function getGoodsGroupBuyList(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGoodsGroupBuyList',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        clearInterval(timeNewGroupdown);
        clearInterval(groupSwiper);
        let data = res.data.data.list
        // 头像处理
        data.forEach(element => { 
            element.userHead = []
            let list = element.users
            let listAr = list.concat([{ id: 0 }, { id: 0 }, { id: 0 }])
            if (self.data.groupBuyLimitNum > 4) {
                element.userHead = listAr.slice(0, 3)
                element.userHead.push({ id: 0 })
            } else {
                element.userHead = listAr.slice(0, self.data.groupBuyLimitNum)
            }
        });
        // 倒计时
        let nowTime = parseInt(new Date().getTime() / 1000);
        cutdownTime2(nowTime, data);
        timeNewGroupdown = setInterval(function () {
            nowTime++;
            var hasFinishAll = cutdownTime2(nowTime, data);
            self.setData({
                goodsGroupBuyList: data
            })
            // 滚动
            if (glist.length >= 3) {
                let frequency = Math.ceil(glist.length / 2)
                let groupList = []
                for (let index = 0; index < frequency; index++) {
                    let list = []
                    list.push(glist[index * 2])
                    if (glist[(index + 1) * 2]) {
                        list.push(glist[(index + 1) * 2])
                    }
                    groupList.push(list)
                }
                self.setData({
                    swiperHeight: '220rpx',
                    groupList: groupList
                })
            } else {
                let groupList = []
                let list = []
                for (let index = 0; index < glist.length; index++) {
                    list.push(glist[index])
                }
                groupList.push(list)
                self.setData({
                    groupList: groupList,
                    swiperHeight: glist.length > 1 ? '220rpx' : glist.length == 1 ? '100rpx' : '0rpx'
                })
            }
            if (hasFinishAll) {
                clearInterval(timeNewGroupdown);
            }
        }, 1000);
        self.setData({
            goodsGroupBuyList: data
        })
        let glist = self.data.goodsGroupBuyList
        // 滚动
        if (glist.length >= 3) {
            let frequency = Math.ceil(glist.length / 2)
            let groupList = []
            for (let index = 0; index < frequency; index++) {
                let list = []
                list.push(glist[index * 2])
                if (glist[(index + 1) * 2]) {
                    list.push(glist[(index + 1) * 2])
                }
                groupList.push(list)
            }
            self.setData({
                swiperHeight: '220rpx',
                groupList: groupList
            })
        } else {
            let groupList = []
            let list = []
            for (let index = 0; index < glist.length; index++) {
                list.push(glist[index])
            }
            groupList.push(list)
            self.setData({
                groupList: groupList,
                swiperHeight: glist.length > 1 ? '220rpx' : glist.length == 1 ? '100rpx' : '0rpx'
            })
        }
    }).catch((err) => { console.log(err, 'err') });
}

// 已经开奖的查询拼团，不管是否中奖
function getGroupBuyOverDetail(self, gbid) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGroupBuyDetail',
        data: {
            gid: self.dataStore.goodsId,
            gbid: gbid
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data
        let status = data.status
        let userJoin = false
        if (self.data.lotteryGroupType == 1) {
            // 判断自己是否在团
            let uid = app.globalData.uid
            let guid = 0
            if (uid) {
                let has = data.users.filter(ele => {
                    return ele.uid == uid
                })
                if (has.length > 0) {
                    userJoin = true
                    // 查找自己在团中的id
                    data.users.forEach(element => {
                        if (element.uid == uid) {
                            guid = element.id
                        }
                    });
                }
            }
            if (userJoin && status == 2 & guid != 0) {
                // 查询中奖信息
                getGoodsGroupBuyResult(self, guid)
            }
        } else {
            //私密小团
            userJoin = true
            // 寻找团长
            let uid = data.uid
            let userid = app.globalData.uid
            let groupHead = false
            let guid = 0
            data.users.forEach(element => {
                if (element.uid == uid) {
                    // 团长
                    element.ishead = true
                    groupHead = element
                }
                if (element.uid == userid) {
                    guid = element.id
                }
            });
            // 查询中奖信息
            if (guid != 0 && status != 1) {
                // 查询中奖信息
                getGoodsGroupBuyResult(self, guid)
            }
            self.setData({
                groupHead: groupHead
            })
        }
        // 用户信息去重
        let userList = []
        data.users.forEach(element => {
            let have = false
            userList.forEach(ele => {
                if (element.uid == ele.uid) {
                    have = true
                }
            });
            if (!have) {
                userList.push(element)
            }
        });
        self.setData({
            userJoin: userJoin,
            groupStatus: status,
            privateGroupList: userList,
        })
    }).catch(err => { console.log(err,'是这里报错') })
}

// 查询自己是否中奖
function getGoodsGroupBuyResult(self, guid) {
    let param = {
        url: app.API_HOST + 'GroupBuy/getGoodsGroupBuyResult',
        data: {
            groupBuyUserId: guid
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data
        try {
            var info = wx.getSystemInfoSync();
            var w = info.windowWidth,
                h = info.windowHeight;
            var rh = (750 / w) * h;
            var top = (rh - 720) / 2
        } catch (e) {
        }
        self.setData({
            groupWinning: data.result == 1,
            showWin: data.notice == 0,
            isMask: data.notice == 0 ? 'mask' : '',
            top: top
        })
    }).catch(err => { })
}

function getGroupBuyDetail(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getMyGoodsGroupBy',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        if (data.length > 0) {
            let info = data[0]
            self.dataStore.gbid = info.gbid;
            clearInterval(groupTimeCutdown);
            let nowTime = parseInt(new Date().getTime() / 1000);
            let groupTimes = [{
                type: 0,
                end_time: info.end_time,
                day: 0,
                hr: 0,
                min: 0,
                sec: 0
            }];
            cutdownTime2(nowTime, groupTimes);
            self.setData({
                hasGroup: true,
                groupTimes: groupTimes
            })
            groupTimeCutdown = setInterval(function () {
                nowTime++;
                var hasFinishAll = cutdownTime2(nowTime, groupTimes);
                self.setData({
                    groupTimes: groupTimes
                })
                if (hasFinishAll) {
                    clearInterval(groupTimeCutdown);
                }
            }, 1000);
        }
    }).catch(err => {
        self.setData({ showStyle: 3 })
    })
}

// 抽奖团获取拼团列表
function getPrivateGoodsGroupBuyList(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getPrivateGoodsGroupBuyList',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        // console.log('拼团列表', res.data)
        let data = res.data.data.list
        // 头像处理
        data.forEach(element => {
            element.userHead = []
            let list = element.users
            let listAr = list.concat([{ id: 0 }, { id: 0 }, { id: 0 }])
            if (self.data.groupBuyLimitNum > 4) {
                element.userHead = listAr.slice(0, 3)
                element.userHead.push({ id: 0 })
            } else {
                element.userHead = listAr.slice(0, self.data.groupBuyLimitNum)
            }
        });
        self.setData({
            goodsGroupBuyList: data
        })
        let glist = self.data.goodsGroupBuyList
        // 滚动
        if (glist.length >= 3) {
            let frequency = Math.ceil(glist.length / 2)
            let groupList = []
            for (let index = 0; index < frequency; index++) {
                let list = []
                list.push(glist[index * 2])
                if (glist[(index + 1) * 2]) {
                    list.push(glist[(index + 1) * 2])
                }
                groupList.push(list)
            }
            self.setData({
                swiperHeight: '220rpx',
                groupList: groupList
            })
        } else {
            let groupList = []
            let list = []
            for (let index = 0; index < glist.length; index++) {
                list.push(glist[index])
            }
            groupList.push(list)
            self.setData({
                groupList: groupList,
                swiperHeight: glist.length > 1 ? '220rpx' : glist.length == 1 ? '100rpx' : '0rpx'
            })
        }
    }).catch((err) => { });
}

function getUserGroupBuyByGoods(self) {
    clearInterval(privateGroupTimeCutdown)
    let param = {
        url: app.API_HOST + 'groupBuy/getUserGroupBuyByGoods',
        data: {
            goods_id: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data
        // console.log('私密抽奖团数据====>', data)
        let groupBuyLimitNum = self.data.groupBuyLimitNum
        if (data && data.id) {
            let frequency = groupBuyLimitNum - data.users.length // 缺多少
            let currentHeadcount = data.users.length // 现在有多少
            if (self.data.isGroupBuy == 3 && self.data.lotteryGroupType == 1) {
                // 公开大团
                // 判断自己是否在团中
                let uid = app.globalData.uid
                let userJoin = false
                if (uid) {
                    let has = data.users.filter(ele => {
                        return ele.uid == uid
                    })
                    if (has.length > 0) {
                        userJoin = true
                    }
                }
                // 判断是否已经达到了标准
                let waitLottery = false
                if (frequency > 0) {
                    // 人员拼凑
                    for (let index = 0; index < frequency; index++) {
                        data.users.push({})
                    }
                } else {
                    waitLottery = true
                }
                // 大团没人的时候 大团最少展示十个头像
                if (currentHeadcount == 0) {
                    while (data.users.length < 10) {
                        data.users.push({})
                    }
                } else if (frequency <= 0) {
                    // 大团人满多展示一个
                    data.users.push({})
                }

                self.setData({
                    gbid: data.id,
                    privateGroupList: data.users,
                    frequency: frequency,
                    currentHeadcount: currentHeadcount,
                    userJoin: userJoin,
                    waitLottery: waitLottery
                })
            } else if (self.data.isGroupBuy == 3 && self.data.lotteryGroupType == 2) {
                // 抽奖小团
                // 寻找团长
                let uid = data.uid
                let groupHead = false
                data.users.forEach(element => {
                    if (element.uid == uid) {
                        // 团长
                        element.ishead = true
                        groupHead = element
                    }
                });
                // 判断是否已经达到了标准
                let waitLottery = false
                if (frequency > 0) {
                    // 人员拼凑
                    for (let index = 0; index < frequency; index++) {
                        data.users.push({})
                    }
                } else {
                    waitLottery = true
                }
                self.setData({
                    gbid: data.id,
                    privateGroupList: data.users,
                    frequency: frequency,
                    currentHeadcount: currentHeadcount,
                    groupHead: groupHead,
                    userJoin: true,
                    waitLottery: waitLottery
                })
            } else {
                if (data.users.length > 0) {
                    // 人员拼凑
                    for (let index = 0; index < frequency; index++) {
                        data.users.push({})
                    }
                }
                let nowTime = parseInt(new Date().getTime() / 1000);
                let privateGroupbuytimes = [{
                    end_time: data.end_time,
                    timeShown: '',
                    timeType: 0,
                    day: 0,
                    hr: 0,
                    min: 0,
                    sec: 0
                }];
                cutdownTime2(nowTime, privateGroupbuytimes);
                privateGroupTimeCutdown = setInterval(function () {
                    nowTime++;
                    var hasFinishAll = cutdownTime2(nowTime, privateGroupbuytimes);
                    self.setData({
                        privateGroupbuytimes: privateGroupbuytimes
                    })
                    if (hasFinishAll) {
                        clearInterval(privateGroupTimeCutdown);
                    }
                }, 1000);
                self.setData({
                    privateGroupStatus: data.status,
                    privateGroupList: data.users,
                    frequency: frequency,
                    currentHeadcount: currentHeadcount,
                    privateGroupbuytimes: privateGroupbuytimes
                })
            }
        } else {
            if (self.data.isGroupBuy == 3 && self.data.lotteryGroupType == 1) {
                // 抽奖大团自己未加入
                getpublicGoodsGroupBuy(self)
            } else if (self.data.isGroupBuy == 3 && self.data.lotteryGroupType == 2) {
                // 抽奖小团
                if (self.data.lotterygbid) {
                    // 有分享的团，展示分享的团
                    // console.log('抽奖小团查询==>', self.data.lotterygbid)
                    getGroupBuyDetailByGbid(self)
                } else {
                    // getGoodsGroupBuyList(self)
                    getPrivateGoodsGroupBuyList(self)
                    self.setData({
                        privateGroupList: []
                    })
                }
            } else {
                self.setData({
                    privateGroupList: []
                })
            }

        }
    }).catch(err => {
    })
}

// 查询分享的团
function getGroupBuyDetailByGbid(self) {
    let groupBuyLimitNum = self.data.groupBuyLimitNum
    let param = {
        url: app.API_HOST + 'groupBuy/getGroupBuyDetail',
        data: {
            gid: self.dataStore.goodsId,
            gbid: self.data.lotterygbid
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        let frequency = groupBuyLimitNum - data.users.length // 缺多少
        let currentHeadcount = data.users.length // 现在有多少
        // 找团长
        let uid = data.uid
        let groupHead = false
        data.users.forEach(element => {
            if (element.uid == uid) {
                // 团长
                element.ishead = true
                groupHead = element
            }
        });
        // 判断自己是否在团中
        let loginInfo = app.globalData.userInfo
        let userJoin = false
        if (loginInfo.id) {
            let has = data.users.filter(ele => {
                return ele.uid == loginInfo.id
            })
            if (has.length > 0) {
                userJoin = true
            }
        }
        // 判断是否已经达到了标准
        let waitLottery = false
        if (frequency > 0) {
            // 人员拼凑
            for (let index = 0; index < frequency; index++) {
                data.users.push({})
            }
        } else {
            waitLottery = true
        }
        self.setData({
            gbid: self.data.lotterygbid,
            privateGroupList: data.users,
            frequency: frequency,
            currentHeadcount: currentHeadcount,
            groupHead: groupHead,
            userJoin: userJoin,
            waitLottery: waitLottery
        })
    }).catch(err => {
        // 没有找到团
        self.setData({
            gbid: 0,
            lotterygbid: 0,
            privateGroupList: [],
            userJoin: false,
            waitLottery: false
        })
    })
}

// 获取抽奖大团
function getpublicGoodsGroupBuy(self) {
    let param = {
        url: app.API_HOST + 'groupBuy/getGoodsGroupBuyList',
        data: {
            goodsId: self.dataStore.goodsId
        }
    };
    fetchApi(self, param).then(res => {
        let groupBuyLimitNum = self.data.groupBuyLimitNum
        let list = res.data.data.list
        if (list.length > 0) {
            let data = list[0]
            // 公开大团
            let frequency = groupBuyLimitNum - data.users.length // 缺多少
            let currentHeadcount = data.users.length // 现在有多少
            // 判断是否已经达到了标准
            let waitLottery = false
            if (frequency > 0) {
                // 人员拼凑
                for (let index = 0; index < frequency; index++) {
                    data.users.push({})
                }
            } else {
                waitLottery = true
            }
            // 大团最少展示十个头像
            while (data.users.length < 10) {
                data.users.push({})
            }
            self.setData({
                gbid: data.id,
                privateGroupList: data.users,
                frequency: frequency,
                currentHeadcount: currentHeadcount,
                userJoin: false,
                waitLottery: waitLottery
            })
        } else {
            // 没有一个人加入
            let user = []
            for (let index = 0; index < groupBuyLimitNum; index++) {
                user.push({})
            }
            // 大团最少展示十个头像
            while (user.length < 10) {
                user.push({})
            }
            self.setData({
                privateGroupList: user,
                currentHeadcount: 0,
                userJoin: false,
                waitLottery: false
            })
        }
    }).catch((err) => { });
}

function getComment(self, rate, isGetMore = false) {
    let param = {
        url: app.API_HOST + 'comment/get',
        data: {
            goodsId: self.dataStore.goodsId,
            pageSize: 7,
            pageIndex: isGetMore ? self.dataStore.pageIndex + 1 : self.dataStore.pageIndex,
            rate: rate,
        }

    };
    fetchApi(self, param).then(res => {
        if (isGetMore) {
            self.dataStore.pageIndex++
        }
        let data = res.data.data
        self.setData({
            loadStyle: data.length < 7 ? 'loadOver' : 'loadMore',
            comments: isGetMore ? self.data.comments.concat(data) : data,
        })
    }).catch((err) => {
        console.log('err',err);
    });
}