import { Visual } from '../interface'
import { GraphChart } from './chart'
import { GraphConfigEditor } from './config-editor'
import { Config, Data } from './interface'
import { verifyData } from './verifies'
import { getDefaultConfig, getDefaultDataCode } from './defaults'

const visual: Visual<Config, Data> = {
    name: 'graph',
    verifyData,
    getDefaultConfig,
    defaultDataCode: getDefaultDataCode(),
    ConfigEditor: GraphConfigEditor,
    Chart: GraphChart,
}

export default visual
