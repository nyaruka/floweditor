const { join, resolve } = require('path');

module.exports = {
    app: join(__dirname, '../preview/src/app'),
    wrapper: join(__dirname, '../wrapper/src/index'),
    lib: join(__dirname, '../src'),
    distDev: join(__dirname, '../preview/dist'),
    distProd: join(__dirname, '../dist'),
    components: join(__dirname, '../src/components'),
    src: join(__dirname, '../src'),
    template: join(__dirname, '../preview/src/index.html'),
    testUtils: join(__dirname, '../src/testUtils'),
    react: resolve(__dirname, './node_modules/react'),
    reactDom: resolve(__dirname, './node_modules/react-dom'),
    umd: join(__dirname, '../umd'),
    stories: join(__dirname, '../stories')
};
