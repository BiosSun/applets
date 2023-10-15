import _ from 'lodash'
import { useFormContext, Controller } from 'react-hook-form'
import Input from '@/components/input'
import { Select, SelectOption } from '@/components/select'
import { Toggle } from '@/components/toggle'
import styles from './index.module.scss'

export function Field({
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
    }

    return (
        <label className={styles.field}>
            {type === 'toggle' ? controller : null}
            <span className={styles.filedLabel}>{label}</span>
            {type !== 'toggle' ? controller : null}
        </label>
    )
}
