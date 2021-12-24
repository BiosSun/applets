import { useMemo } from 'react'
import clsx from 'clsx'
import { VStack, HStack } from '@nami-ui/stack'
import dayjs from 'dayjs'

import styles from './index.module.scss'
import useLocalState from 'utils/use-local-state.ts'

export default function DurationView() {
    const [str, setStr] = useLocalState('Time/duration', '')

    const duration = useMemo(() => {
        const value = str.trim()

        if (!value) {
            return null
        }

        if (/^\d+$/.test(value)) {
            return dayjs.duration(Number(value), 'ms')
        }

        return dayjs.duration(value)
    }, [str])

    return (
        <VStack padding spacing>
            <input
                className={styles.input}
                placeholder="输入一个时长，单位：毫秒"
                value={str}
                onChange={(event) => setStr(event.target.value)}
            />
            {!duration ? null : !Number.isFinite(duration.milliseconds()) ? (
                <span>无效的时间</span>
            ) : (
                <VStack spacing>
                    <Label title="Humanize">{duration.humanize()}</Label>
                    <hr />
                    <Label title="Years">
                        {duration.years()} <em>( as {Math.floor(duration.asYears())} )</em>
                    </Label>
                    <Label title="Months">
                        {duration.months()} <em>( as {Math.floor(duration.asMonths())} )</em>
                    </Label>
                    <Label title="Weeks">
                        {duration.weeks()} <em>( as {Math.floor(duration.asWeeks())} )</em>
                    </Label>
                    <Label title="Days">
                        {duration.days()} <em>( as {Math.floor(duration.asDays())} )</em>
                    </Label>
                    <hr />
                    <Label title="Hours">
                        {duration.hours()} <em>( as {Math.floor(duration.asHours())} )</em>
                    </Label>
                    <Label title="seconds">
                        {duration.seconds()} <em>( as {Math.floor(duration.asSeconds())} )</em>
                    </Label>
                    <Label title="Milliseconds">
                        {duration.milliseconds()}{' '}
                        <em>( as {Math.floor(duration.asMilliseconds())} )</em>
                    </Label>
                </VStack>
            )}
        </VStack>
    )
}

function Label({ title, children, pre, className, ...otherProps }) {
    return (
        <HStack
            key="array"
            className={clsx(styles.label, className)}
            spacing="small"
            {...otherProps}
        >
            <span className={styles.labelTitle}>{title}:</span>
            <span className={clsx(styles.labelValue, pre && styles.labelPreValue)} $flex>
                {children}
            </span>
        </HStack>
    )
}
