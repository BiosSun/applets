import { useMemo } from 'react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

import { VStack, HStack } from '@nami-ui/stack'
import Card from '../../components/card'
import Input from '../../components/input'
import TextButton from '../../components/text-button'

import useLocalState, { updateLocalState } from 'utils/use-local-state.ts'
import useList from 'utils/use-list.ts'

import styles from './index.module.scss'

function createValue(text = '') {
    return {
        text,
    }
}

function createNode(text = '') {
    return {
        id: uuidv4(),
        value: createValue(text),
    }
}

updateLocalState('Time/duration', (value) => {
    if (typeof value === 'string') {
        return [createNode(value)]
    }

    return value
})

export default function DurationView() {
    const list = useList(useLocalState('Time/duration', () => [createNode()]))

    const disabledRemove = list.length === 1 && !list.items[0].value.text?.trim()

    function add() {
        list.add(createNode())
    }

    function change(id, value) {
        list.change(id, 'value', value)
    }

    function remove(id) {
        if (list.length > 1) {
            list.remove(id)
        } else {
            list.change(id, 'value', createValue())
        }
    }

    return (
        <div className={styles.track}>
            {list.items.map((node) => (
                <Item
                    key={node.id}
                    value={node.value}
                    disabledRemove={disabledRemove}
                    onChange={(value) => change(node.id, value)}
                    onRemove={() => remove(node.id)}
                />
            ))}
            <TextButton className={styles.addButton} onClick={add}>
                + 添加
            </TextButton>
        </div>
    )
}

function Item({ value, onChange, onRemove, disabledRemove }) {
    const duration = useMemo(() => {
        const duration = value.text.trim()

        if (!duration) {
            return null
        }

        if (/^\d+$/.test(duration)) {
            return dayjs.duration(Number(duration), 'ms')
        }

        return dayjs.duration(duration)
    }, [value])

    return (
        <VStack className={styles.item} spacing="small">
            <HStack className={styles.itemActions} justify="end" spacing>
                <TextButton onClick={onRemove} disabled={disabledRemove}>
                    删除 x
                </TextButton>
            </HStack>
            <Card>
                <TimeInput value={value} onChange={onChange} />
                <div className={styles.content}>
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
                                {duration.months()}{' '}
                                <em>( as {Math.floor(duration.asMonths())} )</em>
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
                                {duration.seconds()}{' '}
                                <em>( as {Math.floor(duration.asSeconds())} )</em>
                            </Label>
                            <Label title="Milliseconds">
                                {duration.milliseconds()}{' '}
                                <em>( as {Math.floor(duration.asMilliseconds())} )</em>
                            </Label>
                        </VStack>
                    )}
                </div>
            </Card>
        </VStack>
    )
}

function TimeInput({ value, onChange, ...otherProps }) {
    return (
        <Input
            {...otherProps}
            placeholder="输入一个时长，单位：毫秒"
            monospace
            autoFocus
            value={value.text}
            onChange={(text) => onChange({ text })}
        />
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
