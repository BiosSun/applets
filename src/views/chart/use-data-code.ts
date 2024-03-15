import _ from 'lodash'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import outdent from 'outdent'
import { useDebounce, useMount } from 'react-use'
import { exec } from '@/utils/use-exec'
import useLocalState from '@/utils/use-local-state'

export function useData(defaultDataCode: string) {
    const [code, setCode] = useLocalState<string>('Chart/code', defaultDataCode)
    const [sourceData, setSourceData] = useLocalState<unknown>('Chart/sourceData', undefined)
    const [state, setState] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle')
    const [data, setData] = useState<any>(undefined)
    const [error, setError] = useState<Error | undefined>(undefined)

    useDebounce(() => execCode(code), 500, [sourceData])

    function execCode(code: string) {
        setState('parsing')
        setData(undefined)
        setError(undefined)

        const normalizedCode = code.trim()

        if (!normalizedCode) {
            setState('idle')
            return
        }

        // 确保 sourceData 不会被修改
        const source = window.structuredClone(sourceData)

        try {
            const result = exec({ source, tools: { _, dayjs } }, normalizedCode)
            setState('success')
            setData(result)
        } catch (e) {
            console.error(e)

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

    function reset() {
        setCode(defaultDataCode)
        setSourceData(undefined)
        execCode(defaultDataCode)
    }

    return {
        code,
        setCode,
        execCode: () => execCode(code),
        sourceData,
        setSourceData,
        state,
        data,
        error,
        reset,
    }
}
