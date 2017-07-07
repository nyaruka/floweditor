var root = document.getElementById("flow-editor");
var publicPath = __flow_editor_config__.path;
if (publicPath) {
    __webpack_public_path__ = publicPath;
}

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as qs from 'query-string';
import { Editor } from './components/Editor';
import { FlowStore } from './services/FlowStore';
import { Endpoints } from './services/Config';
import * as axios from 'axios';

import 'react-select/dist/react-select.css';
import './global.scss';
import '../fonts/flows/style.css';

// configure axios to always send JSON requests
axios.default.defaults.headers.post['Content-Type'] = 'application/javascript';
axios.default.defaults.responseType = 'json';

var parms = qs.parse(window.location.search);
ReactDOM.render(
    <Editor config={__flow_editor_config__} />,
    document.getElementById("flow-editor")
);