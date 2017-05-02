var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: ['./src/app.tsx'],
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
            /*{
                test: /\.(jpg|png|gif|json)$/,
                use: 'file-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 100000
                    }
                }
            }*/
        ]
    }
}
