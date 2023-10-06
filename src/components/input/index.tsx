import clsx from 'clsx'
import { forwardRef, ChangeEvent } from 'react'
import styles from './index.module.scss'

interface InputProps {
    value?: string
    defaultValue?: string
    className?: string
    placeholder?: string
    monospace?: boolean
    onChange?: (value: ChangeEvent<HTMLInputElement>) => void
}

export default forwardRef<HTMLInputElement, InputProps>(function Input(
    { className, value, defaultValue, placeholder, monospace, onChange, ...otherProps },
    ref
) {
    return (
        <input
            ref={ref}
            className={clsx(styles.input, { [styles.monospaceInput]: monospace }, className)}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={(event) => onChange?.(event)}
            {...otherProps}
        />
    )
})
