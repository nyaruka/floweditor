import { determineTypeConfig } from 'components/flow/helpers';
import { getResultName } from 'components/flow/node/helpers';
import { getSwitchRouter } from 'components/flow/routers/helpers';
import { SaveResult } from 'components/revisions/RevisionExplorer';
import { FlowTypes, Type, Types } from 'config/interfaces';
import { getTypeConfig } from 'config/typeConfigs';
import { createAssetStore, getFlowDetails, saveRevision } from 'external';
import isEqual from 'fast-deep-equal';
import {
  Action,
  AnyAction,
  Category,
  Dimensions,
  Endpoints,
  Exit,
  FlowDefinition,
  FlowNode,
  SendMsg,
  SetContactField,
  SetRunResult,
  StickyNote,
  FlowDetails
} from 'flowTypes';
import mutate from 'immutability-helper';
import { Dispatch } from 'redux';
import { CanvasPositions, EditorState, EMPTY_DRAG_STATE, updateEditorState } from 'store/editor';
import {
  Asset,
  AssetStore,
  DEFAULT_LANGUAGE,
  RenderNode,
  RenderNodeMap,
  updateAssets,
  updateBaseLanguage,
  updateContactFields,
  updateDefinition,
  updateNodes,
  updateMetadata,
  updateIssues
} from 'store/flowContext';
import {
  createEmptyNode,
  fetchFlowActivity,
  getActionIndex,
  getCurrentDefinition,
  getFlowComponents,
  getLocalizations,
  getNode,
  guessNodeType,
  mergeAssetMaps,
  createFlowIssueMap
} from 'store/helpers';
import * as mutators from 'store/mutators';
import {
  NodeEditorSettings,
  updateNodeEditorSettings,
  updateTypeConfig,
  updateUserAddingAction
} from 'store/nodeEditor';
import AppState from 'store/state';
import { createUUID, hasString, NODE_SPACING, timeEnd, timeStart, ACTIVITY_INTERVAL } from 'utils';
import { AxiosError } from 'axios';
import i18n from 'config/i18n';
import { TembaStore } from 'temba-components';

// TODO: Remove use of Function
// tslint:disable:ban-types
export type DispatchWithState = Dispatch<AppState>;

export type GetState = () => AppState;

export type Thunk<T> = (dispatch: Dispatch<AppState>, getState?: GetState) => T;

export type AsyncThunk = Thunk<Promise<void>>;

export type OnAddToNode = (node: FlowNode) => Thunk<void>;

export type HandleTypeConfigChange = (typeConfig: Type) => Thunk<void>;

export type UpdateTranslationFilters = (translationFilters: {
  categories: boolean;
  rules: boolean;
}) => Thunk<void>;

export type OnOpenNodeEditor = (settings: NodeEditorSettings) => Thunk<void>;

export type OnUpdateCanvasPositions = (positions: CanvasPositions) => Thunk<RenderNodeMap>;

export type OnRemoveNodes = (nodeUUIDs: string[]) => Thunk<RenderNodeMap>;

export type AddAsset = (assetType: string, asset: Asset) => Thunk<void>;

export type RemoveNode = (nodeToRemove: FlowNode) => Thunk<RenderNodeMap>;

export type UpdateDimensions = (uuid: string, dimensions: Dimensions) => Thunk<void>;

export type FetchFlow = (
  endpoints: Endpoints,
  uuid: string,
  forceSave: boolean
) => Thunk<Promise<void>>;

export type LoadFlowDefinition = (details: FlowDetails, assetStore: AssetStore) => Thunk<void>;

export type CreateNewRevision = () => Thunk<void>;

export type NoParamsAC = () => Thunk<void>;

export type UpdateConnection = (source: string, target: string) => Thunk<RenderNodeMap>;

export type OnConnectionDrag = (event: ConnectionEvent, flowType: FlowTypes) => Thunk<void>;

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

export interface ErrorMessage {
  status: string;
  description: string;
}

export type LocalizationUpdates = Array<{ uuid: string; translations?: any }>;
const QUIET_SAVE = 1000;
const SAVE_ALERT_MILLIS = 1000 * 60;

let markDirty: (quiet?: number) => void = () => {};
let lastDirtyAttemptTimeout: any = null;
let postingRevision = false;

let lastDirtyMillis: number = 0;
let lastSuccessfulMillis: number = 0;

const NETWORK_ERROR = i18n.t(
  'errors.network',
  'Hmm, we ran into a problem trying to save your changes. It could just be that your internet connection is not working well at the moment. Please wait a minute or so and try again.'
);

const SERVER_ERROR = i18n.t(
  'errors.server',
  'Hmm, we ran into a problem trying to save your changes. If this problem persists, take note of the change you are trying to make and contact support.'
);

export const createSaveMonitor = (dispatch: DispatchWithState) => {
  window.setInterval(() => {
    if (
      lastSuccessfulMillis < lastDirtyMillis &&
      new Date().getTime() - lastDirtyMillis > SAVE_ALERT_MILLIS
    ) {
      dispatch(
        mergeEditorState({
          modalMessage: {
            title: "Uh oh, we couldn't save your changes",
            body: NETWORK_ERROR
          },
          saving: false
        })
      );
    }
  }, 5000);
};

export const createDirty = (
  revisionsEndpoint: string,
  dispatch: DispatchWithState,
  getState: GetState
) => (quiet: number = QUIET_SAVE) => {
  lastDirtyMillis = new Date().getTime();

  if (lastDirtyAttemptTimeout) {
    window.clearTimeout(lastDirtyAttemptTimeout);
  }

  const {
    flowContext: { definition, nodes, assetStore, issues },
    editorState: { currentRevision }
  } = getState();

  dispatch(mergeEditorState({ saving: true }));

  // make sure we have the most current revision number we know about
  const newDefinition = getCurrentDefinition(definition, nodes, true);
  newDefinition.revision = currentRevision;

  if (postingRevision) {
    lastDirtyAttemptTimeout = window.setTimeout(() => {
      markDirty();
    }, QUIET_SAVE);
    return;
  }

  lastDirtyAttemptTimeout = window.setTimeout(() => {
    postingRevision = true;
    saveRevision(revisionsEndpoint, newDefinition).then(
      (result: SaveResult) => {
        const revision = result.revision;
        definition.revision = revision.revision;
        dispatch(updateDefinition(definition));
        dispatch(updateIssues(createFlowIssueMap(issues, result.issues)));

        if (result.metadata) {
          dispatch(updateMetadata(result.metadata));
        }

        const updatedAssets = mutators.addRevision(assetStore, revision);
        dispatch(updateAssets(updatedAssets));
        dispatch(
          mergeEditorState({
            currentRevision: revision.revision,
            saving: false,
            activityInterval: ACTIVITY_INTERVAL
          })
        );

        lastSuccessfulMillis = new Date().getTime();
        postingRevision = false;
      },
      (error: AxiosError) => {
        let body = NETWORK_ERROR;

        if (error.response && error.response.status === 500) {
          body = SERVER_ERROR;
        }

        if (error.response && error.response.data && error.response.data.description) {
          body = error.response.data.description;
        }

        dispatch(
          mergeEditorState({
            modalMessage: {
              title: "Uh oh, we couldn't save your changes",
              body
            },
            saving: false
          })
        );
        postingRevision = false;
      }
    );
  }, quiet);
};

export const mergeEditorState = (changes: Partial<EditorState>) => (
  dispatch: DispatchWithState,
  getState: GetState
): EditorState => {
  const { editorState } = getState();
  const updated = mutate(editorState, { $merge: changes });
  dispatch(updateEditorState(updated));
  return updated;
};

export const createNewRevision = () => (dispatch: DispatchWithState, getState: GetState): void => {
  // mark us dirty with no quiet period
  markDirty(0);
};

export const loadFlowDefinition = (details: FlowDetails, assetStore: AssetStore) => (
  dispatch: DispatchWithState,
  getState: GetState
): void => {
  // first see if we need our asset store initialized

  const definition = details.definition;

  const {
    flowContext: { issues },
    editorState: { fetchingFlow }
  } = getState();

  if (!fetchingFlow) {
    // mark us as underway
    dispatch(mergeEditorState({ fetchingFlow: true }));
  }

  // while we don't officially support doing it, lets make a best effort to load
  // definitions that don't have _ui information (created outside of the editor)
  definition.localization = definition.localization || {};
  definition._ui = definition._ui || { nodes: {}, languages: [], stickies: {} };

  // make sure we have a ui entry for each node
  let currentTop = 0;
  for (const node of definition.nodes) {
    if (!definition._ui.nodes[node.uuid]) {
      definition._ui.nodes[node.uuid] = {
        position: { left: 0, top: currentTop },
        type: guessNodeType(node)
      };
      currentTop += 150;
    }
  }

  // add assets we found in our flow to our asset store
  const components = getFlowComponents(definition);
  mergeAssetMaps(assetStore.fields.items, components.fields);
  mergeAssetMaps(assetStore.groups.items, components.groups);
  mergeAssetMaps(assetStore.labels.items, components.labels);
  mergeAssetMaps(assetStore.results.items, components.results);

  // initialize our language
  let language: Asset;
  if (definition.language) {
    language = assetStore.languages.items[definition.language];
  }

  if (!language) {
    language = DEFAULT_LANGUAGE;
    dispatch(mergeEditorState({ language: DEFAULT_LANGUAGE }));
    mergeAssetMaps(assetStore.languages.items, { base: DEFAULT_LANGUAGE });
  }

  if (details.issues) {
    dispatch(updateIssues(createFlowIssueMap(issues, details.issues)));
  } else {
    dispatch(updateIssues({}));
  }

  dispatch(updateBaseLanguage(language));
  dispatch(updateMetadata(details.metadata));

  // store our flow definition without any nodes
  dispatch(updateDefinition(mutators.pruneDefinition(definition)));
  dispatch(updateNodes(components.renderNodeMap));

  // finally update our assets, and mark us as fetched
  dispatch(updateAssets(assetStore));
  dispatch(mergeEditorState({ language, fetchingFlow: false }));

  const store: TembaStore = document.querySelector('temba-store');
  if (store) {
    store.setKeyedAssets('results', Object.keys(assetStore.results.items));
  }
};

/**
 * Fetches a flow. Fetches all assets as well if the haven't been initialized yet
 * @param endpoints where our assets live
 * @param uuid the uuid for the flow to fetch
 */
export const fetchFlow = (endpoints: Endpoints, uuid: string, forceSave = false) => async (
  dispatch: DispatchWithState,
  getState: GetState
) => {
  // mark us as underway
  dispatch(mergeEditorState({ fetchingFlow: true }));

  // first see if we need our asset store initialized
  let {
    flowContext: { assetStore }
  } = getState();

  if (!Object.keys(assetStore).length) {
    assetStore = await createAssetStore(endpoints);
  }

  fetchFlowActivity(endpoints.activity, dispatch, getState, uuid);
  (window as any).triggerActivityUpdate = () => {
    fetchFlowActivity(endpoints.activity, dispatch, getState, uuid);
  };

  getFlowDetails(assetStore.revisions)
    .then((response: any) => {
      // backwards compatibitly for during deployment
      const details: FlowDetails = response.definition
        ? response
        : { definition: response as FlowDefinition, metadata: { issues: [] } };

      dispatch(loadFlowDefinition(details, assetStore));
      dispatch(
        mergeEditorState({
          currentRevision: details.definition.revision
        })
      );

      markDirty = createDirty(assetStore.revisions.endpoint, dispatch, getState);
      if (forceSave) {
        markDirty(0);
      }

      createSaveMonitor(dispatch);
    })
    .catch(error => {
      // not much we can do without our flow definition
      // log it to the console, this should really only happen if
      // misconfigured or the endpoint is unavailable
      console.error(error);
    });
};

export const addAsset: AddAsset = (assetType: string, asset: Asset) => (
  dispatch: DispatchWithState,
  getState: GetState
): void => {
  const {
    flowContext: { assetStore }
  } = getState();

  const updated = mutate(assetStore, {
    [assetType]: { items: { $merge: { [asset.id]: asset } } }
  });

  // update our temba store if we have one
  const store: TembaStore = document.querySelector('temba-store');
  if (store) {
    store.setKeyedAssets(assetType, Object.keys(updated[assetType]));
  }

  dispatch(updateAssets(updated));
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

export const onUpdateLocalizations = (language: string, changes: LocalizationUpdates) => (
  dispatch: DispatchWithState,
  getState: GetState
): FlowDefinition => {
  const {
    flowContext: { definition }
  } = getState();
  const updated = mutators.updateLocalization(definition, language, changes);
  dispatch(updateDefinition(updated));

  markDirty();
  return updated;
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
  markDirty();
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

export const removeNode = (node: FlowNode) => (
  dispatch: DispatchWithState,
  getState: GetState
): RenderNodeMap => {
  // Remove result name if node has one
  const {
    flowContext: { nodes, assetStore }
  } = getState();

  // update asset store to remove results that no longer exist
  if (node.router && node.router.result_name) {
    const updatedAssets = mutators.removeResultFromStore(node.router.result_name, assetStore, {
      nodeUUID: node.uuid
    });
    dispatch(updateAssets(updatedAssets));
  }

  const updated = mutators.removeNode(nodes, node.uuid);
  dispatch(updateNodes(updated));
  markDirty();
  return updated;
};

export const removeAction = (nodeUUID: string, action: AnyAction) => (
  dispatch: DispatchWithState,
  getState: GetState
): RenderNodeMap => {
  const {
    flowContext: { nodes, assetStore }
  } = getState();
  const renderNode = nodes[nodeUUID];

  // update asset store to remove results that no longer exist
  if (action.type === Types.set_run_result) {
    const resultAction = action as SetRunResult;
    const updatedAssets = mutators.removeResultFromStore(resultAction.name, assetStore, {
      nodeUUID,
      actionUUID: action.uuid
    });
    dispatch(updateAssets(updatedAssets));
  }

  // If it's our last action, then nuke the node
  if (renderNode.node.actions.length === 1) {
    const updated = dispatch(removeNode(renderNode.node));
    markDirty();
    return updated;
  } else {
    // Otherwise, just remove that action
    const updated = mutators.removeAction(nodes, nodeUUID, action.uuid);
    dispatch(updateNodes(updated));
    markDirty();
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
  markDirty();
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
            destination_uuid: null
          }
        ]
      },
      ui: { position: { left, top } },
      inboundConnections: { ...previousNode.inboundConnections }
    };

    updatedNodes = mutators.mergeNode(updatedNodes, topNode);
    top += NODE_SPACING;

    // update our routerNode for the presence of a top node
    newRouterNode.inboundConnections = {
      [topNode.node.exits[0].uuid]: topNode.node.uuid
    };
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
            destination_uuid: previousNode.node.exits[0].destination_uuid
          }
        ]
      },
      ui: {
        position: { left, top }
      },
      inboundConnections: {
        [newRouterNode.node.exits[0].uuid]: newRouterNode.node.uuid
      }
    };
    updatedNodes = mutators.mergeNode(updatedNodes, bottomNode);
  } else {
    // if we don't have a bottom, route our routerNode to the previous destination
    updatedNodes = mutators.updateConnection(
      updatedNodes,
      newRouterNode.node.uuid,
      newRouterNode.node.exits[0].uuid,
      previousNode.node.exits[0].destination_uuid
    );
  }

  dispatch(updateNodes(updatedNodes));

  markDirty();
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
    flowContext: { nodes, contactFields, assetStore }
  } = getState();

  if (settings == null || settings.originalNode == null) {
    throw new Error('Need originalNode in settings to update an action');
  }
  const { originalNode, originalAction } = settings;

  let updatedAssets = assetStore;

  // remove our result reference
  if (originalAction && originalAction.type === Types.set_run_result) {
    const { name: resultName } = originalAction as SetRunResult;
    updatedAssets = mutators.removeResultFromStore(resultName, updatedAssets, {
      nodeUUID: originalNode.node.uuid,
      actionUUID: action.uuid
    });
  }

  let updatedNodes = nodes;
  const creatingNewNode = !!(originalNode !== null && originalNode.ghost);

  let nodeUUID: string = null;

  if (creatingNewNode) {
    const newNode: RenderNode = {
      node: {
        uuid: createUUID(),
        actions: [action],
        exits: [{ uuid: createUUID(), destination_uuid: null }]
      },
      ui: { position: originalNode.ui.position, type: Types.execute_actions },
      inboundConnections: originalNode.inboundConnections
    };
    updatedNodes = mutators.mergeNode(nodes, newNode);

    nodeUUID = newNode.node.uuid;
  } else {
    nodeUUID = originalNode.node.uuid;

    if (userAddingAction) {
      updatedNodes = mutators.addAction(nodes, originalNode.node.uuid, action);
    } else if (originalNode.node.hasOwnProperty('router')) {
      updatedNodes = mutators.spliceInAction(nodes, originalNode.node.uuid, action);
    } else {
      updatedNodes = mutators.updateAction(nodes, originalNode.node.uuid, action, originalAction);
    }
  }

  dispatch(updateNodes(updatedNodes));
  dispatch(updateUserAddingAction(false));

  // Add result to store.
  if (action.type === Types.set_run_result) {
    const { name: resultName } = action as SetRunResult;
    updatedAssets = mutators.addResultToStore(resultName, updatedAssets, {
      nodeUUID,
      actionUUID: action.uuid
    });
    dispatch(updateAssets(updatedAssets));
  }

  // Add contact field to our store.
  if (action.type === Types.set_contact_field) {
    const { field } = action as SetContactField;
    dispatch(updateContactFields({ ...contactFields, [field.key]: field.name }));
  }

  markDirty(0);

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
    flowContext: { nodes }
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

  markDirty();
  dispatch(updateUserAddingAction(true));
  dispatch(handleTypeConfigChange(getTypeConfig(Types.send_msg)));
  dispatch(mergeEditorState(EMPTY_DRAG_STATE));
};

export const onRemoveNodes = (uuids: string[]) => (
  dispatch: DispatchWithState,
  getState: GetState
): RenderNodeMap => {
  const {
    flowContext: { nodes, definition }
  } = getState();

  let updatedNodes = nodes;
  let updatedDefinition = definition;
  let didNodes = false;
  let didDef = false;

  uuids.forEach((uuid: string) => {
    if (uuid in updatedNodes) {
      updatedNodes = mutators.removeNode(updatedNodes, uuid, true);
      didNodes = true;
    } else if (uuid in updatedDefinition._ui.stickies) {
      updatedDefinition = mutators.updateStickyNote(updatedDefinition, uuid, null);
      didDef = true;
    }
  });

  if (didNodes) {
    dispatch(updateNodes(updatedNodes));
  }

  if (didDef) {
    dispatch(updateDefinition(updatedDefinition));
  }

  if (didDef || didNodes) {
    markDirty();
  }

  return nodes;
};

export const onUpdateCanvasPositions = (positions: CanvasPositions) => (
  dispatch: DispatchWithState,
  getState: GetState
): RenderNodeMap => {
  const {
    flowContext: { nodes, definition }
  } = getState();

  let updatedDefinition = definition;
  let updatedNodes = nodes;

  let updatedNodePosition = false;
  let updatedStickyPosition = false;

  for (const uuid in positions) {
    if (updatedNodes[uuid]) {
      updatedNodes = mutators.updatePosition(updatedNodes, uuid, positions[uuid]);
      updatedNodePosition = true;
    } else if (updatedDefinition._ui.stickies[uuid]) {
      updatedDefinition = mutators.updateStickyNotePosition(
        updatedDefinition,
        uuid,
        positions[uuid]
      );
      updatedStickyPosition = true;
    }
  }

  let updated = false;

  if (updatedNodePosition) {
    updated = true;
    dispatch(updateNodes(updatedNodes));
  }

  if (updatedStickyPosition) {
    updated = true;
    dispatch(updateDefinition(updatedDefinition));
  }

  if (updated) {
    markDirty();
  }

  return updatedNodes;
};

/**
 * Called when a connection begins to be dragged from an endpoint both
 * when a new connection is desired or when an existing one is being moved.
 * @param event
 */
export const onConnectionDrag = (event: ConnectionEvent, flowType: FlowTypes) => (
  dispatch: DispatchWithState,
  getState: GetState
) => {
  const {
    flowContext: { nodes, assetStore }
  } = getState();

  // We finished dragging a ghost node, create the spec for our new ghost component
  const [fromNodeUUID, fromExitUUID] = event.sourceId.split(':');

  const fromNode = nodes[fromNodeUUID];

  const names = Object.keys(assetStore.results ? assetStore.results.items : {});

  let resultCount = names.length + 1;
  let key = `result_${resultCount}`;

  while (hasString(names, key)) {
    resultCount++;
    key = `result_${resultCount}`;
  }

  // set our ghost node
  const ghostNode = createEmptyNode(fromNode, fromExitUUID, resultCount, flowType);
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
  markDirty();
};

export const onUpdateRouter = (renderNode: RenderNode) => (
  dispatch: DispatchWithState,
  getState: GetState
): RenderNodeMap => {
  const {
    flowContext: { nodes, assetStore },
    nodeEditor: {
      settings: { originalNode, originalAction }
    }
  } = getState();

  let updated = nodes;
  if (originalNode) {
    const previousPosition = originalNode.ui.position;
    renderNode.ui.position = previousPosition;
    renderNode.inboundConnections = originalNode.inboundConnections;
  }

  if (originalNode.ghost) {
    renderNode.inboundConnections = originalNode.inboundConnections;
    const { left, top } = originalNode.ui.position;
    renderNode.ui.position = { left, top };
    renderNode.node = mutators.uniquifyNode(renderNode.node);
  }

  // update our results
  const resultName = getResultName(renderNode.node);
  if (resultName) {
    let updatedAssets = assetStore;

    // remove our original result name
    const originalResultName = getResultName(originalNode.node);
    if (originalResultName) {
      updatedAssets = mutators.removeResultFromStore(originalResultName, updatedAssets, {
        nodeUUID: originalNode.node.uuid
      });
    }

    updatedAssets = mutators.addFlowResult(updatedAssets, renderNode.node);
    dispatch(updateAssets(updatedAssets));
  }

  if (
    originalNode &&
    originalAction &&
    !originalNode.ghost &&
    !getSwitchRouter(originalNode.node)
  ) {
    const actionToSplice = originalNode.node.actions.find(
      (action: Action) => action.uuid === originalAction.uuid
    );

    if (actionToSplice) {
      // if we are splicing using the original top
      renderNode.ui.position.top = originalNode.ui.position.top;

      return dispatch(
        spliceInRouter(renderNode, {
          nodeUUID: originalNode.node.uuid,
          actionUUID: actionToSplice.uuid
        })
      );
    }

    // didn't recognize that action, let's add a new router node
    // if we are appendeng in, see if we need to route through
    const switchRouter = getSwitchRouter(renderNode.node);
    if (switchRouter) {
      const defaultCategory = switchRouter.categories.find(
        (cat: Category) => cat.uuid === switchRouter.default_category_uuid
      );
      const exitToUpdate = renderNode.node.exits.find(
        (exit: Exit) => exit.uuid === defaultCategory.exit_uuid
      );

      exitToUpdate.destination_uuid = originalNode.node.exits[0].destination_uuid;
    }

    renderNode.inboundConnections = {
      [originalNode.node.exits[0].uuid]: originalNode.node.uuid
    };
    renderNode.node = mutators.uniquifyNode(renderNode.node);
    renderNode.ui.position.top += NODE_SPACING;
    updated = mutators.mergeNode(updated, renderNode);
  } else {
    updated = mutators.mergeNode(updated, renderNode);
  }

  dispatch(updateNodes(updated));

  markDirty(0);
  return updated;
};

export const onOpenNodeEditor = (settings: NodeEditorSettings) => (
  dispatch: DispatchWithState,
  getState: GetState
) => {
  const {
    flowContext: {
      definition: { localization }
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

  const typeConfig = determineTypeConfig(settings);
  dispatch(handleTypeConfigChange(typeConfig));
  dispatch(updateNodeEditorSettings(settings));
  dispatch(mergeEditorState(EMPTY_DRAG_STATE));
};

export const updateTranslationFilters = (translationFilters: {
  categories: boolean;
  rules: boolean;
}) => (dispatch: DispatchWithState, getState: GetState): void => {
  const {
    flowContext: { definition }
  } = getState();

  definition._ui.translation_filters = translationFilters;
  dispatch(updateDefinition(definition));
  markDirty();
};
