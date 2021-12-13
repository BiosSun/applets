import { useMemo, createContext, useContext } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import { useToggle } from 'react-use'
import { VStack, HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import { CheckBox } from '@nami-ui/checkbox'
import TextareaAutosize from 'react-autosize-textarea'
import useLocalState from 'utils/use-local-state.ts'
import Panel from '../../components/panel'

import styles from './index.module.scss'

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
    const [arrayIndex, setArrayIndex] = useLocalState('JSON/arrayIndex', false)

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
                    deep={deep}
                    arrayIndex={arrayIndex}
                />
            </HStack>
        </VStack>
    )
}

function Input({ value, onChange, ...otherProps }) {
    return (
        <Panel title="源码" {...otherProps}>
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

function Display({ text, decode, deep, arrayIndex, ...otherProps }) {
    const [value, error] = useMemo(() => parseJSON(text), [text])
    const context = useMemo(() => ({ decode, deep, arrayIndex }), [decode, deep, arrayIndex])

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
        content = <span className={styles.number}>{value}</span>
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
    const [on, toggle] = useToggle(true)

    const entries = Object.entries(value)

    return (
        <span className={clsx(styles.object, { [styles.fold]: !on })}>
            <span className={clsx(styles.bracket, styles.leftBracket)} onClick={toggle}>
                {'{'}
            </span>

            <div className={styles.length}>{entries.length}</div>

            <div className={styles.items}>
                {entries.map(([key, value], index) => (
                    <PropertyItem
                        key={key}
                        name={key}
                        value={value}
                        last={index === entries.length - 1}
                    />
                ))}
            </div>

            <span className={clsx(styles.bracket, styles.rightBracket)}>{'}'}</span>
        </span>
    )
}
