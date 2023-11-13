export const request = (params) => {
    const {
        url,
        data,
        method = "GET"
    } = params
    // 返回一个promise对象
    return new Promise((resolve, reject) => {
        wx.request({
            url: url, //仅为示例，并非真实的接口地址
            data: data,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: method,
            success: (res) => {
                // 请求成功，就将成功的数据返回出去
                const {
                    data = {}
                } = res
                resolve(data)
            },
            fail: (err) => {
                reject(err)
            },
        })
    })
}