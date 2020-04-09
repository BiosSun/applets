import React, { useRef, useEffect, useState } from 'react'

export default function RichTextEditor({ value, onChange, ...otherProps }) {
    const iframeRef = useRef(null)
    const [inited, setInited] = useState(false)

    useEffect(() => {
        if (inited) {
            iframeRef.current.contentWindow.postMessage({ value }, '*')
        }
    }, [inited, value])

    useEffect(() => {
        function handle(e) {
            if (e.source === iframeRef.current.contentWindow) {
                onChange(e.data.value)
            }
        }

        window.addEventListener('message', handle)

        return () => {
            window.removeEventListener('message', handle)
        }
    }, [onChange])

    return (
        <iframe
            ref={iframeRef}
            {...otherProps}
            onLoad={() => setInited(true)}
            title="rich-text-editor"
            sandbox="allow-scripts"
            src={process.env.PUBLIC_URL + '/xss-rich-text.html?readonly=' + (onChange ? 1 : 0)}
        />
    )
}
