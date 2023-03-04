import { useRef, useEffect, useState } from 'react'

/**
 * 一个 JS 代码的执行环境，返回解析到的结果值
 *
 * NOTE: 结果值不会立即返回，该 hook 会在结果生成后触发组件刷新，并返回结果值。
 *
 * @param {string} code JS 代码
 *
 */
export default function useSandbox(originalHTML, optionsCode) {
    const iframeRef = useRef(null)
    const [inited, setInited] = useState(false)
    const [transformedHTML, setTransformedHTML] = useState('')
    const [transformError, setTransformError] = useState('')
    const [transformDuration, setTransformDuration] = useState(undefined)

    // 创建 iframe，并在所在组件被销毁时，连带销毁该 iframe 元素
    useEffect(() => {
        const el = document.createElement('iframe')
        el.title = 'xss-sandbox'
        el.sandbox = 'allow-scripts'
        el.src = 'xss-sandbox.html?v=1'
        el.style = 'position: fixed; width: 0; height: 0; margin: 0; padding: 0; left: 0; top: 0'

        function handleLoad() {
            iframeRef.current = el
            setInited(true)
        }

        el.addEventListener('load', handleLoad)
        document.body.append(el)

        return () => {
            el.parentElement.removeChild(el)
        }
    }, [])

    // 发送消息
    useEffect(() => {
        if (inited) {
            iframeRef.current.contentWindow.postMessage({ optionsCode, originalHTML }, '*')
        }
    }, [inited, originalHTML, optionsCode])

    // 监听结果
    useEffect(() => {
        function handle(e) {
            if (
                e.origin === 'null' &&
                e.source === iframeRef.current.contentWindow &&
                e.data?.type === 'xss-sandbox-result'
            ) {
                setTransformedHTML(e.data.transformedHTML)
                setTransformError(e.data.error)
                setTransformDuration(e.data.duration)
            }
        }

        window.addEventListener('message', handle)

        return () => {
            window.removeEventListener('message', handle)
        }
    }, [])

    return [transformedHTML, transformError, transformDuration]
}
