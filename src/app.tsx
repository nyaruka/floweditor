import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {FlowLoaderComp} from './components/FlowLoaderComp';
import * as qs from 'query-string';

// our css dependencies
import './styles.scss';
import 'react-select2-wrapper/css/select2.css';
import 'react-select/dist/react-select.css';

var contacts = 'http://localhost:9000/assets/contacts.json';
var fields = 'http://localhost:9000/assets/fields.json'

// var flow = 'test_flows/sample.json';
// var flow = 'test_flows/two_questions.json';
// var flow = 'test_flows/meningitis.json';
// var flow = 'test_flows/favorites.json';
// var flow = 'test_flows/lots_of_action.json';
var engineUrl = 'http://localhost:8080';
var parms = qs.parse(location.search);

console.log(parms);

var flowURL = parms.flow
if (flowURL == null){
  flowURL = 'test_flows/lots_of_action.json';
}

ReactDOM.render(
  <FlowLoaderComp  
    engineURL={engineUrl}
    contactsURL={contacts}
    fieldsURL={fields}
    flowURL={flowURL}
    
    uuid={parms.flow}
    token={parms.token}
    />,
  document.getElementById("root")
);