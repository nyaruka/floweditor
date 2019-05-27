const resthooks = [
  { resthook: 'my-first-zap', subscribers: [] },
  { resthook: 'my-other-zap', subscribers: [] }
];
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: resthooks }) }));
