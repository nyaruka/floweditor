import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer as HotContainer } from 'react-hot-loader';
import ConfigProvider from './providers/ConfigProvider';
import Editor from './components/Editor';

import 'react-select/dist/react-select.css';
import '../fonts/flows/style.css';
import './global.scss';

const flowEditorConfig = require('Config');

const root = document.getElementById('flow-editor');

// if (__flow_editor_config__.hasOwnProperty('path')) {
//     __webpack_public_path__ = __flow_editor_config__.path;
// }

const renderHot = (App: React.ComponentClass) =>
    render(
        <HotContainer>
            <ConfigProvider flowEditorConfig={flowEditorConfig}>
                <App />
            </ConfigProvider>
        </HotContainer>,
        root
    );

if (module.hot) {
    module.hot.accept('./components/Editor', () => {
        const { default: NextEditor } = require('./components/Editor');
        renderHot(NextEditor);
    });
}

renderHot(Editor);
