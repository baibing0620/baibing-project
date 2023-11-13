const app = getApp();
import { fetchApi } from '../../api/api';
import { showToast, showTips, nav, showModal } from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponDetail: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,'otpions')
    this.data.couponUserId = options.couponUserId
    let params = {
      url: app.API_HOST + "coupon/getCouponDetail",
      data: {
        id: options.id || app.link.id || 0,
        couponUserId: options.couponUserId
      }
    }
    fetchApi(this, params).then((res) => {
      let data = res.data.data
      data.description = data.description.split('\n')
      this.setData({
        couponDetail: res.data.data
      })
    }).catch((err) => {
      if (err.data && err.data.msg) {
        showToast(err.data.msg, this)
      }
      console.log('err')
    });
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
  toMall() {
    nav({
      url: '/pages/mall/mall'
    })
  },

  toHome() {
    let couponDetail = this.data.couponDetail.goodsInfo;
    // let categoryDetail = this.data.couponDetail.cateGoryInfo;
    let categoryCDetail = this.data.couponDetail.cateCcateGoryInfo;
    let categoryPDetail = this.data.couponDetail.catePcateGoryInfo;


    if (couponDetail && couponDetail.length > 0) {
      var one = couponDetail[0].goods_type;
      couponDetail.forEach(item => {
        if (item.goods_type != one) {
          nav({
            url: '/pages/index1/index1'
          })
          //首页
        }
      })
      let couponGoodsIds = [];
      for (var key of couponDetail) {
        couponGoodsIds.push(key.id)
      }
      nav({
        url: '/pages/goodsList/goodsList',
        data: {
          couponGoodsIds: JSON.stringify(couponGoodsIds),
          searchType: couponDetail[0].goods_type
        }
      })
    } else if (categoryCDetail.length > 0 || categoryPDetail.length > 0) {
      let categoryDetail = [];
      categoryCDetail.forEach(item => {
        categoryDetail.push(item)
      })
      categoryPDetail.forEach(item => {
        categoryDetail.push(item)
      })
      let two = categoryDetail[0].category_type;
      categoryDetail.forEach(item => {
        if (item.category_type != two) {
          nav({
            url: '/pages/index1/index1'
          })  //首页
        }
      })
      let couponCityIds = {};
      couponCityIds.ccid = [];
      couponCityIds.pcid = [];

      for (var key of categoryPDetail) {
        couponCityIds.pcid.push(key.id)
      }
      for (var key of categoryCDetail) {
        couponCityIds.ccid.push(key.id)
      }
      nav({
        url: '/pages/goodsList/goodsList',
        data: {
          couponCityIds: JSON.stringify(couponCityIds),
          searchType: categoryDetail[0].category_type
        }
      }) 
    } else {
      nav({
        url: '/pages/index1/index1'
      })
    }

  },
  toConsumptionCode(e){
    console.log(e,'e')
    const { id, qrcode } = e.currentTarget.dataset;
    nav({
      url: '/pages/couponConsumptionCode/couponConsumptionCode',
      data: {
        id: id,
        couponUserId: this.data.couponUserId, 
        qrcode: qrcode
      }
    })
  },
  navBack(e) {
    var param = {
      url: app.API_HOST + 'coupon/receiveCoupon',
      data: {
        id: e.currentTarget.dataset.id
      }
    }
    fetchApi(self, param).then((res) => {
      showTips('领取成功', 'sucess');
      setTimeout(function () { wx.navigateBack(); }, 1500);

    }).catch(err => {
      if (err.data && err.data.msg) {
        showModal({
          title: '提示',
          content: err.data.msg
        }).then(_ => { })
      }

    })
  },
})