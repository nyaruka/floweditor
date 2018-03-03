const { optimize: { ModuleConcatenationPlugin } } = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { smartStrategy } = require('webpack-merge');
const paths = require('./paths');
const { typingsForCssModulesLoader, postCSSLoader } = require('./loaders');
const { uglifyPlugin, htmlPlugin } = require('./plugins');
const commonConfig = require('./webpack.common');

const prevConfig = {
    entry: [paths.app],
    output: {
        path: paths.distDev,
        publicPath: '/',
        sourceMapFilename: '[name].map'
    },
    plugins: [
        new ExtractTextPlugin('styles.css'),
        new ModuleConcatenationPlugin(),
        uglifyPlugin,
        htmlPlugin(paths.template)
    ],
    module: {
        rules: [
            {
                test: /\.s?css$/,
                include: [paths.component],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        typingsForCssModulesLoader(true),
                        postCSSLoader,
                        'sass-loader'
                    ]
                })
            },
            {
                test: /\.s?css$/,
                include: [paths.lib],
                exclude: [paths.component],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        postCSSLoader,
                        'sass-loader'
                    ]
                })
            }
        ]
    }
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append',
    'module.rules': 'prepend'
})(commonConfig, prevConfig);
