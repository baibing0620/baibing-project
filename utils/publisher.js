const subscribers = {}
const content = {}

const publish = (key, newVal, oldVal) => {
    content[key] = newVal
    subscribers[key] = (subscribers[key] || []).filter(_ => typeof _ === 'function').map(element => (element(newVal, oldVal), element))
}

const subscribe = (key, handle = _ => _, customId) => {
    if (customId) handle._customId = customId
    const subscriberOfKey = subscribers[key] || []
    subscribers[key] = (customId ? subscriberOfKey.filter(e => e._customId !== customId) : subscriberOfKey).concat(handle)
    const value = content[key]
    value !== undefined && handle(value)
    return value
}

const disSubscribe = customId => {
    for(let key in subscribers) {
        const handles = subscribers[key] || []
        const index = handles.findIndex(func => func._customId && func._customId === customId)
        ~index && handles.splice(index, 1)
    } 
}

export {
    publish,
    subscribe,
    disSubscribe
}