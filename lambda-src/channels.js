const channelsResp = require('../preview/assets/channels.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
    cb(null, getOpts({ body: JSON.stringify(channelsResp.assets) }));
