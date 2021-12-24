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
    withoutTopBorder?: boolean
}

export default function Panel({
    title,
    children,
    note,
    error,
    withoutTopBorder,
    className = undefined,
    ...otherProps
}: PanelProps) {
    return (
        <VStack
            className={clsx(styles.panel, { [styles.error]: error }, className)}
            {...otherProps}
        >
            {!withoutTopBorder ? <Divider /> : null}
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
