import { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './index.module.scss'

export interface SpaceProps {
    className?: string
    children?: ReactNode
}

export function Space(props: SpaceProps) {
    return <div className={clsx(styles.space, props.className)} {...props} />
}
