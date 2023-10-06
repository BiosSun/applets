import _ from 'lodash'
import dayjs from 'dayjs'
import clsx from 'clsx'
import { Chart } from '@antv/g2'
import { useEffect, useRef } from 'react'
import { produce } from 'immer'
import { Config, Data } from './interface'
import styles from './chart.module.scss'
import { exec } from '@/utils/use-exec'

export function G2Chart({
    data,
    config,
    className,
    ...otherProps
}: {
    data: Data
    config: Config
    className?: string
    [otherProp: string]: any
}) {
    const chartEl = useRef<HTMLDivElement>(null)
    const chart = useRef<Chart>()

    useEffect(() => {
        if (!chartEl.current) {
            throw new Error('图表容器元素不存在')
        }

        // 初始化图表实例
        if (!chart.current) {
            chart.current = new Chart({
                autoFit: true,
                container: chartEl.current,
            })
        }

        if (!data) {
            console.info('empty data')
            return
        }

        try {
            exec(
                {
                    chart: chart.current,
                    data,
                    tools: { _, dayjs },
                },
                config
            )
        } catch (error) {
            console.info(error)
        }

        // 渲染可视化
        chart.current.render()

        return () => {
            chart.current?.clear()
        }
    }, [chartEl, data, config])

    return (
        <div className={clsx(className, styles.chartContainer)} {...otherProps}>
            <div className={styles.chart} ref={chartEl} />
        </div>
    )
}
