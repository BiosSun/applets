// import { G2_VISUAL } from './g2'
import { GRAPH_VISUAL, GraphVisualConfig } from './graph'
import { PIE_VISUAL, PieVisualConfig } from './pie'
import { HISTOGRAM_VISUAL, HistogramVisualConfig } from './histogram'

export type VisualName =
    | typeof GRAPH_VISUAL.name
    | typeof PIE_VISUAL.name
    | typeof HISTOGRAM_VISUAL.name

export type VisualConfig = GraphVisualConfig | PieVisualConfig | HistogramVisualConfig

export interface VisualsState {
    name: VisualName
    configs: {
        [GRAPH_VISUAL.name]: GraphVisualConfig
        [PIE_VISUAL.name]: PieVisualConfig
        [HISTOGRAM_VISUAL.name]: HistogramVisualConfig
    }
}

export const VISUALS = {
    [GRAPH_VISUAL.name]: GRAPH_VISUAL,
    [PIE_VISUAL.name]: PIE_VISUAL,
    [HISTOGRAM_VISUAL.name]: HISTOGRAM_VISUAL,
    // [G2_VISUAL.name]: G2_VISUAL,
    // TODO Table
} as const

export const VISUAL_NAMES = Object.keys(VISUALS) as VisualName[]

export const DEFAULT_VISUALS_STATE: VisualsState = {
    name: GRAPH_VISUAL.name,
    configs: {
        [GRAPH_VISUAL.name]: GRAPH_VISUAL.getDefaultConfig(),
        [PIE_VISUAL.name]: PIE_VISUAL.getDefaultConfig(),
        [HISTOGRAM_VISUAL.name]: HISTOGRAM_VISUAL.getDefaultConfig(),
    },
}
