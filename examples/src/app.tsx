// React v16 polyfills (https://reactjs.org/docs/javascript-environment-requirements.html)
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'raf/polyfill';

// Global styles
import 'react-select/dist/react-select.css';
import '../../fonts/flows/style.css';
import '../../src/global.scss';

import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer as HotContainer } from 'react-hot-loader';
import FlowEditor from '../../src/index';
import config from './config';
import { inProduction } from '../../src/lib/utils/index';

const root = document.getElementById('flow-editor');

if (inProduction()) {
    const renderHot = (
        // TODO: type props
        App: React.ComponentClass<any>
    ): void | Element | React.Component<any, React.ComponentState> =>
        render(
            <HotContainer>
                <App config={config} />
            </HotContainer>,
            root
        );

    if (module.hot) {
        module.hot.accept('../../src/lib/component/FlowEditor', () => {
            const {
                default: NextEditor
            } = require('../../src/lib/component/FlowEditor');
            renderHot(NextEditor);
        });
    }

    renderHot(FlowEditor);
} else {
    render(<FlowEditor config={config} />, root);
}
