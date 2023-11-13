export const linkPage = [
    'goodsdetail',
    'goodsList',
    'personal',
    'myCart',
    'flashSaleList',
    'myCoupon',
    'brandList',
    'groupBuyGoodsList',
    'bargainGoodsList',
    'orderList',
    'receiveAllCoupon',
    'reservation',
    'consult',
    'myReservation',
    'DIYPage',
    'webView',
    'distribution',
    'mall',
    'searchPage',
    'membershipCard',
    'marketSlotMachine',
    'marketFruitMachine',
    'marketWheel',
    'marketShake',
    'marketScratch',
    'marketEgg',
    'news',
    'contentDetail',
    'takeAwayMenu',
    'queueMenu',
    'menuOrderList',
    'myConsult',
    'forumHome',
    'foodsDetail',
    'integralMall',
    'payment',
    'takeANumber',
    'couponDetail',
    'categoryShop',
    'ticketAssistant',
    'branchList',
    "reservationServiceList",
    "myAppointment",
    "serviceCommodityDetail",
    'serviceCommodityRecommend'
]

export const linkFunction = {
    locNav: 'openLocation', //'导航前往',
    // hotline: 'makePhoneCall', //拨打电话
    address: 'chooseAddress', //打开地址管理
    miniProgram: 'navigateToMiniProgram',
    share: 'showShare',
    call: 'callPhone',
    scanMenu: 'showChooseScan',
    wifi: 'connectWifi',
    scanCode: 'scanCode',
    liveRoom: 'navLiveRoom',
    appView: 'navAppView' 
}
export const needParam = [
    'goodsdetail',
    'goodsList',
    'locNav',
    'call',
    'miniProgram',
    'DIYPage',
    'webView',
    'marketSlotMachine',
    'marketFruitMachine',
    'marketWheel',
    'marketShake',
    'marketScratch',
    'marketEgg',
    'contentDetail',
    'foodsDetail',
    'wifi',
    'couponDetail',
    'categoryShop'
];
export const cityExpress = ['__dada', '__fengniao', '__self_delivery'];
export const eventType = {
    wechat: '2',
    email: '3',
    company: '4',
    address: '5',
    phone: '6'


};
export const configMap = {
    1: {
        'title': '大转盘',
        'bgUrl': 'https://facing-1256908372.file.myqcloud.com//image/20200331/5fe2e2ec63729dd7.png',
        'path': 'pages/marketWheel/marketWheel'
    },
    2: {
        'title': '刮刮乐',
        'bgUrl': 'https://facing-1256908372.file.myqcloud.com//image/20200331/d770be16876f2c86.png',
        'path': 'pages/marketScratch/marketScratch',
    },
    3: {
        'title': '老虎机',
        'bgUrl': 'https://facing-1256908372.file.myqcloud.com//image/20200331/1e0ec18967c2e953.png',
        'path': 'pages/marketSlotMachine/marketSlotMachine',
    },
    4: {
        'title': '摇一摇',
        'bgUrl': 'https://facing-1256908372.file.myqcloud.com//image/20200331/b1a406b4a124cd63.png',
        'path': 'pages/marketShake/marketShake'
    },
    5: {
        'title': '跑马灯',
        'bgUrl': 'https://facing-1256908372.file.myqcloud.com//image/20200331/713d7df608ab02a2.png',
        'path': 'pages/marketFruitMachine/marketFruitMachine'
    },
    6: {
        'title': '砸金蛋',
        'bgUrl': 'https://facing-1256908372.file.myqcloud.com//image/20200331/b28d5fd80b7d0f59.png',
        'path': 'pages/marketEgg/marketEgg',
    },
};


export const blessBagTask = {
    1: '打开名片',
    2: '复制微信号',
    3: '复制邮箱账号',
    4: '复制公司名称',
    5: '复制公司地址',
    6: '拨打电话',
    7: '分享名片',
    8: '存入手机通讯录',
    9: '名片点赞',
    10: '播放语音',
    11: '标签点赞',
    12: '留言聊天',
    13: '用户搜索商品',
    14: '商品分享',
    15: '查看商城版块',
    16: '查看商品',
    17: '购买商品',
    18: '查看资讯版块',
    19: '查看资讯文章',
    20: '分享资讯文章',
    21: '点赞资讯文章',
    22: '查看官网页面',
    23: '绑定手机号',
}

export const messagePath = {
    1: {
        0: '名片',
        1: '名片首页',
        2: ''
    },
    2: {
        0: '官网',
        1: '官网首页',
        2: 'pages/index/index'
    },
    3: {
        0: '资讯',
        1: '资讯列表',
        2: 'pages/contentDetail/contentDetail'
    },
    4: {
        0: '商城',
        1: '商品列表',
        2: 'pages/goodsdetail/goodsdetail'
    },
    5: {
        0: '动态',
        1: '',
        2: ''
    },
    6: {
        0: '外卖',
        1: '',
        2: ''
    },
    7: {
        0: '预约',
        1: '',
        2: ''
    }
}

export const marketingActivitiesType=[
    'marketShake',
    'marketWheel', 
    'marketScratch', 
    'marketSlotMachine', 
    'marketFruitMachine', 
    'marketEgg'
]

export const couponBoxHide = [
    'pages/cardList/cardList',
    'pages/marketWheel/marketWheel',
    "pages/marketWheel/marketWheel",
    "pages/marketEgg/marketEgg",
    "pages/marketScratch/marketScratch",
    "pages/marketFruitMachine/marketFruitMachine",
    "pages/marketShake/marketShake",
    "pages/marketSlotMachine/marketSlotMachine",
    "pages/confirmOrder/confirmOrder",
]

export const personalIcons = [
    {
        name: 'myBargain',
        value: 'icon-cutOrder'
    },
    {
        name: 'groupBuy',
        value: 'icon-groupbuy'
    },
    {
        name: 'myCourse',
        value: 'icon-kecheng'
    },
    {
        name: 'address',
        value: 'icon-address'
    },
    {
        name: 'shopOrder',
        value: 'icon-order2'
    },
    {
        name: 'o2oOrder',
        value: 'icon-o2oOrder'
    },
    {
        name: 'wallet',
        value: 'icon-mywallet'
    },
    {
        name: 'distribution',
        value: 'icon-distruction'
    },
    {
        name: 'myCoupon',
        value: 'icon-coupon2'
    },
    {
        name: 'winningRecord',
        value: 'icon-marketGifts'
    },
    {
        name: 'predeterminedList',
        value: 'icon-appointment'
    },
    {
        name: 'album',
        value: 'icon-photo'
    },
    {
        name: 'winningRecord',
        value: 'icon-marketGifts'
    },

]

export const bank = [
    '中国农业银行',
    '中国工商银行',
    '中国建设银行',
    '中国邮政储蓄银行',
    '中国银行',
    '交通银行',
    '中信银行',
    '中国光大银行',
    '中国农业发展银行',
    '中国民生银行',
    '中国进出口银行',
    '华夏银行',
    '广发银行',
    '中国银行（香港）',
    '国家开发银行',
    '上海农商银行',
    '上海农村商业银行',
    '上海商业银行',
    '上海浦东发展银行',
    '其他农村信用合作社',
    '其他农村商业银行',
    '其他城市商业银行',
    '农村信用合作联社',
    '农村合作银行',
    '农村商业银行',
    '东亚银行',
    '东方汇理银行',
    '企业银行',
    '兴业银行',
    '创兴银行',
    '华一银行',
    '华侨银行',
    '华南商业银行',
    '华商银行',
    '华美银行',
    '南洋商业银行',
    '厦门国际银行',
    '友利银行',
    '台湾土地银行',
    '国民银行',
    '国泰世华商业银行',
    '城市信用社',
    '城市商业银行',
    '平安银行',
    '平安银行股份有限公司',
    '广东发展银行',
    '彰化商业银行',
    '徽商银行',
    '恒丰银行',
    '恒生银行',
    '永亨银行',
    '永隆银行',
    '汇丰银行',
    '浙商银行',
    '渤海银行',
    '瑞士银行',
    '花旗银行',
    '首都银行'
]

export const vipIcon = [
    {
        name: 'sevenDay',
        value: 'icon-sevenDay'
    },
    {
        name: 'fifteenDay',
        value: 'icon-fifthDay',
    },
    {
        name: 'dianpu',
        value: 'icon-dianpu',
    },
    {
        name: 'distribution',
        value: 'icon-distribution',
    },
    {
        name: 'redPackage',
        value: 'icon-redPackage',
    },
    {
        name: 'vipUse',
        value: 'icon-vipUse',
    },
    {
        name: 'actNotice',
        value: 'icon-actNotice',
    },
    {
        name: 'signIn',
        value: 'icon-signIn',
    },
    {
        name: 'quanqiugou',
        value: 'icon-quanqiugou',
    },
    {
        name: 'quickBack',
        value: 'icon-quickBack',
    },
    {
        name: 'backChange',
        value: 'icon-backChange',
    },
    {
        name: 'wuliu',
        value: 'icon-wuliu'
    },
    {
        name: 'back',
        value: 'icon-back',
    },
    {
        name: 'repair',
        value: 'icon-repair',
    },
    {
        name: 'flower',
        value: 'icon-flower',
    },
    {
        name: 'star',
        value: 'icon-star',
    },
    {
        name: 'zhekou',
        value: 'icon-zhekou',
    },
    {
        name: 'onlyCard',
        value: 'icon-onlyCard',
    },
    {
        name: 'credit',
        value: 'icon-credit',
    },
    {
        name: 'kefu',
        value: 'icon-kefuNew',
    },
    {
        name: 'xiaofeizhekou',
        value: 'icon-xiaofeizhekou'
    }
]