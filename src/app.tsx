import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer as HotContainer } from 'react-hot-loader';
import { flow as flowUUID } from './editor.config';
import EditorConfig from './services/EditorConfig';
import External from './services/External';
import Editor from './components/Editor';

import 'react-select/dist/react-select.css';
import '../fonts/flows/style.css';
import './global.scss';

const root = document.getElementById('flow-editor');

// if (__flow_editor_config__.hasOwnProperty('path')) {
//     __webpack_public_path__ = __flow_editor_config__.path;
// }

if (module.hot) {
    module.hot.accept('./components/Editor', () => {
        const NextEditor = require('./components/Editor');
        render(
            <HotContainer>
                <NextEditor
                    flowUUID={flowUUID}
                    EditorConfig={new EditorConfig()}
                    External={new External()}
                />
            </HotContainer>,
            root
        );
    });
}

render(
    <HotContainer>
        <Editor flowUUID={flowUUID} EditorConfig={new EditorConfig()} External={new External()} />
    </HotContainer>,
    root
);
