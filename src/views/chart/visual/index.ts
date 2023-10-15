import { G2_VISUAL } from './g2'
import { GRAPH_VISUAL, GraphVisualConfig } from './graph'
import { PIE_VISUAL, PieVisualConfig } from './pie'

export type VisualName = typeof GRAPH_VISUAL.name | typeof PIE_VISUAL.name

export type VisualConfig = GraphVisualConfig | PieVisualConfig

export interface VisualsState {
    name: VisualName
    configs: {
        [GRAPH_VISUAL.name]: GraphVisualConfig
        [PIE_VISUAL.name]: PieVisualConfig
    }
}

export const VISUALS = {
    [GRAPH_VISUAL.name]: GRAPH_VISUAL,
    [PIE_VISUAL.name]: PIE_VISUAL,
    // [G2_VISUAL.name]: G2_VISUAL,
    // TODO Table
} as const

export const VISUAL_NAMES = Object.keys(VISUALS) as VisualName[]

export const DEFAULT_VISUALS_STATE: VisualsState = {
    name: GRAPH_VISUAL.name,
    configs: {
        [GRAPH_VISUAL.name]: GRAPH_VISUAL.getDefaultConfig(),
        [PIE_VISUAL.name]: PIE_VISUAL.getDefaultConfig(),
    },
}
