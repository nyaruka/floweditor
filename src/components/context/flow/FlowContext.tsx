import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { determineTypeConfig } from '~/components/flow/helpers';
import { getTypeConfig, Type, Types } from '~/config/typeConfigs';
import {
    AnyAction,
    Dimensions,
    FlowDefinition,
    FlowNode,
    FlowPosition,
    RouterTypes,
    SendMsg,
    StickyNote,
    SwitchRouter
} from '~/flowTypes';
import AssetService, { Asset } from '~/services/AssetService';
import { RenderNode, RenderNodeMap } from '~/store/flowContext';
import { getFlowComponents, getGhostNode } from '~/store/helpers';
import * as mutators from '~/store/mutators';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

import { getFlowResult } from './helpers';

export interface FlowProps {}

export interface Connection {
    previousConnection: Connection;
}

export interface ConnectionEvent {
    connection: Connection;
    source: Element;
    target: Element;
    sourceId: string;
    targetId: string;
    suspendedElementId: string;
    endpoints: any[];
}

export type LocalizationUpdates = Array<{ uuid: string; translations?: any }>;

const mutate = require('immutability-helper');

export interface FlowResult {
    nodeUUIDs: string[];
    key: string;
    name: string;
}

export interface FlowResultMap {
    [resultName: string]: FlowResult;
}

export interface FlowState {
    definition: FlowDefinition;
    results: FlowResultMap;
    nodes: RenderNodeMap;
    ghostNode: RenderNode;

    nodeEditorOpen: boolean;
    nodeEditor: NodeEditorSettings;
    typeConfig: Type;

    languages: Asset[];

    mutator: {
        fetchFlow(assetService: AssetService, uuid: string): void;
        initializeFlow(definition: FlowDefinition, languages: Asset[]): void;

        addToNode(renderNode: RenderNode): void;
        removeNode(renderNode: RenderNode): void;
        addFlowResult(resultName: string, nodeUUID: string): void;
        updateNodePosition(renderNode: RenderNode, position: FlowPosition): void;
        updateNodeDimensions(renderNode: RenderNode, dimensions: Dimensions): void;

        updateConnection(sourceId: string, targetId: string): void;
        updateConnectionDrag(event: ConnectionEvent): void;
        ensureStartNode(): void;
        disconnectExit(nodeUUID: string, exitUUID: string): void;

        updateSticky(uuid: string, sticky: StickyNote): void;

        removeAction(renderNode: RenderNode, action: AnyAction): void;
        moveActionUp(renderNode: RenderNode, action: AnyAction): void;

        updateRouter(renderNode: RenderNode): void;
        updateAction(action: AnyAction): void;

        updateLocalizations(language: string, changes: LocalizationUpdates): void;

        openNodeEditor(settings: NodeEditorSettings): void;
        closeNodeEditor(canceled: boolean): void;
        updateTypeConfig(typeConfig: Type): void;
    };
}

const { Provider, Consumer } = React.createContext<FlowState | null>(null);

export class FlowProvider extends React.Component<FlowProps, FlowState> {
    constructor(props: FlowProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^handle/]
        });

        this.state = {
            results: {},
            ghostNode: null,
            definition: null,
            nodes: {},
            languages: [],

            nodeEditorOpen: false,
            nodeEditor: null,
            typeConfig: null,

            mutator: {
                fetchFlow: this.handleFetchFlow,
                initializeFlow: this.handleInitializeFlow,
                addFlowResult: this.handleAddFlowResult,
                removeNode: this.handleRemoveNode,
                addToNode: this.handleAddToNode,
                disconnectExit: this.handleDisconnectExit,
                updateNodePosition: this.handleUpdateNodePosition,
                updateNodeDimensions: this.handleUpdateNodeDimensions,
                updateConnection: this.handleUpdateConnection,
                updateConnectionDrag: this.handleUpdateConnectionDrag,
                ensureStartNode: this.handleEnsureStartNode,
                updateSticky: this.handleUpdateSticky,
                removeAction: this.handleRemoveAction,
                moveActionUp: this.handleMoveActionUp,
                updateAction: this.handleUpdateAction,
                updateRouter: this.handleUpdateRouter,
                updateLocalizations: this.handleUpdateLocalizations,
                updateTypeConfig: this.handleUpdateTypeConfig,
                openNodeEditor: this.handleOpenNodeEditor,
                closeNodeEditor: this.handleCloseNodeEditor
            }
        };
    }

    private async handleFetchFlow(assetService: AssetService, uuid: string): Promise<void> {
        const [flows, environment, fields, languages] = await Promise.all([
            assetService.getFlowAssets().get(uuid),
            assetService.getEnvironmentAssets().get(''),
            assetService.getFieldAssets().get(''),
            assetService.getLanguageAssets().search('')
        ]);

        this.handleInitializeFlow(flows.content, languages.results);

        /* const fieldsToDedupe = [...fields.content];
        const existingFields = extractContactFields(flows.content.nodes);
        if (existingFields.length) {
            fieldsToDedupe.push(...existingFields);
        }
        const contactFields = dedupe(fieldsToDedupe).reduce((contactFieldMap, field) => {
            contactFieldMap[field.key] = field.name;
            return contactFieldMap;
        }, {});
        dispatch(updateContactFields(contactFields));
        */
    }

    private handleInitializeFlow(definition: FlowDefinition, languages: Asset[]): void {
        const flowComponents = getFlowComponents(definition);

        const results: FlowResultMap = {};
        for (const node of definition.nodes) {
            if (node.router && node.router.type === RouterTypes.switch) {
                const router = node.router as SwitchRouter;
                const result = getFlowResult(results, router.result_name, node.uuid);
                results[result.key] = result;
            }
        }

        this.setState({
            definition,
            results,
            languages,
            nodes: flowComponents.renderNodeMap
        });
    }

    private handleUpdateNodeDimensions(renderNode: RenderNode, dimensions: Dimensions): void {
        // TODO: trigger reflow

        const updated = mutators.updateDimensions(
            this.state.nodes,
            renderNode.node.uuid,
            dimensions
        );
        this.setState({ nodes: updated });
    }

    private handleUpdateConnection(source: string, target: string): void {
        const [nodeUUID, exitUUID] = source.split(':');
        const nodes = mutators.updateConnection(this.state.nodes, nodeUUID, exitUUID, target);
        this.setState({ nodes });
    }

    private handleRemoveAction(renderNode: RenderNode, action: AnyAction): void {
        // TODO: remove flow result for set_run_result

        // If it's our last action, then nuke the node
        let nodes = this.state.nodes;
        if (renderNode.node.actions.length === 1) {
            nodes = mutators.removeNode(this.state.nodes, renderNode.node.uuid);
        } else {
            nodes = mutators.removeAction(this.state.nodes, renderNode.node.uuid, action.uuid);
        }
        this.setState({ nodes });
    }

    private handleRemoveNode(renderNode: RenderNode): void {
        // TODO: Remove flow result from switch routers

        const nodes = mutators.removeNode(this.state.nodes, renderNode.node.uuid, true);
        this.setState({ nodes });
    }

    private handleMoveActionUp(renderNode: RenderNode, action: AnyAction): void {
        const nodes = mutators.moveActionUp(this.state.nodes, renderNode.node.uuid, action.uuid);
        this.setState({ nodes });
    }

    private handleUpdateAction(action: AnyAction): void {
        // TODO: update result name mappings for set_run_result
        // TODO: update with new contact fields for set_contact_field

        const updatedNodes = mutators.replaceWithAction(
            this.state.nodes,
            this.state.nodeEditor,
            action
        );
        this.setState({
            nodes: updatedNodes,
            nodeEditor: null,
            nodeEditorOpen: false,
            ghostNode: null
        });
    }

    private handleUpdateRouter(renderNode: RenderNode): void {
        const nodes = mutators.replaceWithRouter(
            this.state.nodes,
            this.state.nodeEditor,
            renderNode
        );
        this.setState({ nodes, ghostNode: null });
    }

    private handleAddFlowResult(resultName: string, nodeUUID: string): void {
        const result = getFlowResult(this.state.results, resultName, nodeUUID);
        const state = mutate(this.state, { results: { $merge: { [result.key]: result } } });
        this.setState(state);
    }

    private handleAddToNode(renderNode: RenderNode): void {
        const nodeEditor: NodeEditorSettings = { originalNode: renderNode, userAddingAction: true };
        const typeConfig = getTypeConfig(Types.send_msg);
        this.setState({ typeConfig, nodeEditor, nodeEditorOpen: true });
    }

    private handleOpenNodeEditor(nodeEditor: NodeEditorSettings): void {
        const typeConfig = determineTypeConfig(nodeEditor);
        this.setState({ typeConfig, nodeEditor, nodeEditorOpen: true });
    }

    private handleCloseNodeEditor(canceled: boolean): void {
        this.setState({ nodeEditor: null, nodeEditorOpen: false, ghostNode: null });
    }

    private handleUpdateTypeConfig(typeConfig: Type): void {
        this.setState({ typeConfig });
    }

    private handleUpdateSticky(uuid: string, sticky: StickyNote): void {
        const definition = mutators.updateStickyNote(this.state.definition, uuid, sticky);
        this.setState({ definition });
    }

    private handleEnsureStartNode(): void {
        if (Object.keys(this.state.nodes).length === 0) {
            const initialAction: SendMsg = {
                uuid: createUUID(),
                type: Types.send_msg,
                text: 'Hi there, this is the first message in your flow.'
            };

            const node: FlowNode = {
                uuid: createUUID(),
                actions: [initialAction],
                exits: [
                    {
                        uuid: createUUID()
                    }
                ]
            };

            const nodes = mutators.mergeNode(this.state.nodes, {
                node,
                ui: { position: { left: 120, top: 120 } },
                inboundConnections: {}
            });

            this.setState({ nodes });
        }
    }

    private handleUpdateNodePosition(renderNode: RenderNode, position: FlowPosition): void {
        const nodes = mutators.updatePosition(
            this.state.nodes,
            renderNode.node.uuid,
            position.left,
            position.top
        );

        this.setState({ nodes });
    }

    private handleUpdateConnectionDrag(event: ConnectionEvent): void {
        // We finished dragging a ghost node, create the spec for our new ghost component
        const [fromNodeUUID, fromExitUUID] = event.sourceId.split(':');

        const fromNode = this.state.nodes[fromNodeUUID];

        // set our ghost node
        const ghostNode = getGhostNode(fromNode, fromExitUUID, 0);
        ghostNode.inboundConnections = { [fromExitUUID]: fromNodeUUID };

        this.setState({ ghostNode });
    }

    private handleDisconnectExit(nodeUUID: string, exitUUID: string): void {
        const nodes = mutators.updateConnection(this.state.nodes, nodeUUID, exitUUID, null);
        this.setState({ nodes });
    }

    /** ---------------------------------------------------------------------------------------- */

    private handleUpdateLocalizations(language: string, changes: LocalizationUpdates): void {
        console.log('update localizations');
    }

    public render(): JSX.Element {
        return <Provider value={this.state}>{this.props.children}</Provider>;
    }
}

export const FlowConsumer = Consumer;
