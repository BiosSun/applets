import { useMemo } from 'react'
import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

import { VStack, HStack } from '@nami-ui/stack'
import Card from '../../components/card'
import { Toggle } from '../../components/toggle'
import Input from '../../components/input'
import TextButton from '../../components/text-button'

import useLocalState, { updateLocalState } from 'utils/use-local-state.ts'
import useList from 'utils/use-list.ts'
import semanticTime from './semantic-time'

import styles from './index.module.scss'

function maybeMillisecondTimestamp(timestamp) {
    const str = timestamp.toString().trim()
    return /^\d+$/.test(timestamp) && str.length > 10
}

const FORMATS = [
    'YYYY年MM月DD日',
    'YYYY年MM月DD日 HH:mm',
    'YYYY年MM月DD日 Ahh:mm',
    'HH:mm YYYY年MM月DD日',
    'Ahh:mm YYYY年MM月DD日',
]

function createValue(text = '') {
    return {
        text,
        isMillisecondTimestamp: false,
        isExpand: false,
    }
}

function createNode(text = '') {
    return {
        id: uuidv4(),
        value: createValue(text),
    }
}

updateLocalState('Time/time', (value) => {
    if (typeof value === 'string') {
        return [createNode(value)]
    }

    return value
})

export default function TimeView() {
    const list = useList(useLocalState('Time/time', () => [createNode()]))

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
    const [time, valueType, message] = useMemo(() => {
        const text = value.text.trim()
        const ismts = value.isMillisecondTimestamp

        if (!text) {
            return [null, 'invalid']
        }

        if (/^\d+$/.test(text)) {
            let timestamp = Number(text)

            if (!ismts) {
                timestamp *= 1000
            }

            return [dayjs(timestamp), 'timestamp']
        }

        let time = dayjs(text)
        let message = ''

        if (!time.isValid()) {
            time = dayjs(text, FORMATS)
        }

        if (!time.isValid()) {
            try {
                time = semanticTime(text) ?? time
            } catch (error) {
                message = error.message
            }
        }

        return [time, 'time', message]
    }, [value])

    return (
        <VStack className={styles.item} spacing="small">
            <HStack className={styles.itemActions} justify="end" spacing>
                {time && time.isValid() ? (
                    <TextButton
                        $align="end"
                        onClick={() => onChange({ ...value, isExpand: !value.isExpand })}
                    >
                        {value.isExpand ? '收起 -' : '展开 +'}
                    </TextButton>
                ) : null}
                <TextButton onClick={onRemove} disabled={disabledRemove}>
                    删除 x
                </TextButton>
            </HStack>
            <Card style={{ minHeight: 232 }}>
                <TimeInput value={value} valueType={valueType} onChange={onChange} />
                {!time ? null : !time.isValid() ? (
                    <span>{message ?? '无效的时间'}</span>
                ) : (
                    <VStack
                        spacing
                        className={clsx(styles.times, { [styles.expandedTimes]: value.isExpand })}
                    >
                        <Label title="format">{time.format('YYYY-MM-DD ddd HH:mm:ss.SSS Z')}</Label>
                        <hr />
                        <Label title="ISO8601 (UTC)">{time.toISOString()}</Label>
                        <Label title="ISO8601 (Local)">
                            {time.format('YYYY-MM-DDTHH:mm:ss.SSSZZ')}
                        </Label>
                        <Label title="Unix timestamp">
                            {time.valueOf()} <em>({time.unix()})</em>
                        </Label>
                        <Label title="From Now">{time.fromNow()}</Label>
                        <Label title="Week Of Year">{time.week()}</Label>
                        <Label title="Day Of Year">{time.dayOfYear()}</Label>
                        <hr />
                        <Label title="Array">{JSON.stringify(time.toArray(), null, 4)}</Label>
                        <Label title="Object" pre>
                            {JSON.stringify(time.toObject(), null, 4)}
                        </Label>
                    </VStack>
                )}
            </Card>
        </VStack>
    )
}

function TimeInput({ value, valueType, onChange, ...otherProps }) {
    return (
        <HStack {...otherProps} spacing>
            <Input
                $flex
                placeholder="输入一个时间，任意格式"
                monospace
                autoFocus
                value={value.text}
                onChange={(text) =>
                    onChange({ text, isMillisecondTimestamp: maybeMillisecondTimestamp(text) })
                }
            />
            {valueType === 'timestamp' ? (
                <Toggle
                    label="毫秒时间戳"
                    value={value.isMillisecondTimestamp}
                    onChange={(isMillisecondTimestamp) =>
                        onChange({ ...value, isMillisecondTimestamp })
                    }
                />
            ) : null}
        </HStack>
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
