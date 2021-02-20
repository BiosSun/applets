import React, { useMemo } from 'react'
import clsx from 'clsx'
import { VStack, HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import { Space } from '@nami-ui/space'
import _ from 'lodash'
import { useToggle } from 'react-use'
import useLocalState from 'utils/use-local-state.ts'
import TextareaAutosize from 'react-autosize-textarea'

import styles from './index.module.scss'

const DEFAULT_TEXT =
    '{"ID":null,"name":"Doe","first-name":"John","age":25,"hobbies":["reading","cinema",{"sports":["volley-ball","badminton"]}],"address":{}}'

export default function JSONView() {
    const [text, setText] = useLocalState('JSON/text', DEFAULT_TEXT)

    return (
        <VStack className={styles.container}>
            <VStack padding="large" spacing>
                <h1>JSON</h1>
                <p>解析 JSON 字符串</p>

                <HStack spacing align="center">
                    <Space $flex />
                </HStack>
            </VStack>

            <Divider />

            <HStack style={{ flex: '1 0 auto' }} align="stretch">
                <Input $flex $col={10} value={text} onChange={setText} />

                <Divider />

                <Display $flex $col={14} text={text} />
            </HStack>
        </VStack>
    )
}

function Input({ className, value, onChange }) {
    function handleChange(e) {
        let val = e.target.value

        try {
            val = JSON.stringify(JSON.parse(val), null, 4)
        } catch {}

        onChange(val)
    }

    return (
        <TextareaAutosize
            className={clsx(className, styles.input)}
            placeholder="请输入 JSON 内容"
            value={value}
            onChange={handleChange}
        />
    )
}

function Display({ className, text }) {
    const [value, error] = useMemo(() => {
        const trimedText = _.trim(text)

        if (!trimedText) {
            return []
        }

        try {
            return [JSON.parse(trimedText)]
        } catch (error) {
            return [undefined, error]
        }
    }, [text])

    if (error) {
        return <div className={clsx(className, styles.dangerMessage)}>{error.message}</div>
    }

    console.info(value)

    return (
        <div className={clsx(className, styles.display)}>
            <PropertyValue value={value} />
        </div>
    )
}

function PropertyItem({ name, value, last }) {
    return (
        <div className={styles.item}>
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

function StringPropertyValue({ value }) {
    const [decode, toggleDecode] = useToggle(false)
    const str = useMemo(() => {
        if (decode) {
            try {
                return decodeURIComponent(value)
            } catch {
                return value
            }
        } else {
            return value
        }
    }, [value, decode])

    return (
        <span className={styles.string} onDoubleClick={toggleDecode}>
            "{str}"
        </span>
    )
}

function ArrayPropertyValue({ value }) {
    const [on, toggle] = useToggle(true)

    return (
        <span className={clsx(styles.array, { [styles.expand]: on })}>
            <span className={clsx(styles.bracket, styles.leftBracket)} onClick={toggle}>
                [
            </span>

            <div className={styles.length}>{value.length}</div>

            <div className={styles.items}>
                {value.map((item, index) => (
                    <PropertyItem key={index} value={item} last={index === value.length - 1} />
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
        <span className={clsx(styles.object, { [styles.expand]: on })}>
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
