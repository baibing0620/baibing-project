const app = getApp();
import { fetchApi } from '../../api/api.js';
import { getSum, previewImage } from '../../utils/util';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        data: {},
        selected_products_type:"",
        cancel_check_status:"",
        is_check_order_cancel:1,
        bindTextAreaValue:"",
        isShow:false,
        platformReject:false, 
        showStyle: 1,
        showCover: false,
        dialogMode: "",
        express: [],
        expressIndex: 0,
        expressSn: "",
        refundCauseOptions: ['图文不符', '商品损坏', '商品未收到', '错发商品', '与买家协商一致取消订单', '其它'],
        refundFoodsCauseOptions: ["实物与图文不符", "商家未配送", "包装破损", "食材不新鲜", "与买家协商一致取消订单", "其它"],
        refundIndex: 0,
        refuseReason: ["与卖家协商一致", "该时段可接待人数已满，请下次提早预约", "活动已经结束，请留意活动时间~", "预约填写的信息有误，请重新预约~"],
        refuseCheck: {},
        refuseIndex: 0,
        status:'',
        order_type:'',
        privilege: 0
    },
    getDetail() {
        const method = this.data.mode === "appointment" ? this.getAppointmentDetail : this.getOrderDetail;
        method().then(res => {
            if (this.data.mode === "retail") {
                if (res.delivery_type == 4 && res.shopSelfList) {
                    let shopSelfList = res.shopSelfList;
                    res.address = (shopSelfList.address_province + shopSelfList.address_city + shopSelfList.address_area + shopSelfList.address_detail).replace(/-/g, '');
                } else {
                    res.address = res.address_province + ' ' + res.address_city + ' ' + res.address_area + ' ' + res.address_address;
                }
                this.setData({  
                    selected_products_type:res.selected_products_type,
                    is_check_order_cancel:res.is_check_order_cancel,
                    status:res.status,
                    order_type:res.order_type
                })
                res.goodsPrice = (parseFloat(res.price) - parseFloat(res.dispatchprice)).toFixed(2);
            }
            res.price && (res.priceNumber = parseFloat(res.price || 0));
            this.data.mode != 'appointment' && (res.goodsTotal = parseInt(getSum(res.goods, 'total')) || res.goods.length);
            this.data.mode != 'appointment' && (res.hasPersonalGoods = res.goods.findIndex(i => i.goods_card_id && i.goods_card_id != 0) >= 0);
            this.setData({
                showStyle: 1,
                data: res
            });
            app.globalData.transDataToOrderManageList = res;
        }).catch(res => {
            this.setData({
                showStyle: 2,
            });
            console.log("error: ", res);
        });
    },

    getOrderDetail() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "cardOrder/detail",
                data: {
                    orderId: this.data.id
                }
            }
            fetchApi(this, params).then(res => {
                resolve(res.data.data);
                // console.log('"cardOrder/detail"',res.data.data)
            }).catch(res => {
                reject(res);
            });
        });
    },

    getAppointmentDetail() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "cardOrder/getAppointmentOrderDetail",
                data: {
                    id: this.data.id
                }
            }
            fetchApi(this, params).then(res => {
                resolve(res.data.data);
            }).catch(res => {
                reject(res);
            });
        });
    },

    closeDialog() {
        this.setData({
            showCover: false
        });
    },
    
    cancellationOrder(){
        if (this.data.orderDetail.status == 1){
          this.setData({
            isShow: true
          })
        } 
      },
    getShopExpress() { 
        let params = {
            url: app.API_HOST + "cardOrder/getShopExpress",
            data: {}
        }
        fetchApi(this, params).then(res => {
            this.setData({
                express: res.data.data,
                expressGetting: false
            });
        }).catch(res => {
            console.log("error: ", res);
            this.setData({
                expressGetting: false
            });
        });
    },

    expressQRCode() {
        wx.scanCode({
            success: (res) => {
                this.setData({
                    expressSn: res.result
                })
            }
        })
    },

    sendExpress() {
        let params = {
            url: app.API_HOST + "cardOrder/setExpress",
            data: {
                id: this.data.id,
                expressSn: this.data.expressSn,
                expressCode: this.data.express[this.data.expressIndex].code
            }
        }
        fetchApi(this, params).then(res => {
            this.setData({
                showCover: false,
                expressIndex: 0,
                expressSn: "",
            });
            this.getDetail();
        }).catch(res => {
            console.log("error: ", res);
        });
    },
 
    expressSnInput(e) {
        this.setData({
            expressSn: e.detail.value
        });
    },

    showSendExpress() {
        this.setData({
            dialogMode: "express",
            showCover: true,
            expressGetting: true
        })
        this.getShopExpress();
    },

    getCancelCheck() {
        return new Promise((resolve, reject) => {
            let params = {
                url: app.API_HOST + "cardOrder/cancelCheck",
                data: {
                    id: this.data.id
                }
            }
            fetchApi(this, params).then(res => {
                resolve(res.data.data);
                // console.log('getCancelCheck',res.data.data)
            }).catch(res => {
                console.log("error: ", res);
                reject(res);

                
            })
        })
    },
    // 获取textArea值
    bindTextAreaBlur(e) {
        this.setData({
            bindTextAreaValue:e.detail.value
        })
    },
    // 取消订单
    cancelCheck() {

        this.getCancelCheck().then(res => {
            // console.log('取消订单',res)
            
            try {
                switch (parseInt(res)) {
                    case 100:
                        (this.data.selected_products_type == 3 || this.data.is_check_order_cancel == 0 || this.data.status == 0 || this.data.mode === "restaurant") 
                        ? this.refundOrder()
                        : this.setData({
                            isShow: true
                        })
                       
                        break;
                    case 200:
                        this.showCancelCheck("自动退款配置错误，需自行联系消费者，确定取消订单？", true);
                        break;
                    case 300:
                        this.showCancelCheck("未配置自动退款，需自行联系消费者，确定取消订单？", true);
                        break;
                    case 400:
                        this.showCancelCheck("确定取消订单？", true);
                        break;
                    case 500:
                        this.showCancelCheck("不能取消订单", false);
                        break;
                    default:
                        return;
                }
            } catch (err) {
                console.log("error: ", err);
            }
        });
    },

    bindFormSubmit() {
        this.cancelOrder()
        this.setData({
            isShow:false,
        })
    },

    mcl(){
        this.setData({
            isShow:false
        })
    },

    refundOrder() {
        this.setData({
            dialogMode: "cancel",
            showCover: true
        });
    },

    bindRefundPickerChange(e) {
        this.setData({
            refundIndex: parseInt(e.detail.value)
        });
    },

    bindExpressPickerChange(e) {
        this.setData({
            expressIndex: parseInt(e.detail.value)
        });
    },

    bindRefusePickerChange(e) {
        this.setData({
            refuseIndex: parseInt(e.detail.value)
        });
    },

    showCancelCheck(msg, cancelBool = false) {
        const { 
            selected_products_type,
            is_check_order_cancel
        } = this.data
        wx.showModal({
            title: '提示',
            confirmColor: '#ff9b1f',
            content: msg,
            success: (res) => {
                if (res.confirm && cancelBool) {
                    (this.data.selected_products_type == 3 || this.data.is_check_order_cancel == 0 || this.data.status == 0 || this.data.mode === "restaurant")
                    ? this.cancelOrder()
                    : this.setData({
                        isShow: true
                    })
                }
            }
        })
        
    },

    showRefuseAppointment() {
        this.setData({
            showCover: true,
            dialogMode: "refuseAppointment"
        });
    },

    showCancelAppointment() {
        this.setData({
            showCover: true,
            dialogMode: "cancelAppointment"
        });
    },

    confirmGoodsFinished() {
        wx.showModal({
            title: '提示',
            confirmColor: '#ff9b1f',
            content: "确定将订单状态置为已完成？",
            success: (res) => {
                if (res.confirm) {
                    let params = {
                        url: app.API_HOST + "cardOrder/confirmGoodsFinished",
                        data: {
                            id: this.data.id
                        }
                    }
                    fetchApi(this, params).then(res => {
                        this.getDetail();
                    }).catch(res => {
                        console.log("error: ", res);
                    });
                }
            }
        });
    },


    cancelOrderLock: false,
    cancelOrder() {
        if (this.cancelOrderLock) return
        this.cancelOrderLock = true
        let params = {
            url: app.API_HOST + "cardOrder/cancelOrder",
            data: {
                id: this.data.id,
                rsreson:this.data.bindTextAreaValue
            }
        }
        let options = this.data.mode === "restaurant" ? this.data.refundFoodsCauseOptions : this.data.refundCauseOptions
        if (this.data.showCover && this.data.dialogMode === "cancel") params.data.feedback = options[this.data.refundIndex]
        fetchApi(this, params).then(res => {
            this.setData({
                showCover: false,
                refundIndex: 0
            });
            this.cancelOrderLock = false
            this.getDetail();
        }).catch(res => {
            this.cancelOrderLock = false
            console.log("error: ", res)
        })
    },

    startDelivery() {
        wx.showModal({
            title: '提示',
            confirmColor: '#ff9b1f',
            content: "确定将订单状态置为配送中？",
            success: (res) => {
                if (res.confirm) {
                    let params = {
                        url: app.API_HOST + "cardOrder/startDelivery",
                        data: {
                            id: this.data.id
                        }
                    }
                    fetchApi(this, params).then(res => {
                        this.getDetail();
                    }).catch(res => {
                        console.log("error: ", res);
                    });
                }
            }
        })
    },

    finishAppointment() {
        wx.showModal({
            title: '提示',
            confirmColor: '#ff9b1f',
            content: "确定将订单状态置为已完成？",
            success: (res) => {
                if (res.confirm) {
                    let params = {
                        url: app.API_HOST + "cardOrder/finishAppointment",
                        data: {
                            id: this.data.id
                        }
                    }
                    fetchApi(this, params).then(res => {
                        this.getDetail();
                    }).catch(res => {
                        console.log("error: ", res);
                    });
                }
            }
        });
    },

    acceptAppointment() {
        wx.showModal({
            title: '提示',
            confirmColor: '#ff9b1f',
            content: "确定接受该订单？",
            success: (res) => {
                if (res.confirm) {
                    let params = {
                        url: app.API_HOST + "cardOrder/acceptAppointment",
                        data: {
                            ids: this.data.id
                        }
                    }
                    fetchApi(this, params).then(res => {
                        this.getDetail();
                    }).catch(res => {
                        console.log("error: ", res);
                    });
                }
            }
        });
    },

    refuseAppointment() {
        if (this.appointmentRefusing) return;
        this.appointmentRefusing = true;
        let params = {
            url: app.API_HOST + "cardOrder/refuseAppointment",
            data: {
                ids: this.data.id,
                reason: this.data.refuseReason[this.data.refuseIndex]
            }
        }
        fetchApi(this, params).then(res => {
            this.appointmentRefusing = false;
            this.setData({
                showCover: false,
                refuseIndex: 0
            });
            this.getDetail();
        }).catch(res => {
            this.appointmentRefusing = false;
            console.log("error: ", res);
        });
    },

    cancelAppointment() {
        if (this.appointmentRefusing) return;
        this.appointmentRefusing = true;
        let params = {
            url: app.API_HOST + "cardOrder/cancelAppointment",
            data: {
                id: this.data.id,
                reason: this.data.refuseReason[this.data.refuseIndex]
            }
        }
        fetchApi(this, params).then(res => {
            this.appointmentRefusing = false;
            this.setData({
                showCover: false,
                refuseIndex: 0
            });
            this.getDetail();
        }).catch(res => {
            this.appointmentRefusing = false;
            console.log("error: ", res);
        });
    },

    showRefundModelAppointment() {
        this.setData({
            showCover: true,
            dialogMode: "refundAppointment",
            refundCheckGetting: true
        });
        this.refundAppointmentCheck();
    },

    refundAppointmentCheck() {
        let params = {
            url: app.API_HOST + "cardOrder/refundCheck",
            data: {
                id: this.data.id,
            }
        }
        fetchApi(this, params).then(res => {
            try {
                let code = parseInt(res.data.data.code);
                let refundMoney = res.data.data.refundMoney || 0;
                let msg = "";
                switch (code) {
                    case 100:
                        msg = "定金会自动返还至用户账户";
                        break;
                    case 200:
                        msg = "自动退款配置错误，需自行联系消费者完成退款";
                        break;
                    case 300:
                        msg = "未配置自动退款，需自行联系消费者完成退款";
                        break;
                    case 400:
                        msg = "该订单不允许退款"
                        break;
                    default:
                        return;
                }
                this.setData({
                    refundCheckGetting: false,
                    refundCheck: {
                        code: code,
                        msg: msg,
                        refundNumber: parseFloat(refundMoney || 0),
                        refundMoney: refundMoney || 0
                    }
                });
            } catch (res) {
                console.log("error: ", res);
            }

        }).catch(res => {
            console.log("error: ", res);
        });
    },

    refundAppointment() {
        this.closeDialog();
        if (this.refunding) return;
        this.refunding = true;
        let params = {
            url: app.API_HOST + "cardOrder/refundAppointment",
            data: {
                id: this.data.id,
            }
        }
        fetchApi(this, params).then(res => {
            this.refunding = false;
            this.getDetail();
        }).catch(res => {
            this.refunding = false;
            console.log("error: ", res);
        });
            
    },

    showRefundModel() {
        wx.showModal({
            title: '提示',
            confirmColor: '#ff9b1f',
            content: "确认退款？",
            success: (res) => {
                if (res.confirm) { 
                    this.showRefundModelAppointment();
                }
            }
        });
    },

		previewImage(e) {
			previewImage(e)
		},


		approveOrder() {
			wx.showModal({
				title: '提示',
				confirmColor: '#ff9b1f',
				content: "确定审核通过？",
				success: (res) => {
					if (res.confirm) {
						let params = {
							url: app.API_HOST + "ReplaceOrder/orderApproved",
							data: {
								orderId: this.data.data.id,
								openId: this.data.data.openid,
							}
						}
						fetchApi(this, params).then(res => {
							this.getDetail();
						}).catch(res => {
							console.log("error: ", res);
						});
					}
				}
			});
		},

		rejectOrder() {
			wx.showModal({
				title: '提示',
				confirmColor: '#ff9b1f',
				content: "确定审核拒绝？",
				success: (res) => {
					if (res.confirm) {
						let params = {
							url: app.API_HOST + "ReplaceOrder/orderRejection",
							data: {
								orderId: this.data.data.id,
								openId: this.data.data.openid,
							}
						}
						fetchApi(this, params).then(res => {
							this.getDetail();
						}).catch(res => {
							console.log("error: ", res);
						});
					}
				}
			});
		},

    getRootSetting() {
      let param = {
        url: app.API_HOST + 'card/getCardInfo',
        data: {
          cardId: app.globalData.cardId,
        }
      }
      fetchApi(this, param).then(res => {
        // console.log(res.data.data, 'data')
        let data = res.data.data
        this.setData({
          privilege: data.privilege || ''
        })
      })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (!options.id) return;
        this.setData({
            id: options.id,
            mode: options.mode
        });
        this.getRootSetting()
        this.getDetail();
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
        this.getDetail();
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

    }
})