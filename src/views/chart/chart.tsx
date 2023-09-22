import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import { produce } from 'immer'
import dayjs from 'dayjs'
import { Chart, IntervalMark } from '@antv/g2'
import { useToggle } from 'react-use'
import outdent from 'outdent'
import ReactResizeDetector, { useResizeDetector } from 'react-resize-detector'

import { HStack, VStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import Panel from '@/components/panel'
import CodeEditor from '@/components/code-editor'
import Input from '@/components/input'

import styles from './chart.module.scss'

import { useDataCode } from './use-data-code'

type Visual = IntervalMark

const DEFAULT_VISUAL: Visual = {
    type: 'interval',
    encode: {
        x: 'x',
        y: 'y',
    },
    transform: [
        {
            type: 'sample',
            strategy: 'max',
        },
    ],
    animate: false,
}

export default function ChartView() {
    const dataCode = useDataCode()
    const [visual, setVisual] = useState<Visual>(DEFAULT_VISUAL)

    return (
        <VStack className={styles.container}>
            <ChartPanel $col={12} $flex data={dataCode.data} visual={visual} />
            <Divider />
            <HStack $flex $col={12}>
                <DataPanel
                    $col={12}
                    $flex
                    dataCode={dataCode.code}
                    onDataCodeChange={dataCode.setCode}
                />
                <Divider />
                <VisualPanel $col={12} $flex value={visual} onChange={setVisual} />
            </HStack>
        </VStack>
    )
}

function ChartPanel(props: { data: any; visual: Visual; [otherProp: string]: any }) {
    const { data, visual, ...otherProps } = props

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

        const options = { ...visual, data }

        // 声明可视化
        chart.current.options(options)

        // 渲染可视化
        chart.current.render()

        return () => {
            chart.current?.clear()
        }
    }, [chartEl, data, visual])

    return (
        <Panel title="图表" {...otherProps}>
            <div $flex className={styles.chartContainer}>
            <div className={styles.chart} ref={chartEl} />
            </div>
        </Panel>
    )
}

function DataPanel(props: {
    dataCode: string
    onDataCodeChange: (value: string) => void
    [otherProp: string]: any
}) {
    const { dataCode, onDataCodeChange, ...otherProps } = props

    return (
        <Panel title="数据" {...otherProps}>
            <CodeEditor $flex language="javascript" value={dataCode} onChange={onDataCodeChange} />
        </Panel>
    )
}

function VisualPanel(props: {
    value: Visual
    onChange: (value: Visual) => void
    [otherProp: string]: any
}) {
    const { value, onChange, ...otherProps } = props

    return (
        <Panel title="视图" {...otherProps}>
            <IntervalMarkForm value={value} onChange={onChange} />
        </Panel>
    )
}

function IntervalMarkForm({
    value,
    onChange,
}: {
    value: IntervalMark
    onChange: (value: IntervalMark) => void
}) {
    return (
        <div className={styles.formGroup}>
            <span className={styles.formGroupLabel}>Encode</span>
            <Field value={value} label="x" path="encode.x" onChange={onChange} />
            <Field value={value} label="y" path="encode.y" onChange={onChange} />
        </div>
    )
}

function Field({
    value,
    label,
    path,
    onChange,
}: {
    value: any
    label: string
    path: string
    onChange: (value: any) => void
}) {
    function change(filedValue: any) {
        onChange(
            produce(value, (draft: any) => {
                _.set(draft, path, filedValue)
            })
        )
    }

    return (
        <label className={styles.field}>
            <span className={styles.filedLabel}>{label}</span>
            <Input
                className={styles.fieldInput}
                value={_.get(value, path) ?? ''}
                onChange={change}
            />
        </label>
    )
}
