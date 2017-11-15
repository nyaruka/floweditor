import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Exit, StartFlow, Case, SwitchRouter } from '../../flowTypes';
import { Type } from '../../services/EditorConfig';
import { Node, AnyAction } from '../../flowTypes';
import { Endpoints } from '../../services/EditorConfig';
import FlowElement from '../form/FlowElement';
import ComponentMap from '../../services/ComponentMap';

export interface SubflowRouterFormProps {
    action: AnyAction;
    endpoints: Endpoints;
    node: Node;
    type: string;
    router: SwitchRouter;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    onValidCallback: Function;
    onBindWidget(ref: any): void;
    isTranslating: boolean;
    renderExitTranslations(): JSX.Element;
    saveLocalizedExits(widgets: { [name: string]: any }): void;
    getActionUUID(): string;
    ComponentMap: ComponentMap;
}

export default ({
    action,
    endpoints: { flows: flowsEndpoint },
    node,
    router,
    type,
    updateRouter,
    onValidCallback,
    onBindWidget,
    isTranslating,
    renderExitTranslations,
    saveLocalizedExits,
    getActionUUID,
    ComponentMap
}: SubflowRouterFormProps) => {
    onValidCallback((widgets: { [name: string]: any }): void => {
        if (isTranslating) {
            return saveLocalizedExits(widgets);
        }

        const select = widgets['Flow'] as FlowElement;
        const { name: flow_name, id: flow_uuid } = select.state.flow;

        const newAction: StartFlow = {
            uuid: getActionUUID(),
            type,
            flow_name,
            flow_uuid
        };

        // if we were already a subflow, lean on those exits and cases
        let exits: Exit[];
        let cases: Case[];

        const details = ComponentMap.getDetails(node.uuid);

        if (details && details.type === 'subflow') {
            ({ exits } = node);
            ({ cases } = router);
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

        // HACK: this should go away with modal refactor
        let { uuid: nodeUUID } = node;

        if (action && action.uuid === nodeUUID) {
            nodeUUID = generateUUID();
        }

        updateRouter(
            {
                uuid: nodeUUID,
                router: newRouter,
                exits,
                actions: [newAction],
                wait: { type: 'flow', flow_uuid }
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
                ({ flow_name, flow_uuid } = action as StartFlow);
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
