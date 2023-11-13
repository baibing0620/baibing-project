const app = getApp();
import { fetchApi } from '../../api/api.js';
import { showToast, showTips, nav, showLoading, hideLoading } from '../../utils/util';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardInfo:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            cardInfo: { ...options },
            qrCodeURL: `${app.API_HOST}CardManage/genBindingQrCode?token=${app.globalData.token}&beid=${app.globalData.beid}&staffId=${options.staffId}&cardId=${app.globalData.cardId}`
        })
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    saveQRCode() {
        let self = this;
        let qrCodeURL = this.data.qrCodeURL
        if (!qrCodeURL) {
            showTips('无下载链接');
            return;
        }
        showLoading({
            title: '下载中'
        });
        wx.downloadFile({
            url: qrCodeURL,
            success: function (res) {
                hideLoading();
                if (res.statusCode === 200) {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success(res) {
                            showToast('保存成功', 'success')
                        },
                        fail(err) {
                            wx.getSetting({
                                success(resSetting) {
                                    if (!resSetting.authSetting['scope.writePhotosAlbum']) {
                                        self.setData({
                                            showopenSetting: true,
                                            setttingContent: '需要您的授权才可以保存图片'
                                        })
                                    }
                                },
                                fail(err) {
                                    console.log('error: ', err)
                                }
                            })

                        }
                    })
                }
            },
            fail: (err) => {
                console.log('error: ', err)
            }
        })
    },
    cancelSetting() {
        this.setData({
            showopenSetting: false
        })
    },
})