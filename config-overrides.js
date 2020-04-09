const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const virtualUglifyJS = require('./scripts/virtual-uglify-js')

module.exports = function override(config, env) {
    config.output.globalObject = 'self'
    config.plugins.push(virtualUglifyJS)

    // 支持 manoco 语法高亮
    config.plugins.push(
        new MonacoWebpackPlugin({
            // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
            languages: ['json', 'html', 'javascript', 'scss', 'css', 'less', 'markdown', 'shell'],
        }),
    )

    return config
}
