import React, { useState } from 'react'
import QRCode from 'qrcode.react'

import styles from './index.module.scss'

export default function QRCodeView() {
    const [text, setText] = useState('')

    return (
        <>
            <h1>QRCode</h1>
            <p>该工具用于生成一个二维码</p>
            <div className={styles.container}>
                <textarea
                    className={styles.textarea}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="请输入文本"
                />
                {text ? <QRCode className={styles.qrcode} value={text} size={256} /> : null}
            </div>
        </>
    )
}
