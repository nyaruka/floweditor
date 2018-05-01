const { optimize: { ModuleConcatenationPlugin }, EnvironmentPlugin } = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { smartStrategy } = require('webpack-merge');
const paths = require('./paths');
const { typingsForCssModulesLoader, postCSSLoader, awesomeTypeScriptLoader } = require('./loaders');
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
        new EnvironmentPlugin({
            NODE_ENV: 'preview',
            DEPLOY_PRIME_URL: JSON.stringify(process.env.DEPLOY_PRIME_URL)
        }),
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
