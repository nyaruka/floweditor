/* eslint-disable @typescript-eslint/camelcase */
const languages = [
  {
    uuid: '732e4776-dc63-48ad-ae5f-79abd6c462a2',
    name: 'Purrington',
    type: 'wit',
    intents: ['i want', 'show me', 'tell me'],
    created_on: '2019-10-15T20:07:58.529130Z'
  }
];
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: languages }) }));
