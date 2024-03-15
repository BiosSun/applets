import { Visual } from '../interface'
import { HistogramChart } from './chart'
import { GraphConfigEditor } from './config-editor'
import { Config, Data } from './interface'
import { verifyData } from './verifies'
import { getDefaultConfig, getDefaultDataCode } from './defaults'

export const HISTOGRAM_VISUAL: Visual<'histogram', Config, Data> = {
    name: 'histogram',
    verifyData,
    getDefaultConfig,
    defaultDataCode: getDefaultDataCode(),
    ConfigEditor: GraphConfigEditor,
    Chart: HistogramChart,
}

export type { Config as HistogramVisualConfig }
