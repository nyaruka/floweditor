// React v16 polyfills (https://reactjs.org/docs/javascript-environment-requirements.html)
// import 'core-js/es6/map';
// import 'core-js/es6/set';
// import 'raf/polyfill';
import * as React from 'react';
import { render } from 'react-dom';

import FlowEditor from '../../src/';

const showFlowEditor = (ele: any, flowUUID: string) => {
    const base = '/flow/assets/1/' + new Date().getTime() + '/';
    const config = {
        flow: flowUUID,
        localStorage: true,
        endpoints: {
            attachments: '/flow/upload_media_action/1/',
            resthooks: base + 'resthook',
            flows: base + 'flow',
            groups: base + 'group',
            recipients: '/contact/omnibox?types=gcu',
            fields: base + 'field',
            labels: base + 'label',
            languages: base + 'language',
            channels: base + 'channel',
            environment: base + 'environment',
            activity: '',
            simulateStart: '/flow/start',
            simulateResume: '/flow/resume'
        }
    };

    render(<FlowEditor config={config} />, ele);
};

module.exports = showFlowEditor;
