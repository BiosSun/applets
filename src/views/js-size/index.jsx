import { useState, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import * as Comlink from 'comlink'
import { HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import FileSize from 'components/file-size'
import Panel from 'components/panel'
import useLocalState from 'utils/use-local-state.ts'

import styles from './index.module.scss'

import UglifyWorker from './uglify-worker.js?worker&inline'
import FileSizeWorker from 'utils/file-size-worker.js?worker&inline'

const uglifyWorker = Comlink.wrap(new UglifyWorker())
const fileSizeWorker = Comlink.wrap(new FileSizeWorker())

export default function JSSizeView() {
    const [sourceCode, setSourceCode] = useLocalState('JSSize/sourceCode', '')
    const [minifiedCode, setMinifiedCode] = useState('')

    const [minifiedError, setMinifiedError] = useState(null)
    const [isMinifying, setMinifying] = useState(false)

    useEffect(() => {
        setMinifying(true)

        uglifyWorker
            .minify(sourceCode)
            .then((code) => {
                setMinifiedCode(code)
                setMinifiedError(null)
            })
            .catch((error) => {
                setMinifiedCode('')
                setMinifiedError(error)
            })
            .finally(() => {
                setMinifying(false)
            })
    }, [sourceCode])

    return (
        <HStack className={styles.container}>
            <Panel $flex title="Source Code" note={<SizeInfo text={sourceCode} />} withoutTopBorder>
                <textarea
                    $flex
                    value={sourceCode}
                    className={styles.code}
                    onChange={(e) => setSourceCode(e.target.value)}
                    placeholder="请输入或粘贴 JS 源代码"
                    spellCheck={false}
                />
            </Panel>
            <Divider />
            <Panel
                $flex
                title="Minified Code"
                note={<SizeInfo text={minifiedCode} />}
                withoutTopBorder
            >
                {isMinifying ? (
                    <textarea
                        $flex
                        value={''}
                        className={styles.minCode}
                        placeholder="代码压缩中…"
                        readOnly
                    />
                ) : !minifiedError ? (
                    <textarea $flex value={minifiedCode} className={styles.minCode} readOnly />
                ) : (
                    <ParseErrorInfo $flex error={minifiedError} />
                )}
            </Panel>
        </HStack>
    )
}

function SizeInfo({ text }) {
    const [size, setSize] = useState({ original: 0, gzip: 0 })

    useEffect(() => {
        fileSizeWorker
            .size(text)
            .then(setSize)
            .catch(() => {
                setSize({ original: 0, gzip: 0 })
            })
    }, [text])

    return (
        <span className={styles.size}>
            <span>size: </span>
            <FileSize bytes={size.original} />, <span>gzip: </span>
            <FileSize bytes={size.gzip} />
        </span>
    )
}

function ParseErrorInfo({ className, error, ...otherProps }) {
    const info = useMemo(() => {
        const message = error.message

        try {
            return JSON.parse(message)
        } catch {
            return { message: message }
        }
    }, [error.message])

    return (
        <div className={clsx(styles.error, className)} {...otherProps}>
            <strong>{info.name}:</strong>
            <p>{info.message}</p>
            <p>---------------------------</p>
            <p>
                line: {info.line}
                <br />
                col: {info.col}
                <br />
                pos: {info.pos}
            </p>
        </div>
    )
}
