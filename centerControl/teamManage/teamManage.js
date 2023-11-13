const app = getApp();
import {
    fetchApi,
    getGlobalConfig,
    addActionLog
} from '../../api/api.js';
import {
    nav,
    showLoading,
    chooseAddress,
    deleteWhite
} from '../../utils/util';
import {
    getNDay
} from "../../utils/util.js"

Page({

    /**
     * 页面的初始数据
     */
    data: {
        switchTab: {
            tabs: [
                "概览",
                "业务排行",
                "员工名片"
            ],
            themeColor: "rgba(255,255,255)",
            color: "rgba(255,255,255,.3)",
            backgroundColor: '#1F94FD' || app.extConfig.navigationBarBC,
            position: "relative",
            currentIndex: 0,
            top: 0,

        },
        extConfig: app.extConfig,
        showCover: false,
        picker: [{
                index: 0,
                list: ["部门", "员工"],
            },
            {
                index: 0,
                list: ["按客户总数", "按合作客户数", "按订单总数", "按销售金额", "按合作转化率", "按销售转化率"],
            },
            {
                index: 0,
                list: ["全部时间", "近一个月", "近两个月", "近三个月"],
            }
        ],
        menu: {
            path: [{
                name: "全体部门",
                id: "0"
            }],
            data: [],
            show: [],
            current: {
                name: "全体部门",
                id: "0",
                allId: []
            }
        },
        rankings: {
            path: [],
            data: [],
            show: []
        },
        cards: {
            path: [],
            data: [],
            show: []
        },
        search: "",
        overView: "",
        selectedCardId: "",
        cardSelected: false,


        // JX
        goodsData: {},
        sales: "desc",
        isQy: 2,
        timeAgo: "0000-00-00 00:00:00",
        pageIndex: 1,
        pageSize: 10,
        orderBy: "goods_view_num",
        NumIndex: 0,
        DateIndex: 0,
        GoodsIndex: 0,
        loadStyle: "",
        showStyle: 1,
        status: -2
        // JX
    },

    ////////////////////////////////////////////

    changeNum(e){
        if(e.detail.detail.value == 0){
            this.setData({
                sales: "desc",
                pageIndex: 1
            });
            this.getSellMore();

        }else if(e.detail.detail.value != this.data.NumIndex && e.detail.detail.value == 1){
            this.setData({
                sales: "asc",
                pageIndex: 1
            });
            this.getSellMore();

        }
    },

    changeDate(e){
        if(e.detail.detail.value == 0){  // 所有时间
            this.setData({
                timeAgo: "0000-00-00 00:00:00",
                pageIndex: 1
            });
            this.getSellMore();

        }else if(e.detail.detail.value != this.data.DateIndex && e.detail.detail.value == 1){  // 1天
            this.setData({
                timeAgo: getNDay(-1),
                pageIndex: 1
            });
            this.getSellMore();

        }else if(e.detail.detail.value != this.data.DateIndex && e.detail.detail.value == 2){ // 7天
            this.setData({
                timeAgo: getNDay(-7),
                pageIndex: 1
            });
            this.getSellMore();

        }else if(e.detail.detail.value != this.data.DateIndex && e.detail.detail.value == 3){ // 15天
            this.setData({
                timeAgo: getNDay(-15),
                pageIndex: 1
            });
            this.getSellMore();
        }else if(e.detail.detail.value != this.data.DateIndex && e.detail.detail.value == 4){  // 30天
            this.setData({
                timeAgo: getNDay(-30),
                pageIndex: 1
            });
            this.getSellMore();
        }
    },

    ChangeRadio(e){
        this.setData({
            isQy: e.detail,
            pageIndex: 1
        });
        this.getSellMore();
    },

    getSellMore(callback = function () { }) {
        let params = {
                url: app.API_HOST + 'CardGoods/goodsList',
                // data: {...obj, ...{departmentIds: this.data.overView}}
                data: {
                    orderBy: this.data.orderBy,
                    orderType: this.data.sales,
                    pageSize: this.data.pageSize,
                    pageIndex: this.data.pageIndex,
                    isQy: this.data.isQy,
                    beginTime: this.data.timeAgo,
                    endTime: getNDay(0),
                    departmentIds: this.data.overView,
                    cid: 0,
                    status: this.data.status,
                    from: '3'
                }
            };
        this.setData({
            loadStyle: "loading"
        });
        fetchApi(this, params).then(res => {
            this.setData({
                goodsData: res.data.data,
            });
            this.setData({
                showStyle: this.data.goodsData.length == 0 ? 2 : 1,
                loadStyle: res.data.data.length < 10 ? 'loadOver' : 'loadMore'
            });
            callback();
        }).catch((err) => {
            console.log(err)
        });
    },



    //////////////////////////////////////////
    onTabClick(e) {
        this.data.switchTab.currentIndex = e.detail.currentIndex;
        this.setData({
            switchTab: this.data.switchTab
        })
    },

    bindPickerChange(e) {
        let value = parseInt(e.detail.value);
        let index = parseInt(e.currentTarget.dataset.index);
        this.data.picker[index].index = value;
        this.setData({
            picker: this.data.picker
        })
        if (index === 0) {
            this.getRankings();
        }
        if (index === 1) {
            this.setRankings();
        }
        if (index === 2) {
            this.getRankings();
        }
    },

    showCover() {
        this.setData({
            showCover: !this.data.showCover
        })
    },

    getDepartment() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "dataAnalysis/getHasPermissionDepartment",
                data: {
                    permission: app.globalData.permission
                    // permission: "[1]"
                }
            }
            fetchApi(this, params).then(res => {
                this.data.menu.data = res.data.data;
                let newItem = {
                    name: "全体部门",
                    id: "0",
                    child: res.data.data
                };
                this.data.menu.current = newItem;
                this.data.menu.current.allId = getAllChildId(newItem);
                this.setData({
                    "menu.path": [newItem],
                    "menu.show": res.data.data,
                    "menu.current": this.data.menu.current
                });
                resolve("请求吧…");
            }).catch(res => {
                console.log(res, "error");
                reject("别请求了，出大事了！", res);
            })
        })
    },

    getRankings() {
        let params = {
            // url: app.API_HOST + "CrmUserDataCensus/getBusinessRankings",
            url: app.API_HOST + "CrmUserDataCensus/getBusinessRankingsNew",
            data: {
                cardId: app.globalData.cardId,
                rankType: parseInt(this.data.picker[0].index) + 1,
                departmentIds: "",
                beginTime: "",
                endTime: ""
            }
        }

        if (parseInt(params.data.rankType) === 2) {
            params.data.departmentIds = this.data.menu.current.allId;
        }

        if (this.data.picker[2].index !== 0) {
            params.data.beginTime = this.getTime(this.data.picker[2].index, true);
            params.data.endTime = this.getTime();
        }

        fetchApi(this, params, "POST").then(res => {
            // console.log(res)
            this.data.rankings.data = res.data.data;
            this.data.rankings.show = res.data.data;
            this.setRankings();
        }).catch(res => {
            console.log(res, "error");
        })

    },

    setRankings() {
        let data = this.data.rankings.data;
        let path = this.data.rankings.path;
        let realPath;
        let finded = false;
        let noChild = false;
        if (parseInt(this.data.menu.current.id) !== 0 && parseInt(this.data.menu.current.id) !== parseInt(this.data.menu.path[this.data.menu.path.length - 1].id)) {
            realPath = this.data.menu.path.concat(this.data.menu.current, path);
        } else {
            realPath = this.data.menu.path.concat(path);
        }
        if (realPath.length > 1 && this.data.picker[0].index === 0) {
            realPath.map((i, iindex) => {
                if (parseInt(i.id) !== 0) {
                    finded = false;
                    data.map((e, eindex) => {
                        if (parseInt(i.id) === parseInt(e.department_id)) {
                            data = e.child;
                            if (e.child.length < 1) {
                                noChild = true;
                            }
                            finded = true;
                        }
                    })
                }
            })
            if (!finded) {
                data = [];
                path = [];
            }
            if (noChild) {

                this.data.picker[0].index = 1;
                this.setData({
                    picker: this.data.picker
                })

                this.getRankings();

            } else {

                this.setData({
                    "rankings.show": this.sortRankings(this.deepClone(data)),
                    "rankings.path": path
                })

            }
            // console.log(this.data.rankings)

        } else {

            this.setData({
                "rankings.show": this.sortRankings(this.deepClone(this.data.rankings.data)),
                "rankings.path": []
            })

        }
    },

    sortRankings(arr) {
        if (arr.length <= 1) {
            return arr;
        }
        let pivotIndex = Math.floor(arr.length / 2);
        let pivot = arr.splice(pivotIndex, 1)[0];
        let left = [];
        let right = [];

        for (let i = 0; i < arr.length; i++) {

            let bool;

            if (this.data.picker[0].index === 0) {

                switch(this.data.picker[1].index) {
                    case 0:
                        bool = arr[i].dataStatistics.userCount && pivot.dataStatistics.userCount && arr[i].dataStatistics.userCount[0].statusCount > pivot.dataStatistics.userCount[0].statusCount;
                        break;
                    case 1:
                        bool = arr[i].dataStatistics.userCount && pivot.dataStatistics.userCount && arr[i].dataStatistics.userCount[3].statusCount > pivot.dataStatistics.userCount[3].statusCount;
                        break;
                    case 2:
                        bool = arr[i].dataStatistics.orderCount && pivot.dataStatistics.orderCount && arr[i].dataStatistics.orderCount.count > pivot.dataStatistics.orderCount.count;
                        break;
                    case 3:
                        bool = arr[i].dataStatistics.orderCount && pivot.dataStatistics.orderCount && arr[i].dataStatistics.orderCount.salesPrice > pivot.dataStatistics.orderCount.salesPrice;
                        break;
                    case 4:
                        bool = arr[i].dataStatistics.userCooperationConversion && pivot.dataStatistics.userCooperationConversion && arr[i].dataStatistics.userCooperationConversion > pivot.dataStatistics.userCooperationConversion;
                        break;
                    case 5:
                        bool = arr[i].dataStatistics.saleCooperationConversion && pivot.dataStatistics.saleCooperationConversion && arr[i].dataStatistics.saleCooperationConversion > pivot.dataStatistics.saleCooperationConversion;
                        break;
                    default:
                        bool = false;
                }

            } else {

                switch(this.data.picker[1].index) {
                    case 0:
                        bool = arr[i].userCount[0].statusCount > pivot.userCount[0].statusCount;
                        break;
                    case 1:
                        bool = arr[i].userCount[3].statusCount > pivot.userCount[3].statusCount;
                        break;
                    case 2:
                        bool = arr[i].orderCount && pivot.orderCount && arr[i].orderCount.count > pivot.orderCount.count;
                        break;
                    case 3:
                        bool = arr[i].orderCount && pivot.orderCount && arr[i].orderCount.salesPrice > pivot.orderCount.salesPrice;
                        break;
                    case 4:
                        bool = arr[i] && pivot && arr[i].userCooperationConversion > pivot.userCooperationConversion;
                        break;
                    case 5:
                        bool = arr[i] && pivot && arr[i].saleCooperationConversion > pivot.saleCooperationConversion;
                        break;
                    default:
                        bool = false;
                }

            }

            if (bool) {
                left.push(arr[i]);
            } else {
                right.push(arr[i]);
            }
        }

        return this.sortRankings(left).concat([pivot], this.sortRankings(right));
    },

    deepClone(arr) {
        let newArr = [];
        arr.map(i => {
            newArr.push(i);
        });
        return newArr;
    },

    getCards(name = "") {
        let params = {
            // url: app.API_HOST + "CrmUserDataCensus/getStaffCardAnalysis",
            url: app.API_HOST + "CrmUserDataCensus/getStaffCardAnalysisNew",
            data: {
                cardId: app.globalData.cardId,
                name: name,
            }
        }
        fetchApi(this, params).then(res => {
            this.data.cards.data = res.data.data;
            this.data.cards.show = res.data.data;
            this.setCards();
        }).catch(res => {
            console.log(res, "error");
        })
    },

    setCards() {
        let data = this.data.cards.data;
        let path = this.data.cards.path;
        let realPath;
        let finded = false;

        if (parseInt(this.data.menu.current.id) !== 0 && parseInt(this.data.menu.current.id) !== parseInt(this.data.menu.path[this.data.menu.path.length - 1].id)) {
            realPath = this.data.menu.path.concat(this.data.menu.current, path);
        } else {
            realPath = this.data.menu.path.concat(path);
        }

        if (realPath.length > 1) {

            realPath.map((i) => {
                if (parseInt(i.id) !== 0) {
                    finded = false;
                    let result = data.find(e => parseInt(i.id) === parseInt(e.department_id));
                    if (result) {
                        data = (result.child || []).concat(result.card || []);
                        finded = true;
                    }
                }
            })

            if (!finded) {
                data = [];
                path = [];
            }

            this.setData({
                "cards.show": data,
                "cards.path": path
            })

        } else {

            this.setData({
                "cards.show": this.data.cards.data,
                "cards.path": []
            })

        }
    },

    menuClick(e) {
        let item = e.currentTarget.dataset.item;
        let hasChange = false;

        if (e.currentTarget.dataset.change) {

            hasChange = true;

        } else {

            if (item.child && item.child.length > 0) {

                this.setData({
                    "menu.show": item.child
                })

                if (this.data.menu.path[this.data.menu.path.length - 1].id !== item.department_id) {
                    let newItem = {
                        name: item.name,
                        id: item.department_id || item.id,
                        child: item.child,
                        hasPermission: item.hasPermission
                    }
                    this.data.menu.path.push(newItem);
                }

            } else {
                hasChange = true;
            }

        }

        if (hasChange) {
            this.data.showCover = false;
            this.data.menu.current = {
                name: item.name,
                id: item.department_id || item.id,
                allId: getAllChildId(item),
            };
            this.menuChange();
        }

        this.setData({
            menu: this.data.menu,
            showCover: this.data.showCover
        })
    },

    menuBack() {
        let data = this.data.menu.data;
        let path = this.data.menu.path;
        let fined = false;

        if (path.length > 1 && parseInt(path[0].id) === 0) {

            path.pop();

            if (path.length > 1) {

                path.map((i, iindex) => {
                    if (parseInt(i.id) !== 0) {
                        fined = false;

                        data.map((e, eindex) => {
                            if (i.id === e.department_id) {
                                data = e.child;
                                fined = true;

                            } else if (eindex >= data.length - 1 && !fined) {
                                path.splice(iindex, path.length - iindex + 1);
                            }
                        })

                    }
                })

                this.setData({
                    "menu.show": data,
                    "menu.path": path
                })

            } else {

                this.setData({
                    "menu.show": this.data.menu.data,
                    "menu.path": [{
                        name: "全体部门",
                        id: "0",
                        child: this.data.menu.data
                    }]
                })

            }
        }

    },

    menuChange() {
        this.data.cards.path = [];
        this.data.rankings.path = [];
        this.setData({
            search: "",
            cardSelected: false,
            overView: this.data.menu.current.allId
        })
        this.getCards();
        this.setData({
            pageIndex: 1
        });
        this.getSellMore();
        if (this.data.picker[0].index[0]) {
            this.setRankings();
        } else {
            this.getRankings();
        }
    },

    rankingClick(e) {

        let item = e.currentTarget.dataset.item;
        let path = this.data.rankings.path;

        if (item.child && item.child.length > 0) {
            this.setData({
                "rankings.show": item.child
            })

            if (path.length === 0 || path[path.length - 1].id !== item.department_id) {
                path.push({
                    name: item.name,
                    id: item.department_id
                })
            }
        }

        this.setData({
            "rankings.path": path
        })

    },

    rankingBack() {

        this.data.rankings.path.pop();

        this.setRankings();

    },

    cardClick(e) {
        let item = e.currentTarget.dataset.item;
        let path = this.data.cards.path;

            this.setData({
                "cards.show": (item.child || []).concat(item.card || [])
            });

        if (path.length === 0 || path[path.length - 1].id !== item.department_id) {
            path.push({
                name: item.name,
                id: item.department_id
            })
        }

        this.setData({
            "cards.path": path
        })
    },

    cardBack() {

        this.data.cards.path.pop();

        this.setCards();

    },

    bindInput(e) {
        this.data.search = e.detail.value;
    },

    cardSearch() {
        this.setData({
            "menu.path": [{
                name: "全体部门",
                id: "0",
                child: this.data.menu.data,
            }],
            "menu.current": {
                name: "全体部门",
                id: "0",
                allId: getAllChildId(this.data.menu.path[0])
            },
            "menu.show": this.data.menu.data,
            "cards.path": []
        })
        this.getCards(this.data.search);
    },

    getTime(monthAgo = 0, bool) {
        monthAgo = parseInt(monthAgo);
        let time = new Date();
        let year = time.getFullYear();
        let month = time.getMonth() + 1;
        let day = time.getDate();
        let hour = time.getHours();
        let min = time.getMinutes();
        let sec = time.getSeconds();

        if (month - monthAgo < 1) {
            year--;
            month = 12 + (month - monthAgo);
        } else {
            month = month - monthAgo
        }

        if (bool) {
            return `${year}-${mikeItDouble(month)}-${mikeItDouble(day)} 00:00:00`;
        } else {
            return `${year}-${mikeItDouble(month)}-${mikeItDouble(day)} ${mikeItDouble(hour)}:${mikeItDouble(min)}:${mikeItDouble(sec)}`;
        }

    },

    selected(e) {
        let cardId = e.currentTarget.dataset.cardid;
        let uid = e.currentTarget.dataset.uid;
        this.setData({
            selectedCardId: cardId,
            selectedUid: uid,
            cardSelected: true
        })
    },

    selectBack() {
        this.setData({
            cardSelected: false
        })
    },

    navigate(e) {
        const { pack , type } = e.currentTarget.dataset
        nav({
            url: `/${ pack || "centerControl" }/${type}/${type}`,
            data: {
                cardId: this.data.selectedCardId,
                uid: this.data.selectedUid
            }
        })
    },

    init() {
        this.getDepartment().then(res => {
            this.getRankings();
            this.getCards();
            this.setData({
                overView: this.data.menu.current.allId
            });
            this.getSellMore();
        }).catch(res => {
            console.log(res);
        });
    },

    refresh() {

        this.setData({
            overView: this.data.menu.current.allId,
            "rankings.path": [],
            "cards.path": [],
        })
        this.getRankings();
        this.getCards();

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
    //   console.log(options, 'options')
        this.init();
        if (parseInt(options.goodsOrder)){
            this.data.switchTab.tabs = [
                "概览",
                "业务排行",
                "员工名片",
                "商品排行"
            ]
            this.setData({
                'switchTab.tabs': this.data.switchTab.tabs
            })
        }
      this.setData({
        private_region_type: app.globalConfig.private_region_type
      })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        app.showRemind(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.refresh();
        // JX
        this.setData({
            pageIndex: 1
        });
        this.getSellMore(function () {
            wx.stopPullDownRefresh()
        });
        // JX
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        // JX
        this.setData({
            pageIndex: this.data.pageIndex + 1
        });
        let params = {
                url: app.API_HOST + 'CardGoods/goodsList',
                data: {
                    orderBy: this.data.orderBy,
                    orderType: this.data.sales,
                    pageSize: this.data.pageSize,
                    pageIndex: this.data.pageIndex,
                    isQy: this.data.isQy,
                    beginTime: this.data.timeAgo,
                    endTime: getNDay(0),
                    cid: 0,
                    departmentIds: this.data.overView,
                    status: this.data.status,
                    from: '3'
                }
            };
        this.setData({
            loadStyle: "loading"
        });
        fetchApi(this, params).then(res => {
            this.setData({
                goodsData: this.data.goodsData.concat(res.data.data),
                loadStyle: res.data.data.length < 10 ? 'loadOver' : 'loadMore'

            });
        }).catch((err) => {
            console.log(err)
        });
        // JX
    }
})

let mikeItDouble = (n) => {
    if (parseInt(n) < 10) {
        return `0${n}`;
    } else {
        return `${n}`;
    }
}

let getAllChildId = (item) => {

    let ids = [];

    let getId = (item) => {

        if ((item.department_id || item.id) && parseInt(item.hasPermission || 0) === 1) {
            let id = item.department_id || item.id
            ids.push(parseInt(id));
        }
        item.child && item.child.length > 0 && item.child.map(i => {
            getId(i);
        })
    }
    getId(item);
    return JSON.stringify(ids);
}