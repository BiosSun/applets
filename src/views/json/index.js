import React, { useMemo } from 'react'
import clsx from 'clsx'
import { VLinear, HLinear, Divider, Space, Button } from '@biossun/nami'
import _ from 'lodash'
import { useToggle } from 'react-use'
import useLocalState from 'utils/use-local-state'

import styles from './index.module.scss'

const DEFAULT_TEXT =
    '{"ID":null,"name":"Doe","first-name":"John","age":25,"hobbies":["reading","cinema",{"sports":["volley-ball","badminton"]}],"address":{}}'

export default function JSONView() {
    const [text, setText] = useLocalState('JSON/text', DEFAULT_TEXT)

    return (
        <VLinear className={styles.container}>
            <VLinear padding="large" spacing>
                <h1>JSON</h1>
                <p>解析 JSON 字符串</p>

                <HLinear spacing align="center">
                    <Space $flex />
                </HLinear>
            </VLinear>

            <Divider />

            <HLinear className={styles.content} $flex>
                <Input $flex $col={10} value={text} onChange={setText} />

                <Divider />

                <Display $flex $col={14} text={text} />
            </HLinear>
        </VLinear>
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
        <textarea
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

function PropertyItem({ name, value }) {
    return (
        <div className={styles.item}>
            {name ? <span className={styles.property}>{name}: </span> : null}
            <PropertyValue value={value} />
        </div>
    )
}

function PropertyValue({ value }) {
    let content

    if (_.isNull(value)) {
        content = <span className={styles.null}>NULL</span>
    } else if (_.isBoolean(value)) {
        content = <span className={styles.boolean}>{value ? 'true' : 'false'}</span>
    } else if (_.isNumber(value)) {
        content = <span className={styles.number}>{value}</span>
    } else if (_.isString(value)) {
        content = <span className={styles.string}>"{value}"</span>
    } else if (_.isArray(value)) {
        content = <ArrayPropertyValue value={value} />
    } else if (_.isObject(value)) {
        content = <ObjectPropertyValue value={value} />
    } else {
        content = null
    }

    return content
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
                    <PropertyItem key={index} value={item} />
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
                {entries.map(([key, value]) => (
                    <PropertyItem key={key} name={key} value={value} />
                ))}
            </div>

            <span className={clsx(styles.bracket, styles.rightBracket)}>{'}'}</span>
        </span>
    )
}
