import * as UUID from 'uuid';
import * as update from 'immutability-helper';

import { ContactFieldResult, SearchResult } from './ComponentMap';
import { FlowDefinition, Node, Action, Exit, UIMetaData, UINode, Position } from '../FlowDefinition';
import { NodeModalProps } from './NodeModal';
import { NodeComp, NodeProps, DragPoint } from './Node';
import { ComponentMap } from './ComponentMap';
import { FlowLoaderProps } from './FlowLoader';

export class FlowMutator {

    private definition: FlowDefinition;
    private components: ComponentMap;
    private saveMethod: Function;
    private updateMethod: Function;

    private loaderProps: FlowLoaderProps;

    private dirty: boolean;
    private uiTimeout: any;
    private saveTimeout: any;

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
        this.components = new ComponentMap(this.definition);

        this.quietUI = quiteUI;
        this.quietSave = quietSave;

        this.removeAction = this.removeAction.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.getContactFields = this.getContactFields.bind(this);
        this.addContactField = this.addContactField.bind(this);
        this.getGroups = this.getGroups.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.disconnectExit = this.disconnectExit.bind(this);
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
        return this.definition.nodes[details.nodeIdx];
    }

    public getNodeUI(uuid: string): UINode {
        return this.definition._ui.nodes[uuid];
    }

    private markDirty() {
        // add quiet period
        this.updateUI();
        this.save();
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

    public addNode(props: Node, ui: UINode, pendingConnection?: DragPoint) {
        console.time("addNode");

        // add our node
        this.definition = update(this.definition, {
            nodes: {
                $push: [props]
            },
            _ui: {
                nodes: { $merge: { [props.uuid]: ui } }
            }
        });

        // save off our pending connection if we have one
        if (pendingConnection) {
            this.components.addPendingConnection(props.uuid, pendingConnection);
        }

        this.components.initializeUUIDMap(this.definition);
        this.markDirty();
        console.timeEnd("addNode");
        return props;
    }

    public updateRouter(props: Node, type: string,
        draggedFrom: DragPoint = null,
        newPosition: Position = null): Node {

        console.time("updateRouter");
        var node: Node;
        if (draggedFrom) {
            // console.log("adding new router node", props);
            node = this.addNode(
                props, { position: newPosition }, {
                    exitUUID: draggedFrom.exitUUID,
                    nodeUUID: draggedFrom.nodeUUID
                }
            );
        }
        // we are updating
        else {
            //console.log("Updating router node", props);
            let nodeDetails = this.components.getDetails(props.uuid)
            this.definition = update(this.definition, {
                nodes: { [nodeDetails.nodeIdx]: { $set: props } }
            });
            node = this.definition.nodes[nodeDetails.nodeIdx];
        }

        // update our type
        var uiNode = this.definition._ui.nodes[props.uuid];
        this.updateNodeUI(props.uuid, { $merge: { type: type } })

        this.components.initializeUUIDMap(this.definition);
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
        draggedFrom: DragPoint = null,
        newPosition: Position = null,
        addToNode: string = null): Node {
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
            let nodeDetails = this.components.getDetails(addToNode);
            this.definition = update(this.definition, {
                nodes: {
                    [nodeDetails.nodeIdx]: {
                        actions: {
                            $push: [action]
                        }
                    }
                }
            });

            this.components.initializeUUIDMap(this.definition);
        }
        else {
            // update the action into our new flow definition
            let actionDetails = this.components.getDetails(action.uuid)
            if (actionDetails) {
                this.definition = update(this.definition, {
                    nodes: {
                        [actionDetails.nodeIdx]: {
                            actions: { [actionDetails.actionIdx]: { $set: action } },
                        }
                    }
                });

                var node = this.definition.nodes[actionDetails.nodeIdx];
                var previousDestination = null;
                var previousUUID = UUID.v4();
                if (node.exits.length == 1) {
                    previousDestination = node.exits[0].destination_node_uuid;
                    previousUUID = node.exits[0].uuid;
                }

                this.definition = update(this.definition, {
                    nodes: {
                        [actionDetails.nodeIdx]: {
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
                var uiNode = this.definition._ui.nodes[actionDetails.nodeUUID];
                this.updateNodeUI(actionDetails.nodeUUID, { $unset: ["type"] });

                node = this.definition.nodes[actionDetails.nodeIdx];
            }
            // otherwise we might be adding a new action
            else {
                // console.log("Couldn't find node, not updating");
                return;
            }
        }

        this.markDirty();
        console.timeEnd("updateAction");
        return node;
    }

    /**
     * Update the definition for a node
     * @param uuid 
     * @param changes immutability spec to modify the node
     */
    updateNode(uuid: string, changes: any) {
        var index = this.components.getDetails(uuid).nodeIdx
        this.definition = update(this.definition, { nodes: { [index]: changes } });
        this.components.initializeUUIDMap(this.definition);
        this.markDirty();
    }

    updateNodeUI(uuid: string, changes: any) {
        this.definition = update(this.definition, { _ui: { nodes: { [uuid]: changes } } });

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

        this.components.initializeUUIDMap(this.definition);
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

        this.components.initializeUUIDMap(this.definition);
        this.markDirty();
    }

    public removeAction(props: Action) {
        let details = this.getComponents().getDetails(props.uuid);
        let node = this.definition.nodes[details.nodeIdx];

        // if it's our last action, then nuke the node
        if (node.actions.length == 1) {
            this.removeNode(node);
        }

        // otherwise, just splice out that action
        else {
            let details = this.components.getDetails(props.uuid);
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
            this.components.initializeUUIDMap(this.definition);
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

    public disconnectExit(exit: Exit) {
        this.updateExitDestination(exit.uuid, null);
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
            this.components.initializeUUIDMap(this.definition);
        } else {
            console.error("Attempt to route to self, ignored");
        }
    }

    public getComponents() {
        return this.components;
    }

    public addContactField(field: SearchResult): ContactFieldResult {
        return this.components.addContactField(field);
    }

    public addGroup(group: SearchResult): SearchResult {
        return this.components.addGroup(group);
    }


}

export default FlowMutator;