const app = getApp();
import {
    fetchApi
} from '../../api/api';
import {
    showTips,
    showToast,
    nav
} from '../../utils/util';
import {messagePath} from '../../map'
Page({

  /**
   * 页面的初始数据
   */
  data: {
      messageDetail:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
        options
    });
    getMessageDetail(this, options.logId)
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const {options} = this.data;
    getMessageDetail(this, options.logId);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  navNum(){
    nav({
        url:'/centerControl/messagePushNum/messagePushNum',
        data: {
            push_user_detail:this.data.messageDetail.push_user_detail
        }
    })
  }
})

function getMessageDetail(self,id){
    let param = {
        url: `msgPush/detail`,
        data: {
            logId: id
        }
    }
    fetchApi(self, param).then(res => {
        let data = res.data.data
        data.tags = data.tags ? JSON.parse(data.tags) :''
        if (data.skip_path_key != 0 && data.skip_path_type == 1){
            data.path = messagePath[data.skip_path_key][data.skip_path_type]
        }else{
            data.path = data.detail ? JSON.parse(data.detail).title:''
        }
        self.setData({
            messageDetail:data
        })
    }).catch(err => {
        console.log(err)
    })
}

