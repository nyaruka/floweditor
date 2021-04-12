import './global.module.scss';
import 'static/fonts/floweditor/style.css';

import FlowEditor from 'components';
import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import { setHTTPTimeout } from 'external';
import axios from 'axios';
import { getAuthToken } from 'utils';

axios.interceptors.request.use(
  function(config) {
    if (!config.url.includes('revisions') && !config.url.includes('activity')) {
      config.headers.Authorization = getAuthToken();
    }

    return config;
  },
  function(error) {
    console.log(error);
    return Promise.reject(error);
  }
);

// bring in our temba-components if they aren't already registered
if (typeof customElements !== 'undefined' && !customElements.get('temba-textinput')) {
  import('@nyaruka/temba-components').then(() => {
    console.log('Loading temba components');

    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
      console.log(this, arguments);
      origOpen.apply(this, arguments);
      this.setRequestHeader('Authorization', getAuthToken());
    };
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
