import _ from 'lodash'
import { quantile } from '@/utils/quantile'

export const STAT_METHODS = {
    min: {
        name: 'min',
        stat: (val: number[]) => _.min(val),
    },
    max: {
        name: 'max',
        stat: (val: number[]) => _.max(val),
    },
    last: {
        name: 'last',
        stat: (val: number[]) => val.at(-1),
    },
    p50: {
        name: 'p50',
        stat: (val: number[]) => quantile(val, 0.5),
    },
    p80: {
        name: 'p80',
        stat: (val: number[]) => quantile(val, 0.8),
    },
    p90: {
        name: 'p90',
        stat: (val: number[]) => quantile(val, 0.9),
    },
    p99: {
        name: 'p99',
        stat: (val: number[]) => quantile(val, 0.99),
    },
    p999: {
        name: 'p99.9',
        stat: (val: number[]) => quantile(val, 0.999),
    },
    p9999: {
        name: 'p99.99',
        stat: (val: number[]) => quantile(val, 0.9999),
    },
    avg: {
        name: 'avg',
        stat: (val: number[]) => val.reduce((t, v) => t + v, 0) / val.length,
    },
    total: {
        name: 'total',
        stat: (val: number[]) => val.reduce((t, v) => t + v, 0),
    },
} as const

export type StatMethod = keyof typeof STAT_METHODS

export const ALL_STAT_METHOD_NAMES = Object.keys(STAT_METHODS) as StatMethod[]