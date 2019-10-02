const virtualUglifyJS = require('./scripts/virtual-uglify-js');

module.exports = function override(config, env) {
    config.plugins.push(virtualUglifyJS);
    return config
}
