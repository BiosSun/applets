import { StatMethod } from '../../utils/stat'

export type Data = Record<string, string | number>[]

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

    /** Y-轴配置 */
    yAxis: {
        min: number | null;
        max: number | null;
    },

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
