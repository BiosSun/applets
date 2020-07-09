import { useState, useMemo, useRef, useEffect } from 'react'
import localforage from 'localforage'
import { useUpdateEffect } from 'react-use'

const createPromiseResolver = () => {
    let resolve
    const promise = new Promise((r) => {
        resolve = r
    })
    return { resolve, promise }
}

/**
 * 同 setState，但所设置的值会存储到本地，当再次访问该 state 时，使时会加载之间存储的值。
 *
 * @param {string} key 用于标识状态的 key，应用内全局唯一
 * @param {Array|ArrayBuffer|Blob|Float32Array|Float64Array|Int8Array|Int16Array|Int32Array|Number|Object|Uint8Array|Uint8ClampedArray|Uint16Array|Uint32Array|String} defaultValue 默认值，在加载到本地存储的值之前，将使用该默认值
 * @param {function} serialize 序列化，若调用 setStat 时传入的值不是所支持的类型，那么需要提供一个序列化方法用于将值转换成某个支持的类型
 * @param {*} deserialize 反序列化，serialize 的反向操作
 */
export default function useLocalState(key, defaultValue = null, serialize, deserialize) {
    const serializeRef = useRef()

    useEffect(() => {
        serializeRef.current = serialize
    })

    const deserializeRef = useRef()

    useEffect(() => {
        deserializeRef.current = deserialize
    })

    const defaultValueRef = useRef()

    useEffect(() => {
        defaultValueRef.current = defaultValue
    })

    const [state, setState] = useState(
        !deserialize ? defaultValue : deserialize.bind(null, defaultValue),
    )

    const setFlagRef = useRef(false)

    useUpdateEffect(() => {
        throw new Error("useLocalState key can't change.")
    }, [key])

    const setRef = useRef((value) => {
        setFlagRef.current = true
        setState(value)

        if (serializeRef.current) {
            value = serializeRef.current(value)
        }

        localforage.setItem(key, value)
    })

    const promiseResolver = useMemo(createPromiseResolver, [])

    useEffect(() => {
        let didUnmount = false

        localforage
            .getItem(key)
            .catch((err) => {
                if (!didUnmount) {
                    console.error(`useLocalForage get value failed by key ${key}. error info:`, err)
                }

                return null
            })
            .then((value) => {
                if (!setFlagRef.current && !didUnmount) {
                    value = value ?? defaultValueRef.current

                    if (deserializeRef.current) {
                        value = deserializeRef.current(value)
                    }

                    setState(value)
                }
            })
            .finally(() => {
                promiseResolver.resolve()
            })

        return () => {
            didUnmount = true
        }
    }, [])

    return [state, setRef.current]
}
