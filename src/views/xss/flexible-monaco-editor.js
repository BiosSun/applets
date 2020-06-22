import React, { useRef, lazy, Suspense } from 'react'
import ReactResizeDetector from 'react-resize-detector'

const MonacoEditor = lazy(() =>
    import(/* webpackChunkName: "venders_react-monaco-editor" */ 'react-monaco-editor'),
)

export default function FlexibleMonocoEditor({
    readOnly = false,
    language,
    value,
    onChange,
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
                <div {...otherProps}>
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
