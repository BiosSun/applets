import { useMemo } from 'react'
import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'
import produce from 'immer'
import dayjs from 'dayjs'
import { VStack, HStack } from '@nami-ui/stack'

import useLocalState, { updateLocalState } from 'utils/use-local-state.ts'
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

function createNode(text = '') {
    return {
        id: uuidv4(),
        value: {
            text,
            isMillisecondTimestamp: false,
            isExpand: false,
        },
    }
}

updateLocalState('Time/time', (value) => {
    if (typeof value === 'string') {
        return [createNode(value)]
    }

    return value
})

export default function TimeView() {
    const [textList, setTextList] = useLocalState('Time/time', () => [createNode()])

    function add() {
        setTextList(
            produce(textList, (list) => {
                list.push(createNode())
            })
        )
    }

    function change(id, value) {
        setTextList(
            produce(textList, (list) => {
                list.find((node) => node.id === id).value = value
            })
        )
    }

    function clean(id) {
        setTextList(
            produce(textList, (list) => {
                const item = list.find((node) => node.id === id)

                if (item) {
                    item.value = {
                        text: '',
                        isMillisecondTimestamp: false,
                        isExpand: false,
                    }
                }
            })
        )
    }

    function remove(id) {
        setTextList(
            produce(textList, (list) => {
                return list.filter((node) => node.id !== id)
            })
        )
    }

    return (
        <VStack padding="huge" spacing="large">
            <h1>Time</h1>
            <p>解析时间</p>
            <div className={styles.track}>
                {textList.map((node) => (
                    <Item
                        key={node.id}
                        value={node.value}
                        disabledRemove={textList.length === 1 && !textList[0].value.text?.trim()}
                        onChange={(value) => change(node.id, value)}
                        onRemove={() => (textList.length > 1 ? remove(node.id) : clean(node.id))}
                    />
                ))}
                <button className={styles.addButton} onClick={add}>
                    + 添加
                </button>
            </div>
        </VStack>
    )
}

function Item({ value, onChange, onRemove, disabledRemove }) {
    const [time, valueType] = useMemo(() => {
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

        if (!time.isValid()) {
            time = dayjs(text, FORMATS)
        }

        if (!time.isValid()) {
            time = semanticTime(text) ?? time
        }

        return [time, 'time']
    }, [value])

    return (
        <VStack className={styles.item} spacing="small">
            <HStack className={styles.itemActions} justify="end" spacing>
                {time && time.isValid() ? (
                    <button
                        className={styles.button}
                        $align="end"
                        onClick={() => onChange({ ...value, isExpand: !value.isExpand })}
                    >
                        {value.isExpand ? '收起 -' : '展开 +'}
                    </button>
                ) : null}
                <button className={styles.button} onClick={onRemove} disabled={disabledRemove}>
                    删除 x
                </button>
            </HStack>
            <VStack className={styles.card} spacing padding>
                <Input value={value} valueType={valueType} onChange={onChange} />
                {!time ? null : !time.isValid() ? (
                    <span>无效的时间</span>
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
            </VStack>
        </VStack>
    )
}

function Input({ value, valueType, onChange, ...otherProps }) {
    return (
        <HStack {...otherProps} spacing>
            <input
                $flex
                autoFocus
                className={styles.input}
                placeholder="输入一个时间，任意格式"
                value={value.text}
                onChange={(event) =>
                    onChange({
                        text: event.target.value,
                        isMillisecondTimestamp: maybeMillisecondTimestamp(event.target.value),
                    })
                }
            />
            {valueType === 'timestamp' ? (
                <HStack component="label" align="center" spacing="small">
                    <input
                        type="checkbox"
                        checked={value.isMillisecondTimestamp}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                isMillisecondTimestamp: event.target.checked,
                            })
                        }
                    />
                    毫秒时间戳
                </HStack>
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
