import { respond } from './utils/index.js';

const staticFields = require('../preview/assets/fields.json');

exports.handler = (request, context, callback) => {
    if (request.httpMethod === 'POST') {
        const body = JSON.parse(request.body);
        respond(callback, {
            key: slugify(body.label),
            name: body.label,
            value_type: 'text'
        });
    } else {
        respond(callback, staticFields);
    }
};
