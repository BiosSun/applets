import _ from 'lodash'
import { memo, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { Divider } from '@nami-ui/divider'
import { HStack, VStack } from '@nami-ui/stack'
import { Field } from '../../components/field'
import { Config } from './interface'
import styles from './config-editor.module.scss'
import { verifyConfig } from './verifies'

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
        <VStack padding="middle" spacing="middle" align="start">
            <HStack className={styles.formGroup} spacing="big">
                <Field type="toggle" label="柱状图" name="bar" />
                <Field type="toggle" label="折线图" name="line" />
                <Field type="toggle" label="数据点" name="point" />
            </HStack>
            <Divider />

            <HStack className={styles.formGroup} spacing="big">
                <Field type="toggle" label="堆叠" name="stack" />
                <Field type="toggle" label="百分比堆叠" name="percent" />
            </HStack>
            <Divider />
            <VStack className={styles.formGroup} spacing="middle" align="start">
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
            </VStack>
            <Divider />
            <VStack className={styles.formGroup} spacing="middle" align="start">
                <span className={styles.formGroupLabel}>Y 轴</span>
                <Field type="number" label="最小值" name="yAxis.min" />
                <Field type="number" label="最大值" name="yAxis.max" />
            </VStack>
            <Divider />
            <VStack className={styles.formGroup} spacing="middle" align="start">
                <span className={styles.formGroupLabel}>图例</span>
                <Field type="toggle" label="是否显示" name="legend.show" />
                <HStack spacing={{ horizontal: 'big', vertical: 'middle' }} wrap>
                    <Field type="toggle" label="min" name="legend.min" />
                    <Field type="toggle" label="max" name="legend.max" />
                    <Field type="toggle" label="last" name="legend.last" />
                    <Field type="toggle" label="avg" name="legend.avg" />
                    <Field type="toggle" label="total" name="legend.total" />
                </HStack>
                <HStack spacing={{ horizontal: 'big', vertical: 'middle' }} wrap>
                    <Field type="toggle" label="p50" name="legend.p50" />
                    <Field type="toggle" label="p80" name="legend.p80" />
                    <Field type="toggle" label="p90" name="legend.p90" />
                    <Field type="toggle" label="p99" name="legend.p99" />
                    <Field type="toggle" label="p99.9" name="legend.p999" />
                    <Field type="toggle" label="p99.99" name="legend.p9999" />
                </HStack>
                <Field
                    type="number"
                    label="宽度"
                    name="legend.width"
                    min={0}
                    max={1440}
                    step={10}
                />
            </VStack>
            <Divider />
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
        </VStack>
    )
})
