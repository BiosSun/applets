import { Visual } from '../interface'
import { PieChart } from './chart'
import { PieConfigEditor } from './config-editor'
import { Config, Data } from './interface'
import { verifyData } from './verifies'
import { getDefaultConfig, getDefaultDataCode } from './defaults'

export const PIE_VISUAL: Visual<'pie', Config, Data> = {
    name: 'pie',
    verifyData,
    getDefaultConfig,
    defaultDataCode: getDefaultDataCode(),
    ConfigEditor: PieConfigEditor,
    Chart: PieChart,
}

export type { Config as PieVisualConfig }
