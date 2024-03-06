import clsx from 'clsx'
import { forwardRef, ChangeEvent, FocusEvent } from 'react'
import styles from './index.module.scss'

interface InputProps {
    value?: string
    defaultValue?: string
    className?: string
    placeholder?: string
    monospace?: boolean
    type?: string
    min?: number | string
    max?: number | string
    disabled?: boolean
    onBlur?: (value: FocusEvent<HTMLInputElement>) => void
    onChange?: (value: ChangeEvent<HTMLInputElement>) => void
}

export default forwardRef<HTMLInputElement, InputProps>(function Input(
    { className, value, defaultValue, placeholder, monospace, disabled, onChange, ...otherProps },
    ref
) {
    return (
        <input
            ref={ref}
            className={clsx(styles.input, { [styles.monospaceInput]: monospace }, className)}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={(event) => onChange?.(event)}
            {...otherProps}
        />
    )
})
