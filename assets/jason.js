const { promisify } = require('util');
const { readFile } = require('fs');
const signBunny = require('sign-bunny');
const flowsResp = require('./flows.json');
const fieldsResp = require('./fields.json');
const groupsResp = require('./groups.json');

// Setup
const basePath = '/jason';
const baseOpts = {
    statusCode: 200,
    headers: { ['Content-Type']: 'application/json' }
};
const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);
const readFileAsync = promisify(readFile);
const isValidUUID = uuid => validate(uuid, 4);

// Handlers
const flows = async ({ queryStringParameters: query } = {}, cb) => {
    if (Object.keys(query).length > 0) {
        if (query.uuid) {
            if (isValidUUID(query.uuid)) {
                try {
                    const contents = await readFileAsync(`${__dirname}/flows/${query.uuid}.json`, {
                        encoding: 'utf8'
                    });
                    return cb(null, getOpts({ body: contents }));
                } catch (err) {
                    return notFound(cb);
                }
            }
        }
    }
    return cb(null, getOpts({ body: JSON.stringify(flowsResp) }));
};
const fields = cb => cb(null, getOpts({ body: JSON.stringify(fieldsResp) }));
const groups = cb => cb(null, getOpts({ body: JSON.stringify(groupsResp) }));
const notFound = cb => cb(null, getOpts({ statusCode: 404, body: signBunny('howdy') }));

const assetService = (evt, cb) => {
    switch (evt.path) {
        case `${basePath}/assets/flows.json`:
            return flows(evt, cb);
        case `${basePath}/assets/fields.json`:
            return fields(cb);
        case `${basePath}/assets/groups.json`:
            return groups(cb);
        default:
            return notFound(cb);
    }
};

exports.handler = (evt, ctx, cb) => assetService(evt, cb);
