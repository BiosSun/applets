import _ from 'lodash'
import { memo, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { Box, Flex, Separator } from '@radix-ui/themes'
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
        <Flex direction="column" p="3" gap="3" align="start">
            <Separator size="4" />
            <div className={styles.formGroup}>
                <span className={styles.formGroupLabel}>数据要求</span>
                <ul className={styles.note}>
                    <li>应当返回一个数组，其元素为对象；</li>
                    <li>
                        每个元素对象表示一段区间，其中应当有且仅有以下三个字段：
                        <ul>
                            <li>start: 区间起始值（包含）；</li>
                            <li>end: 区间结束值（不包含）；</li>
                            <li>count: 该区间中的数据量。</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </Flex>
    )
})
