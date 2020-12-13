import produce, { Draft } from 'immer'
import { useMemo, useRef } from 'react'
import useRefValue from './use-ref-value'

type StateSetter<T> = (newValue: T) => void

interface ActionsConstructor<T> {
    new (): T
}

export function useActions<T, K extends object>(
    value: T,
    setValue: StateSetter<T>,
    Actions: K | ActionsConstructor<K>,
): K {
    const ActionsRef = useRefValue<K | ActionsConstructor<K>>(Actions)
    const valueRef = useRefValue<T>(value)
    const draftRef = useRef<Draft<T>>(undefined)
    const actionsRef = useRef<K>(undefined)

    const proxy = useMemo(() => {
        function call(method: string, args: any[]) {
            return actionsRef.current[method].apply(proxy, args)
        }

        function generateActions(): K {
            const Actions = ActionsRef.current
            return typeof Actions === 'object' ? Actions : new Actions()
        }

        function get(target: any, property: string) {
            switch (property) {
                case 'data':
                    return draftRef.current
                default:
                    return function action(...args: any[]) {
                        if (!draftRef.current) {
                            let result = undefined

                            setValue(
                                produce(valueRef.current, (draft) => {
                                    draftRef.current = draft
                                    actionsRef.current = generateActions()

                                    result = call(property, args)

                                    if (draft !== draftRef.current) {
                                        return draftRef.current
                                    }
                                }) as T,
                            )

                            draftRef.current = undefined
                            actionsRef.current = undefined

                            return result
                        } else {
                            return call(property, args)
                        }
                    }
            }
        }

        function set(target: any, property: string | number | symbol, value: any) {
            switch (property) {
                case 'data':
                    if (draftRef.current) {
                        draftRef.current = value as Draft<T>
                        return true
                    } else {
                        console.error('[useActions] You can only set value to `data` property in a action method.') // prettier-ignore
                        return false
                    }
                default:
                    console.error('[useActions] do not set value for any properties, except for the `data` property.') // prettier-ignore
                    return false
            }
        }

        return new Proxy<K>({} as K, { get, set })
    }, [])

    return proxy
}
