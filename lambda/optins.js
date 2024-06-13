export const optins = {
  next: null,
  previous: null,
  results: [
    {
      uuid: '8fc583a0-0700-434d-b238-8053af1d040e',
      name: 'Newsletter',
      created_on: '2023-09-25T04:43:19.103443Z'
    },
    {
      uuid: '806f52e7-ad6a-4ede-8793-6f51b60a30ec',
      name: 'U-Report Polls',
      created_on: '2023-09-23T00:18:41.572795Z'
    }
  ]
};
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) => cb(null, getOpts({ body: JSON.stringify(optins) }));
