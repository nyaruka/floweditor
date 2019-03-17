import '../fonts/floweditor/style.css';
import './global.scss';

import React = require('react');
import { render } from 'react-dom';
import FlowEditor from '~/components';
import { FlowEditorConfig } from '~/flowTypes';

declare global {
    interface Window {
        fe: any;
    }
}

(window as any).showFlowEditor = (ele: any, config: FlowEditorConfig) => {
    render(<FlowEditor config={config} />, ele);
};

/* istanbul ignore next */
export default FlowEditor;
