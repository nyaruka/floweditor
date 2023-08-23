import { v4 as generateUUID } from 'uuid';

import { respond } from './utils/index.js';

exports.handler = (request, context, callback) => {
  if (request.httpMethod === 'POST') {
    const body = JSON.parse(request.body);
    respond(callback, {
      uuid: generateUUID(),
      name: body.name,
      query: null,
      status: 'ready',
      count: 0
    });
  } else {
    respond(callback, { results: [] });
  }
};
