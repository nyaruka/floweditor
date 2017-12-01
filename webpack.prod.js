const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { smartStrategy } = require('webpack-merge');
const { LoaderOptionsPlugin, DefinePlugin } = require('webpack');
const commonConfig = require('./webpack.common');
const flowEditorConfig = require('./flowEditor.config.prod');

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
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                warnings: false /** Suppress uglification warnings */,
                screw_ie8: true,
                drop_console: true
            },
            output: {
                beautify: false,
                comments: false
            },
            exclude: [/\.min\.(j|t)sx?$/gi] /** Skip pre-minified libs */
        }),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(t|j)sx?$|\.s?css$|\.html$/,
            threshold: 10240,
            minRatio: 0
        })
    ],
    externals: {
        Config: JSON.stringify(flowEditorConfig)
    }
};

module.exports = smartStrategy({
    output: 'append',
    plugins: 'append'
})(commonConfig, prodConfig);
