const resthooksResp = require('../preview/assets/resthooks.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(resthooksResp) }));
