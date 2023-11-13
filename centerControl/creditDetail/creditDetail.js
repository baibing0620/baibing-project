import { fetchApi } from './../../api/api.js'
Page({

    data: {
        tabBar: [
            { title: '获取记录', status: 1 },
            { title: '使用记录', status: 2 }
        ],
        dataList: [],
        type: 1,
        pageIndex: 1,
        pageSize: 12,
        loadStyle: 'loading',
        showStyle: 0
    },

    tabChange(e) {
        const { status } = e.currentTarget.dataset
        this.setData({
            type: status,
            dataList: []
        })
        this.data.pageIndex = 1
        this.getDataList()
    },

    getDataList() {
        this.setData({
            loadStyle: 'loading'
        })
        const { type, pageIndex, pageSize } = this.data
        fetchApi(this, {
            url: 'userCredit/getUserCreditRecord',
            data: {
                type,
                pageIndex,
                pageSize
            }
        }).then(res => {
            const { data } = res.data
            const { dataList: list, pageSize } = this.data
            const dataList = pageIndex == 1 ? data : list.concat(data)
            this.setData({
                dataList,
                loadStyle: data.length < pageSize ? 'loadOver' : 'loadMore',
                showStyle: dataList.length == 0 ? 2 : 1
            })
        }).catch(err => {
            console.log(err)
            this.setData({
                showStyle: 3
            })
        })
    },

    onLoad: function (options) {
        this.getDataList()
    },

    onReady: function () {

    },

    onShow: function () {

    },

    onHide: function () {

    },


    onUnload: function () {

    },

    onPullDownRefresh: function () {
        this.data.pageIndex = 1
        this.getDataList()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        const { loadStyle } = this.data
        if (loadStyle != 'loadMore') return
        this.data.pageIndex++
        this.getDataList()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})