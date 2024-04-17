import { useState, useMemo } from 'react'
import { html as HTMLBeautify } from 'js-beautify'
import { Flex, Box, Separator } from '@radix-ui/themes'
import useLocalState from '@/utils/use-local-state.ts'
import { Toggle } from '@/components/toggle'
import CodeEditor from '@/components/code-editor'
import { Space } from '@/components/space'
import useSandbox from './use-sandbox'
import RichTextEditor from './rich-text-editor'
import styles from './index.module.scss'

import DEFAULT_OPTIONS from './default-options-code'

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
        <Flex direction={'column'} className={styles.container} p={'3'} gap={'3'}>
            <Flex gap={'3'} align={'center'}>
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

                <Space />

                <Toggle
                    value={isDisplayOptionsEditor}
                    label="显示 XSS 配置编辑器"
                    onChange={setDisplayOptionsEditor}
                />
            </Flex>

            <Flex flexGrow="1" align={'stretch'}>
                {isDisplayOptionsEditor ? <Separator orientation="vertical" size={'4'} /> : null}

                {isDisplayOptionsEditor ? (
                    <Flex direction={'column'} flexGrow={'3'} flexShrink={'1'} flexBasis={'0'} minWidth={'0'}>
                        <Separator orientation={'horizontal'} size={'4'} />

                        <Box asChild flexGrow={'1'}>
                            <CodeEditor
                                language="javascript"
                                value={optionsCode}
                                onChange={setOptionsCode}
                            />
                        </Box>

                        <Separator orientation={'horizontal'} size={'4'} />
                    </Flex>
                ) : null}

                <Separator orientation="vertical" size={'4'} />

                <Flex flexGrow={'2'} flexShrink={'1'} flexBasis={'0'} direction={'column'} minWidth={'0'}>
                    <Separator orientation={'horizontal'} size={'4'} />

                    <Box asChild flexGrow={'1'}>
                        <CodeEditor
                            language="html"
                            value={originalHTML}
                            onChange={setOriginalHTML}
                        />
                    </Box>

                    <Separator orientation={'horizontal'} size={'4'} />

                    <Box asChild flexGrow={'1'}>
                        <CodeEditor language="html" readOnly value={transformedHTML} />
                    </Box>

                    <Separator orientation={'horizontal'} size={'4'} />
                </Flex>

                <Separator orientation="vertical" size={'4'} />

                {!isDisplayOptionsEditor ? (
                    <Flex flexGrow={'2'} flexShrink={'1'} flexBasis={'0'} direction={'column'} minWidth={'0'}>
                        <Separator orientation={'horizontal'} size={'4'} />

                        <Box asChild flexGrow={'1'}>
                            <RichTextEditor
                                className={styles.originalRichTextPanel}
                                value={originalHTML}
                                onChange={setOriginalHTML}
                            />
                        </Box>

                        <Separator orientation={'horizontal'} size={'4'} />

                        <Box asChild flexGrow={'1'}>
                            <RichTextEditor
                                className={styles.transformedRichTextPanel}
                                value={transformedHTML}
                            />
                        </Box>

                        <Separator orientation={'horizontal'} size={'4'} />
                    </Flex>
                ) : null}

                {!isDisplayOptionsEditor ? <Separator orientation={'vertical'} size={'4'} /> : null}
            </Flex>
        </Flex>
    )
}
