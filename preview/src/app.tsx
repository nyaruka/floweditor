// React v16 polyfills (https://reactjs.org/docs/javascript-environment-requirements.html)
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'raf/polyfill';
import * as React from 'react';
import { render } from 'react-dom';
import FlowEditor from '../../src/';

const root = document.getElementById('flow-editor');
const config = require('../config');
config.flow = root.getAttribute('uuid') || config.flow;

render(<FlowEditor config={config} />, root);
