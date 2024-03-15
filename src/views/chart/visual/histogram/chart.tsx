import _ from 'lodash'
import clsx from 'clsx'
import * as echarts from 'echarts'
import { useEffect, useMemo, useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { useThrottleCallback } from '@/utils/use-throttle-callback'
import styles from './chart.module.scss'
import { Config, Data } from './interface'

const HIGH_COLOR = '#F0884D'

export function HistogramChart({
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

    const option = useMemo(() => {
        if (!Array.isArray(data)) {
            return {}
        }

        const counts = data.map((item) => item.count)
        const maxCount = Math.max(...counts)
        const totalCount = counts.reduce((total, count) => total + count, 0)

        let prevQuantile = 0

        // [start, end, count, percent, quantile, prevQuantile]
        const seriesData = data.map((item) => {
            const percent = item.count / totalCount
            const quantile = prevQuantile + percent
            const dataValue = [item.start, item.end, item.count, percent, quantile, prevQuantile]
            prevQuantile = quantile
            return dataValue
        })

        const option = {
            grid: {
                top: 24,
                bottom: 10,
                left: 20,
                right: 20,
                containLabel: true,
            },
            tooltip: {
                formatter({ data }: any) {
                    const [start, end, count, percent, quantile, prevQuantile] = data
                    const percentStr = (percent * 100).toFixed(4) + '%'
                    const quantileStr = (quantile * 100).toFixed(4) + '%'
                    const prevQuantileStr = (prevQuantile * 100).toFixed(4) + '%'
                    const isHigh = isSpecialQuantileRange(prevQuantile, quantile)
                    return `
                        <div>
                            <code style="${isHigh ? `font-weight: bold; color: ${HIGH_COLOR};` : ''}">[${start}, ${end}): ${count}/个</code>
                            <hr />
                            总占比：<code>${percentStr}</code><br />
                            分位数：<code>(${prevQuantileStr}, ${quantileStr}]</code><br />
                        </div>
                    `
                },
            },
            xAxis: {
                scale: true,
            },
            yAxis: {},
            series: [
                {
                    type: 'custom',
                    renderItem: function (params: any, api: any) {
                        const style = api.style()

                        const yValue = api.value(2)
                        const start = api.coord([api.value(0), yValue])
                        const size = api.size([api.value(1) - api.value(0), yValue])

                        const bgStart = api.coord([api.value(0), maxCount])
                        const bgSize = api.size([api.value(1) - api.value(0), maxCount])

                        const isHigh = isSpecialQuantileRange(api.value(5), api.value(4))

                        return {
                            type: 'group',
                            children: [
                                // 添加一个背景层，用于触发 tooltip
                                {
                                    type: 'rect',
                                    shape: {
                                        x: bgStart[0],
                                        y: bgStart[1],
                                        width: bgSize[0],
                                        height: bgSize[1],
                                    },
                                    style: {
                                        fill: '#0000',
                                    },
                                    invisible: false,
                                },
                                {
                                    type: 'rect',
                                    shape: {
                                        x: start[0],
                                        y: start[1],
                                        width: size[0],
                                        height: size[1],
                                    },
                                    style: {
                                        fill: isHigh ? HIGH_COLOR : '#5470c6',
                                    },
                                },
                            ],
                        }
                    },
                    encode: {
                        x: [0, 1],
                        y: 2,
                    },
                    data: seriesData,
                },
            ],
        }

        return option
    }, [data, config])

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

        chart.current.setOption(option as any, {
            notMerge: true,
        })
    }, [chartEl, option])

    useResizeDetector({
        targetRef: containerEl,
        onResize: useThrottleCallback(() => chart.current?.resize(), 200),
    })

    return (
        <div {...otherProps} ref={containerEl} className={clsx(styles.chartContainer, className)}>
            <div className={styles.chart} ref={chartEl} />
        </div>
    )
}

function isSpecialQuantileRange(r1: number, r2: number) {
    return (
        (r1 < 0.5 && r2 >= 0.5) || // P50（中位数）
        (r1 < 0.9 && r2 >= 0.9) || // P90
        (r1 < 0.99 && r2 >= 0.99) // P99
    )
}
