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

let prodConfig = {
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
            filename: 'flow-editor-styles.css'
        }),
        new ModuleConcatenationPlugin(),
        uglifyPlugin,
        compressionPlugin
    ],
    module: {
        rules: [
            {
                test: /\.s?css$/,
                include: [paths.components],
                use: ['style-loader', typingsForCssModulesLoader(), postCSSLoader, 'sass-loader']
            },
            {
                test: /\.(sa|sc|c)ss$/,
                include: [paths.src],
                exclude: [paths.components],
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

let fnConfig = {
    mode: 'production',
    entry: './wrapper/src',
    output: {
        libraryTarget: 'var',
        library: 'showFlowEditor',
        path: paths.umd,
        filename: 'wrapper.js'
    },
    resolve: {
        alias: {
            '~': paths.src
        }
    },
    externals: {}
};

prodConfig = smartStrategy({
    output: 'replace',
    plugins: 'append',
    'module.rules': 'append'
})(commonConfig, prodConfig);

fnConfig = smartStrategy({
    output: 'replace',
    'resolve.alias': 'replace',
    externals: 'replace'
})(prodConfig, fnConfig);

module.exports = [prodConfig, fnConfig];
