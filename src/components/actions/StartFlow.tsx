import * as React from 'react';
import { ActionComp } from "../Action";
import { StartFlow } from "../../FlowDefinition";

export class StartFlowComp extends ActionComp<StartFlow> {
    renderNode(): JSX.Element {
        return <div>{this.getAction().flow_name}</div>
    }
}