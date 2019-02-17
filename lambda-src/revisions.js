import { respond } from './utils/index.js';

const revisions = require('../preview/assets/revisions.json');

const definitions = [
    require('../preview/assets/revision_content/1.json'),
    require('../preview/assets/revision_content/2.json')
];

exports.handler = (request, context, callback) => {
    const id = request.path.replace(/(.*\/revisions\/)|(\/$)/g, '');
    if (id !== '/revisions') {
        respond(callback, definitions[id - 1]);
    } else {
        respond(callback, revisions['results']);
    }
};
