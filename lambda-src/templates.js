const resp = require('../preview/assets/templates.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(resp) }));
