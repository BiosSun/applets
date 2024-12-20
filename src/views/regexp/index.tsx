import clsx from 'clsx'
import { RefObject, useEffect, useRef, useState } from 'react'
import { Flex } from '@radix-ui/themes'
// @ts-ignore
import Parser from './parser/javascript.js'
import dom from '../../utils/dom'

import styles from './index.module.scss'
import useLocalState from '@/utils/use-local-state'

function useRegExpDiagram(containerRef: RefObject<HTMLElement>, expression: string) {
    const [rendering, setRendering] = useState(false)
    const [message, setMessage] = useState('')
    const [warnings, setWarnings] = useState([])

    useEffect(() => {
        const container = containerRef.current

        if (!container) {
            return
        }

        if (!expression) {
            dom.empty(container)
            return
        }

        let box: HTMLDivElement = document.createElement('div')
        box.className = clsx(styles.box, styles.rendering)
        container.appendChild(box)

        const parser = new Parser(box)

        async function render() {
            setRendering(true)

            try {
                await parser.parse(expression)

                if (containerRef.current !== container) {
                    throw new Error('容器元素改变')
                }

                await parser.render()

                dom.prev(box).forEach((el) => el.remove())
                box.classList.remove(styles.rendering)

                setMessage('')
            } catch (error) {
                if (error !== 'Render cancelled') {
                    setMessage((error as Error).message ?? error)
                }

                box.remove()
                box = undefined as any
            } finally {
                setWarnings(parser.warnings)
                setRendering(false)
            }
        }

        render()

        return () => {
            parser.cancel()
        }
    }, [containerRef, expression])

    return { rendering, message, warnings }
}

export default function RegExpView() {
    const [expr, setExpr] = useLocalState('RegExp/expr', '')
    const diagramRef = useRef<HTMLDivElement>(null)

    const render = useRegExpDiagram(diagramRef, expr)

    return (
        <Flex direction={'column'} p={'3'} gap={'3'}>
            <strong>
                绘制语法图的代码是直接从 Jeff Avallone 的{' '}
                <a href="https://regexper.com/" target="__blank">
                    regexper
                </a>{' '}
                项目中搬运过来的，如果你认为这个东西很好用，那么感谢他吧。
            </strong>
            <input
                className={styles.input}
                placeholder="请输入正则表达式"
                value={expr}
                onChange={(event) => setExpr(event.target.value)}
            />
            <div className={styles.diagramWrap}>
                <div className={styles.diagram} ref={diagramRef} />
                {render.rendering ? (
                    <div className={styles.loading} />
                ) : render.message ? (
                    <div className={styles.error}>{render.message}</div>
                ) : render.warnings?.length ? (
                    <div className={styles.warnings}>
                        {render.warnings.map((warn) => (
                            <div className={styles.warn}>{warn}</div>
                        ))}
                    </div>
                ) : null}
            </div>
        </Flex>
    )
}
