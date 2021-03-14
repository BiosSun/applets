const _ = require('lodash')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const virtualUglifyJS = require('./scripts/virtual-uglify-js')
const WebpackCdnPlugin = require('webpack-cdn-plugin')

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

    // 使用 jsdelivr CDN
    config.plugins.push(
        new WebpackCdnPlugin({
            prodUrl: '//cdn.jsdelivr.net/npm/:name@:version/:path',
            modules: [
                {
                    name: 'react',
                    var: 'React',
                    path: 'umd/react.production.min.js',
                },
                {
                    name: 'react-dom',
                    var: 'ReactDOM',
                    path: 'umd/react-dom.production.min.js',
                },
                {
                    name: 'js-beautify',
                    var: 'beautifier',
                    path: 'js/lib/beautifier.min.js',
                },
                {
                    name: 'localforage',
                    var: 'localforage',
                    path: 'dist/localforage.min.js',
                },
                {
                    name: 'immer',
                    var: 'immer',
                    path: 'dist/immer.umd.production.min.js',
                },
                {
                    name: 'lodash',
                    var: '_',
                    path: 'lodash.min.js',
                },
                {
                    name: 'moment',
                    var: 'moment',
                    path: 'min/moment.min.js',
                },
                {
                    name: 'pako',
                    var: 'pako',
                    path: 'dist/pako.min.js',
                },
                {
                    name: 'terser',
                    var: 'Terser',
                    path: 'dist/bundle.min.js',
                },
            ],
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
