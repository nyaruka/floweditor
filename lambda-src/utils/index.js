const baseResponse = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};

exports.getOpts = (opts = {}) => Object.assign({}, baseResponse, opts);

exports.respond = (callback, body = {}) => {
    callback(null, Object.assign({}, baseResponse, { body: JSON.stringify(body) }));
};
