import { subscribe } from './publisher'
import { getCardInfo } from '../api/api'

export default _ => {
    subscribe('cardId', val => {
        val && getCardInfo()
    })
}