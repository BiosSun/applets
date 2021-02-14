const _ = require('lodash')
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

    // 支持 RegExp 的正则渲染器
    _.set(config, 'resolve.alias.snapsvg', 'snapsvg-cjs')

    config.module.rules[1].oneOf.unshift({
        test: /\.peg$/,
        loader: require.resolve('./scripts/canopy-loader'),
    })

    return config
}
