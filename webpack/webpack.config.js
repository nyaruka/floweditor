const rimraf = require('rimraf');
const devConfig = require('./webpack.dev').config;
const prevConfig = require('./webpack.prev');
const prodConfig = require('./webpack.prod');

const DIST_PATH_DEV = './preview/dist';
const DIST_PATH_PROD = './dist';

const rmDist = distPath => {
    try {
        rimraf.sync(distPath);
    } catch (e) {
        throw new Error(e);
    }
};

/**
 * Webpack configuration.
 * @param env arguments passed in on the command line: https://webpack.js.org/guides/environment-variables/
 */
module.exports = ({ NODE_ENV }) => {
    const DEVELOPMENT = NODE_ENV === 'dev';
    const PREVIEW = NODE_ENV === 'prev';

    if (!process.argv.some(arg => arg.indexOf('webpack-dev-server') > -1)) {
        if (DEVELOPMENT || PREVIEW) {
            rmDist(DIST_PATH_DEV);
        } else {
            rmDist(DIST_PATH_PROD);
        }
    }

    if (DEVELOPMENT) {
        return devConfig;
    }

    return PREVIEW ? prevConfig : prodConfig;
};
