import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Exit, StartFlow, Case, SwitchRouter } from '../../flowTypes';
import { Type } from '../../services/EditorConfig';
import { FormProps } from '../NodeEditor';
import { Node, AnyAction } from '../../flowTypes';
import { Endpoints } from '../../services/EditorConfig';
import FlowElement from '../form/FlowElement';
import ComponentMap from '../../services/ComponentMap';

export interface SubflowRouterFormProps extends FormProps {
    action: AnyAction;
    endpoints: Endpoints;
    node: Node;
    config: Type;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    onBindWidget(ref: any): void;
    translating: boolean;
    renderExitTranslations(): JSX.Element;
    saveLocalizedExits(widgets: { [name: string]: any }): void;
    getActionUUID(): string;
    ComponentMap: ComponentMap;
}

export default class SubflowRouter extends React.PureComponent<SubflowRouterFormProps> {
    constructor(props: SubflowRouterFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.translating) {
            return this.props.saveLocalizedExits(widgets);
        }

        const select = widgets['Flow'] as FlowElement;
        const { name: flow_name, id: flow_uuid } = select.state.flow;

        const newAction: StartFlow = {
            uuid: this.props.getActionUUID(),
            type: this.props.config.type,
            flow_name,
            flow_uuid
        };

        /** If we were already a subflow, lean on those exits and cases */
        let exits: Exit[];
        let cases: Case[];

        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        if (details && details.type === 'subflow') {
            ({ exits } = this.props.node);
            ({ cases } = this.props.node.router as SwitchRouter);
        } else {
            // otherwise, let's create some new ones
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

        /** HACK: this should go away with modal refactor */
        let { uuid: nodeUUID } = this.props.node;

        if (this.props.action && this.props.action.uuid === nodeUUID) {
            nodeUUID = generateUUID();
        }

        this.props.updateRouter(
            {
                uuid: nodeUUID,
                router: newRouter,
                exits,
                actions: [newAction],
                wait: { type: 'flow', flow_uuid }
            },
            'subflow',
            this.props.action
        );
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.renderExitTranslations();
        }

        let flow_name: string;
        let flow_uuid: string;

        if (this.props.action) {
            if (this.props.action.type === 'start_flow') {
                ({ flow_name, flow_uuid } = this.props.action as StartFlow);
            }
        }

        return (
            <div>
                <p>Select a flow to run</p>
                <FlowElement
                    ref={this.props.onBindWidget}
                    name="Flow"
                    endpoint={this.props.endpoints.flows}
                    flow_name={flow_name}
                    flow_uuid={flow_uuid}
                    required
                />
            </div>
        );
    }

    public render(): JSX.Element {
        return this.renderForm();
    }
}
