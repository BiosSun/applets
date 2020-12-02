import React, { useState, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import produce from 'immer'
import { VLinear, HLinear, Divider, Button, TextBox } from '@biossun/nami'
import FileSize from 'components/file-size'
import useLocalState from 'utils/use-local-state'

import styles from './index.module.scss'

export default function DigitsView() {
    const [numbers, setNumbers] = useLocalState('Digits/numbers', ['0'])

    const binaries = useMemo(() => {
        return numbers.map((numstr) => {
            const num = Number(numstr) || 0
            return Array.from(num.toString(2).padStart(64, 0))
        })
    }, [numbers])

    function addNewItem() {
        setNumbers(
            produce(numbers, (numbers) => {
                numbers.push('')
            }),
        )
    }

    function changeNumber(index, value) {
        setNumbers(
            produce(numbers, (numbers) => {
                numbers[index] = value
            }),
        )
    }

    return (
        <VLinear spacing padding="large">
            {numbers.map((num, index) => (
                <HLinear key={index} align="center" spacing>
                    <TextBox
                        className={styles.numberInput}
                        $col={2}
                        value={num}
                        onChange={(event, value) => changeNumber(index, value)}
                    />
                    <BinaryBar
                        $flex
                        value={binaries[index]}
                        onChange={(value) => changeNumber(index, parseInt(value.join(''), 2) + '')}
                    />
                </HLinear>
            ))}
            <HLinear>
                <Button type="primary" onClick={addNewItem}>
                    添加
                </Button>
            </HLinear>
        </VLinear>
    )
}

function BinaryBar({ value, onChange }) {
    return (
        <div className={styles.binaryBar}>
            {value.map((char, index) => (
                <div
                    key={index}
                    className={clsx(styles.binaryBarItem, styles[`binaryBarItem${char}`])}
                    data-index={63 - index}
                    onClick={() => {
                        onChange(
                            produce(value, (val) => {
                                val[index] = char === '0' ? '1' : '0'
                            }),
                        )
                    }}
                >
                    {char}
                </div>
            ))}
        </div>
    )
}
