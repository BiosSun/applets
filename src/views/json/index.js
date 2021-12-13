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

    return (
        <VStack className={styles.container} spacing="huge">
            <VStack spacing="large" padding={{ top: 'huge', horizontal: 'huge' }}>
                <h1>JSON</h1>
                <p>解析 JSON 字符串</p>

                <HStack spacing align="center">
                    <CheckBox label="解码字符串" title="对于字符串类型的值，尝试使用 decodeURIComponent 进行解码" checked={decode} onChange={setDecode} />
                    <CheckBox label="深层解析" title="对于 JSON 格式的字符串类型的值，直接解析并渲染其 JSON 数据" checked={deep} onChange={setDeep} />
                    <CheckBox label="数组索引" title="显示数组元素的索引" checked={arrayIndex} onChange={setArrayIndex} />
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
            <TextareaAutosize
                $flex
                className={styles.input}
                placeholder="请输入 JSON 内容"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </Panel>
    )
}

const DisplayContext = createContext({ decode: false })

function parseJSON(text) {
    const trimedText = _.trim(text)

    if (!trimedText) {
        return [undefined, undefined]
    }

    try {
        return [JSON.parse(trimedText)]
    } catch (error) {
        return [undefined, error]
    }
}

function tryParseJSONIfNeed(text, parse) {
    if (!parse) {
        return [text, 'text']
    }

    const [value, error] = parseJSON(text)

    if (error || value === undefined) {
        return [text, 'text']
    } else {
        return [value, 'json']
    }
}

function tryDecodeURIComponentIfNeed(text, decode) {
    if (!decode) {
        return text
    }

    try {
        return decodeURIComponent(text)
    } catch {
        return text
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

    let val, type

    val = useMemo(() => tryDecodeURIComponentIfNeed(str, decode), [str, decode])
    ;[val, type] = useMemo(() => tryParseJSONIfNeed(val, deep), [val, deep])

    if (type === 'text') {
        return <span className={styles.string}>"{val}"</span>
    } else {
        return <PropertyValue value={val} />
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
