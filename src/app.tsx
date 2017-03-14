import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles.scss";
import "./utils";
import FlowComp from "./components/Flow";
import {FlowStore} from "./services/FlowStore";


// var url = "https://gist.githubusercontent.com/nicpottier/56e8cc4271d9a78d9b4785aedb899cac/raw"
var url = 'two_questions.json';

FlowStore.get().loadFlow(url, ()=>{
  ReactDOM.render(
    <FlowComp definition={FlowStore.get().getCurrentDefinition()}/>,
    document.getElementById("root")
  );  
});

