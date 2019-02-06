import { v4 as generateUUID } from 'uuid';

import { respond } from './utils/index.js';

const staticLabels = require('../preview/assets/labels.json');

exports.handler = (request, context, callback) => {
    if (request.httpMethod === 'POST') {
        const body = JSON.parse(request.body);
        respond(callback, {
            uuid: generateUUID(),
            name: body.name,
            count: 0
        });
    } else {
        respond(callback, staticLabels);
    }
};
