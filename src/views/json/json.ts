import commentJSON from 'comment-json'
import jmespath from 'jmespath'

/**
 * 提供两组 JSON 的解析和序列化工具，一组是原生的，另一组则支持注释
 *
 * initialValid
 * 该方法用于初步检测字符串中是否是有效的 JSON 内容，它仅检测字符串中的首字符是否是非法字符，
 * 因此它无法确保所传入的字符串一定是有效的，但你仍可以在调用 parse 方法之间先通过它进行
 * 一次「初步地」检测。如果你需要一次性解析非常多的字符串，而且其中可能大部分都不是有效的
 * JSON 内容时，这样做将会很明显地提高性能。
 */
interface Adaptor {
    parse: (str: string) => any
    stringify: (val: any, space?: number) => string | undefined
    initialValid: (str: string) => boolean
}

const adaptors: { [key in 'native' | 'comment']: Adaptor } = {
    native: {
        parse(str: string) {
            return globalThis.JSON.parse(str)
        },

        stringify(val: any, space?: number) {
            return globalThis.JSON.stringify(val, null, space)
        },

        initialValid(str: string) {
            return /^[{["\-\ntfn]/.test(str)
        },
    },
    comment: {
        parse(str: string) {
            return commentJSON.parse(str)
        },

        stringify(val: any, space?: number) {
            return commentJSON.stringify(val, null, space)
        },

        initialValid(str: string) {
            return /^[{["\-\ntfn/]/.test(str)
        },
    },
}

export default class Json {
    private adaptor: Adaptor

    /**
     * @param comment - 是否支持注释
     */
    constructor(comment: boolean = false) {
        this.adaptor = comment ? adaptors.comment : adaptors.native
    }

    private initialValid(text: string) {
        if (!this.adaptor.initialValid(text)) {
            let message = '无效的 JSON 源码'

            if (this.adaptor !== adaptors.comment && adaptors.comment.initialValid(text)) {
                message += '，若您的 JSON 中包含注释，请勾选「支持注释」'
            }

            throw new Error(message)
        }
    }

    parse(text: string) {
        if (!text) {
            return undefined
        }

        this.initialValid(text)

        return this.adaptor.parse(text)
    }

    deepParse(val: any) {
        let changed = new Map<string, any>()

        const deep = (val: any) => {
            switch (Json.getValueType(val)) {
                case 'string': {
                    const data = parseStringValue(val)
                    return data !== undefined ? this.deepParse(data) : val
                }

                case 'object': {
                    Object.entries(val).forEach(([k, v]) => {
                        const r = deep(v)
                        if (r !== v) {
                            changed.set(k, r)
                        }
                    })

                    if (changed.size) {
                        const newVal = { ...val }
                        changed.forEach((v, k) => (newVal[k] = v))
                        changed.clear()
                        return newVal
                    } else {
                        return val
                    }
                }

                case 'array': {
                    val.forEach((v, i) => {
                        const r = deep(v)
                        if (r !== v) {
                            changed.set(i, r)
                        }
                    })

                    if (changed.size) {
                        const newVal = [...val]
                        changed.forEach((v, i) => (newVal[i] = v))
                        changed.clear()
                        return newVal
                    } else {
                        return val
                    }
                }

                default:
                    return val
            }
        }

        const parseStringValue = (val: string) => {
            val = val.trim()

            if (!val || !this.adaptor.initialValid(val)) {
                return undefined
            }

            try {
                return this.adaptor.parse(val)
            } catch {
                return undefined
            }
        }

        return deep(val)
    }

    format(text: string) {
        return this.adaptor.stringify(this.parse(text), 4)
    }

    compress(text: string) {
        return this.adaptor.stringify(this.parse(text), 0)
    }

    filter(val: any, expr: string = '') {
        if (!expr) {
            return val
        }

        const filteredValue = jmespath.search(val, expr)

        if (filteredValue == null) {
            return val
        }

        return filteredValue
    }

    private static TYPE_SORTS = {
        null: 1,
        boolean: 2,
        number: 3,
        string: 4,
        array: 5,
        object: 6,
        unknown: 100,
    }

    static getValueType(
        value: any
    ): 'null' | 'boolean' | 'string' | 'number' | 'array' | 'object' | 'bigint' | 'symbol' | 'undefined' | 'function' {
        const type = typeof value

        if (type === 'object') {
            if (value === null) {
                return 'null'
            } else if (Array.isArray(value)) {
                return 'array'
            } else {
                return 'object'
            }
        }

        return type
    }

    static compareValue(v1: any, v2: any) {
        const type1 = Json.getValueType(v1)
        const type2 = Json.getValueType(v2)

        const typeIndex1 = Json.TYPE_SORTS[type1] ?? Json.TYPE_SORTS.unknown
        const typeIndex2 = Json.TYPE_SORTS[type2] ?? Json.TYPE_SORTS.unknown

        if (typeIndex1 !== typeIndex2) {
            return typeIndex1 - typeIndex2
        }

        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0
    }
}
