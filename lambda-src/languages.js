const languagesResp = require('../preview/assets/languages.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(languagesResp) }));
