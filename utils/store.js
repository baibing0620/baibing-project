/**
 *  target: { 
 *      val: {
 *          value: Any,
 *          AfterChange: (newVal, oldVal) => _
 *      }
 *  }
 */

export default (target) => {
    return new Proxy(target, {
        set: (target, property, value) => {
            const oldVal = getValue(target, property)
            setValue(target, property, value)
            const callback = target[property].AfterChange
            callback && callback(value, oldVal)
            return true
        },

        get: (target, property) => {
            return getValue(target, property)
        }
    })
}

const getValue = (target, property) => {
    const result = target[property]
    return result && typeof result.Value !== 'undefined' ? result.Value : result
}

const setValue = (target, property, value) => {
    const result = target[property]
    result && typeof result.Value !== 'undefined' ? target[property].Value = value : target[property] = value
}

