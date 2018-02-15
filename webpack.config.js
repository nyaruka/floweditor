const rimraf = require('rimraf');
const { EnvironmentPlugin } = require('webpack');

const DIST_PATH = './dist';
const DEV_CONFIG_PATH = './webpack.dev.js';
const PROD_CONFIG_PATH = './webpack.prod.js';

const rmDist = () => {
    try {
        rimraf.sync(DIST_PATH);
    } catch (e) {
        throw new Error(e);
    }
};

/**
 * Webpack configuration.
 *
 * @param env arguments passed in on the command line: https://webpack.js.org/guides/environment-variables/
 */
module.exports = ({ NODE_ENV }) => {
    let config;

    if (!process.argv.some(arg => arg.indexOf('webpack-dev-server') > -1)) {
        rmDist();
    }

    if (NODE_ENV === 'dev') {
        ({ config } = require(DEV_CONFIG_PATH));
        return Object.assign(config, {
            plugins: [
                ...config.plugins,
                new EnvironmentPlugin({
                    NODE_ENV: 'development'
                })
            ]
        });
    }

    config = require(PROD_CONFIG_PATH);
    return Object.assign(config, {
        plugins: [
            ...config.plugins,
            new EnvironmentPlugin({
                NODE_ENV: 'production'
            })
        ]
    });
};
