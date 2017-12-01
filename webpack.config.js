/**
 * Webpack configuration.
 *
 * @param env arguments passed in on the command line: https://webpack.js.org/guides/environment-variables/
 */
module.exports = ({ NODE_ENV }) => {
    if (NODE_ENV === 'dev') {
        const { config } = require('./webpack.dev.js');
        return config;
    }
    return require(`./webpack.prod.js`)
};

