import { v4 as generateUUID } from 'uuid';

import { respond } from './utils/index.js';

const staticGroups = require('../preview/assets/groups.json');

exports.handler = (request, context, callback) => {
    const body = JSON.parse(request.body);
    if (request.httpMethod === 'POST') {
        respond(callback, {
            uuid: generateUUID(),
            name: body.name,
            query: null,
            status: 'ready',
            count: 0
        });
    } else {
        respond(callback, staticGroups);
    }
};
