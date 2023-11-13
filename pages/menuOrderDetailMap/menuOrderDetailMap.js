const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
  makePhoneCall, showLoading
} from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        scale: 17,
        distance: 0,
        phone: '',
        servicePhone:'',
        deliveryType:'',
        markers: [{
                iconPath: "/imgs/qishou.png",
                id: 0,
                latitude: 23.09834,
                longitude: 113.324520,
                width: 52,
                height: 58,
                callout: {
                    content: '骑手正在狂奔',
                    color: '#d72f22',
                    fontSize: 12,
                    borderRadius: 4,
                    padding: 7,
                    display: 'ALWAYS',
                    bgColor: '#FFEC8B',
                }
            }, {
                iconPath: "/imgs/person.png",
                id: 1,
                latitude: 23.1011,
                longitude: 113.324520,
                width: 42,
                height: 48,
                callout: {
                    content: '小主您在这里',
                    color: '#d72f22',
                    fontSize: 12,
                    borderRadius: 4,
                    padding: 7,
                    display: 'ALWAYS',
                    bgColor: '#FFEC8B',
                },
            },
            {
                iconPath: "/imgs/business.png",
                id: 2,
                latitude: 23.1029,
                longitude: 113.324400,
                width: 42,
                height: 48,
                callout: {
                    content: '我是商家位置',
                    color: '#d72f22',
                    fontSize: 12,
                    borderRadius: 4,
                    padding: 7,
                    display: 'ALWAYS',
                    bgColor: '#FFEC8B',
                }
            }
        ],
        controls: [{
            id: 1,
            iconPath: '/imgs/refresh.png',
            position: {
                left: -100,
                top: -100,
                width: 45,
                height: 45
            },
            clickable: true
        }]
    },
    dataStore: {
        orderId: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        try {
            var res = wx.getSystemInfoSync();
            let mapBottomH = res.windowWidth / 750 * 220;
            let top = res.windowHeight - mapBottomH - 45 - 5;
            let left = res.windowWidth - 45 - 5;
            this.data.controls[0].position.left = left;
            this.data.controls[0].position.top = top;
            this.setData({
                controls: this.data.controls
            })
        } catch (e) {
            this.data.controls[0].position.left = 10;
            this.data.controls[0].position.top = 10;
            this.setData({
                controls: this.data.controls
            })
        }
        this.dataStore.orderId = options.orderId;
        this.setData({
            deliveryStatus:options.deliveryStatus||0
        })
        getInitData(this)
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
        getInitData(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
    makePhone(e) {
        makePhoneCall(`${e.currentTarget.dataset.phone}`)
    },
    controltap() {
        getInitData(this)
    }
})

function getInitData(self) {
    let param = {
        url: app.API_HOST +'delivery/getOrderDetail',
        data: {
            order_id: self.dataStore.orderId
        }
    };
    showLoading();
    fetchApi(self, param).then((res) => {
        let data = res.data.data
        self.data.markers[0].latitude = data.result.Lat
        self.data.markers[0].longitude = data.result.Lng
        self.data.markers[1].latitude = data.result.receiverLat
        self.data.markers[1].longitude = data.result.receiverLng
        let shopLnglat = data.result.shopLnglat.split(",")
        self.data.markers[2].latitude = shopLnglat[1]
        self.data.markers[2].longitude = shopLnglat[0];
        var deliveryType = ['商家','达达','蜂鸟'];
        self.setData({
            markers: self.data.markers,
            distance: data.result.distance,
            phone: data.result.phone,
            servicePhone: data.service_phone,
            deliveryStatus:data.result.status,
            deliveryType : deliveryType[parseInt(data.type)]
        })
    }).catch((err) => {
        console.log(err)
    })
}