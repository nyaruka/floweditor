const { smartStrategy } = require('webpack-merge');
const { HotModuleReplacementPlugin, NamedModulesPlugin } = require('webpack');
const commonConfig = require('./webpack.common');
const flowEditorConfig = require('./flowEditor.config.dev');

const devServerPort = 9000;

const devConfig = {
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:9000',
        'webpack/hot/only-dev-server'
    ],
    devtool: 'source-map',
    devServer: {
        compress: true,
        hot: true,
        port: devServerPort,
        proxy: {
            '/assets/flows': {
                bypass: req => {
                    const { query: { uuid } } = req;
                    if (uuid) {
                        return `/test_flows/${uuid}.json`;
                    }
                    return req.originalUrl;
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
    plugins: [new HotModuleReplacementPlugin(), new NamedModulesPlugin()],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['react-hot-loader/webpack']
            }
        ]
    },
    externals: {
        Config: JSON.stringify(flowEditorConfig)
    }
};

module.exports = {
    devServerPort,
    config: smartStrategy({
        entry: 'prepend',
        plugins: 'append',
        'module.rules': 'prepend'
    })(commonConfig, devConfig)
};
