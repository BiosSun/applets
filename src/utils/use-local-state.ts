import { useLayoutEffect, useRef } from 'react'
import localforage from 'localforage'
import useForceUpdate from './use-force-update'

const localStates = new Map()
const updates = new Map<string, Promise<void>>()

type Serialize<T> = (value: T) => any
type Deserialize<T> = (innerValue: any) => T
type StateSetter<T> = (newValue: T) => void

const noop = () => {}

class LocalState<T> {
    key: string
    value: T | null = null
    defaultValue: T | null = null
    serialize: Serialize<T> | null = null
    deserialize: Deserialize<T> | null = null
    forceUpdateComponent: () => void = noop

    initPromise: any

    constructor(key: string) {
        this.key = key
        this.init()

        this.set = this.set.bind(this)
    }

    init() {
        const updatePromise = updates.get(this.key)

        this.initPromise = (updatePromise || Promise.resolve())
            .then(() => localforage.getItem(this.key))
            .catch((err) => {
                console.error(
                    `useLocalForage get value failed by key ${this.key}. error info:`,
                    err,
                )
                return null
            })
            .then((value) => {
                value = value ?? this._getDefaultValue()

                if (this.deserialize) {
                    value = this.deserialize(value)
                }

                this.value = value as T
            })
            .finally(() => (this.initPromise = undefined))
    }

    // TODO 处理 updateLocalState
    get() {
        if (this.initPromise) {
            // NOTE 让 react 等待状态初始化完成后，再重新渲染相关组件
            throw this.initPromise
        } else {
            return this.value
        }
    }

    // TODO 处理 updateLocalState
    set(value: T) {
        if (value === this.value) {
            return
        }

        this.value = value
        localforage.setItem(this.key, this.serialize ? this.serialize(value) : value)

        this.forceUpdateComponent()
    }

    _getDefaultValue() {
        const { defaultValue } = this
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue
    }
}

let count = 1

/**
 * 同 setState，但所设置的值会存储到本地，当再次访问该 state 时，使时会加载之间存储的值。
 *
 * @param {string} key 用于标识状态的 key，应用内全局唯一
 * @param {LocalForageValue} defaultValue 默认值，在加载到本地存储的值之前，将使用该默认值
 * @param {function} serialize 序列化，若调用 setStat 时传入的值不是所支持的类型，那么需要提供一个序列化方法用于将值转换成某个支持的类型
 * @param {*} deserialize 反序列化，serialize 的反向操作
 */
export default function useLocalState<T>(
    key: string,
    defaultValue: T | null = null,
    serialize: Serialize<T> | null = null,
    deserialize: Deserialize<T> | null = null,
): [T, StateSetter<T>] {
    const idRef = useRef(count++)

    if (!localStates.has(key)) {
        localStates.set(key, new LocalState(key))
    }

    const state = localStates.get(key)

    state.defaultValue = defaultValue
    state.serialize = serialize
    state.deserialize = deserialize
    state.forceUpdateComponent = useForceUpdate()

    useLayoutEffect(() => {
        if (state.__bindedId && state.__bindedId !== idRef.current) {
            throw new Error(`Duplicate key "${key}"`)
        }

        state.__bindedId = idRef.current

        return () => {
            localStates.delete(key)
        }
    }, [key, state])

    return [state.get(), state.set]
}

export function updateLocalState<T>(key: string, update: (value: T) => T | undefined | null) {
    async function exec() {
        const value = (await localforage.getItem(key)) as T
        if (value != null) {
            const newValue = update(value)

            if (newValue !== value) {
                await localforage.setItem(key, newValue)
            }
        }
    }

    const prevPromise = updates.get(key)
    const promise = prevPromise ? prevPromise.then(exec) : exec()

    promise.finally(() => {
        if (updates.get(key) === promise) {
            updates.delete(key)
        }
    })

    updates.set(key, promise)
}
