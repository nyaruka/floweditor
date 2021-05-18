import './global.module.scss';
import 'static/fonts/floweditor/style.css';

import FlowEditor from 'components';
import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import { setHTTPTimeout } from 'external';

// bring in our temba-components if they aren't already registered
var componentsExist =
  document.body.innerHTML.indexOf('temba-components') > -1 ||
  document.body.innerHTML.indexOf('temba-modules') > -1;
if (!componentsExist) {
  import('@nyaruka/temba-components/dist/index.js').then(() => {
    console.log('Loading temba components');
  });
}

window.showFlowEditor = (ele, config) => {
  if (config.httpTimeout) {
    setHTTPTimeout(config.httpTimeout);
  }

  ReactDOM.render(<FlowEditor config={config} />, ele);
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
