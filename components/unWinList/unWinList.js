const app = getApp();
import { fetchApi } from '../../api/api.js';
import { nav, showLoading } from '../../utils/util';


Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: Boolean,
        gbid: String,
        goodsId: String,
        end_time: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        winningList: [],
        selfInviter: [],   // 未中奖
        showStyle: 0,
        showErrorMsg: '',
        length: 0
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getWinningList() {
            let params = {
                url: app.API_HOST + 'groupBuy/getWinningList',
                data: {
                    gbid: this.properties.gbid,
                    goodsId: this.properties.goodsId,
                    end_time: this.properties.end_time
                }
            }
            fetchApi(this, params).then(res => {
                // selfInviter 未中奖  
                let { selfInviter, winningList } = res.data.data;

                this.setData({
                    winningList,
                    selfInviter,
                    length: winningList.length
                });
                this.setData({
                    showStyle: this.data.winningList.length == 0 ? 2 : 1
                })
            })
            .catch(err => {
                let { msg } = err.data;
                this.setData({
                    showStyle: 2,
                    showErrorMsg: msg
                })
            }) 
        },
        close() {
            this.setData({
                show: false
            })
        }
    },
    lifetimes: {
        attached() {
            this.getWinningList()
            // 测试数据
            // let winningList = [
            //     {
            //         avatar: [
            //             'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100',
            //             'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100'
            //         ],
            //         inviter_num: 2
            //     },
                // {
                //     avatar: [
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100',
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100'
                //     ],
                //     inviter_num: 2
                // },
                // {
                //     avatar: [
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100',
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100'
                //     ],
                //     inviter_num: 2
                // },
                // {
                //     avatar: [
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100',
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100'
                //     ],
                //     inviter_num: 2
                // },
                // {
                //     avatar: [
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100',
                //         'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100'
                //     ],
                //     inviter_num: 2
                // },
            // ];
            // let selfInviter = {
                // rank: 10,
                // avatar: [
                //     'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100',
                //     'https://facing-1256908372.file.myqcloud.com//image/20200819/80ece0ffd11c0757.jpg?imageView2/1/w/100/h/100'
                // ],
                // needToInviterNum: 2
            // }
            // this.setData({
            //     winningList,
            //     selfInviter,
            //     length: winningList.length
            // });
            // this.setData({
            //     showStyle: this.data.winningList.length == 0 ? 2 : 1
            // })
        }
    }
})
