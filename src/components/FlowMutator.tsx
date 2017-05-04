import {FlowDefinition, NodeProps, UIMetaDataProps, ActionProps, SearchResult, UINode, DragPoint} from '../interfaces';
import NodeComp from './NodeComp';
import ComponentMap from './ComponentMap';
var update = require('immutability-helper');
var UUID = require('uuid');

export class FlowMutator {
    
    private definition: FlowDefinition;
    private components: ComponentMap;
    private saveMethod: Function;
    
    constructor(definition: FlowDefinition, saveMethod: Function) {
        this.definition = definition;
        this.saveMethod = saveMethod;
        this.components = new ComponentMap(this.definition);
    }

    public getContactFields(): SearchResult[] {
        return this.components.getContactFields();
    }

    /**
     * Get the node with a uuid
     */
    public getNode(uuid: string): NodeProps {
        var details = this.components.getDetails(uuid)
        return this.definition.nodes[details.nodeIdx];
    }

    public getNodeUI(uuid: string): UINode {
        return this.definition._ui.nodes[uuid];
    }

    public getContactFieldURL() {
        return "";
    }

    public removeDragNode() {
        
    }

    public getDefinition(): FlowDefinition {
        return this.definition;
    }

    public addNode(props: NodeProps, current: FlowDefinition = null): FlowDefinition {

        var save = current == null;
        if (!current) {
            current = this.definition;
        }

        // add our node
        current = update(current, {nodes: {$push:[props]}});

        if (save) {
            current = this.updateDefinition(current);
        } else {
            this.components.initializeUUIDMap(current);
        }

        return current;

    }
    
    /**
     * Updates an action in our tree 
     * @param uuid the action to modify
     * @param changes immutability spec to modify at the given action
     */
    public updateAction(props: ActionProps, changes: any, current: FlowDefinition = null): FlowDefinition {
        console.time("updateAction");

        var save = current == null;
        if (!current) {
            current = this.definition;
        }

        var nodeUUID = null;
        if (props.node) {
            nodeUUID = props.node.uuid;
        }

        // realize our drag node if this is a new action
        /*var results = this.realizeGhostNode(props.node, current);
        if (results[1] != null) {
            current = results[0] as FlowDefinition;
            nodeUUID = results[1] as string;
            console.log("New node UUID: ", nodeUUID);
        }*/

        // update the action into our new flow definition
        let actionDetails = this.components.getDetails(props.uuid)
        if (actionDetails) {
            current = update(current, {
                nodes: {[actionDetails.nodeIdx]: {actions: {[actionDetails.actionIdx]: { $set: changes }}}}
            });
        } 
        else {
            // we didn't find our action, check if we can find the node
            let nodeDetails = this.components.getDetails(nodeUUID);
            if (nodeDetails) {
                current = update(current, { nodes:{ [nodeDetails.nodeIdx]: { actions: {
                    $push: [changes]
                }}}});
            } else {
                console.log("Couldn't find node, not updating", props.node, props.uuid);
            }
        }

        if (save) {
            current = this.updateDefinition(current);
        }

        console.timeEnd("updateAction");
        return current;
    }

    public updateDefinition(definition: FlowDefinition): FlowDefinition {
        this.definition = definition;

        // refresh our component map
        this.components.initializeUUIDMap(definition);

        if (this.saveMethod) {
            this.saveMethod(definition);
        }
        return this.definition;
    }

    /**
     * Update the definition for a node
     * @param uuid 
     * @param changes immutability spec to modify the node
     */
    updateNode(uuid: string, changes: any, current: FlowDefinition = null): FlowDefinition {
        var save = current == null;
        if (!current) {
            current = this.definition;
        }

        var index = this.components.getDetails(uuid).nodeIdx
        current = update(current, { nodes: { [index]: changes }});
        if (save) {
            return this.updateDefinition(current);
        }
        return current;
    }

    updateNodeUI(uuid: string, changes: any, current: FlowDefinition = null): FlowDefinition {
        var save = current == null;
        if (!current) {
            current = this.definition;
        }

        current = update(current, { _ui: { nodes: { [uuid]: changes }}});
        
        if (save) {
            return this.updateDefinition(current);
        }
        return current;
    }

    public removeNode(props: NodeProps, current: FlowDefinition = null): FlowDefinition {
        var save = current == null;
        if (!current) {
            current = this.definition;
        }

        let details = this.components.getDetails(props.uuid);
        let node = this.definition.nodes[details.nodeIdx];


        // if we have a single exit, map all our pointers to that destination
        var destination = null;        
        if (node.exits.length == 1) {
            destination = node.exits[0].destination
        }

        // remap all our pointers to our new destination, null some most cases
        for (let pointer of details.pointers) {
            current = this.updateExit(pointer, {$merge:{destination: destination}}, current);
        }

        // now remove ourselves
        current = update(current, {nodes:{ $splice: [[details.nodeIdx, 1]]}})

        if (save) {
            current = this.updateDefinition(current);
        }
        return current;
    }

    public removeAction(props: ActionProps, current: FlowDefinition = null): FlowDefinition {
        var save = current == null;
        if (!current) {
            current = this.definition;
        }

        let node = this.getNode(props.node.uuid);

        // if it's our last action, then nuke the node
        if (node.actions.length == 1) {
            current = this.removeNode(node, current);
        }

        // otherwise, just splice out that action
        else {
            let details = this.components.getDetails(props.uuid);
            current = this.updateNode(props.node.uuid, { actions: {$splice: [[details.actionIdx, 1]]}}, current)
        }

        if (save) {
            return this.updateDefinition(current);
        }

        return current;
    }

    /**
     * Updates the pending connection on this node. Once it is updated,
     * it will get wired up. We can then safely remove the pending connection and update
     * our node properties accordingly.
     * @param props with a pendingConnection set
     */
    public resolvePendingConnection(props: NodeProps): FlowDefinition {

        var current = this.definition;
        
        // only resolve connection if we have one
        if (props.pendingConnection != null) {
            let dragFrom = props.pendingConnection
            current = this.updateExit(dragFrom.exitUUID, { $merge:{ destination: props.uuid}}, current);

            // remove the pending connection from the to node
            let updated = update(props, {$merge:{pendingConnection: null}})
            delete updated["pendingConnection"]

            // update our node sans pending connection
            current = this.updateNode(props.uuid, {$set: updated}, current);

            // save our results
            current = this.updateDefinition(current);
        }
        return current;
    }

    /**
     * Updates an exit in our tree 
     * @param uuid the exit to modify
     * @param changes immutability spec to modify at the given exit
     */
    private updateExit(exitUUID: string, changes: any, current: FlowDefinition = null) {

        var save = current == null;
        if (current == null) {
            current = this.definition;
        }
        var details = this.components.getDetails(exitUUID);
        current = update(current, {
            nodes: {[details.nodeIdx]: { exits: { [details.exitIdx]: changes }}}
        });

        if (save) {
            return this.updateDefinition(current);
        }
        return current;
    }

    public updateConnection(source: string, target: string) {
        let nodeUUID = this.components.getDetails(source).nodeUUID;
        this.updateExit(source, {$merge:{destination: target}});
    }

    public getComponents() {
        return this.components;
    }

    public addContactField(field: SearchResult) {
        this.components.addContactField(field);
    }


}

export default FlowMutator;