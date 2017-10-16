const merge = require('webpack-merge');
const queryString = require('query-string');
const parse = require('url-parse');
const common = require('./webpack.common');

module.exports = merge(common, {
    devtool: 'eval',
    devServer: {
        compress: true,
        hot: true,
        port: 9000,
        proxy: {
            "/assets/flows": {
                bypass: (req, res, proxyOptions) => {
                    const { query: { uuid } } = req;
                    if (uuid != null) {
                        return `/test_flows/${uuid}.json`;
                    }
                    return req.originalUrl;
                },
                changeOrigin: true,
                secure: false
            },
            "/resist": {
                target: "https://rapidbot.io/api/v2/",
                pathRewrite: {"^/resist" : ""},
                changeOrigin: true,
                secure: false
            },
            "/rapid": {
                target: "https://app.rapidpro.io/api/v2/",
                pathRewrite: {"^/rapid" : ""},
                changeOrigin: true,
                secure: false
            },
            "/textit": {
                target: "https://textit.in/api/v2/",
                pathRewrite: {"^/textit" : ""},
                changeOrigin: true,
                secure: false
            },
            "/local": {
                target: "http://localhost.textit.in:8000/api/v2/",
                pathRewrite: {"^/local" : ""},
                changeOrigin: true,
                secure: false
            },
            "/migrate": {
                target: "http://localhost:8080"
            },
            "/flow/**": {
                target: "http://localhost:8080",
            }
        }
    },
});
