const respsonse = require('../preview/assets/functions.json');
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(respsonse) }));
