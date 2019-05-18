const languages = [
    {
        iso: 'eng',
        name: 'English'
    },
    {
        iso: 'spa',
        name: 'Spanish'
    }
];
const { getOpts } = require('./utils');

exports.handler = (evt, ctx, cb) =>
    cb(null, getOpts({ body: JSON.stringify({ results: languages }) }));
