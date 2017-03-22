import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FlowComp from './components/FlowComp';
import SimulatorComp from './components/SimulatorComp';
import FlowStore from './services/FlowStore';

// our css dependencies
import './styles.scss';
import 'react-select2-wrapper/css/select2.css';

var url = 'test_flows/two_questions.json';
var engineUrl = 'http://localhost:8080';

ReactDOM.render(
  <FlowComp url={url} engineUrl={engineUrl}/>,
  document.getElementById("root")
);