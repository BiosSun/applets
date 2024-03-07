import clsx from 'clsx'
import { VStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import styles from './index.module.scss'

interface PanelProps {
    title: string
    subtitle?: any
    note?: any
    children: any
    error?: string
    className?: string
    [otherProp: string]: any
}

export default function Panel({
    title,
    subtitle,
    note,
    children,
    error,
    className = undefined,
    ...otherProps
}: PanelProps) {
    return (
        <VStack
            className={clsx(styles.panel, { [styles.error]: error }, className)}
            {...otherProps}
        >
            <div className={styles.titleBar}>
                <div className={styles.title}>{title}</div>
                {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
                {note ? <div className={styles.note}>{note}</div> : null}
            </div>
            {error ? <div className={styles.errorMessage}>{error}</div> : null}
            <Divider />
            {children}
        </VStack>
    )
}
