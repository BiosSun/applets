import React, { useMemo } from 'react'
import clsx from 'clsx'
import { VStack, HStack } from '@nami-ui/stack'
import moment from 'moment'

import styles from './index.module.scss'
import useLocalState from 'utils/use-local-state.ts'
import semanticTime from './semantic-time'
import useChanged from 'utils/use-changed'

function maybeMillisecondTimestamp(timestamp) {
    return timestamp.toString().length > 10
}

const FORMATS = [
    'YYYY年MM月DD日',
    'YYYY年MM月DD日 HH:mm',
    'YYYY年MM月DD日 Ahh:mm',
    'HH:mm YYYY年MM月DD日',
    'Ahh:mm YYYY年MM月DD日',
]

console.info(FORMATS)

export default function TimeView() {
    return (
        <HStack padding="huge" spacing="large">
            <Time $flex />
            <Duration $flex />
        </HStack>
    )
}

function Time({ ...otherProps }) {
    const [str, setStr] = useLocalState('Time/time', '')
    const [isMillisecondTimestamp, setIsMillisecondTimestamp] = useLocalState(
        'Time/isMillisecondTimestamp',
        false,
    )

    const isStrChanged = useChanged(str)

    const [time, type] = useMemo(() => {
        const value = str.trim()

        if (!value) {
            return [null, 'invalid']
        }

        if (/^\d+$/.test(value)) {
            let timestamp = Number(value)
            let ismts = isMillisecondTimestamp

            if (isStrChanged && !Number.isNaN(timestamp)) {
                ismts = maybeMillisecondTimestamp(timestamp)
                setIsMillisecondTimestamp(ismts)
            }

            if (!ismts) {
                timestamp *= 1000
            }

            return [moment(timestamp), 'timestamp']
        }

        let time = moment(value)

        if (!time.isValid()) {
            time = moment(value, FORMATS)
        }

        if (!time.isValid()) {
            time = semanticTime(value) ?? time
        }

        return [time, 'time']
    }, [str, isStrChanged, isMillisecondTimestamp, setIsMillisecondTimestamp])

    return (
        <VStack {...otherProps} spacing="big">
            <h1>Time</h1>
            <p>解析时间</p>
            <HStack align="center" spacing>
                <input
                    $flex
                    className={styles.input}
                    placeholder="输入一个时间，任意格式"
                    value={str}
                    onChange={(event) => setStr(event.target.value)}
                />
                {type === 'timestamp' ? (
                    <HStack component="label" align="center" spacing="small">
                        <input
                            type="checkbox"
                            checked={isMillisecondTimestamp}
                            onChange={(event) => setIsMillisecondTimestamp(event.target.checked)}
                        />
                        毫秒时间戳
                    </HStack>
                ) : null}
            </HStack>
            {!time ? null : !time.isValid() ? (
                <span>无效的时间</span>
            ) : (
                <VStack spacing>
                    <Label title="format">
                        {time.format('YYYY-MM-DD ddd HH:mm:ss:SSS Z (DDDo wo)')}
                    </Label>
                    <hr />
                    <Label title="ISO8601">{time.toISOString(true)}</Label>
                    <Label title="ISO8601 (UTC)">{time.toISOString()}</Label>
                    <Label title="From Now">{time.fromNow()}</Label>
                    <Label title="Unix">
                        {time.valueOf()} <em>({time.unix()})</em>
                    </Label>
                    <hr />
                    <Label title="Array">{JSON.stringify(time.toArray(), null, 4)}</Label>
                    <Label title="Object" pre>
                        {JSON.stringify(time.toObject(), null, 4)}
                    </Label>
                </VStack>
            )}
        </VStack>
    )
}

function Duration({ ...otherProps }) {
    const [str, setStr] = useLocalState('Time/duration', '')

    const duration = useMemo(() => {
        const value = str.trim()

        if (!value) {
            return null
        }

        if (/^\d+$/.test(value)) {
            return moment.duration(Number(value), 'ms')
        }

        return moment.duration(value)
    }, [str])

    return (
        <VStack {...otherProps} spacing="big">
            <h1>Duration</h1>
            <p>解析时长</p>
            <input
                className={styles.input}
                placeholder="输入一个时长，单位：毫秒"
                value={str}
                onChange={(event) => setStr(event.target.value)}
            />
            {!duration ? null : !duration.isValid() ? (
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
