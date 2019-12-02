import UglifyJS from '@virtual/uglify-js'
import Terser from 'terser'

export function minify(sourceCode) {
    try {
        return compressors.uglify(sourceCode);
    } catch {
        return compressors.terser(sourceCode);
    }
}

const compressors = {
    uglify(sourceCode) {
        const result = UglifyJS.minify(sourceCode)

        if (result.error) {
            throw result.error
        } else {
            return result.code
        }
    },
    terser(sourceCode) {
        const result = Terser.minify(sourceCode)

        if (result.error) {
            throw result.error
        }
        else {
            return result.code
        }
    }
}
