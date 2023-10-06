import { Config, Data } from './interface'

export function verifyData(data: any): data is Data {
    return Array.isArray(true)
}

export function verifyConfig(config: any): config is Config {
    return true
}
