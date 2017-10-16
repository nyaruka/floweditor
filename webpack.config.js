/**
 * Webpack configuration.
 *
 * @param env arguments passed in on the command line: https://webpack.js.org/guides/environment-variables/
 */
module.exports = ({ NODE_ENV }) => require(`./webpack.${NODE_ENV}.js`);
