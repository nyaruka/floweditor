const {
    optimize: { ModuleConcatenationPlugin },
    EnvironmentPlugin
} = require('webpack');
const { smartStrategy } = require('webpack-merge');
const paths = require('./paths');
const { uglifyPlugin, compressionPlugin, copyPlugin } = require('./plugins');
const { typingsForCssModulesLoader, postCSSLoader, awesomeTypeScriptLoader } = require('./loaders');
const commonConfig = require('./webpack.common');
const { pkgName } = require('./utils');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pascalCase = str => require('camelcase')(str, { pascalCase: true });

const name = pkgName();

let prodConfig = {
    mode: 'production',
    entry: {
        [name]: paths.lib
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
            filename: 'flow-editor-styles.css'
        }),
        new ModuleConcatenationPlugin(),
        uglifyPlugin,
        compressionPlugin
    ],
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                include: [paths.src],
                use: [
                    MiniCssExtractPlugin.loader,
                    typingsForCssModulesLoader(),
                    postCSSLoader,
                    'resolve-url-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.tsx?$/,
                use: [awesomeTypeScriptLoader(true)],
                exclude: [/node_modules/, paths.testUtils]
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    chunks: 'initial'
                }
            }
        }
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
        /*'../../node_modules/jsplumb/dist/js/jsplumb': {
            commonjs: 'jsPlumb',
            commonjs2: 'jsPlumb',
            amd: 'jsPlumb',
            root: 'jsPlumb'
        }*/
    }
};

module.exports = smartStrategy({
    output: 'replace',
    plugins: 'append',
    'module.rules': 'prepend',
    externals: 'replace'
})(commonConfig, prodConfig);
