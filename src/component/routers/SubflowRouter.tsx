import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Endpoints, Exit, StartFlow, Case, SwitchRouter } from '../../flowTypes';
import { FormProps } from '../NodeEditor';
import { Node, AnyAction } from '../../flowTypes';
import FlowElement from '../form/FlowElement';
import ComponentMap from '../../services/ComponentMap';
import { ConfigProviderContext, Type, endpointsPT } from '../../config';

export interface SubflowRouterFormProps extends FormProps {
    action: StartFlow;
    node: Node;
    config: Type;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    onBindWidget(ref: any): void;
    translating: boolean;
    getExitTranslations(): JSX.Element;
    saveLocalizedExits(widgets: { [name: string]: any }): void;
    ComponentMap: ComponentMap;
}

export default class SubflowRouter extends React.PureComponent<SubflowRouterFormProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SubflowRouterFormProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizedExits(widgets);
        }

        const select = widgets.Flow as FlowElement;
        const { name: flowName, id: flowUUID } = select.state.flow;

        const newAction: StartFlow = {
            uuid: this.props.action.uuid,
            type: this.props.config.type,
            flow_name: flowName,
            flow_uuid: flowUUID
        };

        // If we're already a subflow, lean on those exits and cases
        let exits: Exit[];
        let cases: Case[];

        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        if (details && details.type === 'subflow') {
            ({ exits } = this.props.node);
            ({ cases } = this.props.node.router as SwitchRouter);
        } else {
            // Otherwise, let's create some new ones
            exits = [
                {
                    uuid: generateUUID(),
                    name: 'Complete',
                    destination_node_uuid: null
                }
            ];

            cases = [
                {
                    uuid: generateUUID(),
                    type: 'has_run_status',
                    arguments: ['C'],
                    exit_uuid: exits[0].uuid
                }
            ];
        }

        const newRouter: SwitchRouter = {
            type: 'switch',
            operand: '@child',
            cases,
            default_exit_uuid: null
        };

        // HACK: this should go away with modal refactor
        let { uuid: nodeUUID } = this.props.node;

        if (this.props.action.uuid === nodeUUID) {
            nodeUUID = generateUUID();
        }

        this.props.updateRouter(
            {
                uuid: nodeUUID,
                router: newRouter,
                exits,
                actions: [newAction],
                wait: { type: 'flow', flow_uuid: flowUUID }
            },
            'subflow',
            this.props.action
        );
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        return (
            <div>
                <p>Select a flow to run</p>
                <FlowElement
                    ref={this.props.onBindWidget}
                    name="Flow"
                    endpoint={this.context.endpoints.flows}
                    flow_name={this.props.action.flow_name}
                    flow_uuid={this.props.action.flow_uuid}
                    required={true}
                />
            </div>
        );
    }
}
