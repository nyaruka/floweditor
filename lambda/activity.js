const activity = {
    nodes: {},
    segments: {}
};

const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(activity) }));
