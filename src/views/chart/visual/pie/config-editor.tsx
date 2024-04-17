import _ from 'lodash'
import { memo, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { Box, Flex, Separator } from '@radix-ui/themes'
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
    return (
        <Flex direction={'column'} p="3" gap="3" align="start">
            <Separator size="4" />
            <div className={styles.formGroup}>
                <span className={styles.formGroupLabel}>数据要求</span>
                <ul className={styles.note}>
                    <li>可以返回一个简单的对象，对象的 key 为数据项名称，value 为数据项的值；</li>
                </ul>
            </div>
        </Flex>
    )
})
