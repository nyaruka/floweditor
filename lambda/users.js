import { v4 as generateUUID } from 'uuid';

import { respond } from './utils/index.js';
const users = {
  next: null,
  previous: null,
  results: [
    {
      uuid: 'agent-user-uuid',
      email: 'agent.user@gmail.com',
      first_name: 'Agent',
      last_name: 'User',
      role: 'agent',
      created_on: '2021-06-10T21:44:30.971221Z'
    },
    {
      uuid: 'viewer-user-uuid',
      email: 'viewr.user@gmail.com',
      first_name: 'Viewer',
      last_name: 'User',
      role: 'viewer',
      created_on: '2020-11-09T23:02:10.095493Z'
    },
    {
      uuid: 'admin-user-uuid',
      email: 'admin.user@gmail.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'administrator',
      created_on: '2020-08-18T19:07:08.984182Z'
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
    respond(callback, users);
  }
};
