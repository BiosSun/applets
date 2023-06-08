import dayjs from 'dayjs'
import { parseTime, parseTimestamp } from './utils'

const OPERATORS = new Set(['<', '>', '+', '-'])
const KEYWORDS = new Set(['now', 'today'])
const UNITS = new Set(['y', 'M', 'd', 'h', 'm', 's', 'ms'])

const KEYWORD_TIMES = {
    now: () => dayjs(),
    today: () => dayjs().startOf('day'),
}

const MANIPULATE_TIMES = {
    '': (source, unit, value) => source.set(unit === 'd' ? 'D' : unit, value),
    '<': (source, unit) => source.startOf(unit),
    '>': (source, unit) => source.endOf(unit),
    '+': (source, unit, value) => source.add(value, unit),
    '-': (source, unit, value) => source.subtract(value, unit),
}

function parseValue(str) {
    const match = str.match(/(\d+)(y|M|d|h|m|s|sm)/)
    return match ? { count: parseInt(match[1], 10), unit: match[2] } : null
}

function isOperator(str) {
    return OPERATORS.has(str)
}

function isKeyword(str) {
    return KEYWORDS.has(str)
}

function isUnit(str) {
    return UNITS.has(str)
}

function assert(cond, message) {
    if (!cond) {
        throw new Error(message)
    }
}

export default function parse(str = '') {
    str = str.trim()

    if (!str) {
        return null
    }

    let time = dayjs(0)
    let operator = ''

    function parseItem(item) {
        let value

        if (item.length > 1 && isOperator(item[0])) {
            parseItem(item[0])
            parseItem(item.substring(1))
        } else if (isOperator(item)) {
            assert(!operator, '操作符之后不能再跟操作符')
            operator = item
        } else if (isKeyword(item)) {
            assert(!operator, '关键字之前不支持操作符')
            time = KEYWORD_TIMES[item]()
        } else if (isUnit(item)) {
            assert(['<', '>'].includes(operator), '在时间单位之前，必须提供 `<` 或 `>` 操作符。')
            time = MANIPULATE_TIMES[operator](time, item)
            operator = ''
        } else if ((value = parseValue(item))) {
            assert(['', '+', '-'].includes(operator), '在时间值之前若提供操作符，则只能是 `+` 或 `-`。') // prettier-ignore
            time = MANIPULATE_TIMES[operator](time, value.unit, value.count)
            operator = ''
        } else if (/^\d+$/.test(item)) {
            time = parseTimestamp(item)
            assert(time.isValid(), '无效的时间戳')
        } else if (item.at(0) === '(' && item.at(-1) === ')') {
            time = parseTime(item.slice(1, -1))
            assert(time.isValid(), '无效的时间')
        } else {
            throw new Error('无效的表达式')
        }
    }

    str.split(/(?<!\([^)]*)[,\s]+/g).forEach(parseItem)

    return time
}
