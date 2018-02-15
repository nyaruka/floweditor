const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { smartStrategy } = require('webpack-merge');
const commonConfig = require('./webpack.common');

const prodConfig = {
    output: {
        publicPath: '/',
        sourceMapFilename: '[name].map'
    },
    plugins: [
        new UglifyJsPlugin({
            parallel: true,
            uglifyOptions: {
                compress: {
                    passes: 2
                },
                output: {
                    beautify: false
                },
                warnings: false
            }
        }),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(t|j)sx?$|\.s?css$|\.html$/,
            threshold: 10240,
            minRatio: 0
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ]
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append'
})(commonConfig, prodConfig);
