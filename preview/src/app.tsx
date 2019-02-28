// React v16 polyfills (https://reactjs.org/docs/javascript-environment-requirements.html)
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'raf/polyfill';

import * as React from 'react';
import { render } from 'react-dom';

import FlowEditor from '../../src/';
import { FlowEditorConfig } from '../../src/flowTypes';

const root = document.getElementById('flow-editor');
if (root) {
    const config = require('../config');
    config.flow = root.getAttribute('uuid') || config.flow;
    render(<FlowEditor config={config} />, root);
}

// export our wrapper function for real-time testing
(window as any).showFlowEditor = (ele: any, userConfig: FlowEditorConfig) => {
    render(<FlowEditor config={userConfig} />, ele);
};
