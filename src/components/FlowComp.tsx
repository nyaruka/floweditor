import * as React from 'react';
import * as Interfaces from '../interfaces';

import NodeComp from './NodeComp';
import Plumber from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import SimulatorComp from './SimulatorComp';
import Config from '../services/Config';
import NodeModal from './NodeModal';
import ComponentMap from './ComponentMap';
import {FlowDefinition} from '../interfaces';

var UUID = require('uuid');
let PropTypes = require("prop-types");
var update = require('immutability-helper');
var forceFetch = true;


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
    private components: ComponentMap;

    static childContextTypes = {
        flow: PropTypes.object
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

    public getContactFields(): Interfaces.SearchResult[] {
        return this.components.getContactFields();
    }

    public openNewActionModal(nodeUUID: string){
        this.newActionModal.editNewAction(nodeUUID);
    }

    /**
     * Get the node with a uuid
     */
    private getNode(uuid: string): Interfaces.NodeProps {
        var details = this.components.getDetails(uuid)
        return this.state.definition.nodes[details.nodeIdx];
    }

    private getNodeUI(uuid: string): Interfaces.UINode {
        return this.state.definition._ui.nodes[uuid];
    }

    /**
     * Update the definition for a node
     * @param uuid 
     * @param changes immutability spec to modify the node
     */
    updateNode(uuid: string, changes: any, current: FlowDefinition = null): FlowDefinition {
        var save = current == null;
        if (!current) {
            current = this.state.definition;
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
            current = this.state.definition;
        }
        current = update(current, { _ui: { nodes: { [uuid]: changes }}});
        if (save) {
            return this.updateDefinition(current);
        }
        return current;
    }

    public removeNode(props: Interfaces.NodeProps, current: FlowDefinition = null): FlowDefinition {
        var save = current == null;
        if (!current) {
            current = this.state.definition;
        }

        let details = this.components.getDetails(props.uuid);
        let node = this.state.definition.nodes[details.nodeIdx];


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

    public removeAction(props: Interfaces.ActionProps, current: FlowDefinition = null): FlowDefinition {
        var save = current == null;
        if (!current) {
            current = this.state.definition;
        }

        let node = this.getNode(props.nodeUUID);

        // if it's our last action, then nuke the node
        if (node.actions.length == 1) {
            current = this.removeNode(node, current);
        }

        // otherwise, just splice out that action
        else {
            let details = this.components.getDetails(props.uuid);
            current = this.updateNode(props.nodeUUID, { actions: {$splice: [[details.actionIdx, 1]]}}, current)
        }

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
        console.time("updateAction");
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
        let actionDetails = this.components.getDetails(props.uuid)
        if (actionDetails) {
            current = update(current, {
                nodes: {[actionDetails.nodeIdx]: {actions: {[actionDetails.actionIdx]: { $set: changes }}}}
            });
        } 
        else {
            // we didn't find our action, but did find our node, it's an action add
            let nodeDetails = this.components.getDetails(nodeUUID);
            if (nodeDetails) {
                current = update(current, { nodes:{ [nodeDetails.nodeIdx]: { actions: {
                    $push: [changes]
                }}}});
            } else {
                console.log("Couldn't find node, not updating", props.nodeUUID, props.uuid);
            }
        }

        if (save) {
            console.timeEnd("updateAction");
            return this.updateDefinition(current);
        }

        console.timeEnd("updateAction");
        return current;
    }

    /**
     * If the inbound uuid belongs to our drag node, turn it into a real node
     * @param uuid for the node or action being updated
     * @returns [newDefinition, newUuid]
     */
    private realizeGhostNode(uuid: string, current: FlowDefinition): any {
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
    public resolvePendingConnection(props: Interfaces.NodeProps): FlowDefinition {

        var current = this.state.definition;
        
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
            current = this.state.definition;
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

    /**
     * Updates our definition, saving it in the store
     * @param definition the new definition 
     */
    private updateDefinition(definition: FlowDefinition) {

        // TODO: lets just update this instead of creating it again
        this.components.initializeUUIDMap(definition);
        FlowStore.get().save(definition);
        this.setState({definition: definition, draggingFrom: null});
        return definition;
    }

    public removeDragNode() {
        this.setState({draggingFrom: null});
    }

    private componentDidMount() {
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

    private componentWillUpdate(nextProps: FlowProps, nextState: FlowState) {
        if (!this.state.definition && nextState.definition) {
            this.components = new ComponentMap(nextState.definition);
        }
    }

    private componentDidUpdate(prevProps: FlowProps, prevState: FlowState) {

        if (this.state.definition) {
            if (!prevState.definition) {
                Plumber.get().connectAll(this.state.definition, ()=>{
                    console.log("Connecting everything..");
                    this.setState({loading: false});
                    Plumber.get().repaint();
                });
            }
        }

        if (this.ghostNode && prevState.draggingFrom && !this.state.draggingFrom) {
            Plumber.get().detach(prevState.draggingFrom.exitUUID, this.ghostNode.props.uuid);
        }
    }

    /**
     * Adds a contact field option
     */
    public addContactField(field: Interfaces.SearchResult) {
        // normally you want to use setState, but we explicitly 
        // don't care about re-renders here
        this.components.addContactField(field);
    }

    /**
     * Called right before a connector is dropped onto an existing node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent) {

        // no longer have a ghost
        this.ghostNode = null;
        
        return true;
    }


    private onConnection(event: ConnectionEvent) {
        // console.log('onConnection', event);
        let nodeUUID = this.components.getDetails(event.sourceId).nodeUUID;
        this.updateExit(event.sourceId, {$merge:{destination: event.targetId}});
    }
    
    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event 
     */
    private onConnectionDrag(event: ConnectionEvent) {

        var nodeUUID = this.components.getDetails(event.sourceId).nodeUUID;
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
    private onConnectorDrop(event: ConnectionEvent) {

        if (this.ghostNode != null) {
            Plumber.get().connectNewNode(event.sourceId, this.ghostNode.props.uuid);
            this.ghostNode.onClick(null);
        } else {
            this.setState({draggingFrom: null});
        }

        $(document).unbind('mousemove');
    }

    private onConnectionMoved(event: ConnectionEvent){
        // console.log('onConnectionMoved', event);
    }

    private onConnectionDetached(event: ConnectionEvent) {
        // console.log('onConnectionDetached', event);
    }

    private onConnectionAborted(event: ConnectionEvent) {
        // console.log('onConnectionAborted');
    }

    private setDefinition(definition: FlowDefinition) {
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