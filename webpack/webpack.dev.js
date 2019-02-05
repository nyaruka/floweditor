const { join } = require('path');
const { smartStrategy } = require('webpack-merge');
const { NamedModulesPlugin, WatchIgnorePlugin, EnvironmentPlugin } = require('webpack');
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

    proxy['/api/v2'] = {
        target: 'http://localhost:8000'
    };

    proxy['/flow/simulate'] = {
        target: 'http://localhost:8000'
    };

    proxy['/flow/assets'] = {
        target: 'http://localhost:8000'
    };

    proxy['/flow/upload_media_action/*'] = {
        target: 'http://localhost:8000'
    };

    proxy['/contact/omnibox'] = {
        target: 'http://localhost:8000'
    };
}

const devConfig = {
    mode: 'development',
    entry: [paths.app, `webpack-dev-server/client?http://localhost:${DEV_SERVER_PORT}`],
    output: {
        path: paths.distDev
    },
    devtool: 'source-map',
    devServer: {
        contentBase: [join(__dirname, '../preview/src')],
        compress: true,
        port: DEV_SERVER_PORT,
        disableHostCheck: true,
        before: function(app) {
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
                    const content = require('../preview/assets/' +
                        type +
                        (type.includes('environment') ? '.json' : 's.json'));

                    if (content.assets) {
                        res.send(content.assets);
                    } else {
                        res.send(content);
                    }
                }
            });
        },
        proxy
    },
    plugins: [
        new EnvironmentPlugin(env),
        new NamedModulesPlugin(),
        new WatchIgnorePlugin([/scss\.d\.ts$/])
    ],
    module: {
        rules: [
            {
                test: /\.s?css$/,
                include: [paths.components],
                use: ['style-loader', typingsForCssModulesLoader(), postCSSLoader, 'sass-loader']
            },
            {
                test: /\.s?css$/,
                include: [paths.src],
                exclude: [paths.components],
                use: ['style-loader', 'css-loader', postCSSLoader, 'sass-loader']
            },
            {
                test: /\.tsx?$/,
                exclude: [/node_modules/],
                use: [awesomeTypeScriptLoader()]
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
