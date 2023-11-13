const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav } from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showStyle: 0,
        company: '',
        phoneNumber: '',
        currentOfferIndex: -1,
        currentTimeOfferIndex: 0,
        cardPrice: 10,
        cardTotal: '',
        totalPrice: 0,
        priceDetail: '',
        offer: [],
        timeOffer: [],
        showDetail: false
    },

    init() {
        this.payLock = false;
        this.getConfig();
    },

    getConfig() {
        const params = {
            url: app.API_HOST + "Feedback/getPersonalCardRecharge",
            data: {}
        }
        fetchApi(this, params).then(res => {
            const { data: { cardPrice, offer, timeOffer, servicePhone } } = res.data;
            const _offer = [];
            const _timeOffer = [];
            for (let key in offer) {
                const count = parseInt(offer[key]);
                const total = parseInt(JSON.parse(key));
                const price = Math.round(cardPrice * total * 100) / 100;
                const priceAfterCount = Math.round(cardPrice * total * count) / 100;
                _offer.push({ count, total, price, priceAfterCount });
            }
            for (let key in timeOffer) {
                const count = parseInt(timeOffer[key]);
                const time = parseInt(JSON.parse(key));
                const year = Math.floor(time / 12);
                const month = time % 12;
                const label = `${year > 0 ? year + '年' : ''}${month > 0 ? month + '个月' : ''}`;
                _timeOffer.push({ count, time, label });
            }
            this.setData({
                cardPrice,
                servicePhone,
                offer: _offer,
                timeOffer: _timeOffer,
                showStyle: 1
            });
        }).catch(res => {
            console.log('error: ', res)
            this.setData({
                showStyle: 3
            });
        })
    },

    handleCompanyInput(e) {
        const { value } = e.detail;
        this.setData({
            company: value.replace(/\s+/g, "")
        });
    },

    handlePhoneInput(e) {
        const { value } = e.detail;
        this.setData({
            phoneNumber: value.replace(/\s+/g, "")
        });
    },

    handleCardNumInput(e) {
        const { value } = e.detail;
        const cardTotal = value < 0 ? 0 : parseInt(value);
        this.setData({
            cardTotal
        });
        this.getCountType(cardTotal, this.getTotalPrice.bind(this));
    },

    getCountType(value, func = () => { }) {
        const { offer } = this.data;
        let currentOfferIndex = -1;
        offer.map((i, n) => {
            if (i.total <= value && (currentOfferIndex == -1 || offer[currentOfferIndex].total < i.total)) {
                currentOfferIndex = n;
            }
        });
        this.setData({
            currentOfferIndex
        });
        func();
    },

    handleIncrease() {
        const { cardTotal } = this.data;
        const _cardTotal = (cardTotal || 0) + 1
        this.setData({
            cardTotal: _cardTotal
        });
        this.getCountType(_cardTotal, this.getTotalPrice.bind(this));
    },

    handleDecrease() {
        const { cardTotal } = this.data;
        const afterDecrease = (cardTotal || 0) - 1;
        const _cardTotal = afterDecrease < 0 ? 0 : afterDecrease;
        this.setData({
            cardTotal: _cardTotal
        });
        this.getCountType(_cardTotal, this.getTotalPrice.bind(this));
    },

    handleOfferClick(e) {
        const { index } = e.currentTarget.dataset;
        const { currentOfferIndex, offer } = this.data;
        if (index == currentOfferIndex) return;
        this.setData({
            currentOfferIndex: index,
            cardTotal: offer[index].total
        });
        this.getTotalPrice();
    },

    handleTimeOfferClick(e) {
        const { index } = e.currentTarget.dataset;
        const { currentTimeOfferIndex } = this.data;
        if (index == currentTimeOfferIndex) return;
        this.setData({
            currentTimeOfferIndex: index
        });
        this.getTotalPrice();
    },

    getTotalPrice() {
        const { cardTotal, cardPrice, currentOfferIndex, currentTimeOfferIndex, offer, timeOffer } = this.data;
        if (cardTotal > 0) {
            const time = timeOffer[currentTimeOfferIndex].time;
            const countOfTotal = currentOfferIndex >= 0 ? offer[currentOfferIndex].count / 100 : 1;
            const countOfTime = timeOffer[currentTimeOfferIndex].count / 100;
            const totalPrice = Math.round(cardPrice * cardTotal * countOfTotal * time * countOfTime / 12 * 10000 / 10000 * 100) / 100;
            this.setData({
                totalPrice,
                priceDetail: `${cardPrice}*${cardTotal}*${countOfTotal}*(${time}/12)*${countOfTime}=${totalPrice}`
            });
        } else {
            this.setData({
                totalPrice: 0,
                priceDetail: ''
            });
        }
    },

    handleShowDetail() {
        const { showDetail } = this.data;
        this.setData({
            showDetail: !showDetail
        });
    },

    handleSubmit() {
        if (this.payLock) return;
        this.payLock = true;
        this.checkOrder().then(res => {
            const orderId = res.data.data;
            fetchApi(this, {
                url: `order/wxpay`,
                data: {
                    orderId: orderId
                }
            }).then((res) => {
                const { data } = res.data;
                wx.requestPayment({
                    'timeStamp': data.timeStamp,
                    'nonceStr': data.nonceStr,
                    'package': data.package,
                    'signType': data.signType,
                    'paySign': data.paySign,
                    'success': res => {
                        wx.showToast({
                            title: '支付成功',
                            icon: 'success',
                            duration: 1500
                        });
                        setTimeout(() => {
                            nav({ url: '/centerControl/cardSuccessOpen/cardSuccessOpen', data: { id: orderId } });
                            this.payLock = false;
                        }, 1500);
                    },
                    'fail': err => {
                        console.log("error: ", err);
                        this.payLock = false;
                        wx.showToast({
                            title: err ? err.msg || err : '支付失败',
                            icon: 'none',
                            duration: 1500
                        });
                    }
                })
            }).catch((e) => {
                console.log("error: ", err);
                this.payLock = false;
                wx.showToast({
                    title: err ? err.msg || err : '支付失败',
                    icon: 'none',
                    duration: 1500
                });
            });
        }).catch(err => {
            console.log("error: ", err);
            this.payLock = false;
            wx.showToast({
                title: err ? err.msg || err : '订单创建失败',
                icon: 'none',
                duration: 1500
            });
        });
    },

    checkOrder() {
        return new Promise((resolve, reject) => {
            const { company, phoneNumber, cardPrice, cardTotal, totalPrice, currentTimeOfferIndex, currentOfferIndex, offer, timeOffer } = this.data;
            if (!company) {
                reject("请填写公司名称");
                return;
            }
            if (!phoneNumber) {
                reject("请填写联系电话");
                return;
            }
            if (!(cardTotal > 0)) {
                reject("请确认开通数量");
                return;
            }
            const params = {
                url: app.API_HOST + "Feedback/createPersonCardOrder",
                data: {
                    remark: {
                        company: company,
                        mobile: phoneNumber,
                        cardLimit: cardTotal,
                        period: timeOffer[currentTimeOfferIndex].time,
                        totalMoney: totalPrice,
                        cardPrice: cardPrice,
                        cardCountDiscount: currentOfferIndex < 0 ? 100 : offer[currentOfferIndex].count,
                        cardTimeDiscount: timeOffer[currentTimeOfferIndex].count,
                    }
                }
            }
            fetchApi(this, params).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });

    },

    payLock: false,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init();
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
        wx.stopPullDownRefresh();
        this.init();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMore) {
            this.data.pageIndex++;
            this.getList();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let data = this.data.detail;
        let img;
        parseInt(data.type) === 1 ? img = data.image_list[0] : img = data.video_cover_image;
        addActionLog(this, {
            type: 29,
            detail: {
                name: data.title
            }
        });
        let shareData = {
            title: data.title,
            path: `/pages/bbsDetail/bbsDetail?cardId=${app.globalData.cardId}&id=${this.data.id}&fromUser=${app.globalData.uid}`,
        }
        img ? shareData.imageUrl = img + "?imageView2/1/w/710/h/400" : "";
        this.share();
        return shareData;
    }
})