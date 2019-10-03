const virtualUglifyJS = require('./scripts/virtual-uglify-js')

module.exports = function override(config, env) {
    config.output.globalObject = 'self'
    config.plugins.push(virtualUglifyJS)
    return config
}
