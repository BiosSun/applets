import clsx from 'clsx'
import styles from './index.module.scss'

interface TextButtonProps {
    text: string
    onClick: () => void
    disabled?: boolean
    className?: string
}

export default function TextButton({ text, className, ...otherProps }: TextButtonProps) {
    return (
        <button className={clsx(styles.button, className)} type="button" {...otherProps}>
            {text}
        </button>
    )
}
