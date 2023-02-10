import './global.module.scss';
import 'static/fonts/floweditor/style.css';

import FlowEditor from 'components';
import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import { setHTTPTimeout } from 'external';

// bring in our temba-components if they aren't already registered
document.addEventListener('DOMContentLoaded', () => {
  var componentsExist =
    document.body.innerHTML.indexOf('temba-components') > -1 ||
    document.body.innerHTML.indexOf('temba-modules') > -1;
  if (!componentsExist) {
    import('@nyaruka/temba-components/dist/index.js').then(() => {
      console.log('Loading temba components');
    });
  }
});

window.unmountEditor = ele => {
  if (ele) {
    ReactDOM.unmountComponentAtNode(ele);
    if (window.editor) {
      window.editor.reset();
    }
  }
};

window.showFlowEditor = (ele, config) => {
  if (config.httpTimeout) {
    setHTTPTimeout(config.httpTimeout);
  }

  ReactDOM.unmountComponentAtNode(ele);
  ReactDOM.render(<FlowEditor config={config} />, ele);
};

// let our document know we are ready to go
document.dispatchEvent(new CustomEvent('temba-floweditor-loaded'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
