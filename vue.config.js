// vue.config.js
const path = require('path');
module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        output: {
            filename: 'ayumi-tooltip.js',
        },
        optimization: {
            splitChunks: false
        }
    },
    chainWebpack: config => {
        config.plugins.delete('html')
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')
        if (process.env.NODE_ENV === 'test') {
            config.optimization.minimize(false);
        }
    },
    css: {
        extract: false,
    },
}
