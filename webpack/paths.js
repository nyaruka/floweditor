const { join } = require('path');

module.exports = {
    app: join(__dirname, '../preview/src/app'),
    distDev: join(__dirname, '../preview/dist'),
    distProd: join(__dirname, '../dist'),
    component: join(__dirname, '../src/component'),
    lib: join(__dirname, '../src'),
    template: join(__dirname, '../preview/src/index.html'),
    testUtils: join(__dirname, '../src/testUtils')
};
