import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as qs from 'query-string';
import {Editor} from './components/Editor';

// our css dependencies
import './styles.scss';
import 'react-select2-wrapper/css/select2.css';
import 'react-select/dist/react-select.css';

var contacts = 'http://localhost:9000/assets/contacts.json';
var fields = 'http://localhost:9000/assets/fields.json'
var engineUrl = 'http://localhost:9000';
var parms = qs.parse(location.search);

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

// console.log(site, token);

ReactDOM.render(
  <Editor
    engineURL={engineUrl}
    site={site}
    token={token}
  />,
  document.getElementById("root")
);