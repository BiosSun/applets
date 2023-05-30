import dayjs from 'dayjs'

const FORMATS = [
    'YYYY年MM月DD日',
    'YYYY年MM月DD日 HH:mm',
    'YYYY年MM月DD日 Ahh:mm',
    'HH:mm YYYY年MM月DD日',
    'Ahh:mm YYYY年MM月DD日',
]

export function maybeMillisecondTimestamp(timestamp: string) {
    const str = timestamp.toString().trim()
    return /^\d+$/.test(str) && str.length > 10
}

export function parseTimestamp(str: string, ismts: boolean = maybeMillisecondTimestamp(str)) {
    let num = parseInt(str, 10)

    if (!ismts) {
        num *= 1000
    }

    return dayjs(num)
}

export function parseTime(str: string) {
    let time = dayjs(str)

    if (!time.isValid()) {
        time = dayjs(str, FORMATS)
    }

    return time
}
