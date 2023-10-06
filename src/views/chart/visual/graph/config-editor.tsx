import _ from 'lodash'
import dayjs from 'dayjs'
import { Fragment, memo, useEffect } from 'react'
import produce from 'immer'
import {
    useForm,
    SubmitHandler,
    FormProvider,
    useFieldArray,
    useFormContext,
    useWatch,
    Controller,
} from 'react-hook-form'
import { IntervalMark } from '@antv/g2'
import { Divider } from '@nami-ui/divider'
import { HStack, VStack } from '@nami-ui/stack'
import { Button } from '@/components/button'
import Input from '@/components/input'
import { Select, SelectOption } from '@/components/select'
import { Toggle } from '@/components/toggle'
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
            <div>
                <Form />
            </div>
        </FormProvider>
    )
}

const Form = memo(function Form() {
    return (
        <VStack padding="middle" spacing="middle" align="start">
            <HStack className={styles.formGroup} spacing="big">
                <Field type="toggle" label="Bar" name="bar" />
                <Field type="toggle" label="Line" name="line" />
                <Field type="toggle" label="Point" name="point" />
            </HStack>
            <Divider />
            <VStack className={styles.formGroup} spacing="middle" align='start'>
                <Field
                    type="select"
                    label="Line Width"
                    name="lineWidth"
                    options={[
                        { label: '1', value: 1 },
                        { label: '2', value: 2 },
                        { label: '3', value: 3 },
                        { label: '4', value: 4 },
                        { label: '5', value: 5 },
                        { label: '6', value: 6 },
                        { label: '7', value: 7 },
                        { label: '8', value: 8 },
                        { label: '9', value: 9 },
                        { label: '10', value: 10 },
                    ]}
                />
                <Field
                    type="select"
                    label="Area Opacity"
                    name="areaOpacity"
                    options={[
                        { label: 'None', value: 0 },
                        { label: '0.1', value: 0.1 },
                        { label: '0.2', value: 0.2 },
                        { label: '0.3', value: 0.3 },
                        { label: '0.4', value: 0.4 },
                        { label: '0.5', value: 0.5 },
                        { label: '0.6', value: 0.6 },
                        { label: '0.7', value: 0.7 },
                        { label: '0.8', value: 0.8 },
                        { label: '0.9', value: 0.9 },
                        { label: '1.0', value: 1.0 },
                    ]}
                />
                <HStack spacing="big">
                    <Field type="toggle" label="Stack" name="stack" />
                    <Field type="toggle" label="Percent" name="percent" />
                </HStack>
                <Field
                    type="select"
                    label="Null value"
                    name="nullMode"
                    options={[
                        { label: 'connected', value: 'connected' },
                        { label: 'null', value: 'null' },
                        { label: 'null as zero', value: 'zero' },
                    ]}
                />
            </VStack>
            <Divider />
            <VStack className={styles.formGroup} spacing="middle" align='start'>
                <span className={styles.formGroupLabel}>Legend</span>
                <Field type="toggle" label="Show" name="legend.show" />
                <HStack spacing={{ horizontal: 'big', vertical: 'middle' }} wrap>
                    <Field type="toggle" label="max" name="legend.max" />
                    <Field type="toggle" label="min" name="legend.min" />
                    <Field type="toggle" label="p50" name="legend.p50" />
                    <Field type="toggle" label="p80" name="legend.p80" />
                    <Field type="toggle" label="p90" name="legend.p90" />
                    <Field type="toggle" label="p99" name="legend.p99" />
                    <Field type="toggle" label="p99.9" name="legend.p999" />
                    <Field type="toggle" label="p99.99" name="legend.p9999" />
                    <Field type="toggle" label="last" name="legend.last" />
                    <Field type="toggle" label="total" name="legend.total" />
                    <Field type="toggle" label="avg" name="legend.avg" />
                </HStack>
                <Field type="text" label="Width" name="legend.width" />
            </VStack>
        </VStack>
    )
})

function Field({
    label,
    name,
    type = 'text',
    options,
}: {
    label: string
    name: string
    type?: 'text' | 'toggle' | 'select'
    options?: SelectOption[]
}) {
    let controller

    switch (type) {
        case 'text':
            const { register } = useFormContext()
            controller = <Input className={styles.fieldInput} {...register(name)} />
            break
        case 'toggle':
            controller = (
                <Controller
                    name={name}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Toggle value={value} onChange={onChange} onBlur={onBlur} />
                    )}
                />
            )
            break
        case 'select':
            controller = (
                <Controller
                    name={name}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Select
                            value={value}
                            options={options!}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />
            )
            break
        default:
            throw new Error('未知的 Field 类型')
            break
    }

    return (
        <label className={styles.field}>
            <span className={styles.filedLabel}>{label}</span>
            {controller}
        </label>
    )
}
