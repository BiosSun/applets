const VirtualModulesPlugin = require('webpack-virtual-modules')
const fs = require('fs')

const FILES = [
    '../node_modules/uglify-js/lib/utils.js',
    '../node_modules/uglify-js/lib/ast.js',
    '../node_modules/uglify-js/lib/parse.js',
    '../node_modules/uglify-js/lib/transform.js',
    '../node_modules/uglify-js/lib/scope.js',
    '../node_modules/uglify-js/lib/output.js',
    '../node_modules/uglify-js/lib/compress.js',
    '../node_modules/uglify-js/lib/sourcemap.js',
    '../node_modules/uglify-js/lib/mozilla-ast.js',
    '../node_modules/uglify-js/lib/propmangle.js',
    '../node_modules/uglify-js/lib/minify.js',
    '../node_modules/uglify-js/tools/exports.js'
].map(file => require.resolve(file))

function getModuleCode() {
    const codes = FILES.map(file => fs.readFileSync(file, 'utf8'))
    return codes.join('\n\n')
}

module.exports = new VirtualModulesPlugin({
    'node_modules/@virtual/uglify-js.js': getModuleCode()
});
