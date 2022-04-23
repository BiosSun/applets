import clsx from 'clsx'
import styles from './index.module.scss'

interface InputProps {
    value: string
    className?: string
    placeholder?: string
    monospace?: boolean
    onChange: (value: string) => void
}

export default function Input({ className, value, placeholder, monospace, onChange, ...otherProps }: InputProps) {
    return (
        <input
            className={clsx(styles.input, { [styles.monospaceInput]: monospace }, className)}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            {...otherProps}
        />
    )
}
