import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'
import produce from 'immer'
import { VStack, HStack } from "@nami-ui/stack";
import TextareaAutosize from 'react-autosize-textarea'
import ReactResizeDetector from 'react-resize-detector'
import QRCode from 'qrcode.react'

import styles from './index.module.scss'
import useLocalState from 'utils/use-local-state.ts'

const MAX_TEXT_LENGTH = 1024

function createNode() {
    return {
        id: uuidv4(),
        text: '',
    }
}

export default function QRCodeView() {
    const [textList, setTextList] = useLocalState('QRCode/textList', () => [createNode()])

    function add() {
        setTextList(
            produce(textList, (list) => {
                list.push(createNode())
            }),
        )
    }

    function change(id, text) {
        setTextList(
            produce(textList, (list) => {
                list.find((node) => node.id === id).text = text
            }),
        )
    }

    function clean(id) {
        setTextList(
            produce(textList, (list) => {
                const item = list.find((node) => node.id === id)

                if (item) {
                    item.text = ''
                }
            }),
        )
    }

    function remove(id) {
        setTextList(
            produce(textList, (list) => {
                return list.filter((node) => node.id !== id)
            }),
        )
    }

    return (
        <VStack padding="huge" spacing="large">
            <h1>QRCode</h1>
            <p>生成一个二维码</p>
            <div className={styles.track}>
                {textList.map((node) => (
                    <Item
                        key={node.id}
                        text={node.text}
                        disabledRemove={textList.length === 1 && !textList[0].text.trim()}
                        onChange={(text) => change(node.id, text)}
                        onRemove={() => (textList.length > 1 ? remove(node.id) : clean(node.id))}
                    />
                ))}
                <button className={styles.addButton} onClick={add}>
                    + 添加
                </button>
            </div>
        </VStack>
    )
}

function Item({ text, onChange, onRemove, disabledRemove }) {
    return (
        <VStack className={styles.card} spacing="small">
            <HStack className={styles.cardActions} justify="end">
                <button
                    className={styles.cardDeleteButton}
                    onClick={onRemove}
                    disabled={disabledRemove}
                >
                    删除 ↓
                </button>
            </HStack>
            <HStack className={styles.item} spacing>
                <Input value={text} onChange={onChange} />
                <Display value={text} />
            </HStack>
        </VStack>
    )
}

function Input({ value, onChange, className }) {
    return (
        <TextareaAutosize
            className={clsx(className, styles.textarea)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入文本"
            rows={5}
        />
    )
}

function Display({ value = '', className }) {
    value = value.trim()

    return (
        <ReactResizeDetector handleHeight>
            {({ width, height }) => (
                <VStack>
                    {!value ? (
                        <div $flex className={styles.qrcodePlaceholder} style={{ width: height }} />
                    ) : value.length > MAX_TEXT_LENGTH ? (
                        <div className={styles.qrcodePlaceholder} style={{ width: height }}>
                            <span $flex className={clsx(className, styles.dangerMessage)}>
                                不可超过 1024 个字符
                            </span>
                        </div>
                    ) : (
                        <QRCode
                            $flex
                            className={clsx(className, styles.qrcode)}
                            value={value}
                            size={height}
                        />
                    )}
                </VStack>
            )}
        </ReactResizeDetector>
    )
}
