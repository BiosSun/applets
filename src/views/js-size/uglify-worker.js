import UglifyJS from '@virtual/uglify-js'
import * as Terser from 'terser'

export function minify(sourceCode) {
    try {
        return compressors.uglify(sourceCode)
    } catch {
        return compressors.terser(sourceCode)
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
    async terser(sourceCode) {
        const options = {
            parse: {
                bare_returns: true,
            },
        }

        try {
            return (await Terser.minify(sourceCode, options)).code
        } catch (error) {
            // 在将错误信息从 worker 中传输给主进程时，workerize-loader 丢失了错误对象中的自定义属性
            // 因此这里通过和主线程约定使用 JSON 编码错误信息来保留它们。
            error.message = JSON.stringify({
                name: error.name,
                message: error.message,
                line: error.line,
                col: error.col,
                pos: error.pos,
            })

            throw error
        }
    },
}
