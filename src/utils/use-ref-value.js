import { useRef, useEffect } from 'react'

export default function useRefValue(value) {
    const ref = useRef()

    useEffect(() => {
        ref.current = value
    })

    return ref
}
