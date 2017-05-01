import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FlowComp from './components/FlowComp';
import SimulatorComp from './components/SimulatorComp';
import FlowStore from './services/FlowStore';

// our css dependencies
import './styles.scss';
// import '../fonts/flows/style.scss';
import 'react-select2-wrapper/css/select2.css';

var contacts = 'http://localhost:9000/assets/contacts.json';
var fields = 'http://localhost:9000/assets/fields.json'

// var flow = 'test_flows/sample.json';
// var flow = 'test_flows/two_questions.json';
var flow = 'test_flows/meningitis.json';

var engineUrl = 'http://localhost:8080';

ReactDOM.render(
  <FlowComp  
    engineURL={engineUrl}
    contactsURL={contacts}
    fieldsURL={fields}
    flowURL={flow}/>,
  document.getElementById("root")
);