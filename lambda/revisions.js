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
    metadata: {
      issues: []
    }
  }
};

const getIssues = definition => {
  const issues = [];
  for (const node of definition.nodes) {
    if (JSON.stringify(node).indexOf('missing_field') > -1) {
      const issue = {
        type: 'missing_dependency',
        description: 'missing field dependency',
        node_uuid: node.uuid,
        dependency: {
          name: 'Missing Field',
          key: 'missing_field',
          type: 'field'
        }
      };

      for (const action of node.actions) {
        if (JSON.stringify(action).indexOf('missing_field') > -1) {
          issue.action_uuid = action.uuid;
        }
      }
      issues.push(issue);
    }
  }
  return issues;
};

exports.handler = (request, context, callback) => {
  if (request.httpMethod === 'POST') {
    const id = Object.keys(assetContent).length + 1;
    const definition = JSON.parse(request.body);

    let issues = [];
    if (request.body.indexOf('missing_field') > 0) {
      issues = getIssues(definition);
    }

    // save our response for browser reloads
    assetContent[id] = { definition: definition, metadata: { issues } };

    const asset = {
      user: user,
      created_on: new Date(),
      id,
      version: '13.0.0',
      revision: id,
      metadata: {
        issues
      }
    };

    assetList.unshift(asset);
    respond(callback, asset);
    return;
  }

  const regex = /.*\/revisions\/(\d+)/;
  const match = regex.exec(request.path);

  if (match && match.length > 1) {
    respond(callback, JSON.stringify(assetContent[match[1]], null, 1));
  } else {
    respond(callback, { results: assetList });
  }
};
