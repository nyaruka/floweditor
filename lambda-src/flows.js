const signBunny = require('sign-bunny');
const flowsResp = require('../preview/assets/flows.json');

const baseOpts = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
};
const flows = [
    require('../preview/assets/flow_content/a4f64f1b-85bc-477e-b706-de313a022979.json'),
    require('../preview/assets/flow_content/9ecc8e84-6b83-442b-a04a-8094d5de997b.json')
];
const getOpts = (opts = {}) => Object.assign({}, baseOpts, opts);
const getFlow = uuid => {
    for (const flowResp of flows) {
        if (flowResp.uuid === uuid) {
            return flowResp;
        }
    }
    return false;
};

const notFoundHandler = cb => cb(null, getOpts({ statusCode: 404, body: signBunny('not found') }));
const flowsHandler = (req = {}, cb) => {
    const uuid = req.path.replace(/(.*\/flows\/)|(\/$)/g, '');

    if (uuid) {
        const flow = getFlow(uuid);
        if (flow) {
            return cb(null, getOpts({ body: JSON.stringify(flow) }));
        }
        return notFoundHandler(cb);
    }

    return cb(null, getOpts({ body: JSON.stringify(flowsResp.assets) }));
};

exports.handler = (evt, ctx, cb) => flowsHandler(evt, cb);
