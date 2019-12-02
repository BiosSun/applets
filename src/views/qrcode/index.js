import React, { useState } from 'react'
import QRCode from 'qrcode.react'

import styles from './index.module.scss'

const MAX_TEXT_LENGTH = 1024
const LONG_TEXT = 256

export default function QRCodeView() {
    const [text, setText] = useState('')

    const payload = text.trim()
    const isShort = payload.length < LONG_TEXT
    const size = isShort ? 256 : 512

    return (
        <>
            <h1>QRCode</h1>
            <p>该工具用于生成一个二维码</p>
            <div className={styles.container}>
                <Input value={text} onChange={setText} height={size} />
                <Display value={payload} size={size} />
            </div>
        </>
    )
}

function Input({ value, onChange, height }) {
    return (
        <textarea
            className={styles.textarea}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="请输入文本"
            style={{ height }}
        />
    )
}

function Display({ value, size }) {
    if (!value) {
        return null
    } else if (value.length > MAX_TEXT_LENGTH) {
        return <span className={styles.dangerMessage}>不可超过 1024 个字符</span>
    } else {
        return <QRCode className={styles.qrcode} value={value} size={size} />
    }
}
