const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { smartStrategy } = require('webpack-merge');
const { DefinePlugin } = require('webpack');
const commonConfig = require('./webpack.common');
const flowEditorConfig = require('./flowEditor.config.prod');

const prodConfig = {
    output: {
        publicPath: '/',
        sourceMapFilename: '[name].map'
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
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
