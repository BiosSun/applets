import React, { useRef } from 'react'
import MonacoEditor from 'react-monaco-editor'
import ReactResizeDetector from 'react-resize-detector'

export default function FlexibleMonocoEditor({
    readOnly = false,
    language,
    value,
    onChange,
    ...otherProps
}) {
    const editorRef = useRef(null)

    return (
        <div {...otherProps}>
            <ReactResizeDetector
                handleWidth
                handleHeight
                onResize={() => {
                    if (editorRef.current) {
                        editorRef.current.layout()
                    }
                }}
            >
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
            </ReactResizeDetector>
        </div>
    )
}
