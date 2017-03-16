import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles.scss";
import "./utils";
import {FlowComp} from "./components/Flow";
import {Simulator} from "./components/Simulator";
import {FlowStore} from "./services/FlowStore";

var url = 'two_questions.json';
var engineUrl = 'http://localhost:8080';

ReactDOM.render(
  <FlowComp url={url} engineUrl={engineUrl}/>,
  document.getElementById("root")
);  

//ReactDOM.render(
//  <Simulator engineUrl={engineUrl}/>,
//  document.getElementById("root_sim")
//);  

