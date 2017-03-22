import * as React from 'react';
import * as Interfaces from '../interfaces';

import NodeComp from './NodeComp';
import Plumber from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import SimulatorComp from './SimulatorComp';
import Config from '../services/Config';
var UUID = require('uuid');

var update = require('immutability-helper');
var forceFetch = true;

export interface FlowProps {
    url: string;
    engineUrl: string;
}

export interface FlowState {
    definition?: Interfaces.FlowDefinition;
    draggingFrom: Interfaces.NodeProps;
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

    // private ghostProps = { uuid={UUID.v4()} _ui={{ location: { x: 0, y: 0}} as Interfaces.UIMetaDataProps} key={Math.random()}};

    private dragNode: NodeComp;
    private promises: any[] = [];

    static childContextTypes = {
        flow: React.PropTypes.object
    }

    getChildContext(): Interfaces.FlowContext {
        return {
            flow: this
        }
    }

    constructor(props: FlowProps) {
        super(props);
        this.state = {
            draggingFrom: null
        }

        this.onConnectionDrag = this.onConnectionDrag.bind(this);
    }

    /**
     * Get the current indexes to our action 
     * TODO: make this not dumb
     * @param uuid of the action
     */
    getActionIndexes(uuid: string): number[] {
        var nodeIdx: number = -1;
        var actionIdx: number = -1;

        for (let i in this.state.definition.nodes) {
            var node = this.state.definition.nodes[i];
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
    updateNode(uuid: string, changes: any) {
        var index = this.getNodeIndex(uuid);
        var updated = update(this.state.definition, { nodes: { [index]: changes }});
        this.updateDefinition(updated);
    }

    /**
     * Updates an action in our tree 
     * @param uuid the action to modify
     * @param changes immutability spec to modify at the given action
     */
    updateAction(uuid: string, changes: any) {
        var indexes = this.getActionIndexes(uuid);
        var updated = update(this.state.definition, {
            nodes: {[indexes[0]]: {actions: {[indexes[1]]: changes }}}
        });
        this.updateDefinition(updated);
    }

    /**
     * Updates an exit in our tree 
     * @param uuid the exit to modify
     * @param changes immutability spec to modify at the given exit
     */
    updateExit(uuid: string, changes: any) {
        var indexes = this.getExitIndexes(uuid);
        var updated = update(this.state.definition, {
            nodes: {[indexes[0]]: { exits: {[indexes[1]]: changes }}}
        });
        this.updateDefinition(updated);
    }

    /**
     * Updates our definition, saving it in the store
     * @param definition the new definition 
     */
    private updateDefinition(definition: Interfaces.FlowDefinition) {
        FlowStore.get().save(definition);
        this.setState({definition: definition});
    }

    componentDidMount() {
        var promise = FlowStore.get().loadFlow(this.props.url, (definition: Interfaces.FlowDefinition)=>{
            this.setDefinition(definition);
        }, forceFetch);

        this.promises.push(promise);
        var plumb = Plumber.get();

        plumb.bind("connection", (event: ConnectionEvent) => {this.onConnection(event)});
        plumb.bind("connectionMoved", (event: ConnectionEvent) => {this.onConnectionMoved(event)});
        plumb.bind("connectionDrag", (event: ConnectionEvent) => {this.onConnectionDrag(event)});
        plumb.bind("connectionDragStop", (event: ConnectionEvent) => {this.onConnectorDrop(event)});
        // plumb.bind("beforeDrop", (event: ConnectionEvent) => {this.onBeforeConnectorDrop(event)});
        
        plumb.bind("connectionDetached", (event: ConnectionEvent) => {this.onConnectionDetached(event); });
        plumb.bind("connectionAborted", (event: ConnectionEvent) => {this.onConnectionAborted(event); });
        
    }

    componentWillUpdate(nextProps: FlowProps, nextState: FlowState) {
    }

    componentDidUpdate(prevProps: FlowProps, prevState: FlowState) {
        if (this.state.definition) {
            if (!prevState.definition) {
                var plumb = Plumber.get();
                plumb.connectAll(this.state.definition);
            }
        }
    }

    /**
     * Called right before a connector is dropped onto an existing node
     */
    onBeforeConnectorDrop(event: ConnectionEvent) {
        console.log('onBeforeConnectionDrop', event);
        return true;
    }


    onConnection(event: ConnectionEvent) {
        console.log('onConnection', event);
        this.updateExit(event.sourceId, {$merge:{destination: event.targetId}});
    }
    
    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event 
     */
    onConnectionDrag(event: ConnectionEvent) {

        // mark that we are dragging a connection from somewhere
        this.setState({draggingFrom: this.getNode(event.sourceId)});

        // move our drag node around as necessary
        $(document).bind("mousemove", (e) => {
            var ele = $(this.dragNode.ele);
            var left = e.clientX - (ele.width() / 2);
            var top = e.clientY;
            $(this.dragNode.ele).offset({left, top});
        });
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    onConnectorDrop(event: ConnectionEvent) {
        console.log('onConnectorDrop', event.sourceId, event.targetId, event);

        // if we drop in open space, we get a source id but no source
        let isNewNode = event.sourceId && !event.source
        
        if (isNewNode) {
            
        }

        // temporarily attach to our drag node
        Plumber.get().connect(event.sourceId, 'drag-node');
        Plumber.get().repaint();

        this.dragNode.setEditing(true);

        // this.dragNode.onClick({target: 'blerg'});
        // this.setState({draggingFrom: null});
        // this.dragNode = null;

        $(document).unbind("mousemove");
    }

    onConnectionMoved(event: ConnectionEvent){
        console.log('onConnectionMoved', event);
    }

    onConnectionDetached(event: ConnectionEvent) {
        console.log('connection detached');
    }

    onConnectionAborted(event: ConnectionEvent) {
        console.log('connection aborted');
    }

    setDefinition(definition: Interfaces.FlowDefinition) {
        this.setState({definition: definition});
    }

    private createDragNode() {
        if (this.state.draggingFrom) {
            var props = {
                uuid: 'drag-node',
                actions: [],
                _ui: {
                    location: {
                        x: this.state.draggingFrom._ui.location.x,
                        y: this.state.draggingFrom._ui.location.y
                    }
                }
            } as Interfaces.NodeProps;

            if (this.state.draggingFrom.exits.length > 1) {
                props.actions.push({
                    uuid: 'drag-msg',
                    type: "msg",
                    text: "Enter a message to send to the contact"
                } as Interfaces.SendMessageProps);

            }
            return <NodeComp ref={(ele) => {this.dragNode = ele}} {...props}/>
        }
    }

    render() {
        var nodes: JSX.Element[] = [];
        var config = Config.get();

        if (this.state.definition) {
            for (let node of this.state.definition.nodes) {
                nodes.push(<NodeComp {...node} key={node.uuid}/>)
            }
        }

        var dragNode = null;
        if (this.state.draggingFrom) {
            dragNode = this.createDragNode();
        }

        console.log('##################### Rendering flow');
        return(
            <div>
                <SimulatorComp engineUrl={this.props.engineUrl}/>
                <div id="flow">
                    <div className="nodes">
                    {nodes}
                    <div>{dragNode}</div>
                    </div>
                </div>
                
            </div>
        )
    }
}

export default FlowComp;