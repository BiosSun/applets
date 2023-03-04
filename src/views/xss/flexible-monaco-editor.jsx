import React, { useRef, lazy, Suspense } from 'react'
import ReactResizeDetector from 'react-resize-detector'
import MonacoEditor from './monaco-editor'

export default function FlexibleMonacoEditor({
    readOnly = false,
    language,
    value,
    onChange,
    style,
    ...otherProps
}) {
    const editorRef = useRef(null)

    return (
        <Suspense fallback={<div {...otherProps}>Loading...</div>}>
            <ReactResizeDetector
                handleWidth
                handleHeight
                onResize={() => {
                    if (editorRef.current) {
                        editorRef.current.layout()
                    }
                }}
            >
                <div style={{ ...style, overflow: 'hidden' }} {...otherProps}>
                    <MonacoEditor
                        language={language}
                        value={value}
                        options={{
                            readOnly: readOnly,
                            wordWrap: 'on',
                            minimap: {
                                enabled: false,
                            },
                        }}
                        onChange={onChange}
                        editorDidMount={(editor) => (editorRef.current = editor)}
                    />
                </div>
            </ReactResizeDetector>
        </Suspense>
    )
}
