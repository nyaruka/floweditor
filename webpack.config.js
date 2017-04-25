var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: ['./src/app.tsx'],
    devServer: {
        compress: true,
        port: 9000
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            'jquery-ui': 'jquery-ui-dist/jquery-ui.js'
        }
    },
    devtool: 'source-map',
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use:[{ loader: 'awesome-typescript-loader'} ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: "style-loader" },   // creates style nodes from JS strings
                    { loader: "css-loader" },     // translates CSS into CommonJS
                    { loader: "sass-loader"}      // compiles Sass to CSS
                ]
            }
        ]
    }
}
