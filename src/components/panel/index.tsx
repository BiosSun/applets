import clsx from 'clsx'
import { VStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import styles from './index.module.scss'

export default function Panel({ title, children, error, className = undefined, ...otherProps }) {
    return (
        <VStack
            className={clsx(styles.panel, { [styles.error]: error }, className)}
            {...otherProps}
        >
            <Divider />
            <div className={styles.label}>{title}</div>
            {error ? <div className={styles.errorMessage}>{error}</div> : null}
            <Divider />
            {children}
        </VStack>
    )
}
