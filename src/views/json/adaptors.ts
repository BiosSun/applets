import commentJSON from 'comment-json'

/**
 * 提供两组 JSON 的解析和序列化工具，一组是原生的，另一组则支持注释
 *
 * initialValid
 * 该方法用于初步检测字符串中是否是有效的 JSON 内容，它仅检测字符串中的首字符是否是非法字符，
 * 因此它无法确保所传入的字符串一定是有效的，但你仍可以在调用 parse 方法之间先通过它进行
 * 一次「初步地」检测。如果你需要一次性解析非常多的字符串，而且其中可能大部分都不是有效的
 * JSON 内容时，这样做将会很明显地提高性能。
 */

const native = {
    parse(str: string) {
        return JSON.parse(str)
    },

    stringify(val: any, space?: number) {
        return JSON.stringify(val, null, space)
    },

    initialValid(str: string) {
        return /^[{["\-\ntfn]/.test(str)
    },
}

const comment = {
    parse(str: string) {
        return commentJSON.parse(str)
    },

    stringify(val: any, space?: number) {
        return commentJSON.stringify(val, null, space)
    },

    initialValid(str: string) {
        return /^[{["\-\ntfn/]/.test(str)
    },
}

export const adaptors = { native, comment }
