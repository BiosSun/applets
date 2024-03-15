import _ from 'lodash'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useDebounce } from 'react-use'
import { exec } from '@/utils/use-exec'
import { useForceTrigger } from '@/utils/use-force-update'

export function useData(code: string = '', defaultDataCode: string, setCode: (code: string) => void) {
    const [codeVersion, applyExecCode] = useForceTrigger()
    const [sourceData, setSourceData] = useState<unknown>(undefined)
    const [state, setState] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle')
    const [data, setData] = useState<any>(undefined)
    const [error, setError] = useState<Error | undefined>(undefined)

    useDebounce(execCode, 100, [codeVersion, sourceData])

    function execCode() {
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
        applyExecCode()
    }

    return {
        code,
        setCode,
        execCode: applyExecCode,
        sourceData,
        setSourceData,
        state,
        data,
        error,
        reset,
    }
}
