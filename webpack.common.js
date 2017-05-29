var path = require("path");
var webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: ['./src/app.tsx'],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "floweditor.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new ExtractTextPlugin("styles.css"),
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                include: path.join(__dirname, 'src/components'),
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            query: {
                                modules: true,
                                sourceMap: true,
                                importLoaders: 2,
                                localIdentName: '[name]__[local]___[hash:base64:5]'
                            }
                        },
                        'sass-loader'
                    ]
                }),
            },
            {
                test: /\.css$/,
                exclude: path.join(__dirname, 'src/components'),
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.tsx?$/,
                use: [ {loader: 'awesome-typescript-loader'} ],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                exclude: path.join(__dirname, 'src/components'),
                use: [
                    { loader: "style-loader" },   // creates style nodes from JS strings
                    { loader: "css-loader" },     // translates CSS into CommonJS
                    { loader: "sass-loader"}      // compiles Sass to CSS
                ]
            }
        ]
    }
}
