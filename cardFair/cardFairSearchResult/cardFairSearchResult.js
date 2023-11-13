const app = getApp();
import { fetchApi } from "./../../api/api.js";
import { nav } from "../../utils/util";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        indus: [],
        list: [],
        sortIndex: 0,
        sortMode: [{
            label: "智能排序",
            value: "default"
        },{
            label: "浏览量",
            value: "page_views"
        },{
            label: "收藏量",
            value: "collection_num"
        }],
        inputValue: "",
        searchValue: "",
        currentIndex: [-1, -1],
        indusIndex: [-1, -1],
        areaIndex: [-1, -1],
        sliderNone: true,
        showStyle: 0,
        pageSize: 10,
        pageIndex: 1
    },

    bindMenuClick(e) {
        if (this.sliderTimer) clearTimeout(this.sliderTimer);
        this.setData({
            sliderNone: false,
        });
        let mode = e.currentTarget.dataset.mode;
        this.sliderTimer = setTimeout(() => {
            this.setData({
                sliderMode: mode,
                currentIndex: mode === "indus" ? this.data.indusIndex : this.data.areaIndex,
                sliderShow: (mode === this.data.sliderMode && this.data.sliderShow) ? false : true
            });
            switch (mode) {
                case "indus":
                    (!this.data.indus || this.data.indus.length < 1) && (this.getAllIndus());
                    break;
                case "area":
                    (!this.data.area || this.data.area.length < 1) && (this.getAllArea());
                    break;
                default:
                    return;
            }
            this.clearSlider();
        });
    },

    clearSlider() {
        if (this.data.sliderShow) return;
        if (this.clearSliderTimer) clearTimeout(this.clearSliderTimer);
        this.clearSliderTimer = setTimeout(() => {
            this.setData({
                sliderNone: true
            });
        }, 500);
    },

    bindTabsMenuClick(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        this.setData({
            currentIndex: [index, -1],
        });
    },

    bindTabsMenuClick2(e) {
        let index = parseInt(e.currentTarget.dataset.index || 0);
        this.setData({
            "currentIndex[1]": index,
            sliderShow: false
        });
        switch (this.data.sliderMode) {
            case "indus":
                this.setData({ indusIndex: this.data.currentIndex });
                break;
            case "area":
                this.setData({ areaIndex: this.data.currentIndex });
                break;
            default:
                return;
        }
        this.clearSlider();
        this.init();
    },

    bindHideSlider() {
        this.setData({
            sliderShow: false
        });
        this.clearSlider();
    },

    bindInput(e) {
        this.data.inputValue = e.detail.value;
    },

    bindSearch() {
        this.data.searchValue = this.data.inputValue;
        this.init();
    },

    getList() {
        this.setData({
            loadStyle: "loading"
        });
        let sortMode = this.data.sortMode[this.data.sortIndex].value;
        let indusIndex = this.data.indusIndex;
        let areaIndex = this.data.areaIndex;
        let area = this.data.area;
        let indus = indusIndex[0] === -1 ? "" : indusIndex[1] === -1 ? this.data.indus[indusIndex[0]].pindus_name : this.data.indus[indusIndex[0]].cindus_name[indusIndex[1]];
        let province = areaIndex[0] === -1 ? "" : area[areaIndex[0]].province;
        let city = areaIndex[0] !== -1 && areaIndex[1] !== -1 ? area[areaIndex[0]].city[areaIndex[1]] : "";
        let params = {
            url: app.API_HOST + "CardMarket/getCardMarketList",
            data: {
                all: this.data.searchValue,
                indus: indus,
                province: province,
                city: city,
                orderBy: sortMode === "default" ? "" : sortMode,
                aiCode: sortMode === "default" ? -1 : 0,
                pageSize: this.data.pageSize,
                pageIndex: this.data.pageIndex
            }
        }
        fetchApi(this, params).then(res => {
            let data = res.data.data;
            data.map(i => {
                try {
                    i.tags = JSON.parse(i.tags).join(" | "); 
                } catch (err) {
                    console.log("error: ", err);
                }
            });
            this.setData({
                showStyle: 1,
                list: this.data.pageIndex > 1 ? this.data.list.concat(data) : data,
                loadStyle: data.length >= this.data.pageSize ? "loadMore" : "loadOver"
            });
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                showStyle: -1
            });
        });
    },

    getAllIndus() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "CardMarket/getAllindus",
                data: {}
            }
            fetchApi(this, params).then(res => {
                let data = res.data.data;
                resolve();
                this.setData({
                    indus: data
                });
            }).catch(res => {
                console.log("error: ", res);
                reject(res);
                this.setData({
                    showStyle: -1
                });
            });
        });
    },

    getAllArea() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "CardMarket/getAllArea",
                data: {}
            }
            fetchApi(this, params).then(res => {
                let data = res.data.data;
                resolve();
                this.setData({
                    area: data
                });
            }).catch(res => {
                console.log("error: ", res);
                reject(res);
                this.setData({
                    showStyle: -1
                });
            });
        });
    },

    bindSortChange(e) {
        let index = parseInt(e.detail.value || 0);
        this.setData({
            sortIndex: index
        });
        this.init();
    },

    navigate(e) {
        let page = e.currentTarget.dataset.page;
        nav({ url: `/cardFair/${page}/${page}` });
    },

    toDetail(e) {
        nav({
            url: "/cardFair/cardFairDetail/cardFairDetail",
            data: {
                mCardId: e.currentTarget.dataset.cardid,
                beid: e.currentTarget.dataset.beid
            }
        });
    },

    init() {
        this.data.pageIndex = 1;
        this.getList();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad (options) {
        if (options.searchValue) {
            this.setData({
                inputValue: options.searchValue
            });
            this.data.searchValue = options.searchValue;
        }
        this.init();
        app.pageData.setPage(this, "cardFairSearchResult");
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        app.pageData.removePage("cardFairSearchResult");
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.init();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        if (this.data.loadStyle === "loading" || this.data.loadStyle === "loadOver") return;
        this.data.pageIndex ++;
        this.getList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})