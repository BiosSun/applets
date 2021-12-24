import React, { useState, useEffect, useCallback } from 'react'
import { VStack } from '@nami-ui/stack'
import TextareaAutosize from 'react-autosize-textarea'
import _ from 'lodash'
import clsx from 'clsx'
import URI from 'urijs'
import QRCode from 'qrcode.react'
import { useUpdate } from 'react-use'

import styles from './index.module.scss'
import useLocalState from 'utils/use-local-state.ts'

// -----------------------------------------------------------------------------
// - test data:
//     https://biossun:password@www.biossun.xyz:80/docs/javascript/index.html?keyword=typescript&starttime=1995&endtime=2020#history
// -----------------------------------------------------------------------------

export default function URLView() {
    const update = useUpdate()

    const [uri, setURI] = useLocalState(
        'URL/uri',
        '',
        (uri) => uri.toString(),
        (str) => URI(str)
    )

    const set = useCallback(
        function set(field, value) {
            if (field === 'uri') {
                setURI(URI(value))
            } else {
                uri[field](value)
                update()
            }
        },
        [uri, update]
    )

    const uriString = uri.toString()
    const isLongURI = uriString.length > 2000

    return (
        <div className={styles.container}>
            <table className={styles.fields}>
                <thead>
                    <Field
                        name="uri"
                        uri={uri}
                        getValue={() => uri.toString()}
                        onChange={set}
                        textarea
                    >
                        <div className={styles.qrcode}>
                            <button
                                className={clsx(styles.qrcodeButton, {
                                    [styles.qrcodeButtonDanger]: isLongURI,
                                })}
                                disabled={!uri.toString()}
                            >
                                二维码
                            </button>
                            <div className={styles.qrcodePopover}>
                                {isLongURI ? (
                                    <p className={styles.qrcodeError}>URL 过长，无法生成二维码</p>
                                ) : (
                                    <QRCode
                                        className={styles.qrcodePayload}
                                        value={uriString}
                                        size={300}
                                    />
                                )}
                            </div>
                        </div>
                    </Field>
                </thead>
                <tbody>
                    <Field indent={1} name="origin" uri={uri} onChange={set} />
                    <Field indent={2} name="protocol" uri={uri} onChange={set} />
                    <Field indent={2} name="userinfo" uri={uri} onChange={set} />
                    <Field indent={3} name="username" uri={uri} onChange={set} />
                    <Field indent={3} name="password" uri={uri} onChange={set} />
                    <Field indent={2} name="host" uri={uri} onChange={set} />
                    <Field indent={3} name="subdomain" uri={uri} onChange={set} />
                    <Field indent={3} name="domain" uri={uri} onChange={set} />
                    <Field indent={3} name="tld" uri={uri} onChange={set} />
                    <Field indent={3} name="port" uri={uri} onChange={set} />
                    <Field indent={1} name="path" uri={uri} onChange={set} />
                    <Field indent={2} name="directory" uri={uri} onChange={set} />
                    <Field indent={2} name="filename" uri={uri} onChange={set} />
                    <Field indent={2} name="suffix" uri={uri} onChange={set} />
                    <Field indent={1} name="query" uri={uri} onChange={set} textarea />
                    <SearchField indent={2} uri={uri} onChange={set} />
                    <Field indent={1} name="hash" uri={uri} onChange={set} />
                </tbody>
            </table>
        </div>
    )
}

function SearchField({ uri, onChange, ...otherProps }) {
    return (
        <Field
            name="search"
            invisibleFieldName
            uri={uri}
            onChange={onChange}
            getValue={(name, uri) => uri.search(true)}
            parse={(value) => JSON.parse(value)}
            serialize={(value) => (_.isEmpty(value) ? '' : JSON.stringify(value, null, 4))}
            textarea
            {...otherProps}
        />
    )
}

Field.defaultProps = {
    getValue: (name, uri) => uri[name](),
    parse: (value) => value,
    serialize: (value) => value,
    indent: 0,
}

function Field({
    name,
    uri,
    onChange,
    getValue,
    parse,
    serialize,
    textarea,
    indent,
    invisibleFieldName,
    children,
}) {
    const [focused, setFocus] = useState(false)
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)

    const currentValue = serialize(getValue(name, uri))

    useEffect(() => {
        if (focused) {
            return
        }

        setValue(currentValue)
        setError(null)
    }, [focused, currentValue])

    function handleChange(value) {
        setValue(value)

        try {
            onChange(name, parse(value))
            setError(null)
        } catch (error) {
            setError(error)
        }
    }

    const Control = textarea ? Textarea : Input
    const className = clsx(styles.fieldItem, {
        [styles.emptyFieldItem]: _.isEmpty(value),
        [styles.focusedFieldItem]: focused,
        [styles[`fieldItemIndent${indent}`]]: indent,
        [styles.errorFieldItem]: error,
    })

    return (
        <tr className={className}>
            <th className={styles.fieldName}>{!invisibleFieldName ? `${name}:` : ' '}</th>
            <td>
                <div className={styles.fieldContent}>
                    <Control
                        value={value}
                        onChange={handleChange}
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
                    />
                    {children}
                </div>
                {error ? <span className={styles.errorMessage}>{error.message}</span> : null}
            </td>
        </tr>
    )
}

function Textarea({ value, onChange, ...otherProps }) {
    return (
        <TextareaAutosize
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入文本"
            spellCheck={false}
            {...otherProps}
        />
    )
}

function Input({ value, onChange, ...otherProps }) {
    return (
        <input
            className={styles.input}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入文本"
            spellCheck={false}
            {...otherProps}
        />
    )
}
