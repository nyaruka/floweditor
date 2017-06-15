import * as React from 'react';
import * as UUID from 'uuid';
import { SwitchRouterForm, SwitchRouterState } from "./SwitchRouter";
import { StartFlow, Case, Exit, SwitchRouter } from '../../FlowDefinition';
import { FlowElement } from "../form/FlowElement";
import { NodeRouterForm } from "../NodeEditor";
import { Config } from "../../services/Config";
import { ComponentMap } from "../ComponentMap";


export class SubflowForm extends NodeRouterForm<SwitchRouter, SwitchRouterState> {

    renderForm(ref: any): JSX.Element {
        var flow_name, flow_uuid: string = null;
        if (this.props.action) {
            var action = this.props.action;
            if (action.type == "start_flow") {
                var startAction: StartFlow = action as StartFlow;
                flow_name = startAction.flow_name;
                flow_uuid = startAction.flow_uuid;
            }
        }

        return (
            <div>
                <p>Select a flow to run</p>
                <FlowElement
                    ref={ref}
                    name="Flow"
                    endpoint={Config.get().endpoints.flows}
                    flow_name={flow_name}
                    flow_uuid={flow_uuid}
                    required
                />
            </div>
        )

    }

    getUUID(): string {
        if (this.props.action) {
            return this.props.action.uuid;
        }
        return UUID.v4();
    }

    onValid(): void {
        var select = this.getWidget("Flow") as FlowElement;
        var flow = select.state.flow;

        var newAction: StartFlow = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            flow_name: flow.name,
            flow_uuid: flow.id
        }

        // if we were already a subflow, lean on those exits and cases
        var exits = [];
        var cases: Case[];

        var details = ComponentMap.get().getDetails(this.props.node.uuid);
        if (details && details.type == "subflow") {
            exits = this.props.node.exits;
            cases = (this.props.node.router as SwitchRouter).cases;
        }

        // otherwise, let's create some new ones
        else {
            exits = [
                {
                    uuid: UUID.v4(),
                    name: "Complete",
                    destination_node_uuid: null
                }
            ];

            cases = [
                {
                    uuid: UUID.v4(),
                    type: "has_run_status",
                    arguments: ["C"],
                    exit_uuid: exits[0].uuid
                }
            ];
        }


        var router: SwitchRouter = {
            type: "switch",
            operand: "@child",
            cases: cases,
            default_exit_uuid: null
        }

        // HACK: this should go away with modal refactor
        var nodeUUID = this.props.node.uuid;
        if (this.props.action && this.props.action.uuid == nodeUUID) {
            nodeUUID = UUID.v4();
        }

        this.props.updateRouter({
            uuid: nodeUUID,
            router: router,
            exits: exits,
            actions: [newAction],
            wait: { type: "flow", flow_uuid: flow.id }
        }, "subflow");
    }
}