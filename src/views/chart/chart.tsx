import { useRef, useEffect, useState, useMemo, useCallback, Fragment } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import { useFilePicker } from 'use-file-picker'
import { FileWithPath } from 'file-selector'
import { parse as parseCsv } from 'csv-parse/browser/esm/sync'

import { HStack, VStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import Panel from '@/components/panel'
import CodeEditor from '@/components/code-editor'
import useLocalState from '@/utils/use-local-state'

import styles from './chart.module.scss'

import { useData } from './use-data-code'
import { VISUALS } from './visual'
import { Button } from '@/components/button'

const DEFAULT_VISUAL_NAME = 'graph'

interface VisualState {
    name: string;
    config: any;
}

const DEFAULT_VISUAL: VisualState = {
    name: DEFAULT_VISUAL_NAME,
    config: VISUALS[DEFAULT_VISUAL_NAME].getDefaultConfig(),
}

function deserializeVisual(val: VisualState): VisualState {
    return {
        name: val.name,
        config: _.defaultsDeep(val.config, VISUALS[val.name].getDefaultConfig()),
    }
}

export default function ChartView() {
    const [visual, setVisual] = useLocalState(
        'Chart/Visual',
        DEFAULT_VISUAL,
        null,
        deserializeVisual
    )
    const { ConfigEditor, Chart, defaultDataCode } = VISUALS[visual.name]
    const data = useData(defaultDataCode)

    const onConfigChange = useCallback(
        (config: typeof visual.config) => {
            setVisual({
                name: visual.name,
                config,
            })
        },
        [visual.name, setVisual]
    )

    return (
        <VStack className={styles.container}>
            <Panel $flex $col={8} title="图表">
                <Chart
                    $flex
                    config={visual.config as any}
                    data={data.data}
                    onConfigChange={onConfigChange}
                />
            </Panel>
            <Divider />
            <HStack $flex $col={16}>
                <DataPanel
                    $col={12}
                    $flex
                    data={data.sourceData}
                    dataCode={data.code}
                    onDataCodeChange={data.setCode}
                    onDataChange={data.setSourceData}
                    onReset={data.reset}
                />
                <Divider />
                <Panel
                    $flex
                    $col={12}
                    title="视图"
                    note={<Button onClick={() => setVisual(DEFAULT_VISUAL)}>重置</Button>}
                >
                    <ConfigEditor value={visual.config as any} onChange={onConfigChange} />
                </Panel>
            </HStack>
        </VStack>
    )
}

function DataPanel(props: {
    data: unknown
    dataCode: string
    onDataCodeChange: (value: string) => void
    onDataChange: (data: unknown) => void
    onReset: () => void
    [otherProp: string]: any
}) {
    const { data, dataCode, onDataChange, onDataCodeChange, onReset, ...otherProps } = props

    const { openFilePicker, file, errors, loading } = useDataFilePicker()
    const mounted = useRef(false)

    useEffect(() => {
        if (!mounted.current) {
            return
        }

        onDataChange(file?.data)
    }, [file])

    useEffect(() => {
        mounted.current = true
    }, [])

    return (
        <Panel
            title="数据"
            subtitle={
                <HStack className={styles.funIntro} spacing="small" align="center">
                    <span>function generator(</span>
                    <HStack spacing="tiny">
                        <div
                            className={clsx(styles.paramName, { [styles.active]: !!data })}
                            tabIndex={1}
                            title={
                                !data
                                    ? '选择本地文件作为源数据后，可以点击该参数名查看所上传的数据，也可以在代码中访问该参数。'
                                    : ''
                            }
                        >
                            source
                            <pre className={styles.data}>{JSON.stringify(data, null, 4)}</pre>
                        </div>
                        <span>:</span>
                        <button onClick={openFilePicker}>选择本地文件</button>
                        <span>,</span>
                    </HStack>
                    <HStack spacing="tiny">
                        <span
                            className={clsx(styles.paramName, styles.active)}
                            tabIndex={1}
                            title="提供 lodash 和 dayjs 这两套实用工具，以便于做数据处理。"
                        >
                            tools
                            <pre className={styles.data}>{`{ _: Lodash, dayjs: Dayjs }`}</pre>
                        </span>
                        <span>:</span>
                        <span>Tools</span>
                    </HStack>
                    <span>) {`{`}</span>
                </HStack>
            }
            note={<Button onClick={onReset}>重置</Button>}
            {...otherProps}
        >
            <CodeEditor $flex language="javascript" value={dataCode} onChange={onDataCodeChange} />
            <Divider />
            <HStack className={styles.funOutro} align="center">{`}`}</HStack>
        </Panel>
    )
}

function useDataFilePicker() {
    const { filesContent, plainFiles, errors, ...picker } = useFilePicker<DataFileParseError>({
        accept: ['.json', '.csv'],
    })

    const rawFile = plainFiles[0]
    const fileContent = filesContent[0]

    const file = useMemo(() => {
        if (!(rawFile && fileContent)) {
            return undefined
        }

        const type = rawFile.type
        const text = fileContent.content

        let data: unknown = undefined

        try {
            switch (type) {
                case 'application/json':
                    data = JSON.parse(text)
                    break
                case 'text/csv':
                    data = parseCsv(text, { cast: true, columns: true })
                    break
                default:
                    throw new Error(`不支持的文件类型：${type}`)
            }
        } catch (e) {
            errors.push(new DataFileParseError(rawFile, e as Error))
            return undefined
        }

        return { type, text, data }
    }, [rawFile, fileContent])

    return {
        ...picker,
        file,
        errors,
    }
}

class DataFileParseError extends Error {
    name = 'DataFileParseError'
    causedByFile: FileWithPath
    constructor(file: FileWithPath, error: Error) {
        super(error.message, { cause: error })
        this.causedByFile = file
    }
}
