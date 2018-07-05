const { join, resolve } = require('path');

module.exports = {
    app: join(__dirname, '../preview/src/app'),
    distDev: join(__dirname, '../preview/dist'),
    distProd: join(__dirname, '../dist'),
    component: join(__dirname, '../src/component'),
    src: join(__dirname, '../src'),
    template: join(__dirname, '../preview/src/index.html'),
    testUtils: join(__dirname, '../src/testUtils'),
    react: resolve(__dirname, './node_modules/react'),
    reactDom: resolve(__dirname, './node_modules/react-dom'),
    umd: join(__dirname, '../umd'),
    stories: join(__dirname, '../stories')
};
