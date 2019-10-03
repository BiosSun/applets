import React, { useState, useEffect } from 'react'

const KB = 1024 // bytes
const MB = KB * KB
const GB = MB * KB
const TB = GB * KB
const PB = TB * KB

const SIZES = [
    { start: 0, end: KB, key: 'bytes' },
    { start: KB, end: MB, key: 'kb' },
    { start: MB, end: GB, key: 'mb' },
    { start: GB, end: TB, key: 'gb' },
    { start: TB, end: PB, key: 'tb' },
    { start: PB, end: Number.MAX_SAFE_INTEGER, key: 'pb' }
]

const FIRST_SIZE = SIZES[0]

function findMatchSize(bytes) {
    return SIZES.find(size => size.start <= bytes && bytes < size.end)
}

function findNextSize(bytes, size) {
    const index = SIZES.indexOf(size)
    const nextSize = SIZES[(index + 1) % SIZES.length]
    const nextValue = format(bytes, nextSize)

    if (nextValue >= 1) {
        return nextSize
    } else {
        return FIRST_SIZE
    }
}

function format(bytes, size) {
    if (size.key === 'bytes') {
        return bytes
    } else {
        return (bytes / (size.start || 1)).toFixed(2)
    }
}

export default function FileSizeText({ bytes, ...otherProps }) {
    const [size, setSize] = useState(() => findMatchSize(bytes))
    const [value, setValue] = useState(() => format(bytes, size))

    useEffect(() => {
        setSize(findMatchSize(bytes))
    }, [bytes])

    useEffect(() => {
        setValue(format(bytes, size))
    }, [bytes, size])

    function switchSize() {
        setSize(findNextSize(bytes, size))
    }

    return (
        <span onClick={switchSize} {...otherProps}>
            {value} {size.key}
        </span>
    )
}
