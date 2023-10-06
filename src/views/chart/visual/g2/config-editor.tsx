import _ from 'lodash'
import { Fragment, memo, useEffect, useMemo } from 'react'
import produce from 'immer'
import {
    useForm,
    SubmitHandler,
    FormProvider,
    useFieldArray,
    useFormContext,
    useWatch,
} from 'react-hook-form'
import { IntervalMark } from '@antv/g2'
import { Divider } from '@nami-ui/divider'
import { VStack } from '@nami-ui/stack'
import { Button } from '@/components/button'
import Input from '@/components/input'
import CodeEditor from '@/components/code-editor'
import { Config } from './interface'
import styles from './config-editor.module.scss'

export function G2ConfigEditor({
    value,
    className,
    onChange: _onChange,
    ...otherProps
}: {
    value: Config
    className?: string
    onChange: (value: Config) => void
    [otherProp: string]: any
}) {
    const onChange = useMemo(() => {
        return _.debounce(_onChange, 500)
    }, [_onChange])

    return (
        <CodeEditor
            {...otherProps}
            style={{ height: '100%' }}
            language="javascript"
            value={value}
            onChange={onChange}
        />
    )
}
