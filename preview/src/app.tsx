// React v16 polyfills (https://reactjs.org/docs/javascript-environment-requirements.html)
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'raf/polyfill';

import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer as HotContainer } from 'react-hot-loader';
import * as config from '../../assets/config';
import FlowEditor from '../../src/';

const root = document.getElementById('flow-editor');

const renderHot = (App: React.ComponentClass<{ config: object }>) =>
    render(
        <HotContainer>
            <App config={config} />
        </HotContainer>,
        root
    );

if (module.hot) {
    module.hot.accept('../../src', () => {
        const { default: NextEditor } = require('../../src');
        renderHot(NextEditor);
    });
}

// renderHot(FlowEditor);
render(<FlowEditor config={config}/>, root)
