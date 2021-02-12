import { Buffer } from 'buffer'

export default {
    encode(source) {
        return new Buffer(source).toString('base64')
    },

    decode(base64) {
        return new Buffer(base64, 'base64').toString('utf8')
    },
}
