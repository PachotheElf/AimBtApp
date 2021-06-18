import { COUNTER_CHANGE } from '../constants';
export function changeCount(count:number) {
    return {
        type: COUNTER_CHANGE,
        payload: count
    }
}