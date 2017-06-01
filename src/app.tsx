import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as qs from 'query-string';
import { Editor } from './components/Editor';
import { FlowStore } from './services/FlowStore';
import { Endpoints } from './interfaces';
import * as axios from 'axios';

import 'react-select/dist/react-select.css';
import './global.scss';
import '../fonts/flows/style.css';

// configure axios to always send JSON requests
axios.default.defaults.headers.post['Content-Type'] = 'application/javascript';
axios.default.defaults.responseType = 'json';

var parms = qs.parse(window.location.search);
var flowURL = parms.flow
if (flowURL == null) {
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


var root = document.getElementById("flow-editor");
var fields = root.getAttribute("fields");
var contacts = root.getAttribute("contacts");
var groups = root.getAttribute("groups");
var engine = root.getAttribute("engine");
var flows = root.getAttribute("flows");
var flowUUID = root.getAttribute("flow");

var endpoints: Endpoints = {
  engine: engine ? engine : 'http://localhost:9000',
  contacts: contacts ? contacts : 'http://localhost:9000/assets/contacts.json',
  groups: groups ? groups : 'http://localhost:9000/assets/groups.json',
  fields: fields ? fields : 'http://localhost:9000/assets/fields.json',
  flows: flows ? flows : 'http://localhost:9000/assets/flows.json',
}

ReactDOM.render(
  <Editor
    endpoints={endpoints}
    flowUUID={flowUUID}
  />,
  document.getElementById("flow-editor")
);