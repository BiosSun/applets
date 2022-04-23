import clsx from 'clsx'
import { VStack } from '@nami-ui/stack'
import styles from './index.module.scss'

interface CardProps {
    className?: string
    children: any
}

export default function Card({ children, className, ...otherProps }: CardProps) {
    return (
        <VStack className={clsx(styles.card, className)} spacing padding {...otherProps}>
            {children}
        </VStack>
    )
}
