import '../fonts/floweditor/style.css';
import './global.module.scss';

import FlowEditor from 'components';
import { FlowEditorConfig } from 'flowTypes';
import * as React from 'react';
import { render } from 'react-dom';

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
