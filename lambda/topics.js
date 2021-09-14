import { v4 as generateUUID } from 'uuid';

import { respond } from './utils/index.js';
const topics = {
  next: null,
  previous: null,
  results: [
    {
      uuid: '6f38eba0-d673-4a35-82df-21bae2b6d466',
      name: 'General',
      created_on: '2021-09-01T01:06:39.178493Z'
    }
  ]
};

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
    respond(callback, topics);
  }
};
