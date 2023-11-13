const app = getApp(); // w
import { fetchApi} from '../../api/api.js';
import { nav, showLoading, showModal } from '../../utils/util';

Page({

    data: {
        showStyle: 0,
        expressStatus: 0,
        expressName: '',
        expressNO: '',
        traces: [],
        expressStatusDes: ['无轨迹', '待揽件', '在途中', '签收', '问题件', '该快递不支持物流跟踪']

    },

    onLoad: function(options) {
        this.dataStore.orderId = options.id;
        getInitData(this);

    },
    dataStore: {
        orderId: 0
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },


    onPullDownRefresh: function() {
        getInitData(this);

    },


})

function getInitData(self) {
    let param = {
        url: app.API_HOST + 'express/getOrderExpressTraces',
        data: {
            orderId: self.dataStore.orderId
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        self.setData({
            showStyle: 1,
            expressStatus: parseInt(data.status),
            expressName: data.express_name,
            expressNO: data.express_sn,
            traces: data.traces
        })
    }).catch(err=>{
      self.setData({
        showStyle:3
      })
    })

}