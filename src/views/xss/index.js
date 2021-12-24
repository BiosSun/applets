import React, { useState, useMemo } from 'react'
import { VStack, HStack } from '@nami-ui/stack'
import { CheckBox } from '@nami-ui/checkbox'
import { Divider } from '@nami-ui/divider'
import { Space } from '@nami-ui/space'
import { Button } from '@nami-ui/button'
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
        <VStack className={styles.container} spacing padding>
            <HStack spacing align="center">
                <CheckBox label="enabled xss" checked={isEnabledXSS} onChange={setEnabledXSS} />

                <CheckBox
                    label="enabled beautify"
                    checked={isEnabledBeautify}
                    onChange={setEnabledBeautify}
                />

                <Space $flex />

                <Button onClick={() => setDisplayOptionsEditer(!isDisplayOptionsEditer)}>
                    {isDisplayOptionsEditer ? '关闭' : '打开'} XSS 配置编辑器
                </Button>
            </HStack>

            <HStack $flex>
                {isDisplayOptionsEditer ? <Divider /> : null}

                {isDisplayOptionsEditer ? (
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

                {!isDisplayOptionsEditer ? (
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

                {!isDisplayOptionsEditer ? <Divider /> : null}
            </HStack>
        </VStack>
    )
}
