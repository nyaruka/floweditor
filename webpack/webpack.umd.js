const {
    optimize: { ModuleConcatenationPlugin },
    EnvironmentPlugin
} = require('webpack');
const { smartStrategy } = require('webpack-merge');
const paths = require('./paths');
const { uglifyPlugin, compressionPlugin } = require('./plugins');
const { typingsForCssModulesLoader, postCSSLoader, awesomeTypeScriptLoader } = require('./loaders');
const commonConfig = require('./webpack.common');
const { pkgName } = require('./utils');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pascalCase = str => require('camelcase')(str, { pascalCase: true });

const name = pkgName();

const prodConfig = {
    mode: 'production',
    entry: {
        [name]: paths.lib,
        [`${name}.min`]: paths.lib
    },
    output: {
        path: paths.umd,
        filename: '[name].js',
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: pascalCase(name),
        umdNamedDefine: true
    },
    plugins: [
        new EnvironmentPlugin({
            NODE_ENV: 'production'
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css'
        }),
        new ModuleConcatenationPlugin(),
        uglifyPlugin,
        compressionPlugin
    ],
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', postCSSLoader, 'sass-loader']
            },
            {
                test: /\.tsx?$/,
                use: [awesomeTypeScriptLoader(true)],
                exclude: [/node_modules/, paths.testUtils]
            }
        ]
    },
    resolve: {
        alias: {
            react: paths.react,
            'react-dom': paths.reactDom
        }
    },
    externals: {
        // We don't want to bundle react or react-dom
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'React',
            root: 'React'
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'ReactDOM',
            root: 'ReactDOM'
        }
    }
};

module.exports = smartStrategy({
    output: 'replace',
    plugins: 'append',
    'module.rules': 'append'
})(commonConfig, prodConfig);
