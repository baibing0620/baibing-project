const app = getApp()

export function cardShare(cardInfo) {
    const { avatarUrl, mobile, wechat, company, position, name } = cardInfo
    return {
        "width": "700px",
        "height": "926px",
        "background": "#fff",
        "views": [
            {
                "type": "image",
                "url": "https://facing-1256908372.file.myqcloud.com//image/20200323/fc96f8b7f22220b7.jpg",
                "css": {
                    "width": "700px",
                    "height": "926px",
                    "top": "0px",
                    "left": "0px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#ff9b1f",
                    "shadow": "",
                    "mode": "scaleToFill"
                }
            },
            {
                "type": "image",
                "url": avatarUrl,
                "css": {
                    "width": "200px",
                    "height": "200px",
                    "top": "102.38px",
                    "left": "450px",
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
                "text": name,
                "css": {
                    "color": "#404040",
                    "background": "rgba(0,0,0,0)",
                    "width": "385px",
                    "height": "51.480000000000004px",
                    "top": "98.5px",
                    "left": "53.69999999999999px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#C87756",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "36px",
                    "fontWeight": "bold",
                    "maxLines": "1",
                    "lineHeight": "51.94800000000001px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "webfontzk",
                    "textAlign": "left"
                }
            },
            {
                "type": "text",
                "text": position,
                "css": {
                    "color": "#fd9a33",
                    "background": "rgba(0,0,0,0)",
                    "width": "400px",
                    "height": "37.18000000000001px",
                    "top": "164.41px",
                    "left": "52.849999999999994px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "26px",
                    "fontWeight": "normal",
                    "maxLines": "1",
                    "lineHeight": "37.51800000000001px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "",
                    "textAlign": "left"
                }
            },
            {
                "type": "text",
                "text": company || '--',
                "css": {
                    "color": "#666666",
                    "background": "rgba(0,0,0,0)",
                    "width": "536px",
                    "height": "42.839999999999996px",
                    "top": "353.12px",
                    "left": "97.51999999999998px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "28px",
                    "fontWeight": "normal",
                    "maxLines": "6",
                    "lineHeight": "43.512px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "",
                    "textAlign": "left"
                }
            },
            {
                "type": "text",
                "text": "微信扫一扫或长按识别小程序",
                "css": {
                    "color": "#999999",
                    "background": "rgba(0,0,0,0)",
                    "width": "489px",
                    "height": "31.459999999999997px",
                    "top": "740px",
                    "left": "199.39999999999998px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "22px",
                    "fontWeight": "normal",
                    "maxLines": "2",
                    "lineHeight": "31.746000000000006px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "",
                    "textAlign": "left"
                }
            },
            {
                "type": "text",
                "text": mobile || '--',
                "css": {
                    "color": "#666666",
                    "background": "rgba(0,0,0,0)",
                    "width": "333px",
                    "height": "42.89999999999999px",
                    "top": "224px",
                    "left": "92.68px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "30px",
                    "fontWeight": "normal",
                    "maxLines": "1",
                    "lineHeight": "43.290000000000006px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "",
                    "textAlign": "left"
                }
            },
            {
                "type": "text",
                "text": wechat || '--',
                "css": {
                    "color": "#666666",
                    "background": "rgba(0,0,0,0)",
                    "width": "346px",
                    "height": "42.89999999999999px",
                    "top": "285px",
                    "left": "95.67000000000002px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "padding": "0px",
                    "fontSize": "30px",
                    "fontWeight": "normal",
                    "maxLines": "1",
                    "lineHeight": "43.290000000000006px",
                    "textStyle": "fill",
                    "textDecoration": "none",
                    "fontFamily": "",
                    "textAlign": "left"
                }
            },
            {
                "type": "image",
                "url": "https://facing-1256908372.file.myqcloud.com//image/20200323/3b1dcbea17431628.png",  //微信
                "css": {
                    "width": "28px",
                    "height": "24px",
                    "top": "292px",
                    "left": "48.18px",
                    "rotate": "6.14",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "mode": "scaleToFill"
                }
            },
            {
                "type": "image",
                "url": "https://facing-1256908372.file.myqcloud.com//image/20200323/bf615f441fce7c5c.png", //手机号
                "css": {
                    "width": "18px",
                    "height": "26px",
                    "top": "230px",
                    "left": "54.99px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "mode": "scaleToFill"
                }
            },
            {
                "type": "image",
                "url": "https://facing-1256908372.file.myqcloud.com//image/20200323/ee96705ee0f1ea69.png",  //职位
                "css": {
                    "width": "24px",
                    "height": "26px",
                    "top": "356.53px",
                    "left": "54.97999999999999px",
                    "rotate": "0",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "mode": "scaleToFill"
                }
            },
            {
                "type": "image",
                "url": `${app.API_HOST}card/genQRCode/beid/${app.globalData.beid}/cardId/${app.globalData.cardId}/token/${app.globalData.token}`,
                "css": {
                    "width": "200px",
                    "height": "200px",
                    "top": "500px",
                    "left": "241.04999991280692px",
                    "rotate": "0.4472326507772311",
                    "borderRadius": "",
                    "borderWidth": "",
                    "borderColor": "#000000",
                    "shadow": "",
                    "mode": "scaleToFill"
                }
            }
        ]
    }
}