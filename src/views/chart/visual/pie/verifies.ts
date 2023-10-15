import { Config, Data } from './interface'

export function verifyData(data: any): data is Data {
    return true
}

export function verifyConfig(config: any): config is Config {
    return true
}
