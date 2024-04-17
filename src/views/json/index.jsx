import { useMemo, createContext, useContext, useState, useEffect, useRef } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useToggle } from 'react-use'
import * as Comlink from 'comlink'

import { Box, Flex, Separator } from '@radix-ui/themes'
import { Button } from '@/components/button'
import Panel from '@/components/panel'
import FileSize from '@/components/file-size'
import { Toggle } from '@/components/toggle'

import useLocalState from '@/utils/use-local-state.ts'
import Json from './json'

import styles from './index.module.scss'

import FileSizeWorker from '@/utils/file-size-worker.js?worker&inline'

const fileSizeWorker = Comlink.wrap(new FileSizeWorker())

const DEFAULT_TEXT = `{
    "ID": null,
    "name": "Doe",
    "first-name": "John",
    "age": 25,
    "hobbies": [
        "reading",
        "cinema",
        {
            "sports": [
                "volley-ball",
                "badminton"
            ]
        }
    ],
    "address": {}
}`

const JSONContext = createContext()

export default function JSONView() {
    const [text, setText] = useLocalState('JSON/text', DEFAULT_TEXT)
    const [decode, setDecode] = useLocalState('JSON/decode', false)
    const [deep, setDeep] = useLocalState('JSON/deep', false)
    const [timestamp, setTimestamp] = useLocalState('JSON/timestamp', false)
    const [arrayIndex, setArrayIndex] = useLocalState('JSON/arrayIndex', false)
    const [sortProps, setSortProps] = useLocalState('JSON/sortProps', false)
    const [comment, setComment] = useLocalState('JSON/comment', false)
    const [filterable, setFilterable] = useLocalState('JSON/filterable', false)
    const [filterText, setFilterText] = useLocalState('JSON/filter-text', '')
    const [displaySourceCode, setDisplaySourceCode] = useLocalState(
        'JSON/display-source-code',
        true
    )

    const json = useMemo(() => new Json(comment), [comment])

    const trimmedText = useMemo(() => text.trim(), [text])
    const trimmedFilterText = useMemo(() => filterText.trim(), [filterText])
    const lastValidFilterText = useRef(undefined)

    const [parsedData, parsedError] = useMemo(() => {
        try {
            return [json.parse(trimmedText)]
        } catch (err) {
            if (_.isError(err)) {
                err.message = `源码：${err.message}`
            }

            return [undefined, err]
        }
    }, [json, trimmedText])

    const deepData = useMemo(() => {
        if (deep && parsedData != null) {
            return json.deepParse(parsedData)
        } else {
            return parsedData
        }
    }, [json, deep, parsedData])

    const [filteredData, filteredError] = useMemo(() => {
        let data = deepData
        let error

        if (filterable && deepData != null) {
            try {
                data = json.filter(deepData, trimmedFilterText)
                lastValidFilterText.current = trimmedFilterText
            } catch (e) {
                if (_.isError(e)) {
                    e.message = `过滤表达式：${e.message}`
                }

                error = e

                if (lastValidFilterText.current) {
                    data = json.filter(deepData, lastValidFilterText.current)
                }
            }
        }

        return [data, error]
    }, [json, filterable, trimmedFilterText, deepData])

    const data = filteredData
    const error = filteredError ?? parsedError

    function formatJSON() {
        try {
            setText(json.format(trimmedText))
        } catch (error) {
            alert(error.message)
        }
    }

    function compressJSON() {
        try {
            setText(json.compress(trimmedText))
        } catch (error) {
            alert(error.message)
        }
    }

    function toggleFilterable() {
        setFilterable(!filterable)
    }

    return (
        <JSONContext.Provider value={JSON}>
            <Flex className={styles.container} direction={'column'}>
                <Flex gap={'3'} p={'3'} wrap={'wrap'} align="center">
                    <Toggle
                        label="解码字符串"
                        title="对于字符串类型的值，尝试使用 decodeURIComponent 进行解码"
                        value={decode}
                        onChange={setDecode}
                    />
                    <Toggle
                        label="解码时间戳"
                        title="对于数值类型的值，若其值大于等于 1 年前的 Unix 时间戳，且小于等于 1 年后的 Unix 时间戳，则将其当作 Unix 时间戳进行解析"
                        value={!!timestamp}
                        onChange={(checked) => setTimestamp(checked ? 'ms' : false)}
                    />
                    <Toggle
                        label="深层解析"
                        title="对于 JSON 格式的字符串类型的值，直接解析并渲染其 JSON 数据"
                        value={deep}
                        onChange={setDeep}
                    />
                    <Toggle
                        label="数组索引"
                        title="显示数组元素的索引"
                        value={arrayIndex}
                        onChange={setArrayIndex}
                    />
                    <Toggle
                        label="排序属性"
                        title="按属性值进行排序"
                        value={sortProps}
                        onChange={setSortProps}
                    />
                    <Toggle
                        label="支持注释"
                        title="允许源码中包含注释"
                        value={comment}
                        onChange={setComment}
                    />
                    <Toggle
                        label="显示源码"
                        title="显示源码输入框"
                        value={displaySourceCode}
                        onChange={setDisplaySourceCode}
                    />
                    <Button className={styles.button} onClick={formatJSON}>
                        格式化源码
                    </Button>
                    <Button className={styles.button} onClick={compressJSON}>
                        压缩源码
                    </Button>
                    <Button
                        className={clsx(styles.button, { [styles.activated]: filterable })}
                        onClick={toggleFilterable}
                    >
                        过滤数据
                    </Button>
                </Flex>
                <Separator size="4" />
                <Flex className={styles.panels} flexGrow={'1'}>
                    {displaySourceCode ? (
                        <Box
                            asChild
                            flexGrow={'10'}
                            flexShrink={'1'}
                            flexBasis={'0'}
                            minWidth={'0'}
                        >
                            <JSONInput value={text} onChange={setText} />
                        </Box>
                    ) : null}
                    {displaySourceCode ? <Separator orientation="vertical" size="4" /> : null}
                    <Flex
                        direction="column"
                        flexGrow={displaySourceCode ? '14' : '1'}
                        flexShrink={'1'}
                        flexBasis={'0'}
                        minWidth={'0'}
                    >
                        {filterable ? (
                            <Box asChild flexGrow="4" flexShrink="0" flexBasis="0" minHeight="0">
                                <FilterInput value={filterText} onChange={setFilterText} />
                            </Box>
                        ) : null}
                        <Box asChild flexGrow="20" flexShrink="1" flexBasis="0" minHeight="0">
                            <Display
                                data={data}
                                error={error}
                                decode={decode}
                                timestamp={timestamp}
                                sortProps={sortProps}
                                arrayIndex={arrayIndex}
                            />
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
        </JSONContext.Provider>
    )
}

function JSONInput({ value, onChange, ...otherProps }) {
    return (
        <Panel title="源码" note={<SizesInfo sourceCode={value} />} {...otherProps}>
            <textarea
                className={styles.input}
                placeholder="请输入 JSON 内容"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                spellCheck={false}
            />
        </Panel>
    )
}

function FilterInput({ value, onChange, ...otherProps }) {
    return (
        <Panel
            title="过滤表达式"
            note={
                <span className={styles.panelNote}>
                    基于{' '}
                    <a
                        href="https://jmespath.org/tutorial.html"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        JMESPath
                    </a>
                </span>
            }
            {...otherProps}
        >
            <textarea
                className={styles.input}
                placeholder="请输入 JMESPath 格式的过滤表达式"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                spellCheck={false}
                autoFocus
            />
        </Panel>
    )
}

function SizesInfo({ sourceCode }) {
    const [sourceCodeSize, setSourceCodeSize] = useState({ original: 0, gzip: 0 })

    useEffect(() => {
        fileSizeWorker
            .size(sourceCode)
            .then(setSourceCodeSize)
            .catch(() => {
                setSourceCodeSize({ original: 0, gzip: 0 })
            })
    }, [sourceCode])

    return (
        <span className={styles.sizes}>
            <span>size: </span>
            <FileSize bytes={sourceCodeSize.original} />, <span>gzip: </span>
            <FileSize bytes={sourceCodeSize.gzip} />
        </span>
    )
}

const DisplayContext = createContext({ decode: false })

function parseNumber(number, timestamp) {
    let value = number
    let type = 'number'

    if (timestamp) {
        ;[value, type = 'number'] = tryParseTime(number)
    }

    return [value, type]
}

function parseString(string, decode, timestamp) {
    let value = string
    let type = 'text'

    if (decode) {
        value = tryDecodeURIComponent(value)
    }

    if (type === 'text') {
        ;[value, type] = tryParseURL(value)
    }

    if (type === 'text' && timestamp) {
        ;[value, type = 'text'] = tryParseTime(string)
    }

    return [value, type]
}

function tryDecodeURIComponent(text, decode) {
    try {
        return decodeURIComponent(text)
    } catch {
        return text
    }
}

const now = dayjs()
const VALID_TIMESTAMP_NUMBER_RANGE = [
    now.subtract(40, 'years').valueOf(),
    now.add(40, 'years').valueOf(),
]

function tryParseTime(val) {
    let num = val

    if (typeof num === 'string') {
        num = parseInt(num)
    }

    if (!Number.isFinite(num)) {
        return [val]
    }

    if (num >= VALID_TIMESTAMP_NUMBER_RANGE[0] && num <= VALID_TIMESTAMP_NUMBER_RANGE[1]) {
        return [dayjs(num), 'time']
    }

    num *= 1000

    if (num >= VALID_TIMESTAMP_NUMBER_RANGE[0] && num <= VALID_TIMESTAMP_NUMBER_RANGE[1]) {
        return [dayjs(num), 'time']
    }

    return [val]
}

function tryParseURL(text) {
    if (
        !(
            text &&
            text.length >= 11 && // 世界上最短的有效 url 是什么？暂时定为 http://a.io
            text[0]?.toLowerCase() === 'h' &&
            text[1]?.toLowerCase() === 't' &&
            text[2]?.toLowerCase() === 't' &&
            text[3]?.toLowerCase() === 'p'
        )
    ) {
        return [text, 'text']
    }

    try {
        return [new URL(text), 'url']
    } catch {
        return [text, 'text']
    }
}

function Display({ data, error, decode, timestamp, sortProps, arrayIndex, ...otherProps }) {
    const context = useMemo(
        () => ({ decode, timestamp, sortProps, arrayIndex }),
        [decode, timestamp, sortProps, arrayIndex]
    )

    return (
        <DisplayContext.Provider value={context}>
            <Panel title="显示" error={error?.message} {...otherProps}>
                {data !== undefined ? (
                    <div className={styles.display}>
                        <PropertyValue value={data} />
                    </div>
                ) : null}
            </Panel>
        </DisplayContext.Provider>
    )
}

function PropertyItem({ index, name, value, last }) {
    return (
        <div className={styles.item}>
            {typeof index === 'number' ? <span className={styles.index}>{index}. </span> : null}
            {typeof name === 'string' ? (
                name ? (
                    <span className={styles.property}>{name}: </span>
                ) : (
                    <span className={styles.emptyProperty}>
                        <span className={styles.flag}>EMPTY PROPERTY NAME</span>:{' '}
                    </span>
                )
            ) : null}
            <PropertyValue value={value} />
            {!last ? ',' : null}
        </div>
    )
}

function PropertyValue({ value }) {
    let content

    if (_.isNull(value)) {
        content = <span className={styles.null}>null</span>
    } else if (_.isBoolean(value)) {
        content = <span className={styles.boolean}>{value ? 'true' : 'false'}</span>
    } else if (_.isNumber(value)) {
        content = <NumberPropertyValue value={value} />
    } else if (_.isString(value)) {
        content = <StringPropertyValue value={value} />
    } else if (_.isArray(value)) {
        content = <ArrayPropertyValue value={value} />
    } else if (_.isObject(value)) {
        content = <ObjectPropertyValue value={value} />
    } else {
        content = null
    }

    return content
}

function NumberPropertyValue({ value: num }) {
    const { timestamp } = useContext(DisplayContext)

    const [value, type] = useMemo(() => parseNumber(num, timestamp), [num, timestamp])

    switch (type) {
        case 'number':
            return <span className={styles.number}>{value}</span>
        case 'time':
            return (
                <span className={styles.time} title={num}>
                    {value.format('YYYY-MM-DD HH:mm:ss.SSS')}
                </span>
            )
        default:
            throw new Error('无效的数值类型')
    }
}

function StringPropertyValue({ value: str }) {
    const { decode, timestamp } = useContext(DisplayContext)

    const [value, type] = useMemo(
        () => parseString(str, decode, timestamp),
        [str, decode, timestamp]
    )

    switch (type) {
        case 'text':
            return <span className={styles.string}>"{value}"</span>
        case 'time':
            return (
                <span className={styles.timestr} title={`"${str}"`}>
                    {value.format('YYYY-MM-DD HH:mm:ss.SSS')}
                </span>
            )
        case 'url':
            return (
                <a
                    className={styles.string}
                    href={value.toString()}
                    target="_blank"
                    rel="noreferrer"
                >
                    {value.toString()}
                </a>
            )
        default:
            throw new Error('无效的字符串值类型')
    }
}

function ArrayPropertyValue({ value }) {
    const { arrayIndex } = useContext(DisplayContext)
    const [on, toggle] = useToggle(true)

    return (
        <span className={clsx(styles.array, { [styles.fold]: !on })}>
            <span className={clsx(styles.bracket, styles.leftBracket)} onClick={toggle}>
                [
            </span>

            <div className={styles.length}>{value.length}</div>

            <div className={styles.items}>
                {value.map((item, index) => (
                    <PropertyItem
                        key={index}
                        index={arrayIndex ? index : undefined}
                        value={item}
                        last={index === value.length - 1}
                    />
                ))}
            </div>

            <span className={clsx(styles.bracket, styles.rightBracket)}>]</span>
        </span>
    )
}

function ObjectPropertyValue({ value }) {
    const { sortProps } = useContext(DisplayContext)
    const [on, toggle] = useToggle(true)

    const entries = useMemo(() => {
        return Object.entries(value)
    }, [value])

    const sortedEntries = useMemo(() => {
        if (!sortProps) {
            return entries
        }

        return [...entries].sort(([k1, v1], [k2, v2]) => Json.compareValue(v1, v2))
    }, [entries, sortProps])

    const finalEntries = sortedEntries

    return (
        <span className={clsx(styles.object, { [styles.fold]: !on })}>
            <span className={clsx(styles.bracket, styles.leftBracket)} onClick={toggle}>
                {'{'}
            </span>

            <div className={styles.length}>{finalEntries.length}</div>

            <div className={styles.items}>
                {finalEntries.map(([key, value], index) => (
                    <PropertyItem
                        key={key}
                        name={key}
                        value={value}
                        last={index === finalEntries.length - 1}
                    />
                ))}
            </div>

            <span className={clsx(styles.bracket, styles.rightBracket)}>{'}'}</span>
        </span>
    )
}
