import * as React from 'react';
import * as UUID from 'uuid';
import { Exit, StartFlow, Case, SwitchRouter } from '../../flowTypes';
import { Type } from '../../services/EditorConfig';
import FlowElement from '../form/FlowElement';
import ComponentMap from '../../services/ComponentMap';

import { Node, AnyAction } from '../../flowTypes';
import { Endpoints } from '../../services/EditorConfig';

export interface SubflowRouterFormProps {
    action: AnyAction;
    endpoints: Endpoints;
    node: Node;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    onValidCallback: Function;
    onBindWidget(ref: any): void;
    isTranslating: boolean;
    renderExitTranslations(): JSX.Element;
    config: Type;
    saveLocalizedExits(widgets: { [name: string]: Widget }): void;
    getActionUUID(): string;
    ComponentMap: ComponentMap;
}

export default ({
    action,
    endpoints: { flows: flowsEndpoint },
    node,
    config,
    updateRouter,
    onValidCallback,
    onBindWidget,
    isTranslating,
    renderExitTranslations,
    saveLocalizedExits,
    getActionUUID,
    ComponentMap
}: SubflowRouterFormProps) => {
    onValidCallback((widgets: { [name: string]: Widget }): void => {
        if (isTranslating) {
            return saveLocalizedExits(widgets);
        }

        const select = widgets['Flow'] as FlowElement;
        const flow = select.state.flow;

        const newAction: StartFlow = {
            uuid: getActionUUID(),
            type: config.type,
            flow_name: flow.name,
            flow_uuid: flow.id
        };

        // if we were already a subflow, lean on those exits and cases
        let exits: Exit[];
        let cases: Case[];

        const details = ComponentMap.getDetails(node.uuid);

        if (details && details.type === 'subflow') {
            exits = node.exits;
            ({ exits } = node);
            ({ cases } = node.router as SwitchRouter);
        } else {
            // otherwise, let's create some new ones
            exits = [
                {
                    uuid: UUID.v4(),
                    name: 'Complete',
                    destination_node_uuid: null
                }
            ];

            cases = [
                {
                    uuid: UUID.v4(),
                    type: 'has_run_status',
                    arguments: ['C'],
                    exit_uuid: exits[0].uuid
                }
            ];
        }

        const router: SwitchRouter = {
            type: 'switch',
            operand: '@child',
            cases: cases,
            default_exit_uuid: null
        };

        // HACK: this should go away with modal refactor
        let {uuid: nodeUUID} = node;

        if (action && action.uuid === nodeUUID) {
            nodeUUID = UUID.v4();
        }

        updateRouter(
            {
                uuid: nodeUUID,
                router: router,
                exits: exits,
                actions: [newAction],
                wait: { type: 'flow', flow_uuid: flow.id }
            },
            'subflow',
            action
        );
    });

    const renderForm = (): JSX.Element => {
        if (isTranslating) {
            renderExitTranslations();
        }

        let flow_name: string;
        let flow_uuid: string;

        if (action) {
            if (action.type === 'start_flow') {
                const startAction = action as StartFlow;
                flow_name = startAction.flow_name;
                ({ flow_name, flow_uuid } = startAction);
            }
        }

        return (
            <div>
                <p>Select a flow to run</p>
                <FlowElement
                    ref={onBindWidget}
                    name="Flow"
                    endpoint={flowsEndpoint}
                    flow_name={flow_name}
                    flow_uuid={flow_uuid}
                    required
                />
            </div>
        );
    };

    return renderForm();
};
