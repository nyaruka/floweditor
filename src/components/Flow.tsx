import * as React from 'react';
import NodeComp from './Node';
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {FlowDefinition} from '../services/FlowStore';
import {NodeProps, ExitProps, ActionProps, LocationProps, UIMetaDataProps, SendMessageProps} from '../interfaces';

var update = require('immutability-helper');


interface FlowProps {
    url: string;
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
export class FlowComp extends React.Component<FlowProps, FlowState> {

    constructor(props: FlowProps) {
        super(props);
        this.state = {}
    }

    updateAction(uuid: string, definition: string) {
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

        var changes: any = JSON.parse(definition);
        var updated = update(this.state.definition, {
            nodes: { 
                [nodeIdx]: {
                    actions: { 
                        [actionIdx]: { $set: changes }
                    }
                }
            }
        });

        console.log('Updated:', updated);
        this.setState({definition: updated});
    }

    componentDidMount() {
        console.log('flow mounted..');
        FlowStore.get().loadFlow(this.props.url, (definition: FlowDefinition)=>{
            this.setState({definition: definition});
        }, false);
    }

    componentDidUpdate() {
        if (this.state.definition) {
            console.log('Flow updated..');
            var plumb = Plumber.get();
            
            plumb.connectAll(this.state.definition);
            plumb.bind("connection", (event: ConnectionEvent) => { this.onConnection(event); });
            plumb.bind("connectionMoved", (event: ConnectionEvent) => {this.onConnectionMoved(event); });
        }
    }

    onConnection(event: ConnectionEvent) {
        console.log('onConnection', event);
        // FlowStore.get().getCurrentDefinition().updateDestination(event.sourceId, event.targetId);
        // FlowStore.get().markDirty();
    }

    onConnectionMoved(event: ConnectionEvent){
        console.log('onConnectionMoved', event);
    }

    /*updateLocation(uuid: string, x: number, y: number) {
        var node = this.props.definition.getNode(uuid);
        if (node) {
            node._ui.setLocation(x, y);
        }
        FlowStore.get().markDirty();
    }*/

    render() {
        var nodes: JSX.Element[] = [];
        if (this.state.definition) {
            for (let node of this.state.definition.nodes) {
                nodes.push(<NodeComp {...node} flow={this} key={Math.random()}/>)
            }
        }
        return(
            <div id="flow">
                <div className="nodes">
                  {nodes}
                </div>
            </div>
        )
    }
}

export default FlowComp;