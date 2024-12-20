import { useMemo } from 'react'
import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'

import { Flex, Box, Separator } from '@radix-ui/themes'
import Card from '../../components/card'
import { Toggle } from '../../components/toggle'
import Input from '../../components/input'
import TextButton from '../../components/text-button'

import useLocalState, { updateLocalState } from '@/utils/use-local-state.ts'
import useList from '@/utils/use-list.ts'
import semanticTime from './semantic-time'
import { maybeMillisecondTimestamp, parseTime, parseTimestamp } from './utils'

import styles from './index.module.scss'

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

    function copy(id) {
        const index = list.getIndex(id)
        const node = list.get(id)
        const newNode = createNode()
        newNode.value = node.value
        list.add(newNode, index + 1)
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
        <Flex direction={'column'}>
            <div className={styles.track}>
                {list.items.map((node) => (
                    <Item
                        key={node.id}
                        value={node.value}
                        disabledRemove={disabledRemove}
                        onChange={(value) => change(node.id, value)}
                        onRemove={() => remove(node.id)}
                        onCopy={() => copy(node.id)}
                    />
                ))}
                <TextButton className={styles.addButton} onClick={add}>
                    + 添加
                </TextButton>
            </div>
            <Separator size={'4'} />
            <div className={styles.tutorial}>
                支持格式如下所示：
                <dl>
                    <dt>时间：</dt>
                    <dd>2023-02-20</dd>
                    <dd>2023-02-20 19:20:34.192</dd>
                </dl>
                <dl>
                    <dt>时间戳：</dt>
                    <dd>1676892034（秒）</dd>
                    <dd>1676892034192（毫秒）</dd>
                </dl>
                <dl>
                    <dt>关键字：</dt>
                    <dd>now</dd>
                    <dd>today</dd>
                </dl>
                <dl>
                    <dt>表达式：</dt>
                    <dd>now 3h（当前时间，但小时数设置为 3 点）</dd>
                    <dd>now +3h（当前时间，加 3 小时）</dd>
                    <dd>now -3h（当前时间，减 3 小时）</dd>
                    <dd>now &lt;h（当前小时的开始时间）</dd>
                    <dd>now &gt;h（当前小时的结束时间）</dd>
                    <dd>now &gt;d +1y -3M 0m 0s 0ms（组合操作）</dd>
                    <dd>now, &gt;d, +1y, -3M, 0m 0s 0ms（另外可以使用逗号作为分隔符）</dd>
                </dl>
                <dl>
                    <dt>表达式中的单位：</dt>
                    <dd>y - 年</dd>
                    <dd>M - 月</dd>
                    <dd>d - 日</dd>
                    <dd>h - 时</dd>
                    <dd>m - 分</dd>
                    <dd>s - 秒</dd>
                    <dd>ms - 毫秒</dd>
                </dl>
                <dl>
                    <dt>更多示例：</dt>
                    <dd>today - 1d</dd>
                    <dd>1676892034192 - 1d</dd>
                    <dd>(2023-02-20 19:20:34.192) - 1d</dd>
                    <dd>2023y 2M 20d 19h 20m 34s 192ms -1d</dd>
                </dl>
            </div>
        </Flex>
    )
}

function Item({ value, onChange, onRemove, onCopy, disabledRemove }) {
    const [time, valueType, message] = useMemo(() => {
        const text = value.text.trim()
        const ismts = value.isMillisecondTimestamp

        if (!text) {
            return [null, 'invalid']
        }

        if (/^\d+$/.test(text)) {
            const time = parseTimestamp(text, ismts)
            return [time, 'timestamp']
        }

        let time = parseTime(text)
        let message = ''

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
        <Flex className={styles.item} direction={'column'} gap={'2'}>
            <Flex className={styles.itemActions} gap={'3'} justify="end">
                {time && time.isValid() ? (
                    <TextButton onClick={() => onChange({ ...value, isExpand: !value.isExpand })}>
                        {value.isExpand ? '收起 ^' : '展开 v'}
                    </TextButton>
                ) : null}
                <TextButton onClick={onCopy}>复制 %</TextButton>
                <TextButton onClick={onRemove} disabled={disabledRemove}>
                    删除 x
                </TextButton>
            </Flex>
            <Card style={{ minHeight: 232 }}>
                <TimeInput value={value} valueType={valueType} onChange={onChange} />
                {!time ? null : !time.isValid() ? (
                    <span>{message ?? '无效的时间'}</span>
                ) : (
                    <Flex
                        className={clsx(styles.times, { [styles.expandedTimes]: value.isExpand })}
                        direction={'column'}
                        gap={'3'}
                    >
                        <Label title="format">{time.format('YYYY-MM-DD ddd HH:mm:ss.SSS Z')}</Label>
                        <Separator size={'4'} />
                        <Label title="ISO8601 (UTC)">
                            {time.utc().format('YYYY-MM-DD')}
                            <em>T</em>
                            {time.utc().format('HH:mm:ss.SSS')}
                            <em>Z</em>
                        </Label>
                        <Label title="ISO8601 (Local)">
                            {time.format('YYYY-MM-DD')}
                            <em>T</em>
                            {time.format('HH:mm:ss.SSS')}
                            <em>{time.format('ZZ')}</em>
                        </Label>
                        <Label title="Unix timestamp">
                            {time.valueOf()}
                            <span style={{ userSelect: 'none' }}>ms</span>
                            <em>
                                ({time.unix()}
                                <span style={{ userSelect: 'none' }}>s</span>)
                            </em>
                        </Label>
                        <Label title="From Now">{time.fromNow()}</Label>
                        {value.isExpand ? (
                            <>
                                <Label title="Week Of Year">{time.week()}</Label>
                                <Label title="Day Of Year">{time.dayOfYear()}</Label>
                                <Separator size={'4'} />
                                <Label title="Array">
                                    {JSON.stringify(time.toArray(), null, 4)}
                                </Label>
                                <Label title="Object" pre>
                                    {JSON.stringify(time.toObject(), null, 4)}
                                </Label>
                            </>
                        ) : null}
                    </Flex>
                )}
            </Card>
        </Flex>
    )
}

function TimeInput({ value, valueType, onChange, ...otherProps }) {
    return (
        <Flex {...otherProps} gap={'3'}>
            <Box asChild flexGrow={'1'}>
                <Input
                    placeholder="输入一个时间，任意格式"
                    monospace
                    autoFocus
                    value={value.text}
                    onChange={(event) =>
                        onChange({
                            text: event.target.value,
                            isMillisecondTimestamp: maybeMillisecondTimestamp(event.target.value),
                        })
                    }
                />
            </Box>
            {valueType === 'timestamp' ? (
                <Toggle
                    label="毫秒时间戳"
                    value={value.isMillisecondTimestamp}
                    onChange={(isMillisecondTimestamp) =>
                        onChange({ ...value, isMillisecondTimestamp })
                    }
                />
            ) : null}
        </Flex>
    )
}

function Label({ title, children, pre, className, ...otherProps }) {
    return (
        <Flex key="array" className={clsx(styles.label, className)} gap={'2'} {...otherProps}>
            <span className={styles.labelTitle}>{title}:</span>
            <span className={clsx(styles.labelValue, pre && styles.labelPreValue)}>
                {children}
            </span>
        </Flex>
    )
}
