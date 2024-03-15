import { useCallback, useReducer, useState } from 'react'

type forceUpdate = () => void

export default function useForceUpdate(): forceUpdate {
    return useReducer((state) => !state, false)[1]
}

export function useForceTrigger(): [number, forceUpdate] {
    const [flag, setFlag] = useState(0)
    const forceUpdate = useCallback(() => {
        setFlag((flag) => flag + 1)
    }, [])
    return [flag, forceUpdate]
}
