import React, { useRef, lazy, Suspense } from 'react'
import Editor from '@monaco-editor/react'

export default function FlexibleMonacoEditor({
    readOnly = false,
    language,
    value,
    onChange,
    style,
    ...otherProps
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
                    onChange={onChange}
                />
            </div>
        </Suspense>
    )
}
