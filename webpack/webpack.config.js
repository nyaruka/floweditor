const rimraf = require('rimraf');
const { EnvironmentPlugin } = require('webpack');

const DIST_PATH_DEV = './preview/dist';
const DIST_PATH_PROD = './dist';
const DEV_CONFIG_PATH = './webpack.dev.js';
const PREV_CONFIG_PATH = './webpack.prev.js';
const PROD_CONFIG_PATH = './webpack.prod.js';

const rmDist = distPath => {
    try {
        rimraf.sync(distPath);
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
    const DEVELOPMENT = NODE_ENV === 'dev';
    const PREVIEW = NODE_ENV === 'prev';

    let config;

    if (!process.argv.some(arg => arg.indexOf('webpack-dev-server') > -1)) {
        if (DEVELOPMENT || PREVIEW) {
            rmDist(DIST_PATH_DEV);
        } else {
            rmDist(DIST_PATH_PROD);
        }
    }

    if (DEVELOPMENT) {
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

    config = require(PREVIEW ? PREV_CONFIG_PATH : PROD_CONFIG_PATH);
    return Object.assign(config, {
        plugins: [
            ...config.plugins,
            new EnvironmentPlugin({
                NODE_ENV: 'production'
            })
        ]
    });
};
