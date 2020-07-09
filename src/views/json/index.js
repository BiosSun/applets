import React, { useMemo } from 'react'
import clsx from 'clsx'
import { VLinear, HLinear, Divider } from '@biossun/nami'
import _ from 'lodash'

import styles from './index.module.scss'
import useLocalState from 'utils/use-local-state'

const DEFAULT_TEXT =
    '{"ID":null,"name":"Doe","first-name":"John","age":25,"hobbies":["reading","cinema",{"sports":["volley-ball","badminton"]}],"address":{}}'

export default function JSONView() {
    const [text, setText] = useLocalState('JSON/text', DEFAULT_TEXT)

    return (
        <VLinear className={styles.container} padding="large" spacing>
            <h1>JSON</h1>
            <p>解析 JSON 字符串</p>

            <HLinear $flex spacing="large">
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
        content = (
            <span className={styles.array}>
                <span className={styles.bracket}>[</span>
                <div className={styles.items}>
                    {value.map((item, index) => (
                        <PropertyItem key={index} value={item} />
                    ))}
                </div>
                <span className={styles.bracket}>]</span>
            </span>
        )
    } else if (_.isObject(value)) {
        content = (
            <span className={styles.object}>
                <span className={styles.bracket}>{'{'}</span>
                <div className={styles.items}>
                    {Object.entries(value).map(([key, value]) => (
                        <PropertyItem key={key} name={key} value={value} />
                    ))}
                </div>
                <span className={styles.bracket}>{'}'}</span>
            </span>
        )
    } else {
        content = null
    }

    return content
}
