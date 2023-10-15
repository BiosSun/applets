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
import { Field } from '../../components/field'
import { Config } from './interface'
import { verifyConfig } from './verifies'
import styles from './config-editor.module.scss'

export function PieConfigEditor({
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
    return <VStack padding="middle" spacing="middle" align="start"></VStack>
})
