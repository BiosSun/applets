import pako from 'pako'

export function size(str) {
    const original = new TextEncoder('utf-8').encode(str).length
    const gzip = original > 0 ? pako.gzip(str).length : 0

    return {
        original,
        gzip
    }
}
