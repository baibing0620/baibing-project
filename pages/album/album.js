import { fetchApi } from '../../api/api'

Page({
    data: {
        showStyle: 0,
        list: [],
        pageIndex: 1,
        pageSize: 18,
        loadStyle: 'loading',
    },

    handlePreview(e) {
        const { index } = e.target.dataset
        const urls = this.data.list.map(e => e.url)
        wx.previewImage({
            current: urls[index],
            urls
        })
    },

    getList() {
        this.setData({
            loadStyle: 'loading'
        })
        const { pageIndex, pageSize, label } = this.data
        fetchApi(this, {
            url: 'CrmUser/getUserImg',
            data: {
                pageIndex,
                pageSize,
                label
            }
        }).then(res => {
            const { list: newList } = res.data.data
            const { list: oldList } = this.data
            const list = pageIndex == 1 ? newList : oldList.concat(newList)
            this.setData({
                list,
                loadStyle: newList < pageSize ? 'loadOver' : 'loadMore',
                showStyle: list.length ? 1 : 2
            })
        }).catch(_ => {
            this.setData({
                showStyle: 3
            })
        })
    },

    onLoad: function (options) {
        this.getList()
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
        this.setData({
            playIndex: -1,
            pageIndex: 1
        })
        this.getList()
    },

    onReachBottom: function () {
        const { loadStyle } = this.data
        if (loadStyle != 'loadMore') return
        this.data.pageIndex++
        this.getList()
    }
})