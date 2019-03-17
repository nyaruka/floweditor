const { ProvidePlugin, LoaderOptionsPlugin } = require('webpack');
const { pkgName } = require('./utils');
const paths = require('./paths');
const path = require('path');

const name = pkgName();

module.exports = {
    mode: 'development',
    output: {
        filename: `${name}.js`
    },
    resolve: {
        modules: [paths.src, 'node_modules'],
        alias: {
            '~': paths.src,
            static: paths.static,
            // https://github.com/JedWatson/react-select/issues/2025
            react: path.resolve(__dirname, '../node_modules', 'react')
        },
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ],
    module: {
        rules: [
            {
                test: /\.s?css$/,
                include: [paths.fonts],
                use: ['style-loader', 'css-loader', 'sass-loader', 'resolve-url-loader']
            },
            {
                test: /\.(png|jpg|gif)$/i,
                include: [paths.static],
                loader: 'url-loader',
                options: {
                    limit: 90192
                }
            },
            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9#=&.]+)?$/,
                loader: 'url-loader'
            }
        ]
    }
};
