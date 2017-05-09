module.exports = function(env) {
    if (!env) { env = "dev"; }
    return require(`./webpack.${env}.js`);
}