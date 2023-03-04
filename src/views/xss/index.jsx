import React, { useState, useMemo } from 'react'
import { html as HTMLBeautify } from 'js-beautify'
import { VStack, HStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import { Space } from '@nami-ui/space'
import { Toggle } from 'components/toggle'
import useSandbox from './use-sandbox'
import FlexibleMonacoEditor from './flexible-monaco-editor'
import RichTextEditor from './rich-text-editor'
import styles from './index.module.scss'

import DEFAULT_OPTIONS from './default-options-code'
import useLocalState from 'utils/use-local-state.ts'

export default function XSSView() {
    const [isEnabledXSS, setEnabledXSS] = useLocalState('XSS/isEnabledXSS', true)
    const [isEnabledBeautify, setEnabledBeautify] = useLocalState('XSS/isEnabledBeautify', false)
    const [isDisplayOptionsEditor, setDisplayOptionsEditor] = useState(false)
    const [optionsCode, setOptionsCode] = useLocalState('XSS/optionsCode', DEFAULT_OPTIONS)
    const [originalHTML, setOriginalHTML] = useLocalState('XSS/originalHTML', '')

    const [xssedHTML, transformError, transformDuration] = useSandbox(originalHTML, optionsCode)

    const transformedHTML = useMemo(() => {
        if (isEnabledBeautify) {
            return HTMLBeautify(xssedHTML)
        } else {
            return xssedHTML
        }
    }, [isEnabledBeautify, xssedHTML])

    return (
        <VStack className={styles.container} spacing padding>
            <HStack spacing align="center">
                <Toggle value={isEnabledXSS} label="Enabled XSS" onChange={setEnabledXSS} />
                <Toggle
                    label="Enabled Beautify"
                    value={isEnabledBeautify}
                    onChange={setEnabledBeautify}
                />

                {!transformError && Number.isFinite(transformDuration) ? (
                    <span className={styles.note}>
                        处理耗时：<strong>{transformDuration}ms</strong>
                    </span>
                ) : null}

                <Space $flex />

                <Toggle
                    value={isDisplayOptionsEditor}
                    label="显示 XSS 配置编辑器"
                    onChange={setDisplayOptionsEditor}
                />
            </HStack>

            <HStack $flex>
                {isDisplayOptionsEditor ? <Divider /> : null}

                {isDisplayOptionsEditor ? (
                    <VStack $flex $col={14}>
                        <Divider />

                        <FlexibleMonacoEditor
                            $flex
                            language="javascript"
                            value={optionsCode}
                            onChange={setOptionsCode}
                        />

                        <Divider />
                    </VStack>
                ) : null}

                <Divider />

                <VStack $flex>
                    <Divider />

                    <FlexibleMonacoEditor
                        $flex
                        language="html"
                        value={originalHTML}
                        onChange={setOriginalHTML}
                    />

                    <Divider />

                    <FlexibleMonacoEditor $flex language="html" readOnly value={transformedHTML} />

                    <Divider />
                </VStack>

                <Divider />

                {!isDisplayOptionsEditor ? (
                    <VStack $flex>
                        <Divider />

                        <RichTextEditor
                            $flex
                            className={styles.originalRichTextPanel}
                            value={originalHTML}
                            onChange={setOriginalHTML}
                        />

                        <Divider />

                        <RichTextEditor
                            $flex
                            className={styles.transformedRichTextPanel}
                            value={transformedHTML}
                        />

                        <Divider />
                    </VStack>
                ) : null}

                {!isDisplayOptionsEditor ? <Divider /> : null}
            </HStack>
        </VStack>
    )
}
