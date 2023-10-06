import { Visual } from '../interface'
import { G2Chart } from './chart'
import { G2ConfigEditor } from './config-editor'
import { Config, Data } from './interface'
import { verifyData } from './verify-data'
import { getDefaultConfig, getDefaultDataCode } from './defaults'

const visual: Visual<Config, Data> = {
    name: 'g2',
    verifyData,
    getDefaultConfig,
    defaultDataCode: getDefaultDataCode(),
    ConfigEditor: G2ConfigEditor,
    Chart: G2Chart,
}

export default visual
