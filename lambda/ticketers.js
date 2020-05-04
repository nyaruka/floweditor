/* eslint-disable @typescript-eslint/camelcase */
const ticketers = [
  {
    uuid: '5b8587d9-c1bd-47e4-b2ff-dfe790fcdaf2',
    name: 'Email',
    type: 'mailgun',
    created_on: '2019-10-15T20:07:58.529130Z'
  }
];
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: ticketers }) }));
