const baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};

exports.getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);
