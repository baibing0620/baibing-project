import { checkAvatar, getEffectiveCardId } from '../../api/api'
import { subscribe, disSubscribe } from '../../utils/publisher'
import { nav } from '../../utils/util'

const app = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        backgroundColor: {
            type: String,
            value: '#FFFFFF'
        },
        color: String,
        title: {
            type: String,
            value: ''
        },
        center: Boolean,
        float: Boolean,
        personalCenter: Boolean,
        cardList: Boolean
    },

    /**
     * 组件的初始数据
     */
    data: {
        menuButtonClientRect: {},
        hasAuthored: false,
        home: '/pages/home/home',   // TODO 自定义主页
        isCloseCardList: true,
        userProfileAble: app.globalData.userProfileAble
    },

    /**
     * 组件的方法列表
     */
    methods: {
        navBack() {
            wx.navigateBack()
        },

        navToHome() {
            const { home: url } = this.data
            nav({ url })
        },

        getPageType() {
            const currentPages = getCurrentPages()
            const current = currentPages[currentPages.length - 1]
            const { home } = this.data
            const config = [
                { type: 'home', rule: _ => ~_.indexOf(home.replace('/', '')) },
                { type: 'tabbar', rule: _ => ~app.tabBarPath.findIndex(e => ~_.indexOf(e.replace('/', ''))) },
                { type: 'fromShare', rule: _ => currentPages.length <= 1 },
                { type: 'default', rule: _ => _ }
            ]
            const { type } = config.find(_ => _.rule(current.route))
            return type
        },

        getUserInfo(e) {
            this.triggerEvent('getUserInfo', e.detail)
        },
        getUserProfile(e) {
            getUserProfile().then(res => {
                nav({
                    url: '/pages/personal/personal'
                })
            }).catch(err => {
                
            })
        },
        navigate(e) {
            const { url } = e.currentTarget.dataset
            nav({ url })
        },

        reLaunch(e) {
            const { url } = e.currentTarget.dataset
            wx.reLaunch({ url })
        }
    },

    lifetimes: {
        attached() {
            this.setData({
                pageType: this.getPageType()
            })
            // TODO 名片列表开关
            getEffectiveCardId().then(e => {
                this.setData({
                    isCloseCardList: Boolean(e.is_open_cardlist)
                })
            })

            subscribe('menuButtonClientRect', val => {
                this.setData({
                    menuButtonClientRect: val,
                })
            }, `navigateBar_${this['__wxExparserNodeId__']}`)

            subscribe('userInfo', val => {
                const { avatar } = val
                this.setData({
                    hasAuthored: checkAvatar(avatar),
                })
            }, `navigateBar_${this['__wxExparserNodeId__']}`)
        },

        detached() {
            disSubscribe(`navigateBar_${this['__wxExparserNodeId__']}`)
        }
    }
})
