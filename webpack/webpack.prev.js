const { optimize: { ModuleConcatenationPlugin } } = require('webpack');
const { smartStrategy } = require('webpack-merge');
const paths = require('./paths');
const { uglifyPlugin, htmlPlugin } = require('./plugins');
const commonConfig = require('./webpack.common');

const prevConfig = {
    entry: [paths.app, paths.lib],
    output: {
        path: paths.distDev,
        publicPath: '/',
        sourceMapFilename: '[name].map'
    },
    plugins: [new ModuleConcatenationPlugin(), uglifyPlugin, htmlPlugin(paths.template)]
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append'
})(commonConfig, prevConfig);
