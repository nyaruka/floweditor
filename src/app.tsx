import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as qs from 'query-string';
import {Editor} from './components/Editor';
import {FlowStore} from './services/FlowStore';
import {Endpoints} from './interfaces';


import 'react-select/dist/react-select.css';
import './global.scss';
// our css dependencies
// var global = require('./global.scss');
//var testing = require('./test.scss');

// console.log("global", global);
//console.log("testing", testing);


var parms = qs.parse(window.location.search);
var flowURL = parms.flow
if (flowURL == null){
  flowURL = 'test_flows/lots_of_action.json';
}

var token = null;
var site = null;

if (parms.rapid) {
  token = parms.rapid;
  site = "rapid";
}

if (parms.textit) {
  token = parms.textit;
  site = "textit";
}

if (parms.resist) {
  token = parms.resist;
  site = "resist";
}

if (parms.local) {
  token = parms.local;
  site = "local";
}

if (parms.reset) {
  FlowStore.get().reset();
}

var endpoints: Endpoints = {
    engine:     'http://localhost:9000',
    contacts:   'http://localhost:9000/assets/contacts.json',
    groups:     'http://localhost:9000/assets/groups.json',
    fields:     'http://localhost:9000/assets/fields.json',
    flow:       flowURL,
}

ReactDOM.render(
  <Editor
    endpoints={endpoints}
    site={site}
    token={token}
  />,
  document.getElementById("flow-editor")
);