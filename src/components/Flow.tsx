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

    private nodes: JSX.Element[];

    constructor(props: FlowProps) {
        super(props);
        this.state = {}
    }

    getActionIndexes(uuid: string) {
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

    updateMessageAction(uuid: string, text: string) {
        var indexes = this.getActionIndexes(uuid);

        var updated = update(this.state.definition, {
            nodes: { 
                [indexes[0]]: {
                    actions: { 
                        [indexes[1]]: { text: { $set: text} }
                    }
                }
            }
        });

        console.log('Updated:', updated);
        this.setState({definition: updated});
    }
    
    updateAction(uuid: string, definition: string) {
        console.log('update action');
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
            this.setDefinition(definition);
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

    setDefinition(definition: FlowDefinition) {
        this.nodes = [];
        if (definition) {
            for (let node of definition.nodes) {
                this.nodes.push(<NodeComp {...node} flow={this} key={Math.random()}/>)
            }
        }
        this.setState({definition: definition});
    }

    render() {
        console.log('##################### Rendering flow');
        return(
            <div id="flow">
                <div className="nodes">
                  {this.nodes}
                </div>
            </div>
        )
    }
}

export default FlowComp;