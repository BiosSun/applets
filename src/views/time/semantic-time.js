import moment from 'moment'

const now = () => moment()
const today = () => moment()
const tomorrow = () => moment().add(1, 'days')
const yesterday = () => moment().add(-1, 'days')
const beforeYesterday = () => moment().add(-2, 'days')

const options = {
    n: now,
    now: now,
    xz: now,
    xianzai: now,
    dq: now,
    dangqian: now,
    现在: now,
    当前: now,

    t: today,
    td: today,
    today: today,
    jr: today,
    jt: today,
    jinri: today,
    jintian: today,
    今日: today,
    今天: today,

    tm: tomorrow,
    tomorrow: tomorrow,
    mt: tomorrow,
    mr: tomorrow,
    mingtian: tomorrow,
    mingri: tomorrow,
    明天: tomorrow,
    明日: tomorrow,

    ys: yesterday,
    yesterday: yesterday,
    zt: yesterday,
    zr: yesterday,
    zuotian: yesterday,
    zuori: yesterday,
    昨天: yesterday,
    昨日: yesterday,

    by: beforeYesterday,
    'before yesterday': beforeYesterday,
    qt: beforeYesterday,
    qr: beforeYesterday,
    qiantian: beforeYesterday,
    qianri: beforeYesterday,
    前天: beforeYesterday,
    前日: beforeYesterday,
}

export default function parse(str = '') {
    str = str.trim()
    return options[str]?.() ?? null
}
