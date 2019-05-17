const recipients = [
    {
        name: 'Cat Fanciers',
        id: 'eae05fb1-3021-4df2-a443-db8356b953fa',
        type: 'group',
        extra: 212
    },
    {
        name: 'Anne',
        id: '673fa0f6-dffd-4e7d-bcc1-e5709374354f',
        type: 'contact'
    }
];
const baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};
const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);

exports.handler = (evt, ctx, cb) =>
    cb(null, getOpts({ body: JSON.stringify({ results: recipients }) }));
