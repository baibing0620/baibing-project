// components/steps/steps.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        chooseIndex: {
            type: String,
            value: "0"
        },
        completeIndex: {
            type: String,
            value: "-1"
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        stepsData: [1, 2, 3, 4, 5],
    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
