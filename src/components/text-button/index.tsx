import clsx from 'clsx'
import { Button, ButtonProps } from '@/components/button'
import styles from './index.module.scss'

interface TextButtonProps extends ButtonProps {
    onClick: () => void
}

export default function TextButton({ className, ...otherProps }: TextButtonProps) {
    return <Button className={clsx(styles.button, className)} {...otherProps} />
}
