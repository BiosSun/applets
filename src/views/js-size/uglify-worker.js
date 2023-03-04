import * as Terser from 'terser'
import * as Comlink from 'comlink'

Comlink.expose({ minify })

export function minify(sourceCode) {
    return compressors.terser(sourceCode)
}

const compressors = {
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
