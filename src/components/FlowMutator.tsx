import {FlowDefinition, NodeProps, UIMetaDataProps, ActionProps, SearchResult, UINode, DragPoint} from '../interfaces';
import NodeComp from './NodeComp';
import ComponentMap from './ComponentMap';
var update = require('immutability-helper');
var UUID = require('uuid');

var UI_QUIET = 0;
var SAVE_QUIET = 0;

export class FlowMutator {
    
    private definition: FlowDefinition;
    private components: ComponentMap;
    private saveMethod: Function;
    private updateMethod: Function;

    private dirty: boolean;
    private uiTimeout: any;
    private saveTimeout: any;

    private quietUI: number;
    private quietSave: number;
    
    constructor(definition: FlowDefinition, 
                updateMethod: Function = null, 
                saveMethod: Function = null,
                quiteUI = 0, quietSave=0) {
        this.definition = definition;
        this.saveMethod = saveMethod;
        this.updateMethod = updateMethod;
        this.components = new ComponentMap(this.definition);

        this.quietUI = quiteUI;
        this.quietSave = quietSave;
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
                
                this.uiTimeout = window.setTimeout(()=>{
                    this.updateMethod(this.definition);
                }, UI_QUIET);

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

                this.saveTimeout = window.setTimeout(()=>{
                    this.saveMethod(this.definition);
                    this.dirty = false;
                }, SAVE_QUIET);
            } else {
                this.saveMethod(this.definition);
                this.dirty = false;
            }
        } else {
            this.dirty = false;
        }
    }

    public addNode(props: NodeProps) {
        // add our node
        this.definition = update(this.definition, {nodes: {$push:[props]}});
        this.components.initializeUUIDMap(this.definition);
        this.markDirty();
    }
    
    /**
     * Updates an action in our tree 
     * @param uuid the action to modify
     * @param changes immutability spec to modify at the given action
     */
    public updateAction(props: ActionProps, changes: any) {
        console.time("updateAction");

        // update the action into our new flow definition
        let actionDetails = this.components.getDetails(props.uuid)
        if (actionDetails) {
            this.definition = update(this.definition, {
                nodes: {[actionDetails.nodeIdx]: {actions: {[actionDetails.actionIdx]: { $set: changes }}}}
            });
        } 
        else {

            var nodeUUID = props.node.uuid;
            // we didn't find our action, check if we can find the node
            let nodeDetails = this.components.getDetails(nodeUUID);
            if (nodeDetails) {
                this.definition = update(this.definition, { nodes:{ [nodeDetails.nodeIdx]: { actions: {
                    $push: [changes]
                }}}});
            } else {
                console.log("Couldn't find node, not updating", props.node, props.uuid);
            }
        }

        this.markDirty();
        console.timeEnd("updateAction");
    }

    /**
     * Update the definition for a node
     * @param uuid 
     * @param changes immutability spec to modify the node
     */
    updateNode(uuid: string, changes: any) {
        var index = this.components.getDetails(uuid).nodeIdx
        this.definition = update(this.definition, { nodes: { [index]: changes }});
        this.markDirty();
    }

    updateNodeUI(uuid: string, changes: any){
        this.definition = update(this.definition, { _ui: { nodes: { [uuid]: changes }}});
        this.markDirty();        
    }

    public removeNode(props: NodeProps) {

        let details = this.components.getDetails(props.uuid);
        let node = this.definition.nodes[details.nodeIdx];

        // if we have a single exit, map all our pointers to that destination
        var destination = null;        
        if (node.exits.length == 1) {
            destination = node.exits[0].destination
        }

        // remap all our pointers to our new destination, null some most cases
        for (let pointer of details.pointers) {
            this.updateExit(pointer, {$merge:{destination: destination}});
        }

        // now remove ourselves
        this.definition = update(this.definition, {nodes:{ $splice: [[details.nodeIdx, 1]]}})
        this.components.initializeUUIDMap(this.definition);
        this.markDirty();
    }

    public removeAction(props: ActionProps) {
        let details = this.getComponents().getDetails(props.uuid);
        let node = this.definition.nodes[details.nodeIdx];

        // if it's our last action, then nuke the node
        if (node.actions.length == 1) {
            this.removeNode(node);
        }

        // otherwise, just splice out that action
        else {
            let details = this.components.getDetails(props.uuid);
            this.updateNode(node.uuid, { actions: {$splice: [[details.actionIdx, 1]]}})
        }

        this.markDirty();
    }

    /**
     * Updates the pending connection on this node. Once it is updated,
     * it will get wired up. We can then safely remove the pending connection and update
     * our node properties accordingly.
     * @param props with a pendingConnection set
     */
    public resolvePendingConnection(props: NodeProps) {

        // only resolve connection if we have one
        if (props.pendingConnection != null) {
            let dragFrom = props.pendingConnection
            this.updateExit(dragFrom.exitUUID, { $merge:{ destination: props.uuid}});

            // remove the pending connection from the to node
            let updated = update(props, {$merge:{pendingConnection: null}})
            delete updated["pendingConnection"]

            // update our node sans pending connection
            this.updateNode(props.uuid, {$set: updated});
            this.markDirty();            
        }
    }

    /**
     * Updates an exit in our tree 
     * @param uuid the exit to modify
     * @param changes immutability spec to modify at the given exit
     */
    private updateExit(exitUUID: string, changes: any) {

        var details = this.components.getDetails(exitUUID);
        this.definition = update(this.definition, {
            nodes: {[details.nodeIdx]: { exits: { [details.exitIdx]: changes }}}
        });

        this.markDirty();
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