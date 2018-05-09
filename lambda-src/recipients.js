const recipientsResp = require('../preview/assets/recipients.json');

const baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};
const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(recipientsResp) }));
