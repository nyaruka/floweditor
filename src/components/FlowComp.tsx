import * as React from 'react';
import * as Interfaces from '../interfaces';

import NodeComp from './NodeComp';
import Plumber from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import SimulatorComp from './SimulatorComp';
import Config from '../services/Config';
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
    draggingFrom: string;
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

    private dragNode: NodeComp;
    private promises: any[] = [];

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

    /**
     * Get the current indexes to our action 
     * TODO: make this not dumb
     * @param uuid of the action
     */
    getActionIndexes(definition: FlowDefinition, uuid: string): number[] {
        var nodeIdx: number = -1;
        var actionIdx: number = -1;

        for (let i in definition.nodes) {
            var node = definition.nodes[i];
            for (let j in node.actions) {
                if (node.actions[j].uuid == uuid) {
                    nodeIdx = parseInt(i);
                    actionIdx = parseInt(j);
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
    getExitIndexes(uuid: string): number[] {
        var nodeIdx: number = -1;
        var exitIdx: number = -1;

        for (let i in this.state.definition.nodes) {
            var node = this.state.definition.nodes[i];
            for (let j in node.exits) {
                if (node.exits[j].uuid == uuid) {
                    nodeIdx = parseInt(i);
                    exitIdx = parseInt(j);
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
        return this.state.definition.nodes[this.getExitIndexes(uuid)[0]];
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
    updateAction(uuid: string, changes: any, current: FlowDefinition = null): FlowDefinition {

        var save = current == null;
        if (!current) {
            current = this.state.definition;
        }

        // realize our drag node if this is a new action
        var results = this.realizeDragNode(uuid, current);
        var current = results[0] as FlowDefinition;
        var newUuid = results[1] as string;

        // update the action into our new flow definition
        var indexes = this.getActionIndexes(current, uuid);
        current = update(current, {
            nodes: {[indexes[0]]: {actions: {[indexes[1]]: changes }}}
        });

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
    realizeDragNode(uuid: string, current: FlowDefinition): any {
        var newUuid = null;

        if (this.dragNode && (this.dragNode.props.uuid == uuid || this.dragNode.props.actions[0].uuid == uuid)) {

            newUuid = UUID.v4();
            var newNode = update(this.dragNode.props, {
                $merge:{
                    uuid: newUuid,
                    drag: false,
                    pendingConnection: this.state.draggingFrom
                },
            });

            // now push the new node on our current definition
            current = update(current, {
                nodes: {$push: [newNode]}
            });

            // update our props with our current location
            var offset = $(this.dragNode.ele).offset();
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
     * Updates an exit in our tree 
     * @param uuid the exit to modify
     * @param changes immutability spec to modify at the given exit
     */
    updateExit(uuid: string, changes: any, current: FlowDefinition = null) {

        // console.log('exit', uuid, changes);

        var save = current == null;
        if (current == null) {
            current = this.state.definition;
        }

        var indexes = this.getExitIndexes(uuid);
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
                Plumber.get().connectAll(this.state.definition, ()=>{
                    console.log("Connecting everything..");
                    this.setState({loading: false});
                    Plumber.get().repaint();
                });
            }
        }

        if (prevState.draggingFrom && !this.state.draggingFrom) {
            // console.log('no longer dragging, detaching from');
            Plumber.get().detach(prevState.draggingFrom, 'drag-node');
        }
    }

    /**
     * Called right before a connector is dropped onto an existing node
     */
    onBeforeConnectorDrop(event: ConnectionEvent) {
        // console.log('onBeforeConnectionDrop', event);
        return true;
    }


    onConnection(event: ConnectionEvent) {
        // console.log('onConnection', event);
        this.updateExit(event.sourceId, {$merge:{destination: event.targetId}});
    }
    
    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event 
     */
    onConnectionDrag(event: ConnectionEvent) {

        // mark that we are dragging a connection from somewhere
        console.log("Setting drag from", event.sourceId);
        this.setState({draggingFrom: event.sourceId});

        // move our drag node around as necessary
        $(document).bind('mousemove', (e) => {
            if (this.dragNode) {
                var ele = $(this.dragNode.ele);
                var left = e.pageX - (ele.width() / 2);
                var top = e.pageY;
                $(this.dragNode.ele).offset({left, top});
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

        // console.log('onConnectorDrop', event);

        // if we drop in open space, we get a source id but no source
        let isNewNode = this.dragNode != null; // event.sourceId && !event.source

        // console.log("isNewNode", isNewNode, $(event.target));

        if (isNewNode) {
            Plumber.get().connect(event.sourceId, this.dragNode.props.uuid);
            Plumber.get().repaint();
            this.dragNode.setEditing(true);
            this.dragNode.onClick(null);
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

    private createDragNode() {
        if (this.state.draggingFrom) {

            console.log("Creating a drag node..");

            var fromNode = this.getNode(this.state.draggingFrom);

            var props = {
                uuid: UUID.v4(),
                actions: [],

                exits: [{
                    "uuid": UUID.v4(),
                    "destination": null
                }],
            } as Interfaces.NodeProps;

            // add an action if we are coming from a split
            if (fromNode.exits.length > 1) {
                props.actions.push({
                    uuid: UUID.v4(),
                    type: "msg"
                } as Interfaces.SendMessageProps);
            } 
            // otherwise we are going to a switch
            else {
                props['router'] = {type:"switch"}
            }

            // create our new node offscreen
            var ui = {position:{x:-2000, y:0}};
            
            return <NodeComp ref={(ele) => {this.dragNode = ele}} drag={true} _ui={ui} {...props}/>
        }
    }

    render() {
        var nodes: JSX.Element[] = [];
        var config = Config.get();

        if (this.state.definition) {
            for (let node of this.state.definition.nodes) {
                var uiNode = this.state.definition._ui.nodes[node.uuid];
                nodes.push(<NodeComp {...node} _ui={uiNode} key={node.uuid}/>)
            }
        }

        var dragNode = null;
        if (this.state.draggingFrom) {
            dragNode = this.createDragNode();
        }

        console.log('##################### Rendering flow');
        return(
            <div>
                {/*<SimulatorComp engineURL={this.props.engineUrl}/>*/}
                <div id="flow" className={this.state.loading ? "loading" : ""}>
                    <div className="nodes">
                    {nodes}
                    {dragNode}
                    </div>
                </div>
                
            </div>
        )
    }
}

export default FlowComp;