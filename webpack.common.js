const { ProvidePlugin } = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { resolve, join } = require('path');

const paths = {
    app: './src/app',
    dist: resolve(__dirname, 'dist'),
    components: join(__dirname, 'src/components')
};

module.exports = {
    entry: [paths.app],
    output: {
        path: paths.dist,
        filename: 'floweditor.js',
        publicPath: ''
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new ExtractTextPlugin('styles.css')
    ],
    module: {
        rules: [
            {
                test: /\.woff(2)?(\?[a-z0-9]+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.(ttf|eot|svg)(\?[a-z0-9]+)?$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[hash].[ext]'
                }
            },
            {
                test: /\.scss$/,
                include: paths.components,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            query: {
                                modules: true,
                                sourceMap: true,
                                importLoaders: 2,
                                localIdentName:
                                    '[name]__[local]___[hash:base64:5]'
                            }
                        },
                        'sass-loader'
                    ]
                })
            },
            {
                test: /\.css$/,
                exclude: paths.components,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.tsx?$/,
                use: ['awesome-typescript-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                exclude: paths.components,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'sass-loader' }
                ]
            }
        ]
    }
};
