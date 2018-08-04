const fieldsResp = require('../preview/assets/fields.json');

const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(fieldsResp) }));
