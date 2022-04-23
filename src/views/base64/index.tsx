import { Buffer } from 'buffer'
import toArrayBuffer from 'to-arraybuffer'
import { useMemo } from 'react'
import { VStack, HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import Panel from '../../components/panel'

import styles from './index.module.scss'
import useLocalState, { updateLocalState } from 'utils/use-local-state'
import Mime from './mime'

function string2buffer(str: string) {
    return toArrayBuffer(Buffer.from(str, 'utf8'))
}

function buffer2string(buffer: ArrayBuffer) {
    return Buffer.from(buffer).toString('utf8')
}

function buffer2objecturl(buffer: ArrayBuffer, type: string) {
    const blob = new Blob([buffer], { type })
    return URL.createObjectURL(blob)
}

function base642buffer(str: string) {
    return toArrayBuffer(Buffer.from(str, 'base64'))
}

function base642dataurl(type: string, str: string) {
    return str ? `data:${type};base64,${encodeURIComponent(str)}` : ''
}

function parsedataurl(str: string) {
    const match = /data:(.+?);base64,(.+)/i.exec(str)

    if (match === null) {
        return { data: str }
    }

    const type = match[1]
    let data = match[2]

    try {
        data = decodeURIComponent(data)
    } catch (error) {
        console.info(error)
    }

    return { isDataUrl: true, type, data }
}

// TODO clean 'Base64/source'

const EMPTY_ARRAY_BUFFER = new ArrayBuffer(0)

type Source = {
    value: ArrayBuffer
    error?: string
}

type Base64 = {
    value: string
    error?: string
}

const DEFAULT_SOURCE: Source = {
    value: EMPTY_ARRAY_BUFFER,
    error: undefined,
}

const DEFAULT_BASE64: Base64 = {
    value: '',
    error: undefined,
}

updateLocalState('Base64/source', (value) => {
    if (typeof value === 'string') {
        return DEFAULT_SOURCE
    }

    return value
})

export default function Base64View() {
    const [type, setType] = useLocalState('Base64/type', 'text/plain')
    const [source, setSource] = useLocalState('Base64/source', DEFAULT_SOURCE)
    const [base64, setBase64] = useLocalState('Base64/base64', DEFAULT_BASE64)
    const [isDataUrl, setIsDataUrl] = useLocalState('Base64/isDataUrl', false)

    const mime = useMemo(() => Mime.from(type), [type])

    function btoa(data: ArrayBuffer) {
        let value: string = ''
        let error: string = undefined

        try {
            value = Buffer.from(data).toString('base64')
        } catch (e) {
            error = e.message
        }

        return { value, error }
    }

    function atob(data: string) {
        let value: ArrayBuffer = EMPTY_ARRAY_BUFFER
        let error: string = undefined

        try {
            value = base642buffer(data)
        } catch (e) {
            error = e
        }

        return { value, error }
    }

    function updateBySource(type: string, value: ArrayBuffer, error?: string) {
        setType(type)
        setSource({ value, error })
        setBase64(error ? { value: '' } : btoa(value))
    }

    function updateByBase64(type: string, value: string, error: string) {
        setType(type)
        setBase64({ value, error })
        setSource(error ? { value: EMPTY_ARRAY_BUFFER } : atob(value))
    }

    function clean() {
        updateBySource('text/plain', EMPTY_ARRAY_BUFFER)
    }

    function fromText(str: string) {
        const type = mime.is('text') ? mime.type : 'text/plain'
        const buffer = string2buffer(str)
        updateBySource(type, buffer)
    }

    function fromFile(file: File) {
        if (!file) {
            return
        }

        if (file.size > 1024 * 1024 * 70) {
            updateBySource(mime.type, source.value, '文件不得大于 70MB')
            return
        }

        var reader = new FileReader()

        reader.addEventListener(
            'load',
            () => updateBySource(file.type, reader.result as ArrayBuffer),
            false
        )

        reader.readAsArrayBuffer(file)
    }

    function fromBase64(str: string) {
        let info: ReturnType<typeof parsedataurl>
        let error = undefined

        try {
            info = parsedataurl(str)
        } catch (e) {
            error = e.message
        }

        setIsDataUrl(info.isDataUrl ?? isDataUrl)
        updateByBase64(info.type ?? mime.type, info.data, error)
    }

    return (
        <VStack className={styles.container}>
            <HStack spacing padding align="center">
                <HStack component="label" spacing="small" align="center">
                    <input
                        type="checkbox"
                        checked={isDataUrl}
                        onChange={(event) => setIsDataUrl(event.target.checked)}
                    />
                    Data URLs
                </HStack>
                <Divider />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => fromFile(event.target.files[0])}
                    onClick={(event) => ((event.target as HTMLInputElement).value = null)}
                />
                <Divider />
                type: {mime.type}
                <Divider />
                <button onClick={clean}>Clean</button>
            </HStack>

            <HStack $flex className={styles.panels}>
                <SourcePanel $flex {...source} mime={mime} onChange={fromText} />
                <Divider />
                <Base64Panel
                    $flex
                    {...base64}
                    mime={mime}
                    isDataUrl={isDataUrl}
                    onChange={fromBase64}
                />
            </HStack>
        </VStack>
    )
}

function SourcePanel(props: {
    mime: Mime
    value: ArrayBuffer
    error?: string
    onChange: (txt: string) => void
    [otherProp: string]: any
}) {
    const { mime, value: _value, error, onChange, ...otherProps } = props

    const value = useMemo(() => {
        if (_value.byteLength === 0) {
            return ''
        } else if (mime.is('text')) {
            return buffer2string(_value)
        } else {
            return buffer2objecturl(_value, mime.type)
        }
    }, [mime, _value])

    return (
        <Panel title="源码" error={error} {...otherProps}>
            {mime.is('text') || !value ? (
                <textarea
                    $flex
                    className={styles.textarea}
                    placeholder="请输入源码"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <div $flex className={styles.imageBox}>
                    <img className={styles.image} src={value} alt="" />
                </div>
            )}
        </Panel>
    )
}

function Base64Panel(props: {
    mime: Mime
    isDataUrl: boolean
    value: string
    error?: string
    onChange: (base64: string) => void
    [otherProp: string]: any
}) {
    const { mime, isDataUrl, value: _value, error, onChange, ...otherProps } = props

    const value = useMemo(() => {
        return isDataUrl ? base642dataurl(mime.type, _value) : _value
    }, [mime, isDataUrl, _value])

    return (
        <Panel title="编码" error={error} {...otherProps}>
            <textarea
                $flex
                className={styles.textarea}
                placeholder="请输入编码"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </Panel>
    )
}
