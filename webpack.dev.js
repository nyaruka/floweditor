const { join } = require('path');
const { smartStrategy } = require('webpack-merge');
const {
    HotModuleReplacementPlugin,
    NamedModulesPlugin,
    WatchIgnorePlugin
} = require('webpack');
const commonConfig = require('./webpack.common');

const DEV_SERVER_PORT = 9000;

const devConfig = {
    entry: [
        'react-hot-loader/patch',
        `webpack-dev-server/client?http://localhost:${DEV_SERVER_PORT}`,
        'webpack/hot/only-dev-server'
    ],
    devtool: 'source-map',
    devServer: {
        contentBase: [join(__dirname, 'examples'), join(__dirname, 'assets')],
        compress: true,
        hot: true,
        port: DEV_SERVER_PORT,
        proxy: {
            '/assets/flows': {
                bypass: req => {
                    const { query: { uuid }, originalUrl } = req;
                    if (uuid) {
                        return `/flows/${uuid}.json`;
                    }
                    return originalUrl.replace('/assets', '');
                },
                changeOrigin: true,
                secure: false
            },
            '/resist': {
                target: 'https://rapidbot.io/api/v2/',
                pathRewrite: { '^/resist': '' },
                changeOrigin: true,
                secure: false
            },
            '/rapid': {
                target: 'https://app.rapidpro.io/api/v2/',
                pathRewrite: { '^/rapid': '' },
                changeOrigin: true,
                secure: false
            },
            '/textit': {
                target: 'https://textit.in/api/v2/',
                pathRewrite: { '^/textit': '' },
                changeOrigin: true,
                secure: false
            },
            '/local': {
                target: 'http://localhost.textit.in:8000/api/v2/',
                pathRewrite: { '^/local': '' },
                changeOrigin: true,
                secure: false
            },
            '/migrate': {
                target: 'http://localhost:8080'
            },
            '/flow/**': {
                target: 'http://localhost:8080'
            }
        }
    },
    plugins: [
        new HotModuleReplacementPlugin(),
        new NamedModulesPlugin(),
        new WatchIgnorePlugin([/scss\.d\.ts$/])
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['react-hot-loader/webpack']
            }
        ]
    }
};

module.exports = {
    DEV_SERVER_PORT,
    config: smartStrategy({
        entry: 'prepend',
        plugins: 'append',
        'module.rules': 'prepend'
    })(commonConfig, devConfig)
};
