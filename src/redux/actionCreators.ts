import * as isEqual from 'fast-deep-equal';
import update from 'immutability-helper';
import { Dispatch } from 'react-redux';
import { v4 as generateUUID } from 'uuid';
import { Components } from '.';
import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { hasCases } from '../component/NodeEditor/NodeEditor';
import { getTypeConfig, Type } from '../config';
import { FlowDetails, getFlow, getFlows } from '../external';
import {
    Action,
    AnyAction,
    ChangeGroups,
    Dimensions,
    Exit,
    FlowDefinition,
    Languages,
    Node,
    Position,
    SendMsg,
    SetContactField,
    SetRunResult,
    SwitchRouter,
    UINode,
    WaitType
} from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import { snakify } from '../utils';
import {
    removePendingConnection,
    updateActionToEdit,
    updateComponents,
    updateContactFields,
    updateCreateNodePosition,
    updateDefinition,
    updateDragGroup,
    updateFetchingFlow,
    updateFlows,
    updateFreshestNode,
    updateGhostNode,
    updateGroups,
    updateLanguage,
    updateLocalizations,
    updateNodeDragging,
    updateNodeEditorOpen,
    updateNodes,
    updateNodeToEdit,
    updateOperand,
    updatePendingConnection,
    updatePendingConnections,
    updateResultName,
    updateResultNames,
    updateShowResultName,
    updateTranslating,
    updateTypeConfig,
    updateUserAddingAction,
    updateUserClickingAction,
    updateUserClickingNode
} from './actions';
import {
    Bounds,
    collides,
    determineConfigType,
    getDetails,
    getExistingFields,
    getExistingGroups,
    getExistingResultNames,
    getExit,
    getLocalizations,
    getNode,
    getNodesBelow,
    getNodeUI,
    getPendingConnection,
    getTranslations,
    getUIs,
    nodeSort,
    pureSort,
    getUpdatedNodes,
    isActionsNode,
    getSuggestedResultName
} from './helpers';
import {
    CompletionOption,
    ComponentDetails,
    ContactFieldResult,
    ReduxState,
    SearchResult
} from './initialState';
import { prepAddNode, prepSetNode, uniquifyNode } from './updateSpec';
import pendingConnection from './reducers/pendingConnection';

export type DispatchWithState = Dispatch<ReduxState>;

export type GetState = () => ReduxState;

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
const NODE_SPACING = 60;

const RESERVED_FIELDS: ContactFieldResult[] = [
    { id: 'name', name: 'Name', type: 'set_contact_field' }
    // { id: "language", name: "Language", type: "update_contact" }
];

const DEFAULT_OPERAND = '@input';

// let uiTimeout: number;
let reflowTimeout: number;

export const setTranslating = (translating: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (translating !== getState().translating) {
        dispatch(updateTranslating(translating));
    }
};

export const setLanguage = (language: Language) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(language, getState().language)) {
        dispatch(updateLanguage(language));
    }
};

export const setFreshestNode = (freshestNode: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(freshestNode, getState().freshestNode)) {
        dispatch(updateFreshestNode(freshestNode));
    }
};

export const setNodeDragging = (nodeDragging: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (nodeDragging !== getState().nodeDragging) {
        dispatch(updateNodeDragging(nodeDragging));
    }
};

export const setNodeEditorOpen = (nodeEditorOpen: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (nodeEditorOpen !== getState().nodeEditorOpen) {
        dispatch(updateNodeEditorOpen(nodeEditorOpen));
    }
};

export const applyUpdateSpec = (updateSpec: any = {}) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (updateSpec != null && Object.keys(updateSpec).length > 0) {
        console.log('updateSpec', updateSpec);
        const updatedDefinition = update(getState().definition, updateSpec);
        dispatch(updateDefinition(updatedDefinition));
    }
};

export const setDefinition = (definition: FlowDefinition) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(definition, getState().definition)) {
        dispatch(updateDefinition(definition));
    }
};

export const setDragGroup = (dragGroup: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (dragGroup !== getState().dragGroup) {
        dispatch(updateDragGroup(dragGroup));
    }
};

export const setShowResultName = (showResultName: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (showResultName !== getState().showResultName) {
        dispatch(updateShowResultName(showResultName));
    }
};

export const setUserAddingAction = (userAddingAction: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (userAddingAction !== getState().userAddingAction) {
        dispatch(updateUserAddingAction(userAddingAction));
    }
};

export const setNodeToEdit = (nodeToEdit: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(nodeToEdit, getState().nodeToEdit)) {
        dispatch(updateNodeToEdit(nodeToEdit));
    }
};

export const setActionToEdit = (actionToEdit: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(actionToEdit, getState().actionToEdit)) {
        dispatch(updateActionToEdit(actionToEdit));
    }
};

export const setLocalizations = (localizations: LocalizedObject[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(localizations, getState().localizations)) {
        dispatch(updateLocalizations(localizations));
    }
};

export const setTypeConfig = (typeConfig: Type) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(typeConfig, getState().typeConfig)) {
        dispatch(updateTypeConfig(typeConfig));
    }
};

export const setContactFields = (contactFields: ContactFieldResult[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(contactFields, getState().contactFields)) {
        dispatch(updateContactFields(contactFields));
    }
};

export const setGroups = (groups: SearchResult[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(groups, getState().groups)) {
        dispatch(updateGroups(groups));
    }
};

export const setComponents = (components: Components) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(components, getState().components)) {
        dispatch(updateComponents(components));
    }
};

export const setResultNames = (resultNames: CompletionOption[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(resultNames, getState().resultNames)) {
        dispatch(updateResultNames(resultNames));
    }
};

export const fetchFlow = (endpoint: string, uuid: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(updateFetchingFlow(true));
    return getFlow(endpoint, uuid, false)
        .then(({ definition }: FlowDetails) => {
            dispatch(setDefinition(definition));
            dispatch(updateFetchingFlow(false));
        })
        .catch((error: any) => console.log(`fetchFlow error: ${error}`));
};

export const fetchFlows = (endpoint: string) => (dispatch: DispatchWithState) =>
    getFlows(endpoint)
        .then((flows: FlowDetails[]) =>
            dispatch(
                updateFlows(
                    flows.map(({ uuid, name }) => ({
                        uuid,
                        name
                    }))
                )
            )
        )
        .catch((error: any) => console.log(`fetchFlowList error: ${error}`));

export const refresh = (definition: FlowDefinition) => (dispatch: DispatchWithState) => {
    const components: { [uuid: string]: ComponentDetails } = {};
    const exitsWithDestinations: Exit[] = [];
    const fields: { [id: string]: ContactFieldResult } = {};
    const groups: { [id: string]: SearchResult } = {};
    const resultNames: { [name: string]: string } = {};

    if (!definition) {
        dispatch(updateComponents(components));
        return;
    }

    // determine our indexes
    definition.nodes.forEach((node, nodeIdx) => {
        components[node.uuid] = {
            nodeUUID: node.uuid,
            nodeIdx,
            actionIdx: -1,
            exitIdx: -1,
            pointers: []
        };

        // Set our type
        const ui = definition._ui.nodes[node.uuid];
        if (ui && ui.type) {
            components[node.uuid].type = ui.type;
        }

        // Map out our action idexes
        if (node.actions && node.actions.length) {
            node.actions.forEach((action, actionIdx) => {
                components[action.uuid] = {
                    nodeUUID: node.uuid,
                    nodeIdx,
                    actionUUID: action.uuid,
                    actionIdx,
                    type: action.type
                };

                if (action.type === 'save_flow_result') {
                    resultNames[
                        snakify((action as SetRunResult).result_name)
                    ] = (action as SetRunResult).result_name;
                } else if (action.type === 'save_contact_field') {
                    if (
                        !RESERVED_FIELDS.some(
                            fieldName => fieldName.name === (action as SetContactField).field_name
                        )
                    ) {
                        if (!((action as SetContactField).field_uuid in fields)) {
                            fields[(action as SetContactField).field_uuid] = {
                                id: (action as SetContactField).field_uuid,
                                name: (action as SetContactField).field_name,
                                type: 'set_contact_field'
                            };
                        }
                    }
                } else if (action.type === 'add_to_group' || action.type === 'remove_from_group') {
                    const groupProps = action as ChangeGroups;
                    for (const group of groupProps.groups) {
                        if (!(group.uuid in groups)) {
                            groups[group.uuid] = {
                                id: group.uuid,
                                name: group.name,
                                type: 'group'
                            };
                        }
                    }
                }
            });
        }

        if (node.router) {
            components[node.uuid].isRouter = true;
            if (node.router.result_name) {
                resultNames[snakify(node.router.result_name)] = node.router.result_name;
            }
        }

        // Same for exits
        if (node.exits && node.exits.length) {
            node.exits.forEach((exit, exitIdx) => {
                components[exit.uuid] = {
                    nodeIdx,
                    nodeUUID: node.uuid,
                    exitIdx,
                    exitUUID: exit.uuid
                };

                if (exit.destination_node_uuid) {
                    exitsWithDestinations.push(exit);
                }
            });
        }
    });

    // Add in our reverse lookups
    exitsWithDestinations.forEach(exit => {
        const details = components[exit.destination_node_uuid];
        if (details) {
            details.pointers.push(exit.uuid);
        }
    });

    const existingFields = getExistingFields(RESERVED_FIELDS, fields);
    const existingGroups = getExistingGroups(groups);
    const existingResultNames = getExistingResultNames(resultNames);

    dispatch(setContactFields(existingFields));
    dispatch(setGroups(existingGroups));
    dispatch(setComponents(components));
    dispatch(setResultNames(existingResultNames));
};

// export const updateUI = (definition: FlowDefinition) => (dispatch: DispatchWithState) => {
//     if (QUIET_UI > 0) {
//         if (uiTimeout) {
//             window.clearTimeout(uiTimeout);
//         }
//         uiTimeout = window.setTimeout(() => dispatch(setDefinition(definition)));
//     } else {
//         dispatch(setDefinition(definition));
//     }
// };

export const sortNodes = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { definition: currentDef } = getState();

    const newDef = {
        ...currentDef,
        nodes: pureSort(currentDef.nodes, nodeSort(currentDef))
    };

    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef))
    dispatch(setDefinition(newDef));
};

export const reflow = () => (dispatch: DispatchWithState, getState: GetState) => {
    console.time('reflow');
    dispatch(sortNodes());

    const { definition: currentDef } = getState();
    let newDef = { ...currentDef };

    const uis = getUIs(newDef.nodes, newDef._ui);
    const updatedNodes = getUpdatedNodes(uis, NODE_SPACING);

    window.setTimeout(() => {
        if (updatedNodes.length > 0) {
            console.log('::REFLOWED::', updatedNodes);
            updatedNodes.forEach(
                node =>
                    (newDef = update(newDef, {
                        _ui: {
                            nodes: { [node.uuid]: { position: { $merge: { y: node.bounds.top } } } }
                        }
                    }))
            );
            // dispatch(updateUI(newDef));
            dispatch(setDefinition(newDef));
            console.timeEnd('reflow');
        }
    }, 100);
};

export const markReflow = () => (dispatch: DispatchWithState) => {
    if (QUIET_UI > 0) {
        if (reflowTimeout) {
            window.clearTimeout(reflowTimeout);
        }
        reflowTimeout = window.setTimeout(() => dispatch(reflow()), QUIET_UI);
    } else {
        dispatch(reflow());
    }
};

export const onUpdateLocalizations = (language: string, changes: LocalizationUpdates) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    let newDef = { ...getState().definition };

    // Initialize localization map if not present on definition
    if (!newDef.localization) {
        newDef = update(newDef, {
            localization: {
                $set: {}
            }
        });
    }

    // Add language to localization map if not present
    if (!newDef.localization[language]) {
        newDef = update(newDef, {
            localization: {
                [language]: {
                    $set: {}
                }
            }
        });
    }

    // Apply changes
    changes.forEach(({ translations, uuid }) => {
        if (translations) {
            newDef = update(newDef, {
                localization: { [language]: { [uuid]: { $set: translations } } }
            });
        } else {
            newDef = update(newDef, {
                localization: { [language]: { $unset: [uuid] } }
            });
        }
    });

    // Update definition
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
};

export const updateNodeUI = (uuid: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition: currentDef } = getState();
    // prettier-ignore
    const newDef = update(
        currentDef,
        { _ui: { nodes: { [uuid]: changes } } }
    );
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    dispatch(markReflow());
};

export const updateDimensions = (node: Node, dimensions: Dimensions) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition: currentDef } = getState();
    const ui = getNodeUI(node.uuid, currentDef);
    if (
        !ui.dimensions ||
        ui.dimensions.height !== dimensions.height ||
        ui.dimensions.width !== dimensions.width
    ) {
        dispatch(updateNodeUI(node.uuid, { $merge: { dimensions } }));
    }
};

export const addNode = (node: Node, ui: UINode, pendingConnection?: DragPoint) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    console.time('addNode');
    const { definition: currentDef } = getState();
    let newDef = { ...currentDef };
    let newNode = { ...node };

    // Give our node a unique uuid
    newNode = update(newNode, { $merge: { uuid: generateUUID() } });

    // Add our node
    newDef = update(newDef, {
        nodes: {
            $push: [newNode]
        },
        _ui: {
            nodes: { $merge: { [newNode.uuid]: ui } }
        }
    });

    // Save our pending connection if we have one
    if (pendingConnection) {
        // prettier-ignore
        dispatch(
            updatePendingConnections(
                newNode.uuid,
                pendingConnection
            )
        );
    }

    dispatch(setFreshestNode(newNode));
    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    console.timeEnd('addNode');
};

/**
 * Updates an exit in our tree
 * @param uuid the exit to modify
 * @param changes immutability spec to modify at the given exit
 */
export const updateExit = (exitUUID: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    // prettier-ignore
    const {
        definition: currentDef,
        components: currentComponents
    } = getState();

    const details = getDetails(exitUUID, currentComponents);

    // prettier-ignore
    const newDef = update(
        currentDef,
        {
            nodes: {
                [details.nodeIdx]: {
                    exits: { [details.exitIdx]: changes }
                }
            }
        }
    );

    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
};

export const updateExitDestination = (exitUUID: string, destination: string) => (
    dispatch: DispatchWithState
) =>
    dispatch(
        updateExit(exitUUID, {
            $merge: { destination_node_uuid: destination }
        })
    );

export const disconnectExit = (exitUUID: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => dispatch(updateExitDestination(exitUUID, null));

export const updateConnection = (source: string, target: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { components: currentComponents, definition: currentDefinition } = getState();
    if (getDetails(source, currentComponents).nodeUUID !== target) {
        dispatch(updateExitDestination(source, target));
    } else {
        console.error('Attempt to route to self, ignored...');
    }
};

export const resolvePendingConnection = (node: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { pendingConnections: currentPendingConnections } = getState();
    // Only resolve connection if we have one
    const pendingConnection = getPendingConnection(node.uuid, currentPendingConnections);
    if (pendingConnection) {
        // Remove our pending connection
        dispatch(removePendingConnection(node.uuid));
        dispatch(updateExitDestination(pendingConnection.exitUUID, node.uuid));
    }
};

export const updateNode = (uuid: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition: currentDef, components: currentComponents } = getState();
    const { nodeIdx } = getDetails(uuid, currentComponents);
    const newDef = update(
        { ...currentDef },
        {
            nodes: {
                [nodeIdx]: changes
            }
        }
    );
    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    dispatch(markReflow());
};

export const ensureStartNode = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { definition: currentDefinition } = getState();

    if (currentDefinition.nodes.length === 0) {
        const initialAction: SendMsg = {
            uuid: generateUUID(),
            type: 'send_msg',
            text: 'Hi there, this the first message in your flow!'
        };

        const node: Node = {
            uuid: generateUUID(),
            actions: [initialAction],
            exits: [
                {
                    uuid: generateUUID()
                }
            ]
        };

        dispatch(addNode(node, { position: { x: 125, y: 125 } }));
    }
};

export const removeNode = (nodeToRemove: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition: currentDefinition, components: currentComponents } = getState();
    const details = getDetails(nodeToRemove.uuid, currentComponents);
    const node = currentDefinition.nodes[details.nodeIdx];

    // If we have a single exit, map all our pointers to that destination
    let destination = null;
    if (node.exits.length === 1) {
        ({ destination_node_uuid: destination } = node.exits[0]);
    }

    // Re-map all our pointers to our new destination, null some most cases
    for (const pointer of details.pointers) {
        // Don't allow it to point to ourselves
        const { nodeUUID } = getDetails(pointer, currentComponents);

        if (nodeUUID === destination) {
            destination = null;
        }

        dispatch(updateExitDestination(pointer, destination));
    }

    // Remove the node
    // Remove it from the UI map as well
    // Calling getState() here because 'updateExitDestination' above
    // will have updated the definition.
    const newDef = update(getState().definition, {
        nodes: { $splice: [[details.nodeIdx, 1]] },
        _ui: { nodes: { $unset: [nodeToRemove.uuid] } }
    });

    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    dispatch(ensureStartNode());
};

export const removeAction = (action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition: currentDefinition, components: currentComponents } = getState();
    const { nodeUUID } = getDetails(action.uuid, currentComponents);
    // prettier-ignore
    const node = getNode(
        nodeUUID,
        currentComponents,
        currentDefinition
    );

    // If it's our last action, then nuke the node
    if (node.actions.length === 1) {
        dispatch(removeNode(node));
    } else {
        // Otherwise, just splice out that action
        const { actionIdx } = getDetails(action.uuid, currentComponents);
        dispatch(
            updateNode(node.uuid, {
                actions: { $splice: [[actionIdx, 1]] }
            })
        );
    }
};

export const moveActionUp = (action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition: currentDefinition, components: currentComponents } = getState();
    const details = getDetails(action.uuid, currentComponents);
    // prettier-ignore
    const node = getNode(
        details.nodeUUID,
        currentComponents,
        currentDefinition
    );

    if (details.actionIdx > 0) {
        const actionAbove = node.actions[details.actionIdx - 1];
        dispatch(
            updateNode(node.uuid, {
                actions: { $splice: [[details.actionIdx - 1, 2, action, actionAbove]] }
            })
        );
    }
};

/**
 * Updates an action in our tree
 * @param uuid the action to modify
 * @param changes immutability spec to modify at the given action
 */
export const updateAction = (
    action: AnyAction,
    previousNodeUUID: string,
    draggedFrom: DragPoint = null,
    newPosition: Position = null
) => (dispatch: DispatchWithState, getState: GetState) => {
    console.time('updateAction');
    const {
        userAddingAction,
        nodeToEdit,
        components: currentComponents,
        definition: currentDefinition
    } = getState();
    let newDef = { ...currentDefinition };

    if (draggedFrom) {
        const newNodeUUID = generateUUID();

        dispatch(
            addNode(
                {
                    uuid: newNodeUUID,
                    actions: [action],
                    exits: [{ uuid: generateUUID(), destination_node_uuid: null, name: null }]
                },
                { position: newPosition },
                {
                    exitUUID: draggedFrom.exitUUID,
                    nodeUUID: draggedFrom.nodeUUID
                }
            )
        );

        // Calling 'getState' because 'addNode' above will
        // have updated the definition.
        ({ definition: newDef } = getState());
    } else if (userAddingAction) {
        const nodeDeets = getDetails(nodeToEdit.uuid, currentComponents);
        newDef = {
            ...update(currentDefinition, {
                nodes: {
                    [nodeDeets.nodeIdx]: {
                        actions: {
                            $push: [action]
                        }
                    }
                }
            })
        };
    } else {
        // Update the action, flow definition
        const actionDetails = getDetails(action.uuid, currentComponents);
        let node = null;
        let nodeIdx = -1;
        let actionIdx = -1;
        let nodeUUID;

        if (actionDetails) {
            node = newDef.nodes[actionDetails.nodeIdx];
            nodeIdx = actionDetails.nodeIdx;
            actionIdx = actionDetails.actionIdx;
            nodeUUID = actionDetails.nodeUUID;
        } else if (previousNodeUUID) {
            // HACK: look it up by previous node;
            // this should fall away with nodemodal refactor based on nodes.
            const nodeDetails = getDetails(previousNodeUUID, currentComponents);
            node = newDef.nodes[nodeDetails.nodeIdx];
            nodeIdx = nodeDetails.nodeIdx;
            actionIdx = 0;
            nodeUUID = previousNodeUUID;
        }

        if (node) {
            if (node.actions && node.actions.length > 0) {
                newDef = update(newDef, {
                    nodes: {
                        [nodeIdx]: {
                            actions: { [actionIdx]: { $set: action } }
                        }
                    }
                });
            } else if (actionIdx === 0) {
                newDef = update(newDef, {
                    nodes: {
                        [nodeIdx]: {
                            actions: { $set: [action] }
                        }
                    }
                });
            }

            let previousDestination = null;
            let previousUUID = generateUUID();
            if (node.exits.length === 1) {
                previousDestination = node.exits[0].destination_node_uuid;
                previousUUID = node.exits[0].uuid;
            }

            newDef = update(newDef, {
                nodes: {
                    [nodeIdx]: {
                        $unset: ['router', 'wait'],
                        exits: {
                            $set: [
                                {
                                    name: null,
                                    uuid: previousUUID,
                                    destination_node_uuid: previousDestination
                                }
                            ]
                        }
                    }
                }
            });

            dispatch(updateNodeUI(nodeUUID, { $unset: ['type'] }));
            dispatch(setFreshestNode(newDef.nodes[nodeIdx]));
        } else {
            // otherwise we might be adding a new action
            console.log("Couldn't find node, not updating");
            return;
        }
    }

    dispatch(setUserAddingAction(false));
    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    dispatch(markReflow());
    console.timeEnd('updateAction');
};

/**
 * Splices a router into a list of actions creating up to three nodes where there
 * was once one node.
 * @param node the new node being added (shares the previous node uuid)
 * @param type the type of the new router
 * @param previousAction the previous action that is being replaced with our router
 */
export const spliceInRouter = (node: Node, type: string, previousAction: Action) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition, components } = getState();
    const previousNode = getNode(node.uuid, components, definition);
    const details = getDetails(previousAction.uuid, components);

    // We need to splice a wait node where our previousAction was
    const topActions: Action[] =
        details.actionIdx > 0 ? [...previousNode.actions.slice(0, details.actionIdx)] : [];
    const bottomActions: Action[] = previousNode.actions.slice(
        details.actionIdx + 1,
        previousNode.actions.length
    );

    const previousUI = getNodeUI(node.uuid, definition);
    const { x } = previousUI.position;
    let { y } = previousUI.position;

    // Add our new router node, do this fist so our top can point to it
    const routerY = topActions.length ? y + NODE_SPACING : y;

    dispatch(
        addNode(node, {
            position: { x, y: routerY },
            type
        })
    );

    // Add our top node if we have one
    if (topActions.length > 0) {
        const { freshestNode } = getState();

        const topActionNode: Node = {
            uuid: generateUUID(),
            actions: topActions,
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: freshestNode.uuid
                }
            ]
        };

        dispatch(addNode(topActionNode, { position: { x, y } }));
        y += NODE_SPACING;
    }

    // Add our bottom
    if (bottomActions.length > 0) {
        const bottomActionNode: Node = {
            uuid: generateUUID(),
            actions: bottomActions,
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: previousNode.exits[0].destination_node_uuid
                }
            ]
        };
        dispatch(addNode(bottomActionNode, { position: { x, y } }));
        const { freshestNode } = getState();
        dispatch(updateExitDestination(freshestNode.exits[0].uuid, freshestNode.uuid));
    } else {
        const { freshestNode } = getState();
        dispatch(
            updateExitDestination(
                freshestNode.exits[0].uuid,
                previousNode.exits[0].destination_node_uuid
            )
        );
    }

    // Remove our previous node since we created new nodes to take it's place
    dispatch(removeNode(previousNode));
};

/**
 * Appends a new node instead of editing the node in place
 */
export const appendNewRouter = (node: Node, type: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { components, definition } = getState();
    const previousNode = getNode(node.uuid, components, definition);
    const { position: { x, y } } = getNodeUI(node.uuid, definition);

    dispatch(
        addNode(node, {
            position: { x, y: y + NODE_SPACING },
            type
        })
    );

    // Rewire our old connections
    dispatch(updateExitDestination(previousNode.exits[0].uuid, getState().freshestNode.uuid));

    // And our new node should point where the old one did
    const { destination_node_uuid: previousDestination } = previousNode.exits[0];
    dispatch(updateExitDestination(getState().freshestNode.exits[0].uuid, previousDestination));
};

export const updateRouter = (
    node: Node,
    type: string,
    draggedFrom: DragPoint = null,
    newPosition: Position = null,
    previousAction: Action = null
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { definition, components } = getState();

    if (isActionsNode(node.uuid, components)) {
        // Make sure our previous action exists in our map
        if (previousAction && getDetails(previousAction.uuid, components)) {
            dispatch(spliceInRouter(node, type, previousAction));
        } else {
            dispatch(appendNewRouter(node, type));
        }
    } else {
        // Dragging from somewhere means we are a new node
        if (draggedFrom) {
            const newNode = uniquifyNode(node);
            const updateSpec = prepAddNode(newNode, { position: newPosition, type });
            dispatch(applyUpdateSpec(updateSpec));

            // Wire up where we dragged from
            dispatch(updateExitDestination(draggedFrom.exitUUID, newNode.uuid));
        } else {
            // Otherwise we are updating an existing node
            dispatch(
                applyUpdateSpec(prepSetNode(getDetails(node.uuid, components).nodeIdx, node, type))
            );
        }
    }

    console.timeEnd('updateRouter');
};

export const onNodeBeforeDrag = (
    node: Node,
    plumberSetDragSelection: Function,
    plumberClearDragSelection: Function
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { nodeDragging, dragGroup, definition } = getState();
    if (nodeDragging) {
        if (dragGroup) {
            const nodesBelow = getNodesBelow(node, definition.nodes);
            plumberSetDragSelection(nodesBelow);
        } else {
            plumberClearDragSelection();
        }
    }
};

export const resetNodeEditingState = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { pendingConnection, createNodePosition, actionToEdit, nodeToEdit } = getState();

    dispatch(updateGhostNode(null));

    if (pendingConnection) {
        dispatch(updatePendingConnection(null));
    }

    if (createNodePosition) {
        dispatch(updateCreateNodePosition(null));
    }

    if (actionToEdit) {
        dispatch(updateActionToEdit(null));
    }

    if (nodeToEdit) {
        dispatch(updateNodeToEdit(null));
    }
};

export const onUpdateAction = (node: Node, action: AnyAction, repaintForDuration: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { pendingConnection, createNodePosition } = getState();
    dispatch(updateAction(action, node.uuid, pendingConnection, createNodePosition));
    repaintForDuration();
};

export const onAddAction = (node: Node, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { translating, definition, language } = getState();

    const newAction: SendMsg = {
        uuid: generateUUID(),
        type: 'send_msg',
        text: ''
    };

    dispatch(setUserAddingAction(true));
    dispatch(setActionToEdit(newAction));
    dispatch(setNodeToEdit(node));

    const localizations = [];
    if (translating) {
        const translations = getTranslations(definition, language);
        localizations.push(
            // prettier-ignore
            ...getLocalizations(
                node,
                newAction,
                language.iso,
                languages,
                translations
            )
        );
    }

    const typeConfig = getTypeConfig(newAction.type);

    dispatch(setLocalizations(localizations));
    dispatch(setTypeConfig(typeConfig));
    dispatch(setNodeDragging(false));
    dispatch(setNodeEditorOpen(true));
};

export const onNodeEditorClose = (canceled: boolean, connectExit: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { pendingConnection, components, definition } = getState();

    // Make sure we re-wire the old connection
    if (canceled) {
        if (pendingConnection) {
            const exit = getExit(pendingConnection.exitUUID, components, definition);

            if (exit) {
                connectExit(exit);
            }
        }
    }

    dispatch(resetNodeEditingState());
};

export const onNodeMoved = (uuid: string, position: Position, repaintForDuration: Function) => (
    dispatch: DispatchWithState
) => {
    dispatch(
        updateNodeUI(uuid, {
            position: { $set: position }
        })
    );

    repaintForDuration();
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
    const { components, definition } = getState();
    // We finished dragging a ghost node, create the spec for our new ghost component
    const draggedFromDetails = getDetails(event.sourceId, components);
    const fromNode = getNode(draggedFromDetails.nodeUUID, components, definition);
    const fromNodeUI = getNodeUI(fromNode.uuid, definition);

    const draggedFrom = {
        nodeUUID: draggedFromDetails.nodeUUID,
        exitUUID: draggedFromDetails.exitUUID
    };

    const ghostNode: Node = {
        uuid: generateUUID(),
        actions: [],
        exits: [
            {
                uuid: generateUUID(),
                destination_node_uuid: null
            }
        ]
    };

    // Add an action if we are coming from a split
    if (fromNode.wait || fromNodeUI.type === 'webhook') {
        const replyAction: SendMsg = {
            uuid: generateUUID(),
            type: 'send_msg',
            text: ''
        };

        ghostNode.actions.push(replyAction);
    } else {
        // Otherwise we are going to a switch
        ghostNode.exits[0].name = 'All Responses';
        ghostNode.wait = { type: WaitType.msg };
        ghostNode.router = {
            type: 'switch',
            result_name: getSuggestedResultName(definition.nodes)
        };
    }

    // Set our ghost spec so it gets rendered.
    // TODO: this is here to workaround a jsplumb
    // weirdness where offsets go off the handle upon
    // dragging connections.
    // window.setTimeout(() => dispatch(updateGhostNode(ghostNode)), 0);
    dispatch(updateGhostNode(ghostNode));

    // Save off our drag point for later
    // this.pendingConnection = draggedFrom;
    dispatch(updatePendingConnection(draggedFrom));
};

export const onUpdateRouter = (
    node: Node,
    type: string,
    repaintForDuration: Function,
    previousAction?: Action
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { uuid: nodeUUID } = node;
    const { nodeToEdit: { uuid: newNodeUUID }, pendingConnection, createNodePosition } = getState();

    dispatch(updateRouter(node, type, pendingConnection, createNodePosition, previousAction));

    if (nodeUUID !== newNodeUUID) {
        repaintForDuration();
    }

    dispatch(resetNodeEditingState());
};

export const onOpenNodeEditor = (node: Node, action: AnyAction, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { translating, definition, components, language } = getState();

    const localizations = [];
    if (translating) {
        // prettier-ignore
        const translations = getTranslations(
            definition,
            language
        );

        localizations.push(
            // prettier-ignore
            ...getLocalizations(
                node,
                action,
                language.iso,
                languages,
                translations
            )
        );
    }

    if (node.actions && node.actions.length) {
        // Account for hybrids or clicking on the empty exit table
        dispatch(setActionToEdit(node.actions[node.actions.length - 1]));
    }

    // prettier-ignore
    const type = determineConfigType(
        node,
        node.actions || [],
        definition,
        components
    );

    const config = getTypeConfig(type);
    dispatch(setTypeConfig(config));

    let operand = DEFAULT_OPERAND;
    let resultName = '';

    if (node.router) {
        if (node.router.result_name) {
            ({ router: { result_name: resultName } } = node);
        }

        if (hasCases(node)) {
            ({ operand } = node.router as SwitchRouter);
        }
    }

    dispatch(setNodeDragging(false));
    dispatch(setNodeToEdit(node));
    dispatch(setLocalizations(localizations));
    dispatch(updateResultName(resultName));
    dispatch(setShowResultName(resultName.length > 0));
    dispatch(updateOperand(operand));
    dispatch(setNodeEditorOpen(true));
};
