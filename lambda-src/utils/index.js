const baseResponse = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};

exports.respond = (callback, body = {}) => {
    callback(null, Object.assign({}, baseResponse, { body: JSON.stringify(body) }));
};
