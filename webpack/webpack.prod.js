const { optimize: { ModuleConcatenationPlugin }, EnvironmentPlugin } = require('webpack');
const { smartStrategy } = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const paths = require('./paths');
const { uglifyPlugin, compressionPlugin } = require('./plugins');
const { typingsForCssModulesLoader, postCSSLoader } = require('./loaders');
const commonConfig = require('./webpack.common');

const prodConfig = {
    entry: [paths.lib],
    output: {
        path: paths.distProd,
        publicPath: '/'
    },
    plugins: [
        new EnvironmentPlugin({
            NODE_ENV: 'production'
        }),
        new ExtractTextPlugin('styles.css'),
        new ModuleConcatenationPlugin(),
        uglifyPlugin,
        compressionPlugin
    ],
    module: {
        rules: [
            {
                test: /\.s?css$/,
                include: [paths.component],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [typingsForCssModulesLoader(true), postCSSLoader, 'sass-loader']
                })
            },
            {
                test: /\.s?css$/,
                include: [paths.lib],
                exclude: [paths.component],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', postCSSLoader, 'sass-loader']
                })
            }
        ]
    }
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append',
    'module.rules': 'prepend'
})(commonConfig, prodConfig);
