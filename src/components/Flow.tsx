import * as React from 'react';
import NodeComp from './Node';
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {FlowDefinition} from '../services/FlowStore';
import {NodeProps, ExitProps, ActionProps, LocationProps, UIMetaDataProps} from '../interfaces';

interface FlowProps {
    definition: FlowDefinition;
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
class FlowComp extends React.Component<FlowProps, {}> {

    constructor(props: FlowProps) {
        super(props);
        console.log(props.definition);
    }

    componentDidMount() {
        console.log('Flow mounted..');
        var plumb = Plumber.get();
        
        plumb.connectAll(this.props.definition);
        plumb.bind("connection", (event: ConnectionEvent) => { this.onConnection(event); });
        plumb.bind("connectionMoved", (event: ConnectionEvent) => {this.onConnectionMoved(event); });
        //Plumber.get()
    }

    onConnection(event: ConnectionEvent) {
        console.log('onConnection', event);
        
        FlowStore.get().getCurrentDefinition().updateDestination(event.sourceId, event.targetId);
        FlowStore.get().markDirty();
    }

    onConnectionMoved(event: ConnectionEvent){
        console.log('onConnectionMoved', event);
    }

    updateLocation(uuid: string, x: number, y: number) {
        var node = this.props.definition.getNode(uuid);
        if (node) {
            node._ui.setLocation(x, y);
        }
        FlowStore.get().markDirty();
    }

    render() {
        var nodes: JSX.Element[] = [];
        for (let node of this.props.definition.nodes) {
            nodes.push(<NodeComp {...node} key={Math.random()}/>)
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