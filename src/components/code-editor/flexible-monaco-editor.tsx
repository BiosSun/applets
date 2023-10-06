import React, { useRef, lazy, Suspense } from 'react'
import Editor from '@monaco-editor/react'

export default function FlexibleMonacoEditor({
    readOnly = false,
    language,
    value,
    onChange,
    style,
    ...otherProps
}: {
    readOnly?: boolean
    language: string
    value: string
    onChange: (value: string) => void
    style?: any
    [otherProp: string]: any
}) {
    return (
        <Suspense fallback={<div {...otherProps}>Loading...</div>}>
            <div style={{ ...style, overflow: 'hidden' }} {...otherProps}>
                <Editor
                    defaultLanguage={language}
                    value={value}
                    options={{
                        readOnly: readOnly,
                        wordWrap: 'on',
                        minimap: {
                            enabled: false,
                        },
                    }}
                    onChange={onChange as any}
                />
            </div>
        </Suspense>
    )
}
