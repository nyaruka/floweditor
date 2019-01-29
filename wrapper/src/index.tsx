// React v16 polyfills (https://reactjs.org/docs/javascript-environment-requirements.html)
// import 'core-js/es6/map';
// import 'core-js/es6/set';
// import 'raf/polyfill';
import * as React from 'react';
import { render } from 'react-dom';

import FlowEditor from '../../src/';
import { FlowEditorConfig } from '../../src/flowTypes';

const showFlowEditor = (ele: any, config: FlowEditorConfig) => {
    render(<FlowEditor config={config} />, ele);
};

module.exports = showFlowEditor;
