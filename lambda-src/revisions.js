import { respond } from './utils/index.js';

const revisions = require('../preview/assets/revisions.json');

const definitions = [
    require('../preview/assets/revision_content/1.json'),
    require('../preview/assets/revision_content/2.json')
];

exports.handler = (request, context, callback) => {
    const regex = /.*\/revisions\/(\d+)/;
    const match = regex.exec(request.path);
    if (match && match.length > 1) {
        respond(callback, definitions[match[1] - 1]);
    } else {
        respond(callback, revisions);
    }
};
