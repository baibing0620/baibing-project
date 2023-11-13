const app = getApp(); // w
import { fetchApi, wxpay,getGlobalConfig } from '../../api/api.js';
import { nav, showLoading, showModal, showTips, getSum ,shareParam, makePhoneCall,showActionSheet} from '../../utils/util';

Page({
    data: {
        extConfig: app.extConfig,
        orderDetail: {
            id: 0,
            statusName:''
        },
        mainColor: app.extConfig.mainColor

    },

    onLoad: function(options) {

        this.dataStore.orderId = options.id;
        getInitData(this);

    },

    dataStore: {
        orderId: 0,
        isFrom:'',
        canUseVIP:false
    },

    onReady: function() {
       
    },

    onShow: function() {
        app.showRemind(this);
    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onPullDownRefresh: function() {
        getInitData(this)
    },

    toGoods(e){
        nav({
            url: '/pages/goodsdetail/goodsdetail',
            data: {
            id: e.currentTarget.dataset.id
            }
        })
    },

    toComment(){
        nav({
            url:'/pages/orderEvaluate/orderEvaluate',
            data:{
                id:this.dataStore.orderId
            }
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            path: `/distribution/distributionCenter/distributionCenter?cardId=${app.globalData.cardId}&fromUser=${app.globalData.uid}`
        }
    }

});
// 获取数据
function getInitData(self) {
    showLoading();
    let param = {
        url: app.API_HOST + 'distribution/getOrderDetail',
        data: {
            orderId: self.dataStore.orderId
        }
    };
    fetchApi(self, param).then(res => {
        let data = res.data.data;
        self.setData({
            orderDetail: data,
            showStyle: 1
        });
        
    }).catch(_ =>{
        self.setData({
            showStyle: -1
        })
    });
};



