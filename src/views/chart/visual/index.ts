import G2Visual from './g2'
import GraphVisual from './graph'

export const VISUALS = {
    [G2Visual.name]: G2Visual,
    [GraphVisual.name]: GraphVisual,
    // TODO
    // Trend - 趋势图
    // Category - 类目图
    // Table,
    // ...
} as const
