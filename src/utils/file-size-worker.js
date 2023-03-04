import pako from 'pako'
import * as Comlink from 'comlink'

Comlink.expose({ size })

function size(str) {
    const original = new TextEncoder('utf-8').encode(str).length
    const gzip = original > 0 ? pako.gzip(str).length : 0

    return {
        original,
        gzip,
    }
}
