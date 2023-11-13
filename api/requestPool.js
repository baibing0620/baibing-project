class RequestPool {
    constructor({
        LOGIN_URL,
        LOGIN_PARAMS = {},
        TOKEN_KEY = 'loginInfo',
        DONT_NEED_TOKEN_URLS = [],
        ERR_CODE_CONFIG = {
            'TOKEN_EXPIRED': -10,
            'SESSION_KEY_EXPIRED': -20,
        },
        loginSuccess = _ => _,
        loginFail = _ => _
    }) {
        this.TOKEN_KEY = TOKEN_KEY
        this.LOGIN_URL = LOGIN_URL
        this.LOGIN_PARAMS = LOGIN_PARAMS
        this.DONT_NEED_TOKEN_URLS = DONT_NEED_TOKEN_URLS
        this.ERR_CODE_CONFIG = ERR_CODE_CONFIG
        this.loginSuccess = loginSuccess
        this.loginFail = loginFail
        this.requestPool = []
        this.token = ''
        this.isLogining = false
        this.isRunning = false
    }

    request = (url, data, method = 'POST') => {
        return new Promise((resolve, reject) => {
            const { SESSION_KEY_EXPIRED, TOKEN_EXPIRED } = this.ERR_CODE_CONFIG
            const initData = {
                url,
                data,
                method,
                success: resolve,
                fail: err => {
                    // 若是 TOKEN 问题导致请求失败，则回收请求
                    const { isLogining,
                        isRunning,
                        run,
                        removeToken,
                        pushRequestIntoPool,
                    } = this
                    if (err && (err.code == SESSION_KEY_EXPIRED || err.code == TOKEN_EXPIRED)) {
                        err.code == TOKEN_EXPIRED && pushRequestIntoPool(new Request(initData))
                        !isLogining && removeToken().then(_ => {
                            !isRunning && run()
                        }).catch(err => {
                            console.log('error: ', err)
                        })
                        return
                    }
                    reject(err)
                }
            }
            this.pushRequestIntoPool(new Request(initData))
        })
    }

    login = _ => {
        return new Promise((resolve, reject) => {
            const loginAPI = wx ? wx.login
                : reject()
            const { LOGIN_URL,
                LOGIN_PARAMS } = this
            loginAPI({
                success: ({ code }) => {
                    // 平台登录成功, 换取token
                    const login = new Request({
                        url: LOGIN_URL,
                        data: {
                            code,
                            ...LOGIN_PARAMS
                        },
                        success: res => {
                            resolve(res)
                        },
                        fail: err => {
                            reject(err)
                        }
                    })
                    login.fetch()
                },
                fail: err => {
                    // 平台登录失败
                    reject(err)
                }
            })
        })
    }

    checkSession = _ => {
        return new Promise((resolve, reject) => {
            wx.checkSession({
                success: _ => {
                    resolve()
                },
                fail: _ => {
                    reject()
                }
            })
        })
    }

    clearPool = _ => {
        this.requestPool = []
    }

    getToken = _ => {
        return new Promise((resolve, reject) => {
            const { TOKEN_KEY, token } = this
            if (token) {
                resolve(token)
                return
            }
            const getStorageAPI = wx ? wx.getStorageSync
                : _ => { }
            try {
                const loginInfo = getStorageAPI(TOKEN_KEY)
                if (loginInfo && loginInfo.token && new Date().getTime() < loginInfo.expired_time) {
                    const checkSession = wx ? wx.checkSession
                        : _ => { }
                    checkSession({
                        success: _ => {
                            this.setToken(loginInfo.token)
                            resolve(loginInfo.token)
                        },
                        fail: _ => {
                            reject()
                        }
                    })
                } else {
                    reject()
                }
            } catch (err) {
                console.log('error: ', err)
                reject(err)
            }
        })
    }

    setToken = token => {
        this.token = token
        !this.isLogining && this.loginSuccess({ token })
        const { TOKEN_KEY } = this
        const setStorageAPI = wx ? wx.setStorage
            : _ => { }
        try {
            setStorageAPI({
                key: TOKEN_KEY,
                data: {
                    token,
                    expired_time: new Date().getTime() + 5 * 24 * 60 * 60 * 1000
                },
                success: _ => {
                    console.log('【token】已更新缓存')
                },
                fail: _ => {
                    console.log('【token】更新缓存失败')
                }
            })
        } catch (_) { }
    }

    removeToken = _ => {
        return new Promise((resolve, reject) => {
            this.token = ''
            const { TOKEN_KEY } = this
            const removeStorageAPI = wx ? wx.removeStorage
                : _ => { }
            removeStorageAPI({
                key: TOKEN_KEY,
                success: res => {
                    resolve(res)
                    console.log('已清除失效缓存 token')
                },
                fail: err => {
                    reject(err)
                    console.log('清除失效缓存 token 失败')
                }
            })
        })
    }

    run = _ => {
        if (this.isRunning) return
        this.isRunning = true
        const {
            requestPool,
            login,
            checkPool,
            getRequestFromPool,
            run,
            setToken,
            clearPool,
            loginFail,
            loginSuccess } = this
        // 检查token状态
        this.getToken().then(token => {
            // 检查请求池
            if (!checkPool()) {
                this.isRunning = false
                return
            }
            const request = getRequestFromPool()
            request.fetch(token)
            this.isRunning = false
            run()
        }).catch(_ => {
            // 没有token，则发起登录
            if (this.isLogining) return
            this.isLogining = true
            login().then(res => {
                const { token } = res.data
                loginSuccess(res.data)
                setToken(token)
                this.isLogining = false
                this.isRunning = false
                run()
            }).catch(err => {
                loginFail(err)
                requestPool.map(i => i.fail())
                clearPool()
                this.isLogining = false
                this.isRunning = false
            })
        })
    }

    checkPool = _ => {
        return this.requestPool.length > 0
    }

    getRequestFromPool = _ => {
        return this.requestPool.shift()
    }

    pushRequestIntoPool = request => {
        this.requestPool.push(request)
        this.run()
    }
}

class Request {
    constructor({
        url,
        data,
        header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method = 'POST',
        success = _ => _,
        fail = _ => _
    }) {
        this.requestAPI = wx ? wx.request : _ => _
        this.url = url
        this.data = data
        this.method = method
        this.header = header
        this.success = success
        this.fail = fail
    }

    fetch = (token = '') => {
        const { url, data, method, header, success, fail } = this
        this.requestAPI({
            url,
            data: {
                token,
                ...data
            },
            method,
            header,
            success: res => {
                const { data } = res
                const { code } = data
                code >= 0 ? success(data) : fail(data)
            },
            fail: err => {
                fail(err)
            }
        })
        return this
    }
}

export default RequestPool