const { optimize: { ModuleConcatenationPlugin } } = require('webpack');
const { smartStrategy } = require('webpack-merge');
const paths = require('./paths');
const { uglifyPlugin, compressionPlugin } = require('./plugins');
const commonConfig = require('./webpack.common');

const prodConfig = {
    entry: [paths.lib],
    output: {
        path: paths.distProd,
        publicPath: '/'
    },
    plugins: [new ModuleConcatenationPlugin(), uglifyPlugin, compressionPlugin]
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append'
})(commonConfig, prodConfig);
