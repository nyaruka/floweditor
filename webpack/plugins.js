const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const paths = require('./paths');

exports.copyPlugin = new CopyPlugin([
    {
        from: paths.static,
        to: paths.umd + '/static/'
    },
    {
        from: paths.fonts,
        to: paths.umd + '/static/fonts/'
    }
]);

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
