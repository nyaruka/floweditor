/* const CompressionPlugin = require('compression-webpack-plugin'); */
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { smartStrategy } = require('webpack-merge');
const { LoaderOptionsPlugin, DefinePlugin } = require('webpack');
const commonConfig = require('./webpack.common');

const prodConfig = {
    output: {
        publicPath: '/',
        sourceMapFilename: '[name].map'
    },
    plugins: [
        new LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new UglifyJSPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true,
                drop_console: true
            },
            comments: false
        })
        /*
            new CompressionPlugin({
                asset: "[path].gz[query]",
                algorithm: "gzip",
                test: /\.js$|\.css$|\.html$/,
                threshold: 10240,
                minRatio: 0.8
            })
        */
    ]
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append'
})(commonConfig, prodConfig);
