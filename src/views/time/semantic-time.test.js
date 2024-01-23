import { expect, test } from 'vitest'
import dayjs from 'dayjs'
import parse from './semantic-time'

test('parse', () => {
    compare('', null)
    compare('now', dayjs())
    compare('today', dayjs().startOf('day'))
    compare('now 3h', dayjs().set('hour', 3))
    compare('now +3h', dayjs().add(3, 'hours'))
    compare('now -3h', dayjs().subtract(3, 'hours'))
    compare('now <y', dayjs().startOf('year'))
    compare('now >y', dayjs().endOf('year'))
    compare('today - 1d', dayjs().startOf('day').subtract(1, 'day'))
    compare('today -1ms', dayjs().startOf('day').subtract(1, 'millisecond'))
    compare('1676892034192 - 1d', dayjs(1676892034192).subtract(1, 'day'))
    compare('(2023-02-20 19:20:34.192) - 1d', dayjs('2023-02-20 19:20:34.192').subtract(1, 'day'))
    compare(
        '2023y 2M 20d 19h 20m 34s 192ms -1d',
        dayjs('2023-02-20 19:20:34.192').subtract(1, 'day')
    )
    compare(
        'now >d +1y -3M 0m 0s 0ms',
        dayjs()
            .endOf('day')
            .add(1, 'year')
            .subtract(3, 'months')
            .set('minute', 0)
            .set('second', 0)
            .set('millisecond', 0)
    )
    compare(
        'now, >d, +1y, -3M, 0m 0s 0ms',
        dayjs()
            .endOf('day')
            .add(1, 'year')
            .subtract(3, 'months')
            .set('minute', 0)
            .set('second', 0)
            .set('millisecond', 0)
    )
})

function compare(expr, expected) {
    expect(parse(expr)).toSatisfy((received /* number | null */) => {
        if (!(dayjs.isDayjs(received) && dayjs.isDayjs(expected))) {
            return received === expected
        }

        if (/\bnow\b/.test(expr)) {
            const diff = Math.abs(expected.valueOf() - expected.valueOf())
            return diff < 10
        }

        return received.valueOf() === expected.valueOf()
    })
}
