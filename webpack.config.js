module.exports = function(env) {
    if (!env) { env = "dev"; }
    console.log("CONFIGURATION:", env);
    return require(`./webpack.${env}.js`);
}