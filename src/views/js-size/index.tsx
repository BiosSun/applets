import { useState, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import * as Comlink from 'comlink'
import { Box, Flex, Separator } from '@radix-ui/themes'
import FileSize from '@/components/file-size'
import Panel from '@/components/panel'
import useLocalState from '@/utils/use-local-state'
import { uglifyWorker } from './uglify-main'

import styles from './index.module.scss'

import FileSizeWorker from '@/utils/file-size-worker.js?worker&inline'

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
            .then((code: any) => {
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
        <Flex className={styles.container}>
            <Panel
                title="Source Code"
                note={<SizeInfo text={sourceCode} />}
                style={{ flex: '1 1 0', minWidth: '0' }}
            >
                <textarea
                    value={sourceCode}
                    className={styles.code}
                    onChange={(e) => setSourceCode(e.target.value)}
                    placeholder="请输入或粘贴 JS 源代码"
                    spellCheck={false}
                />
            </Panel>
            <Separator orientation="vertical" size="4" />
            <Panel
                title="Minified Code"
                note={<SizeInfo text={minifiedCode} />}
                style={{ flex: '1 1 0', minWidth: '0' }}
            >
                {isMinifying ? (
                    <textarea
                        value={''}
                        className={styles.minCode}
                        placeholder="代码压缩中…"
                        readOnly
                    />
                ) : !minifiedError ? (
                    <textarea
                        value={minifiedCode}
                        className={styles.minCode}
                        style={{ height: '100%' }}
                        readOnly
                    />
                ) : (
                    <ParseErrorInfo style={{ height: '100%' }} error={minifiedError} />
                )}
            </Panel>
        </Flex>
    )
}

function SizeInfo({ text }: any) {
    const [size, setSize] = useState({ original: 0, gzip: 0 })

    useEffect(() => {
        (fileSizeWorker as any)
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

function ParseErrorInfo({ className, error, ...otherProps }: any) {
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
