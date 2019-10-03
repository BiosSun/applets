import React, { useState, useEffect } from 'react'
import FileSize from 'components/file-size'

import styles from './index.module.scss'

// eslint-disable-next-line import/no-webpack-loader-syntax
import UglifyWorker from 'workerize-loader!./uglify-worker'

// eslint-disable-next-line import/no-webpack-loader-syntax
import FileSizeWorker from 'workerize-loader!./file-size-worker'

const uglifyWorker = UglifyWorker()
const fileSizeWorker = FileSizeWorker()

export default function JSSizeView() {
    const [sourceCode, setSourceCode] = useState('')
    const [minifiedCode, setMinifiedCode] = useState('')

    const [minifiedError, setMinifiedError] = useState(null)
    const [isMinifying, setMinifying] = useState(false)

    useEffect(() => {
        setMinifying(true)

        uglifyWorker
            .minify(sourceCode)
            .then(code => {
                setMinifiedCode(code)
                setMinifiedError(null)
            })
            .catch(error => {
                setMinifiedCode('')
                setMinifiedError(error)
            })
            .finally(() => {
                setMinifying(false)
            })
    }, [sourceCode])

    return (
        <>
            <h1>JS Size</h1>
            <p>该工具用于计算某个 JS 文件的源文件大小，压缩后大小及 gzip 之后的大小</p>
            <SizesInfo sourceCode={sourceCode} minifiedCode={minifiedCode} />
            <div className={styles.codeareas}>
                <div className={styles.codearea}>
                    <strong className={styles.title}>Source Code</strong>
                    <textarea
                        value={sourceCode}
                        className={styles.code}
                        onChange={e => setSourceCode(e.target.value)}
                        placeholder="请输入或粘贴 JS 源代码"
                    />
                </div>
                <div className={styles.codearea}>
                    <strong className={styles.title}>Minified Code</strong>
                    {isMinifying ? (
                        <textarea
                            value={''}
                            className={styles.minCode}
                            placeholder="代码压缩中…"
                            readOnly
                        />
                    ) : !minifiedError ? (
                        <textarea value={minifiedCode} className={styles.minCode} readOnly />
                    ) : (
                        <ParseErrorInfo error={minifiedError} />
                    )}
                </div>
            </div>
        </>
    )
}

function SizesInfo({ sourceCode, minifiedCode }) {
    const [sourceCodeSize, setSourceCodeSize] = useState({ original: 0, gzip: 0 })
    const [minifiedCodeSize, setMinifiedCodeSize] = useState({ original: 0, gzip: 0 })

    useEffect(() => {
        fileSizeWorker
            .size(sourceCode)
            .then(setSourceCodeSize)
            .catch(() => {
                setSourceCodeSize({ original: 0, gzip: 0 })
            })
    }, [sourceCode])

    useEffect(() => {
        fileSizeWorker
            .size(minifiedCode)
            .then(setMinifiedCodeSize)
            .catch(() => {
                setMinifiedCodeSize({ original: 0, gzip: 0 })
            })
    }, [minifiedCode])

    return (
        <>
            <dl className={styles.sizes}>
                <dt>Source Code Size</dt>
                <dd>
                    <FileSize bytes={sourceCodeSize.original} />
                </dd>
                <dt>GZip</dt>
                <dd>
                    <FileSize bytes={sourceCodeSize.gzip} />
                </dd>
            </dl>
            <dl className={styles.sizes}>
                <dt>Minified Code Size</dt>
                <dd>
                    <FileSize bytes={minifiedCodeSize.original} />
                </dd>
                <dt>GZip</dt>
                <dd>
                    <FileSize bytes={minifiedCodeSize.gzip} />
                </dd>
            </dl>
        </>
    )
}

function ParseErrorInfo({ error }) {
    return (
        <div className={styles.error}>
            <p>{error.message}</p>
            <p>
                line: {error.line}
                <br />
                col: {error.col}
                <br />
            </p>
        </div>
    )
}
