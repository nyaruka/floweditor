const { join } = require('path');
const { smartStrategy } = require('webpack-merge');
const {
    HotModuleReplacementPlugin,
    NamedModulesPlugin,
    WatchIgnorePlugin,
    EnvironmentPlugin
} = require('webpack');
const paths = require('./paths');
const { typingsForCssModulesLoader, postCSSLoader, awesomeTypeScriptLoader } = require('./loaders');
const commonConfig = require('./webpack.common');
const fs = require('fs');

const DEV_SERVER_PORT = 9000;

const env = {
    NODE_ENV: 'development'
};

const proxy = {
    '/migrate': {
        target: 'http://localhost:8800'
    },
    '/flow/start': {
        target: 'http://localhost:8800'
    },
    '/flow/resume': {
        target: 'http://localhost:8800'
    }
};

/** Configure our RAPID proxy */
if (process.env.RAPID_FLOW && process.env.RAPID_ORG) {
    env.RAPID_FLOW = process.env.RAPID_FLOW;
    env.RAPID_ORG = process.env.RAPID_ORG;

    proxy['/flow/assets'] = {
        target: 'http://localhost:8000'
    };
}

const devConfig = {
    entry: [
        'react-hot-loader/patch',
        paths.app,
        `webpack-dev-server/client?http://localhost:${DEV_SERVER_PORT}`,
        'webpack/hot/only-dev-server'
    ],
    output: {
        path: paths.distDev
    },
    devtool: 'source-map',
    devServer: {
        contentBase: [join(__dirname, '../preview/src')],
        compress: true,
        hot: true,
        port: DEV_SERVER_PORT,
        setup: function(app) {
            app.get('/assets/**', function(req, res) {
                const url = req._parsedUrl.pathname.replace(/(^\/assets\/)|(\/$)/g, '');
                const [type, uuid] = url.split('/');

                // fetch the content
                if (uuid) {
                    res.send(
                        fs.readFileSync(
                            'preview/assets/' + type + '_content/' + uuid + '.json',
                            'utf8'
                        )
                    );
                } else {
                    // otherwise return the list
                    const content = require('../preview/assets/' + type + 's.json');
                    res.send(content.assets);
                }
            });
        },
        proxy
    },
    plugins: [
        new HotModuleReplacementPlugin(),
        new EnvironmentPlugin(env),
        new NamedModulesPlugin(),
        new WatchIgnorePlugin([/scss\.d\.ts$/])
    ],
    module: {
        rules: [
            {
                test: /\.s?css$/,
                include: [paths.component],
                use: ['style-loader', typingsForCssModulesLoader(), postCSSLoader, 'sass-loader']
            },
            {
                test: /\.s?css$/,
                include: [paths.lib],
                exclude: [paths.component],
                use: ['style-loader', 'css-loader', postCSSLoader, 'sass-loader']
            },
            {
                test: /\.tsx?$/,
                exclude: [/node_modules/],
                use: ['react-hot-loader/webpack', awesomeTypeScriptLoader()]
            }
        ]
    }
};

module.exports = {
    DEV_SERVER_PORT,
    config: smartStrategy({
        plugins: 'append',
        'module.rules': 'append'
    })(commonConfig, devConfig)
};
