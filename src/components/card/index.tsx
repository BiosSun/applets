import clsx from 'clsx'
import { Flex } from '@radix-ui/themes'
import styles from './index.module.scss'

interface CardProps {
    className?: string
    children: any
}

export default function Card({ children, className, ...otherProps }: CardProps) {
    return (
        <Flex
            direction="column"
            className={clsx(styles.card, className)}
            p="3"
            gap="3"
            {...otherProps}
        >
            {children}
        </Flex>
    )
}
