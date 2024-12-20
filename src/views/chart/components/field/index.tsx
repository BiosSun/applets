import _ from 'lodash'
import clsx from 'clsx'
import { useFormContext, Controller } from 'react-hook-form'
import Input from '@/components/input'
import { Select, SelectOption, SelectValue } from '@/components/select'
import { Toggle } from '@/components/toggle'
import styles from './index.module.scss'

export function Field({
    label,
    name,
    type = 'text',
    options,
    min,
    max,
    step,
    disabled,
}: {
    label: string
    name: string
    type?: 'text' | 'toggle' | 'select' | 'number'
    options?: SelectOption<SelectValue>[]
    min?: number
    max?: number
    step?: number
    disabled?: boolean
}) {
    let controller

    switch (type) {
        case 'text': {
            const { register } = useFormContext()
            controller = (
                <Input
                    className={styles.fieldInput}
                    {...register(name, {
                        disabled,
                    })}
                />
            )
            break
        }
        case 'toggle':
            controller = (
                <Controller
                    name={name}
                    disabled={disabled}
                    render={({ field: { onChange, onBlur, value, disabled } }) => (
                        <Toggle
                            value={value}
                            disabled={disabled}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />
            )
            break
        case 'select':
            controller = (
                <Controller
                    name={name}
                    disabled={disabled}
                    render={({ field: { onChange, onBlur, value, disabled } }) => (
                        <Select
                            value={value}
                            options={options!}
                            disabled={disabled}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />
            )
            break
        case 'number': {
            if (Number.isFinite(max) && Number.isFinite(min)) {
                controller = (
                    <Controller
                        name={name}
                        disabled={disabled}
                        render={({ field: { onChange, onBlur, value, disabled } }) => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    step={step}
                                    style={{ width: 200 }}
                                    value={value}
                                    disabled={disabled}
                                    onChange={(event) => onChange(event.target.valueAsNumber)}
                                    onBlur={onBlur}
                                />
                                {value}
                            </div>
                        )}
                    />
                )
            } else {
                controller = (
                    <Controller
                        name={name}
                        disabled={disabled}
                        render={({ field: { onChange, onBlur, value, disabled } }) => {
                            return (
                                <Input
                                    className={styles.fieldInput}
                                    type="number"
                                    min={min}
                                    max={max}
                                    disabled={disabled}
                                    value={Number.isFinite(value) ? value : ''}
                                    onBlur={onBlur}
                                    onChange={(event) => {
                                        const value = event.target.valueAsNumber
                                        onChange(Number.isFinite(value) ? value : null)
                                    }}
                                />
                            )
                        }}
                    />
                )
            }
            break
        }
        default:
            throw new Error('未知的 Field 类型')
    }

    return (
        <label className={clsx(styles.field, { [styles.disabled]: disabled })}>
            {type === 'toggle' ? controller : null}
            <span className={styles.filedLabel}>{label}</span>
            {type !== 'toggle' ? controller : null}
        </label>
    )
}
