/* eslint-disable @typescript-eslint/camelcase */
const classifiers = [
  {
    uuid: '732e4776-dc63-48ad-ae5f-79abd6c462a3',
    name: 'Travel Agency',
    type: 'wit',
    intents: ['book flight', 'rent car'],
    created_on: '2019-10-15T20:07:58.529130Z'
  }
];
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
  cb(null, getOpts({ body: JSON.stringify({ results: classifiers }) }));
