const app = getApp();
import {
    fetchApi,
    postFormId,
    getToken
} from '../../api/api';
import {
    showLoading,
    previewImageList,
    nav,
    makePhoneCall
} from '../../utils/util';
Page({
    data: {
        cardId: "",
        showShareModal: false,
        hasBindPhone: false,
        showStyle: 0,
        baseInfo: {},
        mediaInfo: {},
        tag: [],
        noCard: false,
        likeInfo: {
            hasLike: 0,
            likeList: [],
            likeNum: 0,
            viewNum: 0,
            hasClick: false
        },
        showInfo: false,
        diyConfig: app.extConfig,
        isCurrentCardManage: 0,
        newMsgCount: 0,
        openTechSupport: 0,
        techSupportText: '',
        autoReplay: {},
        showCover: false,
        later: false,
        message: "",
        messageSending: false,
        showZanToast: false,
        bgimg: 'https://facing-1256908372.file.myqcloud.com//image/20180907/2bbc63fb3ca382e5.jpg',
        ready: false,
        controlPanel: [],
        distributionInfo: [],
        menuSetting: {
            "留言": {
                dontNeedToGetTotal: true
            },
            "个人中心": {},
            "管理中心": {}
        },
        videoShowStyle: 1,
        pageRefresh: 0,
        pageSize: 10,
        pageIndex: 1
    },

    dataStore: {
        startTime: 0,
        fromName: '',
        bless: ''
    },

    onLoad: function (options) {
        if (options.mCardId) {
            this.setData({
                cardId: options.mCardId || 0
            });
        }
        if (options.fromUser) {
            app.globalData.fromUser = options.fromUser || 0;
            this.setData({
                fromShare: true
            });
        }
        if (options.cardId) {
            app.globalData.cardId = parseInt(options.cardId || 0);
            this.setData({
                fromCardId: parseInt(options.cardId || 0)
            });
        }
        if (options.beid) {
            this.data.beid = options.beid;
        }

        if (!app.globalData.token) {
            this.pageInit();
        } else {
            this.pageInit();
        }
    },

    onReady: function () {

    },

    onShow() {
        
        app.showRemind(this);
    },

    pageInit: function () {

        this.dataStore.startTime = new Date().getTime();

        if (this.data.cardId == 0) {
            this.setData({
                noCard: true
            });
        } else {
            showLoading();
            getInitData(this);
            this.getVideoShowStyleSetting();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    onUnload: function () {
        this.syncList();
    },

    onPullDownRefresh: function () {
        this.data.loading = false;
        this.pageInit();
        getInitData(this);
        this.getVideoShowStyleSetting();
        this.setData({
            pageRefresh: new Date().getTime()
        });
    },

    networkFaildRealod: function () {
        this.setData({
            showStyle: 0
        });
        getInitData(this);
        this.getVideoShowStyleSetting();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: `您好，我是${this.data.baseInfo.company}的${this.data.baseInfo.position}——${this.data.baseInfo.name }。请多指教！`,
            path: `/cardFair/cardFairDetail/cardFairDetail?mCardId=${ this.data.cardId }&fromUser=${ app.globalData.uid }&cardId=${ app.globalData.cardId }&beid=${this.data.beid}`,
        }
    },

    addCardPageViews() {
        if (this.data.baseInfo.uid == app.globalData.uid) return;
        let params = {
            url: app.API_HOST + "CardMarket/addCardPageViews",
            data: {
                mcardId: this.data.cardId,
                admin_uid: this.data.baseInfo.uid,
            }
        }
        fetchApi(this, params).then(() => {
            this.setData({
                "baseInfo.page_views": parseInt(this.data.baseInfo.page_views || 0) + 1
            });
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    getVideoShowStyleSetting() {
        let params = {
            url: app.API_HOST + "Card/getCardMarketVideoConfig",
            data: {
                mbeid: this.data.beid,
                mcardId: this.data.cardId
            }
        }
        fetchApi(this, params).then(res => {
            let style = parseInt(res.data.data.video_style);
            let open = parseInt(res.data.data.video_style);
            this.setData({
                videoShowStyle: style,
                videoIfOpen: open
            });
            if (open) {
                this.getVideoList();
            }
        }).catch(res => {
            console.log("error: ", res);
        })
    },

    changeCollect(e) {
        if (this.collecting) return;
        this.collecting = true;
        var params = {
            url: 'CardMarket/collectCard',
            data: {
                mcardId: this.data.cardId,
                admin_uid: this.data.baseInfo.uid
            }
        }
        if (this.data.baseInfo.iHasCollect == 1) {
            params.url = 'CardMarket/delMyCardCollectionById';
        }
        fetchApi(this, params).then(() => {
            this.setData({
                "baseInfo.iHasCollect": parseInt(this.data.baseInfo.iHasCollect || 0 ) ? 0 : 1,
                'baseInfo.collection_num': !parseInt(this.data.baseInfo.iHasCollect || 0) ? parseInt(this.data.baseInfo.collection_num || 0) + 1 : (parseInt(this.data.baseInfo.collection_num || 0) || 1) - 1,
                iHasCollectClick: true
            });
            this.collecting = false;
        }).catch(err => { })
    },

    previewImag(e) {
        let url = e.currentTarget.dataset.previewUrl;
        previewImageList(this.data.mediaInfo.imageList, '', url);
    },

    makePhoneCall() {
        makePhoneCall(this.data.baseInfo.mobile, () => {
            console.log('cancel code')
        })
    },

    toCardList() {
        wx.reLaunch({
            url: '/pages/cardList/cardList'
        });
    },

    toCard() {
        if (app.globalData.cardId == 0) return;
        nav({
            url: "/pages/home/home"
        });
    },

    getVideoList() {
        this.data.loading = true;
        let params = {
            url: app.API_HOST + "Card/getCardMarketVideoInfoByCardId",
            data: {
                mcardId: this.data.cardId,
                mbeid: this.data.beid,
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data.list;
            this.setData({
                videoList: this.data.pageIndex === 1 ? data : this.data.videoList.concat(data),
                hasMore: data.length >= this.data.pageSize,
                showStyle: 1
            });
            this.data.loading = false;
        }).catch(res => {
            console.log(res);
            this.setData({
                showStyle: 1
            })
            this.data.loading = false;
        });
    },

    getMoreVideo() {
        if (!this.data.loading) {
            this.data.pageIndex++;
            this.getVideoList();
        }
    },

    toVideoDetail(e) {
        let params = {
            url: "/pages/videoDetail/videoDetail",
            data: {
                id: e.currentTarget.dataset.id,
                beid: this.data.beid,
                mCardId: this.data.cardId
            }
        }
        nav(params);
    },

    syncList() {
        let pages = [
            app.pageData.getPage("cardFairCardCase"),
            app.pageData.getPage("cardFairCardList"),
            app.pageData.getPage("cardFairIndex"),
            app.pageData.getPage("cardFairSearchResult")
        ];
        pages.map(page => {
            if (page && page.data.list) {
                let index = page.data.list.findIndex(i => {
                    return i.card_id == this.data.cardId;
                });
                if (index > -1) {
                    if (this.data.status) {
                        try {
                            page.data.list[index].page_views = parseInt( this.data.baseInfo.page_views || 0 );
                            page.data.list[index].collection_num = parseInt( this.data.baseInfo.collection_num || 0 );
                        } catch (err) {
                            console.log("error: ", err);
                        }
                    }
                    try {
                        if (page.data.mode === "collection" && !parseInt( this.data.baseInfo.iHasCollect || 0 )) {
                            page.data.list.splice(index, 1);
                        }
                    } catch (err) {
                        console.log("error: ",err);
                    }
                    page.setData({
                        list: page.data.list
                    });
                }
            } 
        });
    }
})

function getInitData(self) {
    var param = {
        url: 'Card/getCardMarketInfo',
        data: {
            mcardId: self.data.cardId,
            mbeid: self.data.beid
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        data.mobile_is_show = parseInt(data.mobile_is_show)
        data.addresses = JSON.parse(data.addresses)
        let baseInfo = data;
        let mediaInfo = {
            description: data.description,
            descriptionArr: data.description.split('\n'),
            hasVoice: parseInt(data.has_voice),
            voiceUrl: data.voice_url,
            imageList: data.image_list,
        }

        let status = parseInt(data.status || 0);

        // 特殊办法，占空行处理
        for (let i = 0; i < mediaInfo.descriptionArr.length; i ++) {
            if (mediaInfo.descriptionArr[i] == '') {
                mediaInfo.descriptionArr[i] = '　　'
            }
        }

        self.setData({
            baseInfo: baseInfo,
            mediaInfo: mediaInfo,
            tag: data.tag || [],
            openTechSupport: data.open_tech_support,
            techSupportText: data.tech_support_text,
            menuSetting: self.data.menuSetting,
            imageShowStyle: data.image_show_style ? parseInt(data.image_show_style) : 2,
            status: status
        })
        
        if (!self.hasAddView && self.data.status) {
            self.hasAddView = true;
            self.addCardPageViews();
        }

    }).catch(err => {
        console.log(err);
        self.setData({
            showStyle: 3
        })
    })
}
