export default {
    encode(source) {
        return window.btoa(source)
    },

    decode(base64) {
        return window.atob(base64)
    },
}
