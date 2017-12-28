/** React v16 polyfills (https://reactjs.org/docs/javascript-environment-requirements.html) */
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'raf/polyfill';

import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer as HotContainer } from 'react-hot-loader';
import ConfigProvider from './providers/ConfigProvider';
import Editor from './components/Editor';

import 'react-select/dist/react-select.css';
import '../fonts/flows/style.css';
import './global.scss';

const root = document.getElementById('flow-editor');

// if (__flow_editor_config__.hasOwnProperty('path')) {
//     __webpack_public_path__ = __flow_editor_config__.path;
// }

const renderHot = (App: React.ComponentClass) =>
    render(
        <HotContainer>
            <ConfigProvider>
                <App />
            </ConfigProvider>
        </HotContainer>,
        root
    );

if (module.hot) {
    // prettier-ignore
    module.hot.accept(
        './components/Editor',
        () => renderHot(
            require('./components/Editor').default
        )
    );
}

renderHot(Editor);
