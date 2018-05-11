const groupsResp = require('../preview/assets/groups.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(groupsResp.assets) }));
