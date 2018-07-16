const { ProvidePlugin, LoaderOptionsPlugin } = require('webpack');
const { pkgName } = require('./utils');
const paths = require('./paths');

const name = pkgName();

module.exports = {
    mode: 'development',
    output: {
        filename: `${name}.js`
    },
    resolve: {
        modules: [paths.src, 'node_modules'],
        alias: {
            '~': paths.src
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
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[hash].[ext]'
                }
            }
        ]
    }
};
