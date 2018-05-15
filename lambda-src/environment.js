const environmentResp = require('../preview/assets/environment.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
    cb(null, getOpts({ body: JSON.stringify(environmentResp.assets) }));
