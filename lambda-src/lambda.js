const validate = require('uuid-validate');
const signBunny = require('sign-bunny');
const flowsResp = require('../assets/flows.json');
const colorsFlowResp = require('../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const customerServiceFlowResp = require('../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const fieldsResp = require('../assets/fields.json');
const groupsResp = require('../assets/groups.json');

const baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};
const flows = [colorsFlowResp, customerServiceFlowResp];
const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);
const isValidUUID = uuid => validate(uuid, 4);
const getFlow = uuid => {
    let flowResp;
    flows.forEach(flow => {
        if (flow.results[0].uuid === uuid) {
            flowResp = flow;
        }
    });
    return flowResp ? flowResp : false;
};

const notFoundHandler = cb => cb(null, getOpts({ statusCode: 404, body: signBunny('howdy') }));
const flowsHandler = ({ queryStringParameters: query } = {}, cb) => {
    if (Object.keys(query).length > 0) {
        if (query.uuid && isValidUUID(query.uuid)) {
            const flow = getFlow(query.uuid);
            if (flow) {
                return cb(null, getOpts({ body: JSON.stringify(flow) }));
            }
        }
        return notFoundHandler(cb);
    }
    return cb(null, getOpts({ body: JSON.stringify(flowsResp) }));
};
const fieldsHandler = cb => cb(null, getOpts({ body: JSON.stringify(fieldsResp) }));
const groupsHandler = cb => cb(null, getOpts({ body: JSON.stringify(groupsResp) }));

const assetService = (evt, cb) => {
    switch (evt.path) {
        case `/lambda/assets/flows.json`:
            return flowsHandler(evt, cb);
        case `/lambda/assets/fields.json`:
            return fieldsHandler(cb);
        case `/lambda/assets/groups.json`:
            return groupsHandler(cb);
        default:
            return notFoundHandler(cb);
    }
};

exports.handler = (evt, ctx, cb) => assetService(evt, cb);
