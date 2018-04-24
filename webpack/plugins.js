const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

exports.uglifyPlugin = new UglifyJsPlugin({
    parallel: true,
    include: /\.min\.js$/,
    uglifyOptions: {
        compress: {
            passes: 2
        },
        output: {
            beautify: false
        },
        warnings: false
    }
});

exports.htmlPlugin = templatePath =>
    new HtmlWebpackPlugin({
        template: templatePath
    });

exports.compressionPlugin = new CompressionPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(t|j)sx?$|\.s?css$|\.html$/,
    threshold: 10240,
    minRatio: 0
});
