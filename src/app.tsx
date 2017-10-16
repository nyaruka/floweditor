import * as React from 'react';
import { render } from 'react-dom';
import * as qs from 'query-string';
import { Editor } from './components/Editor';
import { FlowStore } from './services/FlowStore';
import { Endpoints } from './services/Config';
import { AppContainer as HotContainer } from 'react-hot-loader';
import * as axios from 'axios';

import 'react-select/dist/react-select.css';
import './global.scss';
import '../fonts/flows/style.css';

const root = document.getElementById('flow-editor');
const publicPath = __flow_editor_config__.path;
const params = qs.parse(window.location.search);

if (publicPath) {
    __webpack_public_path__ = publicPath;
}

/**
 * Configure axios to always send JSON requests
 */
axios.default.defaults.headers.post['Content-Type'] = 'application/javascript';
axios.default.defaults.responseType = 'json';

if (module.hot) {
    module.hot.accept('./components/Editor', () => {
        const NextEditor = require('./components/Editor').Editor;
        render(
            <HotContainer>
                <NextEditor config={__flow_editor_config__} />
            </HotContainer>,
            root
        );
    });
}

render(
    <HotContainer>
        <Editor config={__flow_editor_config__} />
    </HotContainer>,
    root
);
