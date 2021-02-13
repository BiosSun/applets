import React, { CSSProperties, useCallback, useMemo, useState, MouseEvent, useRef } from 'react'
import _ from 'lodash'
import { v4 as uuid } from 'uuid'
import clsx from 'clsx'
import dayjs, { Dayjs } from 'dayjs'
import duration, { Duration } from 'dayjs/plugin/duration'
import { CheckBox } from '@biossun/nami'
import { Button } from '@nami-ui/button'
import { HStack, VStack, StackItemProps } from '@nami-ui/stack'
import { Space } from '@nami-ui/space'
import { TextBox } from '@nami-ui/textbox'
import useLocalState, { updateLocalState } from 'utils/use-local-state'
import useAnimationFrame from 'utils/use-animation-frame'
import useNotification from 'utils/use-notification'
import { useActions } from 'utils/use-actions'
import { Popover, Popconfirm } from 'antd'
import { useInterval } from 'react-use'
import styles from './index.module.scss'
import audioUrl from './audio.mp3'
import useForceUpdate from 'utils/use-force-update'

dayjs.extend(duration)

interface TimeRange {
    start: number
    end?: number
}

interface TimeRecord {
    id: string
    time: number
    desc: string
}

interface Timer {
    id: string
    ended: boolean
    paused: boolean
    desc: string
    ranges: TimeRange[]
    records: TimeRecord[]
}

interface Info {
    timers: Timer[]
    current: string
}

class InfoActions {
    data: Info

    private getTimer(id: string | Timer): Timer | undefined {
        return typeof id === 'string' ? this.data.timers.find((v) => v.id === id) : id
    }

    private getRecord(
        timerId: string | Timer,
        recordId: string | TimeRecord,
    ): TimeRecord | undefined {
        const timer = this.getTimer(timerId)

        if (timer === undefined) {
            return undefined
        }

        return typeof recordId === 'string'
            ? timer.records.find((v) => v.id === recordId)
            : recordId
    }

    changeCurrent(id: string) {
        this.data.current = id
    }

    startTimer(id?: string | Timer) {
        if (!id) {
            id = uuid()
            this.data.timers.unshift({
                id,
                ended: false,
                paused: false,
                desc: '',
                ranges: [{ start: Date.now() }],
                records: [],
            })
            this.data.current = id
        } else {
            const timer = this.getTimer(id)
            if (timer) {
                timer.ended = false
            }
            this.data.current = timer.id
        }
    }

    removeTimer(id: string | Timer) {
        const { timers } = this.data
        const index = timers.findIndex((timer) => timer.id === id)

        if (index !== -1) {
            timers.splice(index, 1)
            this.data.current = index === 0 ? timers[0]?.id : timers[index - 1].id
        }
    }

    endTimer(id: string) {
        const timer = this.getTimer(id)
        if (timer) {
            timer.ended = true
            this.pauseTimer(timer)
        }
    }

    playTimer(id: string) {
        const timer = this.getTimer(id)
        if (timer) {
            if (timer.ended) {
                this.startTimer(timer)
            }

            const range = timer.ranges[timer.ranges.length - 1]

            if (range.end) {
                timer.ranges.push({ start: Date.now() })
            }

            timer.paused = false
        }
    }

    pauseTimer(id: string | Timer) {
        const timer = this.getTimer(id)

        if (timer) {
            const range = timer.ranges[timer.ranges.length - 1]

            if (!range.end) {
                range.end = Date.now()
            }

            timer.paused = true
        }
    }

    changeTimerDesc(timerId: string, desc: string) {
        const timer = this.getTimer(timerId)
        if (timer) {
            timer.desc = desc
        }
    }

    insertRecord() {
        this.data.timers[0].records.unshift({ id: uuid(), time: Date.now(), desc: '' })
    }

    removeRecord(timerId: string, recordId: string) {
        const timer = this.getTimer(timerId)
        timer.records = timer.records.filter((record) => record.id !== recordId)
    }

    changeRecordDesc(timerId: string, recordId: string, desc: string) {
        const record = this.getRecord(timerId, recordId)
        if (record) {
            record.desc = desc
        }
    }
}

updateLocalState('Stopwatch/info', (value: unknown) => {
    if (Array.isArray(value)) {
        return {
            timers: value,
            current: value[0]?.id ?? undefined,
        }
    } else {
        return value
    }
})

export default function StopwatchView() {
    const [info, setInfo] = useLocalState<Info>('Stopwatch/info', {
        timers: [],
        current: undefined,
    })
    const actions = useActions(info, setInfo, InfoActions)
    const [isShowMillisecond, setShowMillisecond] = useLocalState('Stopwatch/showMillisecond', true)
    const [isNotification, setNotification] = useLocalState('Stopwatch/notification', false)

    const currentTimer = useMemo(() => {
        return info.timers.find((timer) => timer.id === info.current)
    }, [info])

    return (
        <VStack className={styles.container} padding="large" spacing>
            <h1>计时器</h1>
            <p>记录并查看耗时</p>

            <DurationClock
                ranges={currentTimer?.ranges}
                millisecond={isShowMillisecond}
                notification={isNotification}
            />

            <HStack spacing align="center" justify="center">
                {!currentTimer || currentTimer?.ended ? (
                    <Button onClick={() => actions.startTimer()}>开始</Button>
                ) : (
                    <Button onClick={() => actions.endTimer(currentTimer.id)}>结束</Button>
                )}
                {currentTimer?.paused ? (
                    <Button onClick={() => actions.playTimer(currentTimer.id)}>继续</Button>
                ) : (
                    <Button onClick={() => actions.pauseTimer(currentTimer.id)}>暂停</Button>
                )}
                <Button onClick={() => actions.insertRecord()}>记录</Button>
            </HStack>

            <HStack spacing align="center" justify="center">
                <CheckBox
                    label="显示毫秒"
                    checked={isShowMillisecond}
                    onChange={(_, __, checked) => setShowMillisecond(checked)}
                />
                <CheckBox
                    label="每 30分钟 提醒一次"
                    checked={isNotification}
                    onChange={(_, __, checked) => {
                        setNotification(checked)
                        Notification.requestPermission()
                    }}
                />
            </HStack>

            <VStack spacing>
                {info.timers.map((timer, timerIndex) => (
                    <VStack
                        className={clsx(styles.timer, {
                            [styles.currentTimer]: timer.id === currentTimer?.id,
                        })}
                        spacing
                        key={timer.id}
                    >
                        <HStack align="center">
                            <TextBox
                                placeholder="描述"
                                $col={12}
                                value={timer.desc}
                                onChange={(value) => actions.changeTimerDesc(timer.id, value)}
                            />
                            <Space $flex />
                            <CurrentButton onClick={() => actions.changeCurrent(timer.id)} />
                            <Space />
                            <DeleteButton onClick={() => actions.removeTimer(timer.id)} />
                        </HStack>
                        <Timeline timer={timer} actions={actions} />
                    </VStack>
                ))}
            </VStack>
        </VStack>
    )
}

function DurationClock({
    ranges = [],
    millisecond = false,
    notification = false,
}: {
    ranges: TimeRange[]
    millisecond: boolean
    notification: boolean
}) {
    const [duration, setDuration] = useState<number>(0)

    useAnimationFrame(() => {
        setDuration(
            ranges
                .map((range) => (range.end ?? Date.now()) - range.start)
                .reduce((total, duration) => total + duration, 0),
        )
    })

    const [sendedSecond, setSendedSecond] = useState(0)

    useNotification(() => {
        const second = Math.floor(duration / 1000)

        if (notification && second !== sendedSecond && second % (30 * 60) === 0) {
            setSendedSecond(second)
            return { title: '整点报时', sound: audioUrl }
        }
    }, [duration, notification])

    return (
        <DurationText
            className={styles.durationClock}
            duration={duration}
            millisecond={millisecond}
        />
    )
}

function DurationText({
    duration,
    className,
    millisecond = false,
}: {
    duration: Duration | number
    millisecond?: boolean
    className?: string
}) {
    duration = dayjs.duration(duration)

    let format = 'mm:ss'

    if (millisecond) {
        format += '.SSS'
    }

    if (duration.hours()) {
        format = 'HH:' + format
    }

    return (
        <HStack className={clsx(styles.duration, className)}>
            {duration
                .format(format)
                .split('')
                .map((char, index) => (
                    <span key={index} className={styles.char} data-char={char}>
                        {char}
                    </span>
                ))}
        </HStack>
    )
}

function Timeline({
    timer,
    className,
    actions,
}: { timer: Timer; className?: string; actions: InfoActions } & StackItemProps) {
    const start = timer.ranges[0].start
    const end = timer.ranges[timer.ranges.length - 1].end ?? Date.now()
    const duration = end - start
    const lineRef = useRef<HTMLDivElement>(null)
    const [timePercentByPointer, setTimePercentByPointer] = useState(undefined)

    const forceUpdate = useForceUpdate()
    useInterval(forceUpdate, 1000)

    const enableAndUpdateTimeByPointer = useCallback((event: MouseEvent<HTMLDivElement>) => {
        const line = lineRef.current
        const rect = line.getBoundingClientRect()
        const percent = _.clamp((event.clientX - rect.left) / rect.width, 0, 1)
        setTimePercentByPointer(percent)
    }, [])

    const disableTimeByPointer = useCallback(() => {
        setTimePercentByPointer(undefined)
    }, [])

    const timeByPointer =
        timePercentByPointer !== undefined
            ? Math.round((end - start) * timePercentByPointer) + start
            : undefined

    return (
        <div className={clsx(styles.timeline, className)}>
            <div
                className={styles.line}
                ref={lineRef}
                onMouseEnter={enableAndUpdateTimeByPointer}
                onMouseMove={enableAndUpdateTimeByPointer}
                onMouseLeave={disableTimeByPointer}
            >
                {timer.ranges.map((range, index) => (
                    <div
                        key={index}
                        className={styles.range}
                        style={
                            {
                                '--range-start': (range.start - start) / duration,
                                '--range-end': ((range.end ?? Date.now()) - start) / duration,
                            } as CSSProperties
                        }
                    ></div>
                ))}
                {timer.records.map((record) => (
                    <TimelineRecord
                        key={record.id}
                        record={record}
                        position={(record.time - start) / duration}
                        onChangeDesc={(desc) => actions.changeRecordDesc(timer.id, record.id, desc)}
                        onRemove={() => actions.removeRecord(timer.id, record.id)}
                    />
                ))}
            </div>
            <div className={styles.time}>
                <TimeText className={styles.start} time={start} />
                <TimeText className={styles.end} time={end} />
                {timeByPointer !== undefined ? (
                    <TimeText
                        className={styles.timeByPointer}
                        style={{ '--percent': timePercentByPointer * 100 + '%' } as CSSProperties}
                        time={timeByPointer}
                    />
                ) : null}
            </div>
        </div>
    )
}

function TimelineRecord({
    record,
    position,
    onChangeDesc,
    onRemove,
}: {
    record: TimeRecord
    position: number
    onChangeDesc: (desc: string) => void
    onRemove: () => void
}) {
    const content = (
        <VStack spacing="small">
            <TextBox
                value={record.desc}
                onChange={(value) => onChangeDesc(value)}
                placeholder="描述"
            />
            <HStack justify="end">
                <Popconfirm title="你确认要删除该条记录吗？" onConfirm={onRemove}>
                    <button>删除</button>
                </Popconfirm>
            </HStack>
        </VStack>
    )

    return (
        <Popover content={content} title="记录">
            <div
                key={record.id}
                className={styles.record}
                style={{ '--record-position': position } as CSSProperties}
            ></div>
        </Popover>
    )
}

function TimeText({
    time,
    className,
    style,
}: {
    time: Dayjs | number
    className?: string
    style?: CSSProperties
}) {
    return (
        <HStack className={clsx(styles.time, className)} style={style}>
            {dayjs(time)
                .format('YYYY-MM-DD HH:mm:ss')
                .split('')
                .map((char, index) => (
                    <span key={index} className={styles.char} data-char={char}>
                        {char}
                    </span>
                ))}
        </HStack>
    )
}

function CurrentButton({ onClick }: { onClick: () => void }) {
    return (
        <button className={styles.delete} onClick={onClick}>
            当前
        </button>
    )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
    return (
        <button className={styles.delete} onClick={onClick}>
            x 删除
        </button>
    )
}