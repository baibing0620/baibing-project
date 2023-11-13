// pages/myCart/myCart.js
const app = getApp();
import {
  fetchApi
} from '../../api/api.js';
import {
  nav,
  showLoading,
  getSum,
  showTips,
  showModal
} from '../../utils/util';
Page({

  data: {
    canUseCartList: [],
    disUseCartList: [],
    totalMoney: 0,
    showStyle: 0,
    homepageUrl: app.HOMEPAGE_URL,
    goodsList:[],
    payGoods: [],
    isAllSelected: false,
    is_open_credit: '',
  },
  onLoad: function (options) {

  },
  onReady: function () {

  },
  onShow: function () {
    getInitData(this);
    app.showRemind(this);
  },
  onHide: function () {

  },
  onUnload: function () {

  },

  onPullDownRefresh: function () {
    getInitData(this);

  },
  totalChange: function (e) {
    let canUseCartList = this.data.canUseCartList,
      index = parseInt(e.target.dataset.index),
      type = e.target.dataset.type,
      id = canUseCartList[index].id;
    //函数 增减 请求
    let updateTotal = () => {
      let param = {
        url: app.API_HOST + 'cart/update',
        data: {
          id: id,
          total: canUseCartList[index].total
        }
      };
      fetchApi(this, param).then(res => {
        // let totalMoney = getSum(cartList, 'totalprice');
        this.setData({
          canUseCartList: canUseCartList,
          // totalMoney: totalMoney
        });
        this.almostUse()
      }).catch(err => {
        console.log('plus or minus fail', err)
      })
    };
    //函数 增减 请求结束
    if (type == 'plus') {
      canUseCartList[index].total++;
      canUseCartList[index].totalprice = parseInt(canUseCartList[index].total) * parseFloat(canUseCartList[index].productprice);
      updateTotal();
    } else {
      if (canUseCartList[index].total == 1) {
        showModal({
          title: '提示',
          content: '商品不能再少了,仍要减少请按删除',
        })
      } else {
        canUseCartList[index].total--;
        canUseCartList[index].totalprice = parseInt(canUseCartList[index].total) * parseFloat(canUseCartList[index].productprice);
        updateTotal();
      }
    };


  },
  handleChangeSelect: function (e) {
    const index = e.currentTarget.dataset.index;
    this.data.canUseCartList[index].isSelected = !this.data.canUseCartList[index].isSelected;
    this.setData({
      canUseCartList: this.data.canUseCartList
    })
   this.almostUse()
},
// 计算价格及传递选中商品及全选控制
almostUse(){
  this.data.payGoods = [];
  let totalMoney = 0;
  this.data.canUseCartList.map(item => {
    if (item.isSelected) {
        this.data.payGoods.push(item.goodsid)
        totalMoney += Number(item.productprice)*Number(item.total)
      }
  })
  this.setData({
    payGoods: this.data.payGoods,
    totalMoney: totalMoney,
    isAllSelected: this.data.canUseCartList.every( item => {return item.isSelected})
  })
  
},
// 全选
changeAll(){
    if(this.data.canUseCartList.length == 0){
      showTips('无可操作的商品',this)
    }
    this.setData({
      isAllSelected: !this.data.isAllSelected,
      canUseCartList: this.data.canUseCartList.map( item => {return {...item,isSelected: !this.data.isAllSelected}})
    })
    this.data.payGoods = [];
    let totalMoney = 0;
    this.data.canUseCartList.map(item => {
      if (item.isSelected) {
          this.data.payGoods.push(item.goodsid)
          totalMoney += Number(item.productprice)*Number(item.total)
        }
    })
    this.setData({
      payGoods: this.data.payGoods,
      totalMoney: totalMoney
    })
},

  delItem: function (e) {
    showModal({
      content: '是否删除',
      showCancel: true
    }).then(() => {
      let canUseCartList = this.data.canUseCartList,
        disUseCartList = this.data.disUseCartList, 
        index = parseInt(e.currentTarget.dataset.index),
        flag = e.currentTarget.dataset.use == '1'
        console.log('index: ', index)
      let param = {
        url: app.API_HOST + 'cart/delete',
        data: {
          id: flag ? canUseCartList[index].id : disUseCartList[index].id
        }
      };
      console.log('那你特么为什么就是不怕起请求呢')
      fetchApi(this, param).then(res => {
        if(flag){
          canUseCartList.splice(index, 1);
          this.setData({
            canUseCartList: canUseCartList,
          });
        }else{
          disUseCartList.splice(index, 1);
          this.setData({
            disUseCartList: disUseCartList,
          });
        }

        this.almostUse()
      }).catch(err => {
        console.log('del fail')
      })

    }).catch(err => {
      console.log('error: ', err)
    })



  },
  // 该方法已丢弃
  // clearAll: function () {
  //   showModal({
  //     title: '是否清除所有',
  //     showCancel: true
  //   }).then(() => {
  //     let param = {
  //       url: app.API_HOST + 'cart/clear',
  //       data: {}
  //     };
  //     fetchApi(this, param).then(res => {
  //       showTips('清空成功', this, 1500, 'success');
  //       var cartList = [];
  //       // let totalMoney = getSum(cartList, 'totalprice');
  //       this.setData({
  //         cartList: cartList,
  //         // totalMoney: totalMoney
  //       });
  //       this.almostUse()
  //     }).catch(err => {
  //       console.log('获取网络失败: ', err);
  //     })
  //   }).catch(_ => { })
  // },
  navigateToGoods(e) {
    nav({
      url: '/pages/goodsdetail/goodsdetail',
      data: {
        goodsId: e.currentTarget.dataset.goodsId
      }
    })
  },
  navTo(e) {
    let type = e.currentTarget.dataset.type;
    if (type == 'home') {
      nav({
        url: app.HOMEPAGE_URL
      })
    } else if (type == 'personal') {
      nav({
        url: '/pages/personal/personal'
      })
    }
  },
  // 结算
  payMent() {
    if(this.data.payGoods.length == 0){
      showTips('您还未勾选商品哦!', this)
      return
    }
    nav({
      url: '/pages/confirmOrder/confirmOrder?goodsId=' + JSON.stringify(this.data.payGoods)
    })
  },
  getShopCreditSetting() {
    fetchApi(this, {
      url: "config/get",
      data: {}
    }).then(res => this.setData({
      is_open_credit: res.data.data.is_open_credit == 1
    }))
  },
});

function getInitData(self) {
  showLoading();
  let param = {
    url: app.API_HOST + 'cart/get',
    data: {}
  };
  fetchApi(self, param).then(res => {
    let data = res.data.data
      // totalMoney = getSum(data, 'totalprice');
    self.setData({
      canUseCartList: data.filter( item => {return item.status != 2}),
      disUseCartList: data.filter( item => {return item.status == 2}),
      showStyle: 1,
      // totalMoney: totalMoney
    });
    self.almostUse()
    loadGoodsList(self);
  }).catch(err => {
    console.log('error :', err)
    self.setData({
      showStyle: 3
    })
  })
}

function loadGoodsList(self) {
  var param = {
    url: app.API_HOST + 'category/goodsList',
    data: {
      cid: 0,
      pageSize: 8,
      pageIndex: 1
    }

  };
  fetchApi(self, param).then(res => {
    self.setData({
      goodsList: res.data.data
    });
   
  }).catch((err) => {
    console.log('error :', err)
    self.setData({
      showStyle: 3
    })
  });
}