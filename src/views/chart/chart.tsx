import { useRef, useEffect, useState, useMemo, useCallback, Fragment } from 'react'
import _ from 'lodash'
import clsx from 'clsx'
import { useFilePicker } from 'use-file-picker'
import { FileWithPath } from 'file-selector'
import { parse as parseCsv } from 'csv-parse/browser/esm/sync'

import {
    Panel as RPanel,
    PanelGroup as RPanelGroup,
    PanelResizeHandle as RPanelResizeHandle,
} from 'react-resizable-panels'
import { Flex, Separator } from '@radix-ui/themes'
import Panel from '@/components/panel'
import CodeEditor from '@/components/code-editor'
import { Button } from '@/components/button'
import { Select } from '@/components/select'
import useLocalState from '@/utils/use-local-state'

import { useData } from './use-data-code'
import {
    DEFAULT_VISUALS_STATE,
    VISUALS,
    VISUAL_NAMES,
    VisualConfig,
    VisualName,
    VisualsState,
} from './visual'

import styles from './chart.module.scss'

function deserializeVisual(val: VisualsState): VisualsState {
    return {
        name: val.name,
        configs: _.defaultsDeep(val.configs, DEFAULT_VISUALS_STATE.configs),
        codes: _.defaultsDeep(val.codes, DEFAULT_VISUALS_STATE.codes),
    }
}

export default function ChartView() {
    const [visual, setVisual] = useLocalState<VisualsState>(
        'Chart/Visual',
        DEFAULT_VISUALS_STATE,
        null,
        deserializeVisual
    )
    const { ConfigEditor, Chart, defaultDataCode, getDefaultConfig } = VISUALS[visual.name]

    const onNameChange = useCallback(
        (name: VisualName) => {
            setVisual({
                ...visual,
                name,
            })
            data.execCode()
        },
        [visual, setVisual]
    )

    const onConfigChange = useCallback(
        (config: VisualConfig) => {
            setVisual({
                ...visual,
                configs: {
                    ...visual.configs,
                    [visual.name]: config,
                },
            })
        },
        [visual, setVisual]
    )

    const onCodeChange = useCallback(
        (code: string) => {
            setVisual({
                ...visual,
                codes: {
                    ...visual.codes,
                    [visual.name]: code,
                },
            })
        },
        [visual, setVisual]
    )

    const data = useData(visual.codes[visual.name], defaultDataCode, onCodeChange)

    return (
        <RPanelGroup direction="vertical" className={styles.container} autoSaveId="chartContainer">
            <RPanel defaultSize={35} minSize={20}>
                <Panel
                    title="图表"
                    subtitle={
                        <Select
                            value={visual.name}
                            options={VISUAL_NAMES.map((name) => ({
                                label: name,
                                value: name,
                            }))}
                            onChange={onNameChange}
                        />
                    }
                >
                    <Chart
                        style={{ height: '100%' }}
                        config={visual.configs[visual.name] as any}
                        data={data.data}
                        onConfigChange={onConfigChange}
                    />
                </Panel>
            </RPanel>

            <Separator size="4" />
            <RPanelResizeHandle />

            <RPanel minSize={20}>
                <RPanelGroup direction="horizontal" autoSaveId="chartEditorContainer">
                    <RPanel minSize={30}>
                        <DataPanel
                            data={data.sourceData}
                            dataCode={data.code}
                            onDataCodeChange={data.setCode}
                            onDataCodeConfirm={data.execCode}
                            onDataChange={data.setSourceData}
                            onReset={data.reset}
                        />
                    </RPanel>

                    <Separator orientation="vertical" size="4" />
                    <RPanelResizeHandle />

                    <RPanel minSize={30}>
                        <Panel
                            title="视图"
                            note={
                                <Button onClick={() => onConfigChange(getDefaultConfig())}>
                                    重置
                                </Button>
                            }
                        >
                            <div
                                className={styles.configEditorContainer}
                                style={{ height: '100%' }}
                            >
                                <ConfigEditor
                                    value={visual.configs[visual.name] as any}
                                    onChange={onConfigChange}
                                />
                            </div>
                        </Panel>
                    </RPanel>
                </RPanelGroup>
            </RPanel>
        </RPanelGroup>
    )
}

function DataPanel(props: {
    data: unknown
    dataCode: string
    onDataCodeChange: (value: string) => void
    onDataCodeConfirm: () => void
    onDataChange: (data: unknown) => void
    onReset: () => void
    [otherProp: string]: any
}) {
    const {
        data,
        dataCode,
        onDataChange,
        onDataCodeChange,
        onDataCodeConfirm,
        onReset,
        ...otherProps
    } = props

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
                <Flex className={styles.funIntro} gap="2" align="center">
                    <span>function generator(</span>
                    <Flex gap="1">
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
                    </Flex>
                    <Flex gap="1">
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
                    </Flex>
                    <span>) {`{`}</span>
                </Flex>
            }
            note={<Button onClick={onReset}>重置</Button>}
            {...otherProps}
        >
            <CodeEditor
                style={{ height: '100%' }}
                language="javascript"
                value={dataCode}
                onChange={onDataCodeChange}
                onBlur={onDataCodeConfirm}
            />
            <Separator size="4" />
            <Flex className={styles.funOutro} align="center">{`}`}</Flex>
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
