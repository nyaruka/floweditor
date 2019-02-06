import { v4 as generateUUID } from 'uuid';

import { respond } from './utils/index.js';

const staticGroups = require('../preview/assets/groups.json');

exports.handler = (request, context, callback) => {
    const body = JSON.parse(request.body);
    if (request.httpMethod === 'POST') {
        respond(callback, { uuid: generateUUID(), name: body.name, type: 'group' });
    } else {
        respond(callback, staticGroups);
    }
};
