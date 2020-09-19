import React, { useState, useEffect } from 'react'
import { VLinear, HLinear, Divider } from '@biossun/nami'

import styles from './index.module.scss'
import useLocalState from 'utils/use-local-state.ts'
import codec from './codec'

export default function Base64View() {
    const [source, setSource] = useLocalState('Base64/source', '')
    const [base64, setBase64] = useState()

    const [encodeError, setEncodeError] = useState()
    const [decodeError, setDecodeError] = useState()

    useEffect(() => {
        encode(source)
    }, [])

    function encode(source) {
        setSource(source)

        try {
            setBase64(codec.encode(source))
            setEncodeError(null)
        } catch (error) {
            setEncodeError(error)
        }
    }

    function decode(base64) {
        setBase64(base64)

        try {
            setSource(codec.decode(base64))
            setDecodeError(null)
        } catch (error) {
            setDecodeError(error)
        }
    }

    return (
        <VLinear className={styles.container} spacing>
            <VLinear spacing className={styles.header}>
                <h1>Base64</h1>
                <p className={styles.abstract}>编码/反编码 Base64 字符串</p>
            </VLinear>
            <HLinear $flex>
                <Item
                    $flex
                    title="源码"
                    placeholder="请输入源码"
                    value={source}
                    onChange={encode}
                    error={decodeError}
                />
                <Divider />
                <Item
                    $flex
                    title="编码"
                    placeholder="或输入编码"
                    value={base64}
                    onChange={decode}
                    error={encodeError}
                />
            </HLinear>
        </VLinear>
    )
}

function Item({ title, placeholder, value, onChange, error, className, ...otherProps }) {
    return (
        <VLinear className={className} {...otherProps}>
            <Divider />
            <span className={styles.label}>{title}</span>
            <Divider />
            {!error ? (
                <textarea
                    $flex
                    className={styles.textarea}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <div $flex className={styles.error}>
                    <strong>{error.name}:</strong>
                    <p>{error.message}</p>
                </div>
            )}
        </VLinear>
    )
}
