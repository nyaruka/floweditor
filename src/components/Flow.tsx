import * as React from 'react';
import NodeComp from './Node';
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {FlowDefinition} from '../services/FlowStore';
import {NodeProps, ExitProps, ActionProps, LocationProps, UIMetaDataProps, SendMessageProps, FlowContext} from '../interfaces';

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
export class FlowComp extends React.PureComponent<FlowProps, FlowState> {

    static childContextTypes = {
        flow: React.PropTypes.object
    }

    getChildContext(): FlowContext {
        return {
            flow: this
        }
    }

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
            nodes: { [indexes[0]]: {
                    actions: { [indexes[1]]: { 
                        text: { $set: text} } }
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

    /*shouldComponentUpdate(nextProps: FlowProps, nextState: FlowState) {
        if (this.state.definition === undefined) {
            console.log('flow YES update');
            return true;
        }
        console.log('flow NO update');
        return false;
    }*/

    componentDidMount() {
        console.log('flow mounted..');
        FlowStore.get().loadFlow(this.props.url, (definition: FlowDefinition)=>{
            this.setDefinition(definition);
        }, false);

        var plumb = Plumber.get();
        plumb.bind("connection", (event: ConnectionEvent) => { this.onConnection(event); });
        plumb.bind("connectionMoved", (event: ConnectionEvent) => {this.onConnectionMoved(event); });

    }

    componentWillUpdate() {
        Plumber.get().reset();
    }

    componentDidUpdate() {
        if (this.state.definition) {
            console.log('Flow updated..');
            var plumb = Plumber.get();
            plumb.connectAll(this.state.definition);
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
            <div id="flow">
                <div className="nodes">
                  {nodes}
                </div>
            </div>
        )
    }
}

export default FlowComp;