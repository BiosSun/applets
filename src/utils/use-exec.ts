import { useMemo } from 'react'

type ExecResult = [unknown, unknown]

export function useExec<T>(params: { [name: string]: unknown }, body: string): ExecResult {
    const result = useMemo<ExecResult>(() => {
        try {
            return [exec(params, body), undefined]
        } catch (error) {
            return [undefined, error]
        }
    }, [params, body])

    return result
}

export function exec<T = unknown>(params: { [name: string]: unknown }, body: string): T {
    // 形参
    const paramNames = Object.keys(params)
    // 实参
    const paramValues = Object.values(params)

    // WAIT 安全
    const fun = new Function(...paramNames, body.trim())
    const result = fun(...paramValues)

    return result
}
