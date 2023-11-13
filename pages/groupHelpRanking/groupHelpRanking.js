const app = getApp();
import { fetchApi, getGlobalConfig } from '../../api/api.js';
import { shareParam } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        flag: {
            0: 'https://facing-1256908372.file.myqcloud.com//image/20200826/bbebb2fafd33222c.png?imageView2/1/w/100/h/100',
            1: 'https://facing-1256908372.file.myqcloud.com//image/20200826/9cc934f83a730333.png?imageView2/1/w/100/h/100',
            2: 'https://facing-1256908372.file.myqcloud.com//image/20200826/5820f3e8cb67dbdc.png?imageView2/1/w/100/h/100',
        },
        rankList: [],
        showStyle: 0,
        loadStyle: 'loadMore',
    },
    dataStore: {
        pageIndex: 1,
        pageSize: 15,
        options: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.dataStore.options = options
        this.getHelpRankList()
        if (app.globalConfig) {
        } else {
            getGlobalConfig().then(res => {
            })
        }
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
        this.getHelpRankList()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.loadStyle == 'loadOver') {
            return
        }
        this.setData({
            loadStyle: 'showLoading'
        })
        this.getHelpRankList(true)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const { share_image, share_words, title, banner } = this.data;
        const { options: { goodsId } } = this.dataStore
        return {
            title: share_words || title,
            imageUrl: share_image || banner + '?imageView2/1/w/300/h/300',
            path: `/pages/goodsdetail/goodsdetail?goodsId=${goodsId}&${shareParam()}&invitorId=${app.globalData.uid}&beid=${app.globalData.beid}`
        }
    },
    getHelpRankList(isGetMore = false) {
        let { pageIndex, pageSize, options: { gbid, goodsId, end_time } } = this.dataStore
        let param = {
            url: app.API_HOST + 'groupBuy/getHelpRankList',
            data: {
                gbid: gbid,
                goodsId: goodsId,
                end_time: end_time,
                pageIndex: isGetMore ? ++pageIndex : 1,
                pageSize
            }
        }
        fetchApi(this, param).then(res => {
            let { rankList, selfRank, shareInfo } = res.data.data
            if (isGetMore) {
                this.dataStore.pageIndex++
            } else {
                this.dataStore.pageIndex = 1
            }
            this.setData({
                rankList: isGetMore ? list.concat(rankList) : rankList,
                ...selfRank,
                ...shareInfo,
                loadStyle: rankList.length < pageSize ? 'loadOver' : 'loadMore'
            });
            this.setData({
                showStyle: this.data.rankList.length == 0 ? 2 : 1
            })
        }).catch(err => {
            console.log(err)
            this.setData({
                showStyle: 3
            })
        })
    },
    invitationFriends() {
        const { options: { goodsId } } = this.dataStore
        let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10);
        let QRcode = `${app.API_HOST}goods/getQRcode?goodsId=${goodsId}&${shareParam()}&_t=${qrCodeTime}&invitorId=${app.globalData.uid}&beid=${app.globalData.beid}`;
        console.log(QRcode)
        this.setData({
            QRcode: QRcode,
            showShare: true
        })
    }
})