import clsx from 'clsx'
import { VStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import styles from './index.module.scss'

interface PanelProps {
    title: string
    children: any
    note?: any
    error?: string
    className?: string
}

export default function Panel({
    title,
    children,
    note,
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
                {note ? <div className={styles.note}>{note}</div> : null}
            </div>
            {error ? <div className={styles.errorMessage}>{error}</div> : null}
            <Divider />
            {children}
        </VStack>
    )
}
