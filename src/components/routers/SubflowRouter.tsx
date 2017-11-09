import * as React from 'react';
import * as UUID from 'uuid';
import { IExit, IStartFlow, ICase, ISwitchRouter } from '../../flowTypes';
import { IType } from '../../services/EditorConfig';
import { FlowElement } from '../form/FlowElement';
import Widget from '../NodeEditor/Widget';
import ComponentMap from '../../services/ComponentMap';

import { INode, TAnyAction } from '../../flowTypes';
import { IEndpoints } from '../../services/EditorConfig';

export interface ISubflowRouterFormProps {
    action: TAnyAction;
    endpoints: IEndpoints;
    node: INode;
    updateRouter(node: INode, type: string, previousAction: TAnyAction): void;
    validationCallback: Function;
    onBindWidget(ref: any): void;
    isTranslating: boolean;
    renderExitTranslations(): JSX.Element;
    config: IType;
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
    validationCallback,
    onBindWidget,
    isTranslating,
    renderExitTranslations,
    saveLocalizedExits,
    getActionUUID,
    ComponentMap
}: ISubflowRouterFormProps) => {
    validationCallback((widgets: { [name: string]: Widget }): void => {
        if (isTranslating) {
            return saveLocalizedExits(widgets);
        }

        const select = widgets['Flow'] as FlowElement;
        const flow = select.state.flow;

        const newAction: IStartFlow = {
            uuid: getActionUUID(),
            type: config.type,
            flow_name: flow.name,
            flow_uuid: flow.id
        };

        // if we were already a subflow, lean on those exits and cases
        let exits: IExit[];
        let cases: ICase[];

        const details = ComponentMap.getDetails(node.uuid);

        if (details && details.type === 'subflow') {
            exits = node.exits;
            ({ exits } = node);
            ({ cases } = node.router as ISwitchRouter);
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

        const router: ISwitchRouter = {
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
                const startAction = action as IStartFlow;
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
