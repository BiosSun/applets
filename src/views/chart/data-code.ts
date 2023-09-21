import { useEffect, useState } from 'react'
import outdent from 'outdent'
import { useDebounce, useMount } from 'react-use'

const DEFAULT_DATA_CODE = outdent`
    // return [
    //     { x: 'Sports', y: 275 },
    //     { x: 'Strategy', y: 115 },
    //     { x: 'Action', y: 120 },
    //     { x: 'Shooter', y: 350 },
    //     { x: 'Other', y: 150 },
    // ]

    function random(length) {
        return Math.random().toFixed(length).substring(2);
    }

    const data = []

    for (let i = 0; i < 100; i++) {
        const val = random(8);

        data.push({
            x: 'item-' + val,
            y: parseInt(val, 10),
        });
    }

    return data;
`

export function useDataCode() {
    const [code, setCode] = useState<string>(DEFAULT_DATA_CODE)
    const [state, setState] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle')
    const [data, setData] = useState<any>(undefined)
    const [error, setError] = useState<Error | undefined>(undefined)

    // WAIT 组件刚渲染时，应当调用一次
    useDebounce(parseCode, 500, [code])

    function parseCode() {
        setState('parsing')
        setData(undefined)
        setError(undefined)

        const normalizedCode = code.trim()

        if (!normalizedCode) {
            setState('idle')
            return
        }

        try {
            // WAIT 安全
            const result = window.eval(`
                (function sandbox() {
                    ${normalizedCode}
                })()
            `)

            setState('success')
            setData(result)
        } catch (e) {
            let error: Error

            if (e instanceof Error) {
                error = e
            } else if (typeof e === 'string') {
                error = new Error(e)
            } else {
                error = new Error('代码解析失败')
            }

            setState('error')
            setError(error)
        }
    }

    return {
        code,
        setCode,
        state,
        data,
        error,
    }
}
