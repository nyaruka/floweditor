import * as isEqual from 'fast-deep-equal';
import mutate from 'immutability-helper';
import { Dispatch } from 'react-redux';
import { determineTypeConfig } from '~/components/flow/helpers';
import { getTypeConfig, Type, Types } from '~/config/typeConfigs';
import { getAssets, getFlow, getURL } from '~/external';
import {
    Action,
    AnyAction,
    Dimensions,
    Endpoints,
    Exit,
    FlowDefinition,
    FlowNode,
    FlowPosition,
    SendMsg,
    SetContactField,
    SetRunResult,
    StickyNote,
    SwitchRouter
} from '~/flowTypes';
import { EditorState, updateEditorState } from '~/store/editor';
import {
    Asset,
    AssetType,
    DEFAULT_LANGUAGE,
    incrementSuggestedResultNameCount,
    RenderNode,
    RenderNodeMap,
    updateAssets,
    updateBaseLanguage,
    updateContactFields,
    updateDefinition,
    updateNodes,
    updateResultMap
} from '~/store/flowContext';
import {
    assetListToMap,
    FlowComponents,
    generateResultQuery,
    getActionIndex,
    getCollision,
    getFlowComponents,
    getGhostNode,
    getLocalizations,
    getNode
} from '~/store/helpers';
import * as mutators from '~/store/mutators';
import {
    NodeEditorSettings,
    updateNodeEditorSettings,
    updateTypeConfig,
    updateUserAddingAction
} from '~/store/nodeEditor';
import AppState from '~/store/state';
import { createUUID, NODE_SPACING, snakify, timeEnd, timeStart } from '~/utils';

// TODO: Remove use of Function
// tslint:disable:ban-types
export type DispatchWithState = Dispatch<AppState>;

export type GetState = () => AppState;

export type Thunk<T> = (dispatch: DispatchWithState, getState?: GetState) => T;

export type AsyncThunk = Thunk<Promise<void>>;

export type OnAddToNode = (node: FlowNode) => Thunk<void>;

export type HandleTypeConfigChange = (typeConfig: Type) => Thunk<void>;

export type OnResetDragSelection = () => Thunk<void>;

export type OnNodeMoved = (uuid: string, position: FlowPosition) => Thunk<RenderNodeMap>;

export type OnOpenNodeEditor = (settings: NodeEditorSettings) => Thunk<void>;

export type RemoveNode = (nodeToRemove: FlowNode) => Thunk<RenderNodeMap>;

export type UpdateDimensions = (node: FlowNode, dimensions: Dimensions) => Thunk<RenderNodeMap>;

export type FetchFlow = (endpoints: Endpoints, uuid: string) => Thunk<Promise<void>>;

export type EnsureStartNode = () => Thunk<RenderNode>;

export type NoParamsAC = () => Thunk<void>;

export type UpdateConnection = (source: string, target: string) => Thunk<RenderNodeMap>;

export type OnConnectionDrag = (event: ConnectionEvent) => Thunk<void>;

export type OnUpdateLocalizations = (
    language: string,
    changes: LocalizationUpdates
) => Thunk<FlowDefinition>;

export type UpdateSticky = (stickyUUID: string, sticky: StickyNote) => Thunk<void>;

export type OnUpdateAction = (
    action: AnyAction,
    onUpdated?: (dispatch: DispatchWithState, getState: GetState) => void
) => Thunk<RenderNodeMap>;

export type ActionAC = (nodeUUID: string, action: AnyAction) => Thunk<RenderNodeMap>;

export type DisconnectExit = (nodeUUID: string, exitUUID: string) => Thunk<RenderNodeMap>;

export type HandleLanguageChange = (language: Asset) => Thunk<void>;

export type MergeEditorState = (state: Partial<EditorState>) => Thunk<EditorState>;

export interface ReplaceAction {
    nodeUUID: string;
    actionUUID: string;
}

export type OnUpdateRouter = (node: RenderNode) => Thunk<RenderNodeMap>;

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

const FORCE_FETCH = true;
const QUIET_UI = 10;
const QUIET_SAVE = 1000;
const QUIET_REFLOW = 200;

let debounceReflow: any = null;

export const mergeEditorState = (changes: Partial<EditorState>) => (
    dispatch: DispatchWithState,
    getState: GetState
): EditorState => {
    const { editorState } = getState();
    const updated = mutate(editorState, { $merge: changes });
    dispatch(updateEditorState(updated));
    return updated;
};

/* export const updateAssets = (assets: AssetMap) => (
    dispatch: DispatchWithState,
    getState: GetState
): AssetMap => {
    
    return assets;
};*/

export const initializeFlow = (
    definition: FlowDefinition,
    endpoints: Endpoints,
    languages: Asset[] = []
) => (dispatch: DispatchWithState, getState: GetState): FlowComponents => {
    const flowComponents = getFlowComponents(definition, languages);

    let currentLanguages = languages;

    // if we have an unset base language, inject our "Default" Language and set it
    if (!flowComponents.baseLanguage) {
        currentLanguages = mutators.addLanguage(languages, DEFAULT_LANGUAGE);
    }

    const groups = assetListToMap(flowComponents.groups);
    dispatch(
        updateAssets({
            channels: {
                endpoint: getURL(endpoints.channels),
                type: AssetType.Channel,
                items: {} // TODO: flow components should include channels
            },
            languages: {
                endpoint: getURL(endpoints.languages),
                type: AssetType.Language,
                items: assetListToMap(currentLanguages),
                id: 'iso'
            },
            flows: {
                endpoint: getURL(endpoints.flows),
                type: AssetType.Flow,
                items: {} // TODO: flow components should include flows
            },
            fields: {
                endpoint: getURL(endpoints.fields),
                type: AssetType.Field,
                id: 'key',
                items: assetListToMap(flowComponents.fields)
            },
            groups: {
                endpoint: getURL(endpoints.groups),
                type: AssetType.Group,
                items: groups
            },
            labels: {
                endpoint: getURL(endpoints.labels),
                type: AssetType.Label,
                items: assetListToMap(flowComponents.labels)
            },
            results: {
                type: AssetType.Result,
                items: flowComponents.resultsMap
            },
            recipients: {
                endpoint: getURL(endpoints.recipients),
                type: AssetType.Contact || AssetType.Group || AssetType.URN,
                items: groups
            }
        })
    );

    // Take stock of the flow's language settings
    if (flowComponents.baseLanguage) {
        dispatch(updateBaseLanguage(flowComponents.baseLanguage));
        dispatch(mergeEditorState({ language: flowComponents.baseLanguage }));
    } else {
        dispatch(updateBaseLanguage(DEFAULT_LANGUAGE));
        dispatch(mergeEditorState({ language: DEFAULT_LANGUAGE }));
    }

    // store our flow definition without any nodes
    dispatch(updateDefinition(mutators.pruneDefinition(definition)));
    dispatch(updateNodes(flowComponents.renderNodeMap));

    // Take stock of existing results
    dispatch(updateResultMap(flowComponents.resultMap));
    // tslint:disable-next-line:forin
    for (const key in flowComponents.resultMap) {
        dispatch(incrementSuggestedResultNameCount());
    }

    dispatch(mergeEditorState({ fetchingFlow: false }));
    return flowComponents;
};

export const fetchFlow = (endpoints: Endpoints, uuid: string) => async (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(mergeEditorState({ fetchingFlow: true }));

    const [flow, languages] = await Promise.all([
        getFlow(endpoints, uuid),
        getAssets(endpoints.languages, AssetType.Language, 'iso')
    ]);

    dispatch(initializeFlow(flow.content, endpoints, languages));
};

export const handleLanguageChange: HandleLanguageChange = language => (dispatch, getState) => {
    const {
        flowContext: { baseLanguage },
        editorState: { translating, language: currentLanguage }
    } = getState();

    // determine translating state
    if (!isEqual(language, baseLanguage)) {
        if (!translating) {
            dispatch(mergeEditorState({ translating: true }));
        }
    } else {
        dispatch(mergeEditorState({ translating: false }));
    }

    // update language
    if (!isEqual(language, currentLanguage)) {
        dispatch(mergeEditorState({ language }));
    }
};

export const reflow = (current: RenderNodeMap = null) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    let nodes = current;
    if (!nodes) {
        nodes = getState().flowContext.nodes;
    }

    const collision = getCollision(nodes);
    if (collision.length) {
        timeStart('reflow');

        const [top, bottom, cascade] = collision;
        let updated = mutators.updatePosition(
            nodes,
            bottom.node.uuid,
            bottom.ui.position.left,
            top.ui.position.bottom + NODE_SPACING
        );

        if (cascade) {
            // start with the top of the bottom node
            let cascadeTop = top.ui.position.bottom + NODE_SPACING;

            // and add its height
            cascadeTop += bottom.ui.position.bottom - bottom.ui.position.top;

            updated = mutators.updatePosition(
                updated,
                cascade.node.uuid,
                cascade.ui.position.left,
                cascadeTop
            );
        }

        timeEnd('reflow');

        updated = dispatch(reflow(updated));
        if (current == null) {
            dispatch(updateNodes(updated));
        }
        return updated;
    }
    return nodes;
};

export const onUpdateLocalizations = (language: string, changes: LocalizationUpdates) => (
    dispatch: DispatchWithState,
    getState: GetState
): FlowDefinition => {
    const {
        flowContext: { definition }
    } = getState();
    const updated = mutators.updateLocalization(definition, language, changes);
    dispatch(updateDefinition(updated));
    return updated;
};

export const updateDimensions = (node: FlowNode, dimensions: Dimensions) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const {
        flowContext: { nodes }
    } = getState();
    const updated = mutators.updateDimensions(nodes, node.uuid, dimensions);
    dispatch(updateNodes(updated));
    markReflow(dispatch);
    return updated;
};

/**
 * @param renderNode Adds the given node, uniquifying its uuid
 */
export const addNode = (renderNode: RenderNode) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNode => {
    timeStart('addNode');
    const {
        flowContext: { nodes }
    } = getState();
    renderNode.node = mutators.uniquifyNode(renderNode.node);
    dispatch(updateNodes(mutators.mergeNode(nodes, renderNode)));
    timeEnd('addNode');
    return renderNode;
};

export const updateExitDestination = (nodeUUID: string, exitUUID: string, destination: string) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const {
        flowContext: { nodes }
    } = getState();
    const updated = mutators.updateConnection(nodes, nodeUUID, exitUUID, destination);
    dispatch(updateNodes(updated));
    return updated;
};

export const disconnectExit = (nodeUUID: string, exitUUID: string) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => dispatch(updateExitDestination(nodeUUID, exitUUID, null));

export const updateConnection = (source: string, target: string) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const [nodeUUID, exitUUID] = source.split(':');
    return dispatch(updateExitDestination(nodeUUID, exitUUID, target));
};

export const ensureStartNode = () => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNode => {
    const {
        flowContext: { nodes }
    } = getState();

    if (Object.keys(nodes).length === 0) {
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

        return dispatch(
            addNode({
                node,
                ui: { position: { left: 120, top: 120 } },
                inboundConnections: {}
            })
        );
    }
};

export const removeNode = (node: FlowNode) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    // Remove result name if node has one
    const {
        flowContext: {
            nodes,
            results: { resultMap }
        }
    } = getState();
    if (resultMap.hasOwnProperty(node.uuid)) {
        const toKeep = mutate(resultMap, { $unset: [node.uuid] });
        dispatch(updateResultMap(toKeep));
    }

    const updated = mutators.removeNode(nodes, node.uuid);
    dispatch(updateNodes(updated));
    return updated;
};

export const removeAction = (nodeUUID: string, action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const {
        flowContext: {
            nodes,
            results: { resultMap }
        }
    } = getState();
    const renderNode = nodes[nodeUUID];

    // Remove result from store
    if (action.type === Types.set_run_result) {
        const toKeep = mutate(resultMap, { $unset: [action.uuid] });
        dispatch(updateResultMap(toKeep));

        // Node invalidation => ...
    }

    /*

    actions[] (
        set_result_name,
        send_msg,
        send_broadcast,
        set_contact_property,
        set_contact_field,
        split_by_expression,
        call_webhook
    )

    router {} result_name

    */

    // If it's our last action, then nuke the node
    if (renderNode.node.actions.length === 1) {
        return dispatch(removeNode(renderNode.node));
    } else {
        // Otherwise, just remove that action
        const updated = mutators.removeAction(nodes, nodeUUID, action.uuid);
        dispatch(updateNodes(updated));
        return updated;
    }
};

export const moveActionUp = (nodeUUID: string, action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const {
        flowContext: { nodes }
    } = getState();
    const updated = mutators.moveActionUp(nodes, nodeUUID, action.uuid);
    dispatch(updateNodes(updated));
    return updated;
};

/**
 * Splices a router into a list of actions creating up to three nodes where there
 * was once one node.
 * @param nodeUUID the node to replace
 * @param node the new node being added (shares the previous node uuid)
 * @param type the type of the new router
 * @param previousAction the previous action that is being replaced with our router
 * @returns a list of RenderNodes that were created
 */
export const spliceInRouter = (
    newRouterNode: RenderNode,
    previousAction: { nodeUUID: string; actionUUID: string }
) => (dispatch: DispatchWithState, getState: GetState): RenderNodeMap => {
    const {
        flowContext: { nodes }
    } = getState();
    const previousNode = nodes[previousAction.nodeUUID];

    // remove our old node, we'll make new ones
    let updatedNodes = nodes;
    updatedNodes = mutators.removeNode(updatedNodes, previousNode.node.uuid, false);

    newRouterNode.node = mutators.uniquifyNode(newRouterNode.node);

    const actionIdx = getActionIndex(previousNode.node, previousAction.actionUUID);

    // we need to splice a wait node where our previousAction was
    const topActions: Action[] =
        actionIdx > 0 ? [...previousNode.node.actions.slice(0, actionIdx)] : [];
    const bottomActions: Action[] = previousNode.node.actions.slice(
        actionIdx + 1,
        previousNode.node.actions.length
    );

    // tslint:disable-next-line:prefer-const
    let { left, top } = previousNode.ui.position;

    let topNode: RenderNode;
    let bottomNode: RenderNode;

    // add our top node if we have one
    if (topActions.length > 0) {
        topNode = {
            node: {
                uuid: createUUID(),
                actions: topActions,
                exits: [
                    {
                        uuid: createUUID(),
                        destination_node_uuid: null
                    }
                ]
            },
            ui: { position: { left, top } },
            inboundConnections: { ...previousNode.inboundConnections }
        };

        updatedNodes = mutators.mergeNode(updatedNodes, topNode);
        top += NODE_SPACING;

        // update our routerNode for the presence of a top node
        newRouterNode.inboundConnections = { [topNode.node.exits[0].uuid]: topNode.node.uuid };
        newRouterNode.ui.position.top += NODE_SPACING;
    } else {
        newRouterNode.inboundConnections = { ...previousNode.inboundConnections };
    }

    // now add our routerNode
    updatedNodes = mutators.mergeNode(updatedNodes, newRouterNode);

    // add our bottom
    if (bottomActions.length > 0) {
        bottomNode = {
            node: {
                uuid: createUUID(),
                actions: bottomActions,
                exits: [
                    {
                        uuid: createUUID(),
                        destination_node_uuid: previousNode.node.exits[0].destination_node_uuid
                    }
                ]
            },
            ui: {
                position: { left, top }
            },
            inboundConnections: { [newRouterNode.node.exits[0].uuid]: newRouterNode.node.uuid }
        };
        updatedNodes = mutators.mergeNode(updatedNodes, bottomNode);
    } else {
        // if we don't have a bottom, route our routerNode to the previous destination
        updatedNodes = mutators.updateConnection(
            updatedNodes,
            newRouterNode.node.uuid,
            newRouterNode.node.exits[0].uuid,
            previousNode.node.exits[0].destination_node_uuid
        );
    }

    dispatch(updateNodes(updatedNodes));
    return updatedNodes;
};

export const handleTypeConfigChange = (typeConfig: Type) => (dispatch: DispatchWithState) => {
    // TODO: Generate suggested result name if user is changing to a `wait_for_response` router.
    dispatch(updateTypeConfig(typeConfig));
};

export const resetNodeEditingState = () => (dispatch: DispatchWithState, getState: GetState) => {
    dispatch(mergeEditorState({ ghostNode: null }));
    dispatch(updateNodeEditorSettings(null));
};

export const onUpdateAction = (
    action: AnyAction,
    onUpdated?: (dispatch: DispatchWithState, getState: GetState) => void
) => (dispatch: DispatchWithState, getState: GetState) => {
    timeStart('onUpdateAction');

    const {
        nodeEditor: { userAddingAction, settings },
        flowContext: {
            nodes,
            results: { resultMap },
            contactFields
        }
    } = getState();

    if (settings == null || settings.originalNode == null) {
        throw new Error('Need originalNode in settings to update an action');
    }
    const { originalNode, originalAction } = settings;

    let updatedNodes = nodes;
    const creatingNewNode = originalNode !== null && originalNode.ghost;

    if (creatingNewNode) {
        const newNode: RenderNode = {
            node: {
                uuid: createUUID(),
                actions: [action],
                exits: [{ uuid: createUUID(), destination_node_uuid: null, name: null }]
            },
            ui: { position: originalNode.ui.position },
            inboundConnections: originalNode.inboundConnections
        };
        updatedNodes = mutators.mergeNode(nodes, newNode);
    } else if (userAddingAction) {
        updatedNodes = mutators.addAction(nodes, originalNode.node.uuid, action);
    } else if (originalNode.node.hasOwnProperty('router')) {
        updatedNodes = mutators.spliceInAction(nodes, originalNode.node.uuid, action);
    } else {
        updatedNodes = mutators.updateAction(nodes, originalNode.node.uuid, action, originalAction);
    }

    dispatch(updateNodes(updatedNodes));
    dispatch(updateUserAddingAction(false));

    // Add result to store.
    if (action.type === Types.set_run_result) {
        const { name: resultNameOnAction } = action as SetRunResult;
        const newResultMap = {
            ...resultMap,
            // We store results created by a `set_run_result` action
            // with a reference to the action's uuid. A single node may
            // contain one or more `set_run_result` actions, and they
            // may be identical.
            [action.uuid]: `@run.results.${snakify(resultNameOnAction)}`
        };
        dispatch(updateResultMap(newResultMap));
    }

    // Add contact field to our store.
    if (action.type === Types.set_contact_field) {
        const { field } = action as SetContactField;
        dispatch(updateContactFields({ ...contactFields, [field.key]: field.name }));
    }

    timeEnd('onUpdateAction');

    if (onUpdated) {
        onUpdated(dispatch, getState);
    }
    return updatedNodes;
};

/**
 * Opens the NodeEditor in the state for adding to a provided node
 * @param node the node to add to
 */
export const onAddToNode = (node: FlowNode) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowContext: { definition, nodes },
        editorState: { language }
    } = getState();

    // TODO: remove the need for this once we all have formHelpers
    const newAction: SendMsg = {
        uuid: createUUID(),
        type: Types.send_msg,
        text: ''
    };

    dispatch(
        updateNodeEditorSettings({
            originalNode: getNode(nodes, node.uuid),
            originalAction: newAction,
            showAdvanced: false
        })
    );

    dispatch(updateUserAddingAction(true));
    dispatch(handleTypeConfigChange(getTypeConfig(Types.send_msg)));
    dispatch(mergeEditorState({ nodeDragging: false }));
};

export const onResetDragSelection = () => (dispatch: DispatchWithState, getState: GetState) => {
    const {
        editorState: { dragSelection }
    } = getState();

    /* istanbul ignore else */
    if (dragSelection && dragSelection.selected) {
        dispatch(mergeEditorState({ dragSelection: { selected: null } }));
    }
};

export const onNodeMoved = (nodeUUID: string, position: FlowPosition) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const {
        flowContext: { nodes },
        editorState: { dragSelection }
    } = getState();

    if (dragSelection && dragSelection.selected) {
        dispatch(mergeEditorState({ dragSelection: { selected: null } }));
    }

    const updated = mutators.updatePosition(nodes, nodeUUID, position.left, position.top);
    dispatch(updateNodes(updated));
    markReflow(dispatch);
    return updated;
};

/**
 * Called when a connection begins to be dragged from an endpoint both
 * when a new connection is desired or when an existing one is being moved.
 * @param event
 */
export const onConnectionDrag = (event: ConnectionEvent) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowContext: {
            nodes,
            results: { suggestedNameCount }
        }
    } = getState();

    // We finished dragging a ghost node, create the spec for our new ghost component
    const [fromNodeUUID, fromExitUUID] = event.sourceId.split(':');

    const fromNode = nodes[fromNodeUUID];

    // set our ghost node
    const ghostNode = getGhostNode(fromNode, fromExitUUID, suggestedNameCount);
    ghostNode.inboundConnections = { [fromExitUUID]: fromNodeUUID };
    dispatch(mergeEditorState({ ghostNode }));
};

export const updateSticky = (uuid: string, sticky: StickyNote) => (
    dispatch: DispatchWithState,
    getState: GetState
): void => {
    const {
        flowContext: { definition }
    } = getState();
    const updated = mutators.updateStickyNote(definition, uuid, sticky);
    dispatch(updateDefinition(updated));
};

export const onUpdateRouter = (renderNode: RenderNode) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const {
        flowContext: {
            nodes,
            results: { resultMap },
            assets
        },
        nodeEditor: {
            settings: { originalNode, originalAction }
        }
    } = getState();

    const previousNode = nodes[originalNode.node.uuid];
    let updated = nodes;
    if (previousNode) {
        const previousPosition = previousNode.ui.position;
        renderNode.ui.position = previousPosition;
    }

    if (originalNode.ghost) {
        renderNode.inboundConnections = originalNode.inboundConnections;
        const { left, top } = originalNode.ui.position;
        renderNode.ui.position = { left, top };
        renderNode.node = mutators.uniquifyNode(renderNode.node);
    }

    // update our result names map
    const resultsToUpdate = {
        ...resultMap
    };
    if (renderNode.node.router && renderNode.node.router.result_name) {
        resultsToUpdate[renderNode.node.uuid] = generateResultQuery(
            renderNode.node.router.result_name
        );

        const updatedAssets = mutators.addFlowResult(assets, renderNode.node.router.result_name);
        dispatch(updateAssets(updatedAssets));
    } else {
        delete resultsToUpdate[renderNode.node.uuid];
    }
    dispatch(updateResultMap(resultsToUpdate));

    if (originalNode && originalAction && previousNode) {
        const actionToSplice = previousNode.node.actions.find(
            (action: Action) => action.uuid === originalAction.uuid
        );

        if (actionToSplice) {
            // if we are splicing using the original top
            renderNode.ui.position.top = previousNode.ui.position.top;

            return dispatch(
                spliceInRouter(renderNode, {
                    nodeUUID: previousNode.node.uuid,
                    actionUUID: actionToSplice.uuid
                })
            );
        }

        // don't recognize that action, let's add a new router node
        const router = renderNode.node.router as SwitchRouter;
        const exitToUpdate = renderNode.node.exits.find(
            (exit: Exit) => exit.uuid === router.default_exit_uuid
        );

        exitToUpdate.destination_node_uuid = previousNode.node.exits[0].destination_node_uuid;

        renderNode.inboundConnections = {
            [previousNode.node.exits[0].uuid]: previousNode.node.uuid
        };
        renderNode.node = mutators.uniquifyNode(renderNode.node);
        renderNode.ui.position.top = previousNode.ui.position.bottom;
        updated = mutators.mergeNode(updated, renderNode);
    } else {
        updated = mutators.mergeNode(updated, renderNode);
    }

    dispatch(updateNodes(updated));

    return updated;
};

/**
 * Debounce for triggered reflows
 */
const markReflow = (dispatch: DispatchWithState) => {
    if (debounceReflow) {
        window.clearTimeout(debounceReflow);
    }

    debounceReflow = window.setTimeout(
        /* istanbul ignore next */ () => {
            dispatch(reflow());
        },
        QUIET_REFLOW
    );
};

export const onOpenNodeEditor = (settings: NodeEditorSettings) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowContext: {
            definition: { localization },
            assets
        },
        editorState: { language, translating }
    } = getState();

    const { originalNode: renderNode } = settings;
    let { originalAction: action } = settings;

    const node = renderNode.node;

    // stuff our localization objects in our settings
    settings.localizations = [];
    if (translating) {
        let actionToTranslate = action;

        // TODO: this is a hack, would be nice to find how to make that area respond differently
        // if they clicked just below the actions, treat it as the last action
        if (!actionToTranslate && node.actions.length > 0) {
            actionToTranslate = node.actions[node.actions.length - 1];
            if (
                actionToTranslate.type !== Types.send_msg &&
                actionToTranslate.type !== Types.send_broadcast
            ) {
                return;
            }
        }

        const translations = localization[language.id];
        settings.localizations.push(
            ...getLocalizations(node, actionToTranslate, language, translations)
        );
    }

    // Account for hybrids or clicking on the empty exit table
    if (!action && node.actions.length > 0) {
        action = node.actions[node.actions.length - 1];
    }

    let resultName = '';

    if (node.router) {
        /* istanbul ignore else */
        if (node.router.result_name) {
            ({
                router: { result_name: resultName }
            } = node);
        }
    }

    const typeConfig = determineTypeConfig(settings);
    dispatch(handleTypeConfigChange(typeConfig));
    dispatch(updateNodeEditorSettings(settings));
    dispatch(mergeEditorState({ nodeDragging: false }));
};
