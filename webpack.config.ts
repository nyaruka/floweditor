var path = require("path");

module.exports = {
    entry: ['./src/app.tsx'],
    devServer: {
        // contentBase: path.join(__dirname, ""),
        compress: true,
        port: 9000
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { 
                test: /\.css$/, 
                loader: "style!css" 
            },
            /*{ 
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            }*/
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/
            }
        ],
        rules: [
            {
                test: /\.tsx?$/,
                use:[{ loader: 'awesome-typescript-loader'} ],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "sass-loader" // compiles Sass to CSS
                }]
            }
        ]
    }
};