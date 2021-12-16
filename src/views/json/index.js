import { useMemo, createContext, useContext, useState, useEffect } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import { useToggle } from 'react-use'
import { VStack, HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import useLocalState from 'utils/use-local-state.ts'
import Panel from 'components/panel'
import FileSize from 'components/file-size'
import dayjs from 'dayjs'

import styles from './index.module.scss'

// eslint-disable-next-line import/no-webpack-loader-syntax
import FileSizeWorker from 'workerize-loader?inline!../../utils/file-size-worker'

const fileSizeWorker = FileSizeWorker()

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

export default function JSONView() {
    const [text, setText] = useLocalState('JSON/text', DEFAULT_TEXT)
    const [decode, setDecode] = useLocalState('JSON/decode', false)
    const [deep, setDeep] = useLocalState('JSON/deep', false)
    const [timestamp, setTimestamp] = useLocalState('JSON/timestamp', false)
    const [arrayIndex, setArrayIndex] = useLocalState('JSON/arrayIndex', false)
    const [sortProps, setSortProps] = useLocalState('JSON/sortProps', false)

    function formatText() {
        const [json, error] = parseJSON(text)

        if (error) {
            alert(error.message)
        } else {
            setText(JSON.stringify(json, null, 4))
        }
    }

    function compressText() {
        const [json, error] = parseJSON(text)

        if (error) {
            alert(error.message)
        } else {
            setText(JSON.stringify(json, null, 0))
        }
    }

    return (
        <VStack className={styles.container} spacing="huge">
            <VStack spacing="large" padding={{ top: 'huge', horizontal: 'huge' }}>
                <h1>JSON</h1>
                <p>解析 JSON 字符串</p>

                <HStack spacing align="center">
                    <HStack
                        component="label"
                        spacing="small"
                        align="center"
                        title="对于字符串类型的值，尝试使用 decodeURIComponent 进行解码"
                    >
                        <input
                            type="checkbox"
                            checked={decode}
                            onChange={(event) => setDecode(event.target.checked)}
                        />
                        解码字符串
                    </HStack>
                    <HStack
                        component="label"
                        spacing="small"
                        align="center"
                        title="对于数值类型的值，若其值大于等于 1 年前的 Unix 时间戳，且小于等于 1 年后的 Unix 时间戳，则将其当作 Unix 时间戳进行解析"
                    >
                        <input
                            type="checkbox"
                            checked={!!timestamp}
                            onChange={(event) => setTimestamp(event.target.checked ? 'ms' : false)}
                        />
                        解码时间戳（毫秒）
                    </HStack>
                    <HStack
                        component="label"
                        spacing="small"
                        align="center"
                        title="对于 JSON 格式的字符串类型的值，直接解析并渲染其 JSON 数据"
                    >
                        <input
                            type="checkbox"
                            checked={deep}
                            onChange={(event) => setDeep(event.target.checked)}
                        />
                        深层解析
                    </HStack>
                    <HStack
                        component="label"
                        spacing="small"
                        align="center"
                        title="显示数组元素的索引"
                    >
                        <input
                            type="checkbox"
                            checked={arrayIndex}
                            onChange={(event) => setArrayIndex(event.target.checked)}
                        />
                        数组索引
                    </HStack>
                    <HStack
                        component="label"
                        spacing="small"
                        align="center"
                        title="按属性值进行排序"
                    >
                        <input
                            type="checkbox"
                            checked={sortProps}
                            onChange={(event) => setSortProps(event.target.checked)}
                        />
                        排序属性
                    </HStack>
                    <button onClick={formatText}>格式化源码</button>
                    <button onClick={compressText}>压缩源码源码</button>
                </HStack>
            </VStack>

            <HStack $flex className={styles.panels}>
                <Input $flex $col={10} value={text} onChange={setText} />
                <Divider />
                <Display
                    $flex
                    $col={14}
                    text={text}
                    decode={decode}
                    timestamp={timestamp}
                    deep={deep}
                    sortProps={sortProps}
                    arrayIndex={arrayIndex}
                />
            </HStack>
        </VStack>
    )
}

function Input({ value, onChange, ...otherProps }) {
    return (
        <Panel title="源码" note={<SizesInfo sourceCode={value} />} {...otherProps}>
            <textarea
                $flex
                className={styles.input}
                placeholder="请输入 JSON 内容"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                spellCheck={false}
            />
        </Panel>
    )
}

function SizesInfo({ className, sourceCode, ...otherProps }) {
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

const r_valid_json = /^[{["\-\ntfn]/

function parseJSON(text) {
    const trimedText = _.trim(text)

    if (!trimedText || !r_valid_json.test(trimedText)) {
        return [undefined, undefined]
    }

    try {
        return [JSON.parse(trimedText)]
    } catch (error) {
        return [undefined, error]
    }
}

const now = dayjs()
const VALID_TIMESTAMP_NUMBER_RANGE = [
    now.subtract(10, 'years').valueOf(),
    now.add(10, 'years').valueOf(),
]

function parseNumber(number, timestamp) {
    let value = number
    let type = 'number'

    console.info(number, timestamp, VALID_TIMESTAMP_NUMBER_RANGE)

    if (
        timestamp &&
        value >= VALID_TIMESTAMP_NUMBER_RANGE[0] &&
        value <= VALID_TIMESTAMP_NUMBER_RANGE[1]
    ) {
        value = dayjs(value)
        type = 'time'
    }

    return [value, type]
}

function parseString(string, decode, deep) {
    let value = string
    let type = 'text'

    if (decode) {
        value = tryDecodeURIComponent(value)
    }

    if (deep) {
        ;[value, type] = tryParseJSON(value)
    }

    if (type === 'text') {
        ;[value, type] = tryParseURL(value)
    }

    return [value, type]
}

function tryParseJSON(text) {
    const [value, error] = parseJSON(text)

    if (error || value === undefined) {
        return [text, 'text']
    } else {
        return [value, 'json']
    }
}

function tryDecodeURIComponent(text, decode) {
    try {
        return decodeURIComponent(text)
    } catch {
        return text
    }
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

function getType(value) {
    return _.isNull(value)
        ? 'null'
        : _.isBoolean(value)
        ? 'boolean'
        : _.isNumber(value)
        ? 'number'
        : _.isString(value)
        ? 'string'
        : _.isArray(value)
        ? 'array'
        : _.isObject(value)
        ? 'object'
        : 'unknown'
}

const TYPE_SORTS = {
    unknown: 0,
    null: 1,
    boolean: 2,
    number: 3,
    string: 4,
    array: 5,
    object: 6,
}

function Display({ text, decode, timestamp, deep, sortProps, arrayIndex, ...otherProps }) {
    const [value, error] = useMemo(() => parseJSON(text), [text])

    const context = useMemo(
        () => ({ decode, deep, timestamp, sortProps, arrayIndex }),
        [decode, deep, timestamp, sortProps, arrayIndex]
    )

    return (
        <DisplayContext.Provider value={context}>
            <Panel title="显示" error={error?.message} {...otherProps}>
                {!error && value !== undefined ? (
                    <div $flex className={styles.display}>
                        <PropertyValue value={value} />
                    </div>
                ) : null}
            </Panel>
        </DisplayContext.Provider>
    )
}

function PropertyItem({ index, name, value, last }) {
    return (
        <div className={styles.item}>
            {_.isNumber(index) ? <span className={styles.index}>{index}. </span> : null}
            {name ? <span className={styles.property}>{name}: </span> : null}
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
    const { decode, deep } = useContext(DisplayContext)

    const [value, type] = useMemo(() => parseString(str, decode, deep), [str, decode, deep])

    switch (type) {
        case 'text':
            return <span className={styles.string}>"{value}"</span>
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
        case 'json':
            return <PropertyValue value={value} />
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

        return [...entries].sort(([key1, value1], [key2, value2]) => {
            const type1 = getType(value1)
            const type2 = getType(value2)

            const typeIndex1 = TYPE_SORTS[type1]
            const typeIndex2 = TYPE_SORTS[type2]

            if (typeIndex1 !== typeIndex2) {
                return typeIndex1 - typeIndex2
            }

            return value1 < value2 ? -1 : value1 > value2 ? 1 : 0
        })
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
