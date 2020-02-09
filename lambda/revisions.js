import { respond } from './utils/index.js';

const user = {
  email: 'chancerton@nyaruka.com',
  name: 'Chancellor von Frankenbean'
};

const assetList = [
  {
    user: user,
    created_on: new Date(),
    id: 1,
    version: '13.0.0',
    revision: 1
  }
];

const assetContent = {
  1: {
    definition: {
      name: 'Favorites',
      language: 'eng',
      type: 'message',
      spec_version: '13.0.0',
      uuid: 'a4f64f1b-85bc-477e-b706-de313a022979',
      localization: {},
      nodes: [],
      _ui: {
        languages: [{ eng: 'English' }, { spa: 'Spanish' }]
      }
    },
    metadata: {}
  }
};

exports.handler = (request, context, callback) => {
  if (request.httpMethod === 'POST') {
    const id = Object.keys(assetContent).length + 1;
    assetContent[id] = request.body;

    const asset = {
      user: user,
      created_on: new Date(),
      id,
      version: '13.0.0',
      revision: id
    };
    assetList.unshift(asset);
    respond(callback, asset);
    return;
  }

  const regex = /.*\/revisions\/(\d+)/;
  const match = regex.exec(request.path);

  if (match && match.length > 1) {
    respond(callback, assetContent[match[1]]);
  } else {
    respond(callback, { results: assetList });
  }
};
