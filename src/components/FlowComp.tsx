import * as React from 'react';
import * as Interfaces from '../interfaces';

import NodeComp from './NodeComp';
import Plumber from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import SimulatorComp from './SimulatorComp';
import Config from '../services/Config';
import NodeModal from './NodeModal';
import {FlowDefinition} from '../interfaces';


var UUID = require('uuid');

var update = require('immutability-helper');
var forceFetch = false;


export interface FlowProps {
    flowURL: string;
    engineURL: string;
    contactsURL: string;
    fieldsURL: string;
}

export interface FlowState {
    definition?: FlowDefinition;
    draggingFrom: Interfaces.DragPoint;
    loading: boolean;

    contactFields?: Interfaces.SearchResult[];
    groups?: Interfaces.SearchResult[];
}

interface Connection {
    previousConnection: Connection;
}

interface ConnectionEvent {
    connection: Connection;
    source: Element;
    target: Element;
    sourceId: string;
    targetId: string;
}

/**
 * Our top level flow. This class is responsible for state and 
 * calling into our Plumber as necessary.
 */
export class FlowComp extends React.PureComponent<FlowProps, FlowState> {

    private ghostNode: NodeComp;
    private promises: any[] = [];
    private newActionModal: NodeModal;

    static childContextTypes = {
        flow: React.PropTypes.object
    }

    constructor(props: FlowProps) {
        super(props);

        this.state = {
            draggingFrom: null,
            loading: true
        }

        this.onConnectionDrag = this.onConnectionDrag.bind(this);
    }

    getChildContext(): Interfaces.FlowContext {
        return {
            flow: this
        }
    }

    public getContactFields() {
        return this.state.contactFields;
    }

    public openNewActionModal(nodeUUID: string){
        this.newActionModal.editNewAction(nodeUUID);
    }

    /**
     * Get the current indexes to our action 
     * TODO: make this not dumb
     * @param uuid of the action
     */
    getActionIndexes(definition: FlowDefinition, nodeUUID: string, actionUUID: string): number[] {
        var nodeIdx: number = -1;
        var actionIdx: number = -1;

        for (let i in definition.nodes) {
            var node = definition.nodes[i];
            if (node.uuid == nodeUUID) {
                nodeIdx = parseInt(i);
                for (let j in node.actions) {
                    if (node.actions[j].uuid == actionUUID) {
                        actionIdx = parseInt(j);
                    }
                }
            }
        } 
        return [nodeIdx, actionIdx];
    }

    /**
     * Get the current indexes to our exit
     * TODO: make this not terrible
     * @param uuid of the exit
     */
    getExitIndexes(nodeUUID: string, exitUUID: string): number[] {
        var nodeIdx: number = -1;
        var exitIdx: number = -1;

        for (let i in this.state.definition.nodes) {
            var node = this.state.definition.nodes[i];
            if (node.uuid == nodeUUID) {
                nodeIdx = parseInt(i);
                for (let j in node.exits) {
                    if (node.exits[j].uuid == exitUUID) {
                        exitIdx = parseInt(j);
                    }
                }
            }
        } 
        return [nodeIdx, exitIdx];     
    }

    /**
     * Get the current index for a given node
     * TODO: be less dumb
     * @param uuid of the node
     */
    getNodeIndex(uuid: string): number {
        for (let i in this.state.definition.nodes){
            var node = this.state.definition.nodes[i];
            if (node.uuid == uuid) {
                return parseInt(i);
            }
        }
    }

    /**
     * Get the node with a uuid
     */
    getNode(uuid: string): Interfaces.NodeProps {
        return this.state.definition.nodes[this.getNodeIndex(uuid)];
    }

    getNodeUI(uuid: string): Interfaces.UINode {
        return this.state.definition._ui.nodes[uuid];
    }

    /**
     * Update the definition for a node
     * @param uuid 
     * @param changes immutability spec to modify the node
     */
    updateNode(uuid: string, changes: any, current: FlowDefinition = null) {
        var save = current == null;
        if (!current) {
            current = this.state.definition;
        }

        var index = this.getNodeIndex(uuid);
        current = update(current, { nodes: { [index]: changes }});
        if (save) {
            return this.updateDefinition(current);
        }
        return current;
    }

    updateNodeUI(uuid: string, changes: any, current: FlowDefinition = null) {
        var save = current == null;
        if (!current) {
            current = this.state.definition;
        }
        current = update(current, { _ui: { nodes: { [uuid]: changes }}});
        if (save) {
            return this.updateDefinition(current);
        }
        return current;
    }

    /**
     * Updates an action in our tree 
     * @param uuid the action to modify
     * @param changes immutability spec to modify at the given action
     */
    updateAction(props: Interfaces.ActionProps, changes: any, current: FlowDefinition = null): FlowDefinition {

        var save = current == null;
        var nodeUUID = props.nodeUUID;
        if (!current) {
            current = this.state.definition;
        }

        // realize our drag node if this is a new action
        var results = this.realizeGhostNode(props.uuid, current);
        if (results[1] != null) {
            current = results[0] as FlowDefinition;
            nodeUUID = results[1] as string;
        }

        // update the action into our new flow definition
        var indexes = this.getActionIndexes(current, nodeUUID, props.uuid);
        let nodeIdx = indexes[0];
        let actionIdx = indexes[1];

        // found our node, but not our action
        if (nodeIdx != -1 && actionIdx == -1) {
            current = update(current, { nodes:{ [nodeIdx]: { actions: {
                $push: [changes]
            }}}});
        } 
        else if (nodeIdx != -1 && actionIdx != -1) {
            current = update(current, {
                nodes: {[nodeIdx]: {actions: {[actionIdx]: { $set: changes }}}}
            });
        } else {
            console.log("Couldn't find node, not updating", props.nodeUUID, props.uuid);
        }

        if (save) {
            return this.updateDefinition(current);
        }

        return current;
    }

    /**
     * If the inbound uuid belongs to our drag node, turn it into a real node
     * @param uuid for the node or action being updated
     * @returns [newDefinition, newUuid]
     */
    realizeGhostNode(uuid: string, current: FlowDefinition): any {
        var newUuid = null;

        if (this.ghostNode && (this.ghostNode.props.uuid == uuid || this.ghostNode.props.actions[0].uuid == uuid)) {

            newUuid = UUID.v4();
            var newNode = update(this.ghostNode.props, {
                $merge:{
                    uuid: newUuid,
                    pendingConnection: this.state.draggingFrom
                },
            });

            // no longer a ghost node
            delete newNode["ghost"]

            // now push the new node on our current definition
            current = update(current, {
                nodes: {$push: [newNode]}
            });

            // update our props with our current location
            var offset = $(this.ghostNode.ele).offset();
            current = this.updateNodeUI(newUuid, {
                $set: { position: {
                        x: offset.left,
                        y: offset.top
                    }}}
            , current);
        }
        return [current, newUuid];
    }

    /**
     * Updates the exist for the pending connection on this node. Once it is updated,
     * it will get wired up. We can then safely remove the pending connection and update
     * our node properties accordingly.
     * @param props with a pendingConnection set
     */
    resolvePendingConnection(props: Interfaces.NodeProps) {

        var current = this.state.definition;
        
        // only resolve connection if we have one
        if (props.pendingConnection != null) {
            let dragFrom = props.pendingConnection
            current = this.updateExit(dragFrom.nodeUUID, dragFrom.exitUUID, { $merge:{ destination: props.uuid}}, this.state.definition);

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
    updateExit(nodeUUID: string, exitUUID: string, changes: any, current: FlowDefinition = null) {

        // console.log('exit', uuid, changes);

        var save = current == null;
        if (current == null) {
            current = this.state.definition;
        }

        var indexes = this.getExitIndexes(nodeUUID, exitUUID);
        current = update(current, {
            nodes: {[indexes[0]]: { exits: {[indexes[1]]: changes }}}
        });

        if (save) {
            return this.updateDefinition(current);
        }
        return current;
    }

    /**
     * Updates our definition, saving it in the store
     * @param definition the new definition 
     */
    private updateDefinition(definition: FlowDefinition) {
        FlowStore.get().save(definition);
        this.setState({definition: definition, draggingFrom: null});
        return definition;
    }

    public removeDragNode() {
        this.setState({draggingFrom: null});
    }

    componentDidMount() {
        var promise = FlowStore.get().loadFlow(this.props.flowURL, (definition: FlowDefinition)=>{
            this.setDefinition(definition);
        }, forceFetch);

        this.promises.push(promise);
        var plumb = Plumber.get();

        plumb.bind("connection", (event: ConnectionEvent) => { return this.onConnection(event)});
        plumb.bind("connectionMoved", (event: ConnectionEvent) => { return this.onConnectionMoved(event)});
        plumb.bind("connectionDrag", (event: ConnectionEvent) => { return this.onConnectionDrag(event)});
        plumb.bind("connectionDragStop", (event: ConnectionEvent) => { return this.onConnectorDrop(event)});
        plumb.bind("beforeDrop", (event: ConnectionEvent) => { return this.onBeforeConnectorDrop(event)});
        
        plumb.bind("connectionDetached", (event: ConnectionEvent) => { return this.onConnectionDetached(event); });
        plumb.bind("connectionAborted", (event: ConnectionEvent) => { return this.onConnectionAborted(event); });
        
    }

    componentWillUpdate(nextProps: FlowProps, nextState: FlowState) {
    }

    componentDidUpdate(prevProps: FlowProps, prevState: FlowState) {
        if (this.state.definition) {
            if (!prevState.definition) {

                var fields: {[id:string]:Interfaces.SearchResult} = {}
                var groups: {[id:string]:Interfaces.Group} = {}

                for (let node of this.state.definition.nodes) {
                    if (node.actions) {
                        for (let action of node.actions) {
                            if (action.type == 'save_to_contact') {
                                var saveProps = action as Interfaces.SaveToContactProps;
                                if (!(saveProps.field in fields)) {
                                    fields[saveProps.field] = { id: saveProps.field, name: saveProps.name, type: "field" }
                                }
                            } else if (action.type == 'add_group') {
                                var addGroupProps = action as Interfaces.AddToGroupProps;
                                if (!(addGroupProps.uuid in groups)) {
                                    groups[addGroupProps.uuid] = { uuid: addGroupProps.uuid, name: addGroupProps.name}
                                }
                            }
                        }
                    }
                }

                var contactFields: Interfaces.SearchResult[] = []
                for (var key in fields) {
                    contactFields.push(fields[key]);
                }

                Plumber.get().connectAll(this.state.definition, ()=>{
                    console.log("Connecting everything..");
                    this.setState({loading: false, contactFields: contactFields});
                    Plumber.get().repaint();
                });
            }
        }

        if (this.ghostNode && prevState.draggingFrom && !this.state.draggingFrom) {
            Plumber.get().detach(prevState.draggingFrom.exitUUID, this.ghostNode.props.uuid);
        }
    }

    /**
     * Gets a node UUID given an exit UUID.
     * @param exitUUID 
     */
    private getNodeUUIDForExit(exitUUID: string) {
        // TODO: yuk.. encode stuff so jsPlumb can give us both ids please        
        return $('#' + exitUUID).parents(".node").attr("id");

    }

    /**
     * Adds a contact field option
     */
    public addContactField(field: Interfaces.SearchResult) {
        // normally you want to use setState, but we explicitly 
        // don't care about re-renders here
        this.state.contactFields.push(field);
    }

    /**
     * Called right before a connector is dropped onto an existing node
     */
    onBeforeConnectorDrop(event: ConnectionEvent) {

        // no longer have a ghost
        this.ghostNode = null;
        
        return true;
    }


    onConnection(event: ConnectionEvent) {
        // console.log('onConnection', event);
        var nodeUUID = this.getNodeUUIDForExit(event.sourceId);
        this.updateExit(nodeUUID, event.sourceId, {$merge:{destination: event.targetId}});
    }
    
    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event 
     */
    onConnectionDrag(event: ConnectionEvent) {

        // yuk, this is a border crossing from jsplumb / jquery land
        var nodeUUID = this.getNodeUUIDForExit(event.sourceId);

        this.setState({draggingFrom: {exitUUID: event.sourceId, nodeUUID: nodeUUID}});

        // move our drag node around as necessary
        $(document).bind('mousemove', (e) => {
            if (this.ghostNode) {
                var ele = $(this.ghostNode.ele);
                var left = e.pageX - (ele.width() / 2);
                var top = e.pageY;
                $(this.ghostNode.ele).offset({left, top});
            } else {
                $(document).unbind('mousemove');
            }
        });
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    onConnectorDrop(event: ConnectionEvent) {

        if (this.ghostNode != null) {
            Plumber.get().connectNewNode(event.sourceId, this.ghostNode.props.uuid);
            this.ghostNode.onClick(null);
        } else {
            this.setState({draggingFrom: null});
        }

        $(document).unbind('mousemove');
        
        // this.dragNode.onClick({target: 'blerg'});
        // this.setState({draggingFrom: null});
        // this.dragNode = null;
    }

    onConnectionMoved(event: ConnectionEvent){
        // console.log('onConnectionMoved', event);
    }

    onConnectionDetached(event: ConnectionEvent) {
        // console.log('onConnectionDetached', event);
    }

    onConnectionAborted(event: ConnectionEvent) {
        // console.log('onConnectionAborted');
    }

    setDefinition(definition: FlowDefinition) {
        this.setState({definition: definition});
    }

    private createGhostNode() {
        if (this.state.draggingFrom) {
            var fromNode = this.getNode(this.state.draggingFrom.nodeUUID);
            var nodeUUID = UUID.v4();

            var props = {
                uuid: nodeUUID,
                actions: [],

                exits: [{
                    "uuid": UUID.v4(),
                    "destination": null
                }],
            } as Interfaces.NodeProps;

            // add an action if we are coming from a split
            if (fromNode.exits.length > 1) {
                props.actions.push({
                    nodeUUID: nodeUUID,
                    uuid: UUID.v4(),
                    type: "msg"
                } as Interfaces.SendMessageProps);
            } 
            // otherwise we are going to a switch
            else {
                props['router'] = {type:"switch"}
            }

            // create our new node offscreen
            // var ui = {position:{x:-2000, y:-2000}};
            let fromPosition = this.getNodeUI(this.state.draggingFrom.nodeUUID).position;
            let ghostPosition = update(fromPosition, {$merge:{y: fromPosition.y + 2000}});

            return <NodeComp ref={(ele) => {this.ghostNode = ele}} ghost={true} _ui={{position: ghostPosition}} {...props}/>
        }
    }

    render() {
        var nodes: JSX.Element[] = [];
        if (this.state.definition) {
            for (let node of this.state.definition.nodes) {
                var uiNode = this.state.definition._ui.nodes[node.uuid];
                nodes.push(<NodeComp {...node} _ui={uiNode} key={node.uuid}/>)
            }
        }

        var dragNode = null;
        if (this.state.draggingFrom) {
            dragNode = this.createGhostNode();
        }

        // create our empty modal for creating new actions
        // let config = Config.get().getTypeConfig("msg");
        // let renderer = new config.renderer({type:"msg", uuid:UUID.v4()}, this.getChildContext());
        let modal = <NodeModal 
                ref={(ele: any) => {this.newActionModal = ele}}
                initial={{type:"msg", uuid:UUID.v4()}}
                context={this.getChildContext()}
                changeType={true}
        />

        console.log('##################### Rendering flow');
        return(
            <div>
                {/*<SimulatorComp engineURL={this.props.engineUrl}/>*/}
                <div id="flow" className={this.state.loading ? "loading" : ""}>
                    <div className="nodes">
                    {nodes}
                    {dragNode}
                    {modal}
                    </div>
                </div>
                
            </div>
        )
    }
}

export default FlowComp;