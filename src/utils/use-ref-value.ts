import { useRef, useEffect } from 'react'

export default function useRefValue<T>(value: T) {
    const ref = useRef<T>()

    useEffect(() => {
        ref.current = value
    })

    return ref
}
