import _ from 'lodash'
import { memo, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { Box, Flex, Separator } from '@radix-ui/themes'
import { Field } from '../../components/field'
import { Config } from './interface'
import { verifyConfig } from './verifies'
import styles from './config-editor.module.scss'

export function GraphConfigEditor({
    value,
    className,
    onChange,
    ...otherProps
}: {
    value: Config
    className?: string
    onChange: (value: Config) => void
    [otherProp: string]: any
}) {
    const methods = useForm({
        values: value,
    })

    const { watch } = methods

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (verifyConfig(value)) {
                onChange(value)
            }
        })

        return () => subscription.unsubscribe()
    }, [onChange, watch])

    useWatch({ control: methods.control })

    return (
        <FormProvider {...methods}>
            <div {...otherProps}>
                <Form />
            </div>
        </FormProvider>
    )
}

const Form = memo(function Form() {
    return (
        <Flex direction={'column'} p={'3'} gap={'3'} align="start">
            <Flex className={styles.formGroup} gap={'5'}>
                <Field type="toggle" label="柱状图" name="bar" />
                <Field type="toggle" label="折线图" name="line" />
                <Field type="toggle" label="数据点" name="point" />
            </Flex>

            <Separator size="4" />

            <StackFormSection />

            <Flex className={styles.formGroup} direction={'column'} gap="3" align="start">
                <Field type="number" label="折线宽度" name="lineWidth" min={0} max={10} step={1} />
                <Field type="number" label="填充度" name="areaOpacity" min={0} max={1} step={0.1} />
                <Field
                    type="number"
                    label="填充渐变度"
                    name="areaGradient"
                    min={0}
                    max={1}
                    step={0.1}
                />
                <Field
                    type="select"
                    label="空值处理"
                    name="nullMode"
                    options={[
                        { label: 'connected', value: 'connected' },
                        { label: 'null', value: 'null' },
                        { label: 'null as zero', value: 'zero' },
                    ]}
                />
            </Flex>

            <Separator size="4" />

            <Flex className={styles.formGroup} direction="column" gap="3" align="start">
                <span className={styles.formGroupLabel}>Y 轴</span>
                <Field type="number" label="最小值" name="yAxis.min" />
                <Field type="number" label="最大值" name="yAxis.max" />
            </Flex>

            <Separator size="4" />

            <ValueLabelsFormSection />

            <Flex className={styles.formGroup} direction="column" gap="3" align="start">
                <span className={styles.formGroupLabel}>图例</span>
                <Field type="toggle" label="是否显示" name="legend.show" />
                <Flex gapX="5" gapY="3" wrap="wrap">
                    <Field type="toggle" label="min" name="legend.min" />
                    <Field type="toggle" label="max" name="legend.max" />
                    <Field type="toggle" label="last" name="legend.last" />
                    <Field type="toggle" label="avg" name="legend.avg" />
                    <Field type="toggle" label="total" name="legend.total" />
                </Flex>
                <Flex gapX="5" gapY="3" wrap="wrap">
                    <Field type="toggle" label="p50" name="legend.p50" />
                    <Field type="toggle" label="p80" name="legend.p80" />
                    <Field type="toggle" label="p90" name="legend.p90" />
                    <Field type="toggle" label="p99" name="legend.p99" />
                    <Field type="toggle" label="p99.9" name="legend.p999" />
                    <Field type="toggle" label="p99.99" name="legend.p9999" />
                </Flex>
            </Flex>
            <Separator size="4" />
            <div className={styles.formGroup}>
                <span className={styles.formGroupLabel}>数据要求</span>
                <ul className={styles.note}>
                    <li>应当返回一个数组，其元素为对象；</li>
                    <li>对象中字段的值只能为字符串、数值或 null；</li>
                    <li>值为字符串的字段将视为维度；</li>
                    <li>值为数值的则视为指标（另外所有值都为 null 的字段，也会被视为指标）；</li>
                    <li>第一个维度用于渲染 X 轴；</li>
                    <li>
                        若有某个字段的名称是 time、t 或
                        date，且其所有值都可以解析为一个有效的日期（`dayjs(val).isValid()`），
                        则强制作为维度，并用于渲染 X 轴（且此时 X 轴将渲染为时间轴）。{' '}
                    </li>
                </ul>
            </div>
        </Flex>
    )
})

function StackFormSection() {
    const stack = useWatch({ name: 'stack' }) as boolean

    return (
        <>
            <Flex className={styles.formGroup} gap="5">
                <Field type="toggle" label="堆叠" name="stack" />
                <Field type="toggle" label="百分比堆叠" name="percent" disabled={!stack} />
            </Flex>
            <Separator size="4" />
        </>
    )
}

function ValueLabelsFormSection() {
    const point = useWatch({ name: 'point' }) as boolean
    const line = useWatch({ name: 'line' }) as boolean

    return (
        <>
            <Flex className={styles.formGroup} direction="column" gap="3" align="start">
                <span className={styles.formGroupLabel}>
                    标签
                    {point ? '' : line ? '（鼠标交互时显示）' : '（开启折线图或数据点时生效）'}
                </span>
                <Field type="toggle" label="是否显示" name="valueLabels.show" />
                <Field
                    type="select"
                    label="位置"
                    name="valueLabels.position"
                    options={[
                        { label: '上', value: 'top' },
                        { label: '下', value: 'bottom' },
                        { label: '左', value: 'left' },
                        { label: '右', value: 'right' },
                    ]}
                />
            </Flex>
            <Separator size="4" />
        </>
    )
}
