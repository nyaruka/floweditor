const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        compress: true,
        port: 9000,
        proxy: {
            "/textit": {
                target: "http://localhost.textit.in:8000/api/v2/",
                pathRewrite: {"^/textit" : ""},
                secure: false
            },
            "/migrate": {
                target: "http://localhost:8080"
            }
        }
    },
})
