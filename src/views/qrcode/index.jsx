import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'
import { produce } from 'immer'
import { Box, Flex, Separator } from '@radix-ui/themes'
import TextareaAutosize from 'react-textarea-autosize'
import { useResizeDetector } from 'react-resize-detector'
import { QRCodeSVG } from 'qrcode.react'
import { ErrorBoundary } from 'react-error-boundary'

import { Button } from '@/components/button'
import useLocalState from '@/utils/use-local-state.ts'

import styles from './index.module.scss'

function createNode() {
    return {
        id: uuidv4(),
        text: '',
    }
}

export default function QRCodeView() {
    const [textList, setTextList] = useLocalState('QRCode/textList', () => [createNode()])
    const [level, setLevel] = useLocalState('QRCode/level', () => 'L')

    function add() {
        setTextList(
            produce(textList, (list) => {
                list.push(createNode())
            })
        )
    }

    function change(id, text) {
        setTextList(
            produce(textList, (list) => {
                list.find((node) => node.id === id).text = text
            })
        )
    }

    function clean(id) {
        setTextList(
            produce(textList, (list) => {
                const item = list.find((node) => node.id === id)

                if (item) {
                    item.text = ''
                }
            })
        )
    }

    function remove(id) {
        setTextList(
            produce(textList, (list) => {
                return list.filter((node) => node.id !== id)
            })
        )
    }

    return (
        <Flex direction={'column'}>
            <Flex p={'3'} gap={'3'} align="center">
                Level:
                <Flex component="label" gap={'2'} align={'center'}>
                    <input type="radio" checked={level === 'L'} onChange={() => setLevel('L')} />L
                </Flex>
                <Flex component="label" gap={'2'} align={'center'}>
                    <input type="radio" checked={level === 'M'} onChange={() => setLevel('M')} />M
                </Flex>
                <Flex component="label" gap={'2'} align={'center'}>
                    <input type="radio" checked={level === 'Q'} onChange={() => setLevel('Q')} />Q
                </Flex>
                <Flex component="label" gap={'2'} align={'center'}>
                    <input type="radio" checked={level === 'H'} onChange={() => setLevel('H')} />H
                </Flex>
            </Flex>
            <Separator size={'4'} />
            <div className={styles.track}>
                {textList.map((node) => (
                    <Item
                        key={node.id}
                        text={node.text}
                        level={level}
                        disabledRemove={textList.length === 1 && !textList[0].text.trim()}
                        onChange={(text) => change(node.id, text)}
                        onRemove={() => (textList.length > 1 ? remove(node.id) : clean(node.id))}
                    />
                ))}
                <Button className={styles.addButton} onClick={add}>
                    + 添加
                </Button>
            </div>
        </Flex>
    )
}

function Item({ text, level, onChange, onRemove, disabledRemove }) {
    return (
        <Flex className={styles.card} direction={'column'} gap={'2'}>
            <Flex className={styles.cardActions} justify="end">
                <Button className={styles.button} onClick={onRemove} disabled={disabledRemove}>
                    删除 ↓
                </Button>
            </Flex>
            <Flex className={styles.item} gap={'3'}>
                <Input value={text} onChange={onChange} />
                <Display value={text} level={level} />
            </Flex>
        </Flex>
    )
}

function Input({ value, onChange, className }) {
    return (
        <TextareaAutosize
            className={clsx(className, styles.textarea)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入文本"
            minRows={5}
        />
    )
}

function Display({ value = '', level, className }) {
    value = value.trim()

    const { height: containerHeight, ref: containerEl } = useResizeDetector({ handleWidth: false })

    return (
        <Flex asChild direction={'column'}>
            <div ref={containerEl}>
                {!value ? (
                    <Box className={styles.qrcodePlaceholder} style={{ width: containerHeight }} />
                ) : (
                    <ErrorBoundary
                        key={value}
                        fallbackRender={({ error }) => (
                            <div
                                className={styles.qrcodePlaceholder}
                                style={{ width: containerHeight }}
                            >
                                <span className={clsx(className, styles.dangerMessage)}>
                                    {error?.message ?? '渲染错误'}
                                </span>
                            </div>
                        )}
                    >
                        <QRCodeSVG
                            className={clsx(className, styles.qrcode)}
                            value={value}
                            size={containerHeight}
                            level={level}
                            bgColor="transparent"
                        />
                    </ErrorBoundary>
                )}
            </div>
        </Flex>
    )
}
