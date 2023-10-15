import _ from 'lodash'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { useEffect, useMemo, useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { Config, Data } from './interface'
import styles from './chart.module.scss'
import { useThrottleCallback } from '@/utils/use-throttle-callback'
import { HStack } from '@nami-ui/stack'
import { pickColor } from '../../utils/color'

export function PieChart({
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

    const { series } = useMemo(() => {
        type Series = {
            name: string
            data: {
                name: string
                value: number
            }[]
        }

        const series: Series[] = []

        if (!Array.isArray(data)) {
            series.push({
                name: '',
                data: Object.entries(data).map(([name, value]) => ({ name, value })),
            })
        } else {
        }

        return {
            series,
        }
    }, [data])

    const option = useMemo(() => {
        const option = {
            grid: {
                top: 12,
                bottom: 10,
                left: 10,
                right: 10,
                containLabel: true,
            },
            tooltip: {
                trigger: 'item',
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

        console.info(series)

        for (let i = 0, t = series.length; i < t; i++) {
            const name = series[i].name
            const color = pickColor(i, t)
            let data = series[i].data

            option.series.push({
                data: data as any,
                type: 'pie',
                name,
            })
        }

        return option
    }, [series, config])

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

    return (
        <HStack className={className} {...otherProps}>
            <div $flex ref={containerEl} className={styles.chartContainer}>
                <div className={styles.chart} ref={chartEl} />
            </div>
        </HStack>
    )
}
