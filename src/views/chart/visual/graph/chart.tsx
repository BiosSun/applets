import _ from 'lodash'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { useEffect, useMemo, useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import { useThrottleCallback } from '@/utils/use-throttle-callback'
import { pickColor } from '../../utils/color'
import { numeric } from '../../utils/numeric'
import { ALL_STAT_METHOD_NAMES, STAT_METHODS, StatMethod } from '../../utils/stat'
import styles from './chart.module.scss'
import { Config, Data } from './interface'

function isValidTime(val: string | number): boolean {
    return dayjs(val).isValid()
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
            series,
        }
    }, [data, validStatMethods, config.sort, config.sortDire])

    const option = useMemo(() => {
        const line = config.line || config.point
        const percent = config.stack && config.percent
        const areaOpacity = config.line ? config.areaOpacity : 0
        const areaGradient = config.line ? config.areaGradient : 0

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
                    areaStyle: areaOpacity
                        ? {
                              opacity: areaGradient ? 1 : areaOpacity,
                              color: areaGradient
                                  ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        {
                                            offset: 0,
                                            color:
                                                color +
                                                Math.round(areaGradient * 0xff)
                                                    .toString(16)
                                                    .padStart(2, '0'), // 0% 处的颜色
                                        },
                                        {
                                            offset: 1,
                                            color:
                                                color +
                                                Math.round(areaGradient * 0.3 * 0xff)
                                                    .toString(16)
                                                    .padStart(2, '0'), // 100% 处的颜色
                                        },
                                    ])
                                  : undefined,
                          }
                        : undefined,
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
                                            <span>{numeric((series as any)[method])}</span>
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