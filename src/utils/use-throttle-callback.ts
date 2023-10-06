import _ from 'lodash'
import { useMemo, useRef } from 'react'

export function useThrottleCallback<T extends Function>(fn: T, wait: number): T {
    const fnRef = useRef(fn)
    fnRef.current = fn
    return useMemo<any>(() => {
        return _.throttle((...args) => fnRef.current?.(...args), wait)
    }, [wait])
}
