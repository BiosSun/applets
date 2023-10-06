import _ from 'lodash'

export type Data = Record<string, string | number>[]

// TODO 转移到其它地方
function quantile(nums: number[], level: number): number {
    if (nums.length === 0) {
        throw new Error('Array must not be empty')
    }

    if (level < 0 || level > 1) {
        throw new Error('Level must be between 0 and 1')
    }
    nums = [...nums]
    nums.sort((a, b) => a - b)

    const index = level * (nums.length - 1)
    const lower = Math.floor(index)
    const upper = lower + 1
    const weight = index % 1

    if (upper === nums.length) {
        return nums[lower]
    }

    return nums[lower] * (1 - weight) + nums[upper] * weight
}

export const STAT_METHODS = {
    min: {
        name: 'min',
        stat: (val: number[]) => _.min(val),
    },
    max: {
        name: 'max',
        stat: (val: number[]) => _.max(val),
    },
    last: {
        name: 'last',
        stat: (val: number[]) => val.at(-1),
    },
    p50: {
        name: 'p50',
        stat: (val: number[]) => quantile(val, 0.5),
    },
    p80: {
        name: 'p80',
        stat: (val: number[]) => quantile(val, 0.8),
    },
    p90: {
        name: 'p90',
        stat: (val: number[]) => quantile(val, 0.9),
    },
    p99: {
        name: 'p99',
        stat: (val: number[]) => quantile(val, 0.99),
    },
    p999: {
        name: 'p99.9',
        stat: (val: number[]) => quantile(val, 0.999),
    },
    p9999: {
        name: 'p99.99',
        stat: (val: number[]) => quantile(val, 0.9999),
    },
    avg: {
        name: 'avg',
        stat: (val: number[]) => val.reduce((t, v) => t + v, 0) / val.length,
    },
    total: {
        name: 'total',
        stat: (val: number[]) => val.reduce((t, v) => t + v, 0),
    },
} as const

export type StatMethod = keyof typeof STAT_METHODS

export const ALL_STAT_METHOD_NAMES = Object.keys(STAT_METHODS) as StatMethod[]

export type Config = {
    bar: boolean
    line: boolean
    point: boolean

    /** 若开启折线图，则控制折线填充区域的不透明度 */
    areaOpacity: number

    /** 若开启折线图，则控制折线填充区域的渐变程度 */
    areaGradient: number

    /** 图形的颜色，默认自动分派，也可以强制指定 */
    color: 'auto' | string

    /** 线的宽度 */
    lineWidth: number

    /**
     * 对于空置的处理方式（仅对 line 和 point 的有影响）：
     * - null：按空处理：line 断开，point 不显示；
     * - connected: line 连接，point 同 null 模式；
     * - zero：按零处理；
     */
    nullMode: 'connected' | 'null' | 'zero'

    /** 是否堆叠处理 */
    stack: boolean

    /** 当堆叠时，是否按百分比显示 */
    percent: boolean

    /**
     * X-轴类型：
     * - time: 时间轴；
     * - category: 类目轴；
     */
    xAxisMode: 'time' | 'category'

    /** 图例 */
    legend: {
        /** 是否显示图例 */
        show: boolean
        width: string
    } & {
        [key in StatMethod]: boolean
    }

    sort: 'default' | StatMethod
    sortDire: 'asc' | 'desc'
}
