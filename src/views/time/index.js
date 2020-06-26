import React, { useState, useMemo, Fragment } from 'react'
import clsx from 'clsx'
import { VLinear, HLinear, Divider } from '@biossun/nami'
import moment from 'moment'
import 'moment/locale/zh-cn'

import styles from './index.module.scss'

moment.locale('zh-cn')

export default function TimeView() {
    return (
        <VLinear padding="large" spacing>
            <HLinear spacing>
                <Time $flex />
                <Duration $flex />
            </HLinear>
        </VLinear>
    )
}

function Time({ ...otherProps }) {
    const [str, setStr] = useState('')

    const time = useMemo(() => {
        const value = str.trim()

        if (!value) {
            return null
        }

        if (/^\d+$/.test(value)) {
            return moment(Number(value))
        }

        return moment(value)
    }, [str])

    return (
        <VLinear {...otherProps} spacing>
            <h1>Time</h1>
            <p>解析时间</p>
            <input
                className={styles.input}
                placeholder="输入一个时间，任意格式"
                value={str}
                onChange={(event) => setStr(event.target.value)}
            />
            {!time ? null : !time.isValid() ? (
                <span>无效的时间</span>
            ) : (
                <VLinear spacing>
                    <Label key="unix" title="format">
                        {time.format('YYYY-MM-DD ddd HH:mm:ss:SSS Z (DDDo wo)')}
                    </Label>
                    <Divider />
                    <Label key="unix" title="ISO8601">
                        {time.toISOString(true)}
                    </Label>
                    <Label key="unix" title="ISO8601 (UTC)">
                        {time.toISOString()}
                    </Label>
                    <Label key="from-now" title="From Now">
                        {time.fromNow()}
                    </Label>
                    <Label key="unix" title="Unix">
                        {time.valueOf()} <em>({time.unix()})</em>
                    </Label>
                    <Divider />
                    <Label key="array" title="Array">
                        {JSON.stringify(time.toArray(), null, 4)}
                    </Label>
                    <Label key="array" title="Object" pre>
                        {JSON.stringify(time.toObject(), null, 4)}
                    </Label>
                </VLinear>
            )}
        </VLinear>
    )
}

function Duration({ ...otherProps }) {
    const [str, setStr] = useState('')

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
        <VLinear {...otherProps} spacing>
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
                <VLinear spacing>
                    <Label key="unix" title="Humanize">
                        {duration.humanize()}
                    </Label>
                    <Divider />
                    <Label key="unix" title="Years">
                        {duration.years()} <em>( as {Math.floor(duration.asYears())} )</em>
                    </Label>
                    <Label key="unix" title="Months">
                        {duration.months()} <em>( as {Math.floor(duration.asMonths())} )</em>
                    </Label>
                    <Label key="unix" title="Weeks">
                        {duration.weeks()} <em>( as {Math.floor(duration.asWeeks())} )</em>
                    </Label>
                    <Label key="unix" title="Days">
                        {duration.days()} <em>( as {Math.floor(duration.asDays())} )</em>
                    </Label>
                    <Divider />
                    <Label key="unix" title="Hours">
                        {duration.hours()} <em>( as {Math.floor(duration.asHours())} )</em>
                    </Label>
                    <Label key="unix" title="seconds">
                        {duration.seconds()} <em>( as {Math.floor(duration.asSeconds())} )</em>
                    </Label>
                    <Label key="unix" title="Milliseconds">
                        {duration.milliseconds()}{' '}
                        <em>( as {Math.floor(duration.asMilliseconds())} )</em>
                    </Label>
                </VLinear>
            )}
        </VLinear>
    )
}

function Label({ title, children, pre, className, ...otherProps }) {
    return (
        <HLinear
            key="array"
            className={clsx(styles.label, className)}
            spacing="small"
            {...otherProps}
        >
            <span className={styles.labelTitle}>{title}:</span>
            <span className={clsx(styles.labelValue, pre && styles.labelPreValue)} $flex>
                {children}
            </span>
        </HLinear>
    )
}
