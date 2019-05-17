import { respond } from './utils/index.js';

const SNAKED_CHARS = /\s+(?=\S)/g;
const snakify = value =>
    value
        .toLowerCase()
        .trim()
        .replace(SNAKED_CHARS, '_');

exports.handler = (request, context, callback) => {
    if (request.httpMethod === 'POST') {
        const body = JSON.parse(request.body);
        respond(callback, {
            key: snakify(body.label),
            name: body.label,
            value_type: 'text'
        });
    } else {
        respond(callback, { results: [] });
    }
};
