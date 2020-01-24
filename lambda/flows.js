const signBunny = require('sign-bunny');
const { getOpts } = require('./utils');

const assetList = [
  {
    uuid: '9ecc8e84-6b83-442b-a04a-8094d5de997b',
    name: 'Customer Service',
    type: 'message',
    archived: false,
    labels: [],
    parent_refs: ['order_number', 'customer_id'],
    expires: 10080
  }
];

const assetContent = {
  '9ecc8e84-6b83-442b-a04a-8094d5de997b': {
    name: 'Customer Service',
    type: 'message',
    uuid: '9ecc8e84-6b83-442b-a04a-8094d5de997b',
    nodes: []
  }
};

const getFlow = uuid => {
  for (const flowResp of assetContent) {
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
    const flowContent = getFlow(uuid);
    if (flowContent) {
      return cb(null, getOpts({ body: JSON.stringify(flowContent) }));
    }
    return notFoundHandler(cb);
  }

  return cb(null, getOpts({ body: JSON.stringify({ results: assetList }) }));
};

exports.handler = (evt, ctx, cb) => flowsHandler(evt, cb);
