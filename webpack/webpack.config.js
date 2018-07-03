const devConfig = require('./webpack.dev').config;
const prevConfig = require('./webpack.prev');
const umdConfig = require('./webpack.umd');

/**
 * Webpack configuration.
 * @param env arguments passed in on the command line: https://webpack.js.org/guides/environment-variables/
 */
module.exports = ({ NODE_ENV }) => {
    return NODE_ENV === 'dev' ? devConfig : NODE_ENV === 'prev' ? prevConfig : umdConfig;
};
