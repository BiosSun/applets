import UglifyJS from '@virtual/uglify-js'

export function minify(sourceCode) {
    const result = UglifyJS.minify(sourceCode)

    if (result.error) {
        throw result.error
    } else {
        return result.code
    }
}
