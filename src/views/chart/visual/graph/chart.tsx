import _, { method } from 'lodash'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { produce } from 'immer'
import * as echarts from 'echarts'
import { useEffect, useMemo, useRef } from 'react'
import Color from 'colorjs.io'
import { assert } from '@/utils/assert'
import { useResizeDetector } from 'react-resize-detector'
import { ALL_STAT_METHOD_NAMES, Config, Data, STAT_METHODS, StatMethod } from './interface'
import styles from './chart.module.scss'
import { useThrottleCallback } from '@/utils/use-throttle-callback'
import { HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'

function isValidTime(val: string | number): boolean {
    return dayjs(val).isValid()
}

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

const COLORS_10 = [
    '#1783FF',
    '#00C9C9',
    '#F0884D',
    '#D580FF',
    '#7863FF',
    '#60C42D',
    '#BD8F24',
    '#FF80CA',
    '#2491B3',
    '#17C76F',
]

const COLORS_20 = [
    '#1783FF',
    '#00C9C9',
    '#F0884D',
    '#D580FF',
    '#7863FF',
    '#60C42D',
    '#BD8F24',
    '#FF80CA',
    '#2491B3',
    '#17C76F',
    '#AABA01',
    '#BC7CFC',
    '#237CBC',
    '#2DE379',
    '#CE8032',
    '#FF7AF4',
    '#545FD3',
    '#AFE410',
    '#D8C608',
    '#FFA1E0',
]

// const colorDisk = _.memoize((total: number) => {
//     const indexes = new Array(total).fill(0).map((_, i) => i)
//     const groupLength = 3
//     const groupsCount = Math.ceil(total / groupLength) // 每三个颜色一组
//     const groups = _.chain(indexes)
//         .groupBy((index) => index % groupsCount)
//         .values()
//         .map((group, groupIndex) => {
//             for (let i = 0; i < groupIndex % groupLength; i++) {
//                 const index = group.pop()!
//                 group.unshift(index)
//             }
//             return group
//         })
//         .flatten()
//         .value()

//     return groups
// })

// function pickColor(i: number, total: number): string {
//     const groups = colorDisk(total)
//     const index = groups[i]

//     const interval = 360 / total
//     const color = new Color(`oklch(0.65 0.3 ${(interval * index + 239) % 360})`).toString()

//     console.info(color)

//     return color
// }

function pickColor(i: number, t: number): string {
    if (t <= 10) {
        return COLORS_10[i]
    } else {
        return COLORS_20[i % 20]
    }
}

export function GraphChart({
    data = [],
    config,
    className,
    onConfigChange,
    ...otherProps
}: {
    data: Data
    config: Config
    className?: string
    onConfigChange: (config: Config) => void
    [otherProp: string]: any
}) {
    const containerEl = useRef<HTMLDivElement>(null)
    const chartEl = useRef<HTMLDivElement>(null)
    const chart = useRef<echarts.ECharts>()

    const visibleStatMethods = useMemo(() => {
        const methods: StatMethod[] = []

        if (config.legend.show) {
            ALL_STAT_METHOD_NAMES.forEach((method) => {
                if (config.legend[method]) {
                    methods.push(method)
                }
            })
        }

        return methods
    }, [config.legend])

    const validStatMethods = useMemo(() => {
        const methods = [...visibleStatMethods]

        if (config.sort !== 'default' && !methods.includes(config.sort)) {
            methods.push(config.sort)
        }

        return methods
    }, [config.legend, config.sort])

    const { xAxis, series } = useMemo(() => {
        // NOTE 至少第一个数据项中应当包含所有字段，即使字段的值为 null
        const fieldNames = Object.keys(data?.[0] ?? [])

        const metricFieldNames: string[] = []
        const dimensionFieldNames: string[] = []

        const xAxis: { name: string; type: 'category' | 'time' } = {
            name: '',
            type: 'category',
        }

        for (const name of ['time', 't', 'date']) {
            if (fieldNames.includes(name)) {
                const values = data.map((item) => item[name])
                if (values.every(isValidTime)) {
                    xAxis.name = name
                    xAxis.type = 'time'
                    _.pull(fieldNames, name)
                }
            }
        }

        for (const fieldName of fieldNames) {
            for (const item of data) {
                const val = item[fieldName]
                if (typeof val === 'number') {
                    metricFieldNames.push(fieldName)
                    break
                } else if (typeof val === 'string') {
                    dimensionFieldNames.push(fieldName)
                    break
                } else if (item === data.at(-1)) {
                    metricFieldNames.push(fieldName)
                    break
                }
            }
        }

        if (!xAxis.name) {
            xAxis.name = dimensionFieldNames.shift()!
        }

        const dataGroupsByDimensions = _.chain(data)
            .groupBy((item) => _.chain(item).pick(dimensionFieldNames).values().join(', ').value())
            .entries()
            .value()

        type Series = {
            name: string
            data: (readonly [string | number, number])[]
        } & {
            [key in StatMethod]?: number
        }

        const series: Series[] = []

        for (const [key, items] of dataGroupsByDimensions) {
            for (const metric of metricFieldNames) {
                const data = items.map((d) => [d[xAxis.name], d[metric] as number] as const)
                const seriesItem: Series = {
                    name: key ? key + ' - ' + metric : metric,
                    data,
                }

                if (validStatMethods.length) {
                    const vals = data.map((item) => item[1])

                    validStatMethods.forEach((method) => {
                        seriesItem[method] = STAT_METHODS[method].stat(vals)
                    })
                }

                series.push(seriesItem)
            }
        }

        if (config.sort !== 'default') {
            series.sort((a, b) =>
                config.sortDire === 'asc'
                    ? (a as any)[config.sort] - (b as any)[config.sort]
                    : (b as any)[config.sort] - (a as any)[config.sort]
            )
        }

        return {
            xAxis,
            fields: fieldNames,
            series,
        }
    }, [data, validStatMethods, config.sort, config.sortDire])

    const option = useMemo(() => {
        const line = config.line || config.point
        const percent = config.stack && config.percent
        const areaOpacity = config.line ? config.areaOpacity : 0

        const option = {
            grid: {
                top: 12,
                bottom: 10,
                left: 10,
                right: 10,
                containLabel: true,
            },
            xAxis: {
                type: xAxis.type,
            },
            yAxis: {
                type: 'value',
                max: percent ? 1 : undefined,
            },
            tooltip: {
                trigger: 'axis',
                hideDelay: 0,
                transitionDuration: 0,
                appendToBody: true,
                position(point: [number, number]) {
                    return [point[0] + 16, point[1] + 16]
                },
            },
            animationDuration: 300,
            series: [] as echarts.SeriesOption[],
        }

        const totalData: number[] = []
        if (percent) {
            series.forEach((series) => {
                series.data.forEach((item, index) => {
                    totalData[index] = (totalData[index] ?? 0) + (item[1] as number)
                })
            })
        }

        for (let i = 0, t = series.length; i < t; i++) {
            const name = series[i].name
            const color = pickColor(i, t)
            let data = series[i].data

            if (percent) {
                data = data.map(([key, val], index) => [key, (val as number) / totalData[index]])
            }

            if (config.nullMode === 'zero') {
                data = data.map(([key, val]) => [key, val == null ? 0 : val])
            }

            if (line) {
                option.series.push({
                    data: data as any,
                    type: 'line',
                    z: i + 1,
                    name,
                    itemStyle: { color },
                    stack: config.stack ? 'line' : undefined,
                    showSymbol: config.point,
                    connectNulls: config.nullMode === 'connected',
                    lineStyle: { width: config.line ? config.lineWidth : 0 },
                    areaStyle: areaOpacity ? { opacity: areaOpacity } : undefined,
                    emphasis: { disabled: true },
                })
            }

            if (config.bar) {
                option.series.push({
                    data: data as any,
                    type: 'bar',
                    z: i + 1 + t,
                    name,
                    itemStyle: { color },
                    stack: config.stack ? 'bar' : undefined,
                    emphasis: { disabled: true },
                    tooltip: { show: !line },
                })
            }
        }

        return option
    }, [xAxis, series, config])

    useEffect(() => {
        if (!chartEl.current) {
            throw new Error('图表容器元素不存在')
        }

        // 初始化图表实例
        if (!chart.current) {
            chart.current = echarts.init(chartEl.current, {
                renderer: 'canvas',
            })
        }

        chart.current.setOption(option, {
            notMerge: true,
        })
    }, [chartEl, option])

    useResizeDetector({
        targetRef: containerEl,
        onResize: useThrottleCallback(() => chart.current?.resize(), 200),
    })

    function setSort(method: string) {
        const newConfig = { ...config }
        if (newConfig.sort === method) {
            if (newConfig.sortDire === 'desc') {
                newConfig.sortDire = 'asc'
            } else {
                newConfig.sort = 'default'
                newConfig.sortDire = 'desc'
            }
        } else {
            newConfig.sort = method as any
            newConfig.sortDire = 'desc'
        }
        onConfigChange(newConfig)
    }

    return (
        <HStack className={className} {...otherProps}>
            <div $flex ref={containerEl} className={styles.chartContainer}>
                <div className={styles.chart} ref={chartEl} />
            </div>
            {config.legend.show ? <Divider /> : null}
            {config.legend.show ? (
                <div className={styles.legendTable} style={{ width: config.legend.width }}>
                    <table>
                        <thead>
                            <tr>
                                <th align="left">&nbsp;</th>
                                {visibleStatMethods.map((method) => (
                                    <th
                                        key={method}
                                        className={styles.methodTh}
                                        align="right"
                                        tabIndex={1}
                                        onClick={() => setSort(method)}
                                    >
                                        {STAT_METHODS[method].name}
                                        &nbsp;
                                        {config.sort === method ? (
                                            <span className={styles.sortFlag}>
                                                {config.sortDire === 'asc' ? '▲' : '▼'}
                                            </span>
                                        ) : null}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {series.map((series) => (
                                <tr key={series.name}>
                                    <td align="left">{series.name}</td>
                                    {visibleStatMethods.map((method) => (
                                        <td key={method} align="right">
                                            <Numeric num={(series as any)[method]} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </HStack>
    )
}

function Numeric({ num }: { num: number }) {
    const str = useMemo(() => {
        return Intl.NumberFormat('zh-Hans-CN', {
            style: 'decimal',
            maximumFractionDigits: 4,
        }).format(num)
    }, [num])

    return <span>{str}</span>
}
