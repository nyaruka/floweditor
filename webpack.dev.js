const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        compress: true,
        port: 9000,
        proxy: {
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
})
