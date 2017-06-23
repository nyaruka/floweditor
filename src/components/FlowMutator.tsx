import * as UUID from 'uuid';
import * as update from 'immutability-helper';

import { ContactFieldResult, SearchResult } from './ComponentMap';
import { FlowDefinition, Node, Action, Exit, UIMetaData, UINode, Position, Dimensions, SendMessage } from '../FlowDefinition';
import { NodeComp, NodeProps, DragPoint } from './Node';
import { ComponentMap } from './ComponentMap';
import { FlowLoaderProps } from './FlowLoader';

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
interface Reflow {
    uuid: string;
    bounds: Bounds;
}

const NODE_SPACING = 60;

export class FlowMutator {

    private definition: FlowDefinition;
    private components: ComponentMap;
    private saveMethod: Function;
    private updateMethod: Function;

    private loaderProps: FlowLoaderProps;

    private dirty: boolean;
    private uiTimeout: any;
    private saveTimeout: any;
    private reflowTimeout: any;

    private quietUI: number;
    private quietSave: number;


    constructor(definition: FlowDefinition = null,
        updateMethod: Function = null,
        saveMethod: Function = null,
        loaderProps: FlowLoaderProps = {},
        quiteUI = 0, quietSave = 0) {

        this.definition = definition;
        this.saveMethod = saveMethod;
        this.updateMethod = updateMethod;
        this.loaderProps = loaderProps;
        this.components = ComponentMap.initialize(this.definition);

        this.quietUI = quiteUI;
        this.quietSave = quietSave;

        this.removeAction = this.removeAction.bind(this);
        this.moveActionUp = this.moveActionUp.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.getContactFields = this.getContactFields.bind(this);
        this.getGroups = this.getGroups.bind(this);
        this.disconnectExit = this.disconnectExit.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.updateLocalization = this.updateLocalization.bind(this);

    }

    public getContactFields(): ContactFieldResult[] {
        return this.components.getContactFields();
    }

    public getGroups(): SearchResult[] {
        return this.components.getGroups();
    }

    /**
     * Get the node with a uuid
     */
    public getNode(uuid: string): Node {
        var details = this.components.getDetails(uuid)
        if (!details) {
            return null;
        }
        return this.definition.nodes[details.nodeIdx];
    }

    public getExit(uuid: string): Exit {
        var details = this.components.getDetails(uuid);
        if (details) {
            var node = this.definition.nodes[details.nodeIdx];
            return node.exits[details.exitIdx];
        }
        return null;
    }

    public getNodeUI(uuid: string): UINode {
        return this.definition._ui.nodes[uuid];
    }

    private markDirty() {
        // add quiet period
        this.updateUI();
        this.save();
    }

    private markReflow() {
        if (this.quietUI > 0) {
            if (this.reflowTimeout) {
                window.clearTimeout(this.reflowTimeout);
            }

            this.reflowTimeout = window.setTimeout(() => {
                this.reflow();
            }, this.quietUI);
        } else {
            this.reflow();
        }
    }

    public updateUI() {

        if (this.updateMethod) {
            if (this.quietUI > 0) {
                if (this.uiTimeout) {
                    window.clearTimeout(this.uiTimeout);
                }

                this.uiTimeout = window.setTimeout(() => {
                    this.updateMethod(this.definition);
                }, this.quietUI);

            } else {
                this.updateMethod(this.definition);
            }
        }
    }

    public save() {

        if (this.saveMethod) {
            if (this.quietSave > 0) {
                if (this.saveTimeout) {
                    window.clearTimeout(this.saveTimeout);
                }

                this.saveTimeout = window.setTimeout(() => {
                    this.saveMethod(this.definition);
                    this.dirty = false;
                }, this.quietSave);
            } else {
                this.saveMethod(this.definition);
                this.dirty = false;
            }
        } else {
            this.dirty = false;
        }
    }

    private collides(a: Bounds, b: Bounds) {
        if (a.bottom < b.top ||
            a.top > b.bottom ||
            a.left > b.right ||
            a.right < b.left) {
            return false;
        }
        // console.log("COLLISION!");
        return true;
    }

    /**
     * Reflows the entire flow pushing nodes downward until there are no collisions
     */
    public reflow() {

        console.time("reflow");

        this.sortNodes();

        // get a list of nodes to flow
        var uis: Reflow[] = [];
        for (let node of this.definition.nodes) {
            var uiNode = this.definition._ui.nodes[node.uuid];

            // this should only happen with freshly added nodes, since
            // they don't have dimensions until they are rendered
            var dimensions = uiNode.dimensions;
            if (!dimensions) {
                // console.log("using default dimensions");
                dimensions = { width: 250, height: 100 };
            }

            uis.push({
                uuid: node.uuid, bounds: {
                    left: uiNode.position.x,
                    top: uiNode.position.y,
                    right: uiNode.position.x + dimensions.width,
                    bottom: uiNode.position.y + dimensions.height
                }
            });
        }

        var dirty = false;
        var previous: Reflow;

        var updatedNodes: Reflow[] = [];
        for (var i = 0; i < uis.length; i++) {
            let current = uis[i];
            for (var j = i + 1; j < uis.length; j++) {
                let other = uis[j];

                if (!current.bounds) {
                    throw new Error("Dimensions missing for " + current.uuid);
                }

                if (this.collides(current.bounds, other.bounds)) {
                    // console.log("COLLISON:", current, other);

                    var diff = current.bounds.bottom - other.bounds.top + NODE_SPACING;
                    other.bounds.top += diff;
                    other.bounds.bottom += diff;

                    updatedNodes.push(other);

                    // see if our collision cascades
                    if (uis.length > j + 1) {
                        let next = uis[j + 1];
                        //if (this.collides(other.bounds, next.bounds)) {
                        // if so, push everybody else down
                        for (var k = j + 1; k < uis.length; k++) {
                            let below = uis[k];
                            below.bounds.top += diff;
                            below.bounds.bottom += diff;
                            updatedNodes.push(below);
                        }
                        //}
                    }
                    break;
                }
                // if they start below our lowest point, move on
                else if (other.bounds.top > current.bounds.bottom) {
                    break;
                }
            }
            previous = current;
        }

        window.setTimeout(() => {
            if (updatedNodes.length > 0) {
                console.log("::REFLOWED::", updatedNodes);

                var updated = this.definition;
                for (let node of updatedNodes) {
                    updated = update(updated, { _ui: { nodes: { [node.uuid]: { position: { $merge: { y: node.bounds.top } } } } } });
                }
                this.definition = updated;
                this.markDirty();
            }

        }, 100);

        console.timeEnd("reflow");
    }

    public updateLocalization(uuid: string, language: string, values: any) {

        if (this.definition.localization == null) {
            this.definition.localization = {};
        }

        if (!this.definition.localization[language]) {
            this.definition.localization[language] = {};
        }

        if (values) {
            this.definition = update(this.definition, { localization: { [language]: { [uuid]: { $set: values } } } });
        } else {
            this.definition = update(this.definition, { localization: { [language]: { $unset: [uuid] } } });
        }

        this.markDirty();
    }

    public updateDimensions(node: Node, dimensions: Dimensions) {
        var ui = this.getNodeUI(node.uuid);
        if (!ui.dimensions || ui.dimensions.height != dimensions.height || ui.dimensions.width != dimensions.width) {
            this.updateNodeUI(node.uuid, { $merge: { dimensions: dimensions } });
        }
    }

    public addNode(node: Node, ui: UINode, pendingConnection?: DragPoint): Node {
        console.time("addNode");

        // give our node a unique uuid
        node = update(node, { $merge: { uuid: UUID.v4() } });

        // add our node
        this.definition = update(this.definition, {
            nodes: {
                $push: [node]
            },
            _ui: {
                nodes: { $merge: { [node.uuid]: ui } }
            }
        });

        // save off our pending connection if we have one
        if (pendingConnection) {
            this.components.addPendingConnection(node.uuid, pendingConnection);
        }

        this.components.refresh(this.definition);
        this.markDirty();
        console.timeEnd("addNode");
        return node;
    }

    /**
     * Splices a router into a list of actions creating up to three nodes where there 
     * was once one node. 
     * @param node the new node being added (shares the previous node uuid)
     * @param type the type of the new router
     * @param previousAction the previous action that is being replaced with our router
     */
    private spliceInRouter(node: Node, type: string, previousAction: Action): Node {
        var previousNode = this.getNode(node.uuid);
        var details = this.components.getDetails(previousAction.uuid);

        // we need to splice a wait node where our previousAction was
        var topActions: Action[] = [];
        var bottomActions: Action[] = previousNode.actions.slice(details.actionIdx + 1, previousNode.actions.length);
        if (details.actionIdx > 0) {
            topActions = previousNode.actions.slice(0, details.actionIdx);
        }

        var lastNode: Node;

        var previousUI = this.getNodeUI(node.uuid);
        var { x, y } = previousUI.position;

        // add our new router node, do this fist so our top can point to it
        var routerY = topActions.length ? y + NODE_SPACING : y;
        var newRouterNode = this.addNode(node, { position: { x: x, y: routerY }, type: type });

        // add our top node if we have one
        if (topActions.length > 0) {
            var topActionNode: Node = {
                uuid: UUID.v4(),
                actions: topActions,
                exits: [{
                    uuid: UUID.v4(),
                    destination_node_uuid: newRouterNode.uuid
                }]
            };

            lastNode = this.addNode(topActionNode, { position: { x: x, y: y } });
            y += NODE_SPACING;
        }

        // add our bottom 
        if (bottomActions.length > 0) {
            var bottomActionNode: Node = {
                uuid: UUID.v4(),
                actions: bottomActions,
                exits: [{
                    uuid: UUID.v4(),
                    destination_node_uuid: previousNode.exits[0].destination_node_uuid
                }]
            };

            lastNode = this.addNode(bottomActionNode, { position: { x: x, y: y } });
            this.updateExitDestination(newRouterNode.exits[0].uuid, lastNode.uuid);
            y += NODE_SPACING;
        } else {
            this.updateExitDestination(newRouterNode.exits[0].uuid, previousNode.exits[0].destination_node_uuid);
        }

        // remove our previous node since we created new nodes to take it's place
        this.removeNode(previousNode);

        return newRouterNode;
    }

    /**
     * Appends a new node instead of editing the node in place
     */
    private appendNewRouter(node: Node, type: string) {
        var previousNode = this.getNode(node.uuid);
        var { x, y } = this.getNodeUI(node.uuid).position;
        var newRouterNode = this.addNode(node, { position: { x: x, y: y + NODE_SPACING }, type: type });

        // rewire our old connections
        var previousDestination = previousNode.exits[0].destination_node_uuid
        this.updateExitDestination(previousNode.exits[0].uuid, newRouterNode.uuid);

        // and our new node should point where the old one did
        this.updateExitDestination(newRouterNode.exits[0].uuid, previousDestination);

        return newRouterNode;
    }

    public updateRouter(node: Node, type: string,
        draggedFrom: DragPoint = null,
        newPosition: Position = null,
        previousAction: Action = null): Node {

        console.time("updateRouter");

        var details = this.components.getDetails(node.uuid);
        var previousNode = this.getNode(node.uuid);

        if (details && !details.type && previousNode && previousNode.actions && previousNode.actions.length > 0) {
            // make sure our previous action exists in our map
            if (previousAction && this.components.getDetails(previousAction.uuid)) {
                return this.spliceInRouter(node, type, previousAction);
            } else {
                return this.appendNewRouter(node, type);
            }
        }

        if (draggedFrom) {
            // console.log("adding new router node", props);
            node = this.addNode(
                node, { position: newPosition, type: type }, {
                    exitUUID: draggedFrom.exitUUID,
                    nodeUUID: draggedFrom.nodeUUID
                }
            );
        }
        // we are updating
        else {
            let nodeDetails = this.components.getDetails(node.uuid)
            this.definition = update(this.definition, {
                nodes: { [nodeDetails.nodeIdx]: { $set: node } }
            });
            node = this.definition.nodes[nodeDetails.nodeIdx];

            // update our type 
            var uiNode = this.definition._ui.nodes[node.uuid];
            this.updateNodeUI(node.uuid, { $merge: { type: type } })
        }

        this.components.refresh(this.definition);
        this.markDirty();

        console.timeEnd("updateRouter");
        return node;
    }

    /**
     * Updates an action in our tree 
     * @param uuid the action to modify
     * @param changes immutability spec to modify at the given action
     */
    public updateAction(action: Action,
        previousNodeUUID: string,
        draggedFrom: DragPoint = null,
        newPosition: Position = null,
        addToNode: Node = null): Node {
        console.time("updateAction");
        var node: Node;

        if (draggedFrom) {
            var newNodeUUID = UUID.v4();
            node = this.addNode({
                uuid: newNodeUUID,
                actions: [action],
                exits: [
                    { uuid: UUID.v4(), destination_node_uuid: null, name: null }
                ]
            }, { position: newPosition },
                {
                    exitUUID: draggedFrom.exitUUID,
                    nodeUUID: draggedFrom.nodeUUID
                });

        }
        else if (addToNode) {
            let nodeDetails = this.components.getDetails(addToNode.uuid);
            this.definition = update(this.definition, {
                nodes: {
                    [nodeDetails.nodeIdx]: {
                        actions: {
                            $push: [action]
                        }
                    }
                }
            });

            this.components.refresh(this.definition);
        }
        else {

            console.log("Updating existing action");

            // update the action into our new flow definition
            let actionDetails = this.components.getDetails(action.uuid)

            var node: Node = null;
            var nodeIdx = -1;
            var actionIdx = -1;
            var nodeUUID;

            if (actionDetails) {
                node = this.definition.nodes[actionDetails.nodeIdx];
                nodeIdx = actionDetails.nodeIdx;
                actionIdx = actionDetails.actionIdx;
                nodeUUID = actionDetails.nodeUUID
            }
            // HACK: look it up by previous node
            // this should fall away with nodemodal refactor based on nodes
            else if (previousNodeUUID) {
                var nodeDetails = this.components.getDetails(previousNodeUUID);
                node = this.definition.nodes[nodeDetails.nodeIdx];
                nodeIdx = nodeDetails.nodeIdx;
                actionIdx = 0;
                nodeUUID = previousNodeUUID;
            }

            if (node) {

                if (node.actions && node.actions.length > 0) {
                    this.definition = update(this.definition, {
                        nodes: {
                            [nodeIdx]: {
                                actions: { [actionIdx]: { $set: action } },
                            }
                        }
                    });
                } else if (actionIdx == 0) {
                    this.definition = update(this.definition, {
                        nodes: {
                            [nodeIdx]: {
                                actions: { $set: [action] },
                            }
                        }
                    });
                }

                var previousDestination = null;
                var previousUUID = UUID.v4();
                if (node.exits.length == 1) {
                    previousDestination = node.exits[0].destination_node_uuid;
                    previousUUID = node.exits[0].uuid;
                }

                this.definition = update(this.definition, {
                    nodes: {
                        [nodeIdx]: {
                            $unset: ["router", "wait"],
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

                // make sure we don't have a type set
                var uiNode = this.definition._ui.nodes[nodeUUID];
                this.updateNodeUI(nodeUUID, { $unset: ["type"] });

                node = this.definition.nodes[nodeIdx];
            }
            // otherwise we might be adding a new action
            else {
                console.log("Couldn't find node, not updating");
                return;
            }
        }

        this.markDirty();
        this.markReflow();
        console.timeEnd("updateAction");
        return node;
    }

    /**
     * Makes sure there is always at least a node to start with
     */
    public ensureStartNode() {

        if (this.definition.nodes.length == 0) {

            let initialAction: SendMessage = {
                uuid: UUID.v4(),
                type: "reply",
                text: "Hi there, this the first message in your flow!"
            };

            var node: Node = {
                uuid: UUID.v4(),
                actions: [initialAction],
                exits: [{
                    uuid: UUID.v4()
                }]
            };
            this.addNode(node, { position: { x: 0, y: 0 } });
        }
    }

    /**
     * Update the definition for a node
     * @param uuid 
     * @param changes immutability spec to modify the node
     */
    updateNode(uuid: string, changes: any) {
        var index = this.components.getDetails(uuid).nodeIdx
        this.definition = update(this.definition, { nodes: { [index]: changes } });
        this.components.refresh(this.definition);
        this.markReflow();
        this.markDirty();
    }

    private sortNodes() {
        // find our first node
        var top: Position;
        var topNode: string;

        this.definition.nodes.sort((a: Node, b: Node) => {
            var aPos = this.definition._ui.nodes[a.uuid].position;
            var bPos = this.definition._ui.nodes[b.uuid].position;
            var diff = aPos.y - bPos.y;

            // secondary sort on x location
            if (diff == 0) {
                diff = aPos.x - bPos.x;
            }

            return diff;
        });

        for (let nodeUUID in this.definition._ui.nodes) {
            let position = this.definition._ui.nodes[nodeUUID].position;
            if (top == null || top.y < position.y) {
                top = position;
                topNode = nodeUUID;
            }
        }

        this.components.refresh(this.definition);
        this.markDirty();
    }

    updateNodeUI(uuid: string, changes: any) {
        this.definition = update(this.definition, { _ui: { nodes: { [uuid]: changes } } });
        this.markReflow();
        this.markDirty();
    }

    public removeNode(props: Node) {

        let details = this.components.getDetails(props.uuid);
        let node = this.definition.nodes[details.nodeIdx];

        // if we have a single exit, map all our pointers to that destination
        var destination = null;
        if (node.exits.length == 1) {
            destination = node.exits[0].destination_node_uuid
        }

        // remap all our pointers to our new destination, null some most cases
        for (let pointer of details.pointers) {
            // don't allow it to point to ourselves
            var nodeUUID = this.components.getDetails(pointer).nodeUUID;
            if (nodeUUID == destination) {
                destination = null;
            }
            this.updateExitDestination(pointer, destination);
        }

        // now remove ourselves
        this.definition = update(this.definition, { nodes: { $splice: [[details.nodeIdx, 1]] } })

        // remove us from the ui map as well
        this.definition = update(this.definition, { _ui: { nodes: { $unset: [props.uuid] } } });

        this.ensureStartNode();

        this.components.refresh(this.definition);
        this.markDirty();
    }

    public moveActionUp(action: Action) {
        let details = this.components.getDetails(action.uuid);
        let node = this.definition.nodes[details.nodeIdx];

        if (details.actionIdx > 0) {
            var actionAbove = node.actions[details.actionIdx - 1];
            this.updateNode(node.uuid, { actions: { $splice: [[details.actionIdx - 1, 2, action, actionAbove]] } });
        }

        this.markDirty();
    }

    public removeAction(action: Action) {
        let details = this.components.getDetails(action.uuid);
        let node = this.definition.nodes[details.nodeIdx];

        // if it's our last action, then nuke the node
        if (node.actions.length == 1) {
            this.removeNode(node);
        }

        // otherwise, just splice out that action
        else {
            let details = this.components.getDetails(action.uuid);
            this.updateNode(node.uuid, { actions: { $splice: [[details.actionIdx, 1]] } })
        }

        this.markDirty();
    }

    /**
     * Updates the pending connection on this node. Once it is updated,
     * it will get wired up.
     * @param props with a pendingConnection set
     */
    public resolvePendingConnection(props: Node) {
        // only resolve connection if we have one
        var pendingConnection = this.components.getPendingConnection(props.uuid);
        if (pendingConnection != null) {
            this.updateExitDestination(pendingConnection.exitUUID, props.uuid);
            this.components.refresh(this.definition);
            this.markDirty();
            // remove our pending connection
            this.components.removePendingConnection(props.uuid);
        }
    }

    public getConnectionError(source: string, target: string): string {
        var exitDetails = this.components.getDetails(source);
        if (exitDetails.nodeUUID == target) {
            return "Connections cannot route back to the same places.";
        }
        return null;
    }

    public disconnectExit(exitUUID: string) {
        this.updateExitDestination(exitUUID, null);
    }

    private updateExitDestination(exitUUID: string, destination: string) {
        this.updateExit(exitUUID, { $merge: { destination_node_uuid: destination } });
    }

    /**
     * Updates an exit in our tree 
     * @param uuid the exit to modify
     * @param changes immutability spec to modify at the given exit
     */
    private updateExit(exitUUID: string, changes: any) {
        var details = this.components.getDetails(exitUUID);

        this.definition = update(this.definition, {
            nodes: { [details.nodeIdx]: { exits: { [details.exitIdx]: changes } } }
        });

        // our pointers need to be reevaluated
        this.markDirty();
    }

    public updateConnection(source: string, target: string) {
        let nodeUUID = this.components.getDetails(source).nodeUUID;
        if (nodeUUID != target) {
            this.updateExitDestination(source, target);
            this.components.refresh(this.definition);
        } else {
            console.error("Attempt to route to self, ignored");
        }
    }
}

export default FlowMutator;