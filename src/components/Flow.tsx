import * as React from 'react';
import * as Interfaces from '../interfaces';

import NodeComp from './Node';
import {Plumber} from '../services/Plumber';
import {FlowStore, FlowDefinition} from '../services/FlowStore';
import {Simulator} from './Simulator';
// import {NewActionModal} from './NewAction'

var update = require('immutability-helper');
var forceFetch = true;

interface FlowProps {
    url: string;
    engineUrl: string;
}

interface FlowState {
    definition?: FlowDefinition;
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

    // private newModal: NewActionModal;

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
        this.state = {}
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
    private updateDefinition(definition: FlowDefinition) {
        FlowStore.get().save(definition);
        this.setState({definition: definition});
    }

    componentDidMount() {
        console.log('Flow component mounted');
        FlowStore.get().loadFlow(this.props.url, (definition: FlowDefinition)=>{
            this.setDefinition(definition);
        }, forceFetch);

        var plumb = Plumber.get();
        plumb.bind("connection", (event: ConnectionEvent) => { this.onConnection(event); });
        plumb.bind("connectionMoved", (event: ConnectionEvent) => {this.onConnectionMoved(event); });
    }

    componentWillUpdate() {
        Plumber.get().reset();
    }

    componentDidUpdate() {
        if (this.state.definition) {
            console.log('Flow updated');
            var plumb = Plumber.get();
            plumb.connectAll(this.state.definition);
        }
    }

    onConnection(event: ConnectionEvent) {
        console.log('onConnection', event);
        this.updateExit(event.sourceId, {$merge:{destination: event.targetId}});
    }

    onConnectionMoved(event: ConnectionEvent){
        console.log('onConnectionMoved', event);
    }

    setDefinition(definition: FlowDefinition) {
        this.setState({definition: definition});
    }

    render() {
        var nodes: JSX.Element[] = [];
        if (this.state.definition) {
            for (let node of this.state.definition.nodes) {
                nodes.push(<NodeComp {...node} key={node.uuid}/>)
            }
        }

        console.log('##################### Rendering flow');
        return(
            <div>
                <Simulator engineUrl={this.props.engineUrl}/>
                <div id="flow">
                    <div className="nodes">
                    {nodes}
                    </div>
                </div>
            </div>
        )
    }
}

export default FlowComp;