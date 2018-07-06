const {
    optimize: { ModuleConcatenationPlugin },
    EnvironmentPlugin
} = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { smartStrategy } = require('webpack-merge');
const paths = require('./paths');
const { typingsForCssModulesLoader, postCSSLoader, awesomeTypeScriptLoader } = require('./loaders');
const { uglifyPlugin, htmlPlugin } = require('./plugins');
const commonConfig = require('./webpack.common');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const prevConfig = {
    entry: [paths.app],
    output: {
        path: paths.distDev,
        publicPath: '/',
        sourceMapFilename: '[name].map'
    },
    plugins: [
        new EnvironmentPlugin({
            NODE_ENV: 'preview',
            DEPLOY_PRIME_URL: JSON.stringify(process.env.DEPLOY_PRIME_URL)
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css'
        }),
        new ModuleConcatenationPlugin(),
        uglifyPlugin,
        htmlPlugin(paths.template)
    ],
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', postCSSLoader, 'sass-loader']
            },
            {
                test: /\.tsx?$/,
                use: [awesomeTypeScriptLoader()],
                exclude: [/node_modules/]
            }
        ]
    }
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append',
    'module.rules': 'prepend'
})(commonConfig, prevConfig);
