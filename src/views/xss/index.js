import React, { useState, useMemo } from 'react'
import { CheckBox, VLinear, HLinear, Divider, Button, Space } from '@biossun/nami'
import { html as HTMLBeautify } from 'js-beautify'
import useSandbox from './use-sandbox'
import FlexibleMonacoEditor from './flexible-monaco-editor'
import RichTextEditor from './rich-text-editor'
import styles from './index.module.scss'

import DEFAULT_OPTIONS from './default-options-code'
import useLocalState from 'utils/use-local-state.ts'

export default function XSSView() {
    const [isEnabledXSS, setEnabledXSS] = useLocalState('XSS/isEnabledXSS', true)
    const [isEnabledBeautify, setEnabledBeautify] = useLocalState('XSS/isEnabledBeautify', false)
    const [isDisplayOptionsEditer, setDisplayOptionsEditer] = useState(false)
    const [optionsCode, setOptionsCode] = useLocalState('XSS/optionsCode', DEFAULT_OPTIONS)
    const [originalHTML, setOriginalHTML] = useLocalState('XSS/originalHTML', '')

    const [xssedHTML] = useSandbox(originalHTML, optionsCode)

    const transformedHTML = useMemo(() => {
        if (isEnabledBeautify) {
            return HTMLBeautify(xssedHTML)
        } else {
            return xssedHTML
        }
    }, [isEnabledBeautify, xssedHTML])

    return (
        <VLinear className={styles.container} padding="large" spacing>
            <h1>XSS</h1>
            <p>为 HTML 添加 XSS 过滤</p>

            <HLinear spacing align="center">
                <CheckBox
                    label="enabled xss"
                    checked={isEnabledXSS}
                    onChange={(event) => setEnabledXSS(event.target.checked)}
                />

                <CheckBox
                    label="enabled beautify"
                    checked={isEnabledBeautify}
                    onChange={(event) => setEnabledBeautify(event.target.checked)}
                />

                <Space $flex />

                <Button onClick={() => setDisplayOptionsEditer(!isDisplayOptionsEditer)}>
                    {isDisplayOptionsEditer ? '关闭' : '打开'} XSS 配置编辑器
                </Button>
            </HLinear>

            <HLinear $flex>
                {isDisplayOptionsEditer ? <Divider /> : null}

                {isDisplayOptionsEditer ? (
                    <VLinear $flex $col={14}>
                        <Divider />

                        <FlexibleMonacoEditor
                            $flex
                            language="javascript"
                            value={optionsCode}
                            onChange={setOptionsCode}
                        />

                        <Divider />
                    </VLinear>
                ) : null}

                <Divider />

                <VLinear $flex>
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
                </VLinear>

                <Divider />

                {!isDisplayOptionsEditer ? (
                    <VLinear $flex>
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
                    </VLinear>
                ) : null}

                {!isDisplayOptionsEditer ? <Divider /> : null}
            </HLinear>
        </VLinear>
    )
}
