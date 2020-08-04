import React from 'react'
import clsx from 'clsx'
import { VLinear, HLinear } from '@biossun/nami'
import TextareaAutosize from 'react-textarea-autosize'
import ReactResizeDetector from 'react-resize-detector'
import QRCode from 'qrcode.react'

import styles from './index.module.scss'
import useLocalState from 'utils/use-local-state'

const MAX_TEXT_LENGTH = 1024
const LONG_TEXT = 256

export default function QRCodeView() {
    const [text, setText] = useLocalState('QRCode/text', '')

    const payload = text.trim()
    const isShort = payload.length < LONG_TEXT
    const size = isShort ? 256 : 512

    return (
        <VLinear className={styles.container} padding="large" spacing>
            <h1>QRCode</h1>
            <p>生成一个二维码</p>
            <HLinear spacing>
                <Input value={text} onChange={setText} />
                <Display value={payload} size={size} />
            </HLinear>
        </VLinear>
    )
}

function Input({ value, onChange, className }) {
    return (
        <TextareaAutosize
            className={clsx(className, styles.textarea)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入文本"
            minRows={5}
        />
    )
}

function Display({ value, size, className }) {
    if (!value) {
        return null
    } else if (value.length > MAX_TEXT_LENGTH) {
        return <span className={clsx(className, styles.dangerMessage)}>不可超过 1024 个字符</span>
    } else {
        return (
            <ReactResizeDetector handleHeight>
                {({ width, height }) => {
                    console.info(width, height)

                    return (
                        <VLinear>
                            <QRCode
                                $flex
                                className={clsx(className, styles.qrcode)}
                                value={value}
                                size={height}
                            />
                        </VLinear>
                    )
                }}
            </ReactResizeDetector>
        )
    }
}
