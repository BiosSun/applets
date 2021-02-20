import React, { useState, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { VStack, HStack } from "@nami-ui/stack";
import { Divider } from "@nami-ui/divider";
import FileSize from 'components/file-size'

import styles from './index.module.scss'

// eslint-disable-next-line import/no-webpack-loader-syntax
import UglifyWorker from 'workerize-loader?inline!./uglify-worker'

// eslint-disable-next-line import/no-webpack-loader-syntax
import FileSizeWorker from 'workerize-loader?inline!./file-size-worker'
import useLocalState from 'utils/use-local-state.ts'

const uglifyWorker = UglifyWorker()
const fileSizeWorker = FileSizeWorker()

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
        <VStack className={styles.container} spacing>
            <VStack spacing className={styles.header}>
                <h1>JS Size</h1>
                <p>计算某段 JS 代码的源文件大小，压缩后大小及 gzip 之后的大小</p>
                <SizesInfo sourceCode={sourceCode} minifiedCode={minifiedCode} />
            </VStack>

            <HStack $flex className={styles.codeareas}>
                <VStack $flex className={styles.codearea}>
                    <strong className={styles.title}>Source Code</strong>
                    <Divider />
                    <textarea
                        $flex
                        value={sourceCode}
                        className={styles.code}
                        onChange={(e) => setSourceCode(e.target.value)}
                        placeholder="请输入或粘贴 JS 源代码"
                    />
                </VStack>
                <Divider />
                <VStack $flex className={styles.codearea}>
                    <strong className={styles.title}>Minified Code</strong>
                    <Divider />
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
                </VStack>
            </HStack>
        </VStack>
    )
}

function SizesInfo({ className, sourceCode, minifiedCode, ...otherProps }) {
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
        <VStack className={className} {...otherProps}>
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
        </VStack>
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
