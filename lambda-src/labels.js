const labelsResp = require('../preview/assets/labels.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(labelsResp) }));
