const fieldsResp = require('../preview/assets/fields.json');

const baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};

const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(fieldsResp.assets) }));
