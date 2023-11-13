const app = getApp();
import { fetchApi, getGlobalConfig, getCardInfo } from '../../api/api.js';
import { nav, shareParam } from '../../utils/util.js';
import { configMap } from '../../map'
Component({ 
    /**
     * 组件的属性列表
     */
    properties: {
        activity: {
            type:Object,
            value:{}
        },
        showCover:{
            type:Boolean,
            observer(newVal, oldVal, changedPath) {
                newVal && this.setData({
                    palette: this.getpalette()
                })
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        cardInfo:{}
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getpalette(){
            const { type, items, id } = this.properties.activity
            let qrCodeTime = parseInt(new Date().getTime() / 1000 / 60 / 10),
                path = encodeURIComponent(`${configMap[type].path}?id=${id}&${shareParam()}`),
                qrcode = `${app.API_HOST}card/getQRCoedByParameter?path=${path}&beid=${app.globalData.beid}&_t=${qrCodeTime}`
            let _items = items.map(item => item.title).join(',')
            const { name, avatar_url, position} = this.data.cardInfo
            return {
                "width": "750px",
                "height": "1164px",
                "background": "#f8f8f8",
                "views": [
                    {
                        "type": "image",
                        "url": configMap[type].bgUrl,     //背景    
                        "css": {
                            "width": "750px",
                            "height": "1164px",
                            "top": "0px",
                            "left": "0px",
                            "rotate": "0",
                            "borderRadius": "",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "mode": "scaleToFill"
                        }
                    },
                    {
                        "type": "text",
                        "text": `邀请您来玩${configMap[type].title}，快来进来抽豪礼`,
                        "css": {
                            "color": "#000000",
                            "background": "rgba(0,0,0,0)",
                            "width": "600px",
                            "height": "42.89999999999999px",
                            "top": "818.0001174566606px",
                            "left": "50.999990722656946px",
                            "rotate": "0",
                            "borderRadius": "",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "padding": "0px",
                            "fontSize": "30px",
                            "fontWeight": "normal",
                            "maxLines": "2",
                            "lineHeight": "43.290000000000006px",
                            "textStyle": "fill",
                            "textDecoration": "none",
                            "fontFamily": "",
                            "textAlign": "left"
                        }
                    },
                    {
                        "type": "text",
                        "text": `奖品信息：${_items}`,
                        "css": {
                            "color": "#ff0606",
                            "background": "rgba(0,0,0,0)",
                            "width": "650px",
                            "height": "69.57600000000001px",
                            "top": "866px",
                            "left": "54px",
                            "rotate": "0",
                            "borderRadius": "",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "padding": "0px",
                            "fontSize": "24px",
                            "fontWeight": "normal",
                            "maxLines": "2",
                            "lineHeight": "34.632000000000005px",
                            "textStyle": "fill",
                            "textDecoration": "none",
                            "fontFamily": "",
                            "textAlign": "left"
                        }
                    },
                    {
                        "type": "image",
                        "url": qrcode,
                        "css": {
                            "width": "118px",
                            "height": "118px",
                            "top": "964.9999471445026px",
                            "left": "44.0000001627604px",
                            "rotate": "0",
                            "borderRadius": "250px",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "mode": "scaleToFill"
                        }
                    },
                    {
                        "type": "image",
                        "url": `${avatar_url}?imageView2/1/w/118/h/118`,   //头像
                        "css": {
                            "width": "118px",
                            "height": "118px",
                            "top": "967.000405225479px",
                            "left": "193.99999560546908px",
                            "rotate": "0",
                            "borderRadius": "250px",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "mode": "scaleToFill"
                        }
                    },
                    {
                        "type": "text",
                        "text": name,
                        "css": {
                            "color": "#462430",
                            "background": "rgba(0,0,0,0)",
                            "width": "200px",
                            "height": "57.19999999999999px",
                            "top": "1000.9999236531704px",
                            "left": "347px",
                            "rotate": "0",
                            "borderRadius": "",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "padding": "0px",
                            "fontSize": "40px",
                            "fontWeight": "normal",
                            "maxLines": "2",
                            "lineHeight": "57.72000000000001px",
                            "textStyle": "fill",
                            "textDecoration": "none",
                            "fontFamily": "",
                            "textAlign": "left"
                        }
                    },
                    {
                        "type": "text",
                        "text": position,
                        "css": {
                            "color": "#935716",
                            "background": "rgba(0,0,0,0)",
                            "width": "235.99990950521567px",
                            "height": "81.172px",
                            "top": "1007.0001057109946px",
                            "left": "487.9999996744793px",
                            "rotate": "0",
                            "borderRadius": "",
                            "borderWidth": "",
                            "borderColor": "#000000",
                            "shadow": "",
                            "padding": "0px",
                            "fontSize": "28px",
                            "fontWeight": "normal",
                            "maxLines": "1",
                            "lineHeight": "40.40400000000001px",
                            "textStyle": "fill",
                            "textDecoration": "none",
                            "fontFamily": "",
                            "textAlign": "left"
                        }
                    }
                ]
            }
        }
    },
    lifetimes: {
        attached(){
            getCardInfo().then(data=>{
                this.data.cardInfo = data
            })
            
        }
    }
})
