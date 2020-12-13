import { useRef, useEffect } from 'react'
import useRefValue from './use-ref-value'

export default function useAnimationFrame(callback: () => void, run: boolean = true) {
    const requestRef = useRef(0)
    const callbackRef = useRefValue(callback)

    useEffect(() => {
        if (run) {
            requestRef.current = requestAnimationFrame(frame)
            return () => cancelAnimationFrame(requestRef.current)
        }
    }, [run])

    function frame() {
        callbackRef.current()

        if (run) {
            requestRef.current = requestAnimationFrame(frame)
        }
    }
}
