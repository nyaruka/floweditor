import * as React from 'react';
import {FlowDefinition, DragPoint, NodeProps, SendMessageProps} from '../interfaces';
import {NodeComp} from './NodeComp';
import {NodeModal} from './NodeModal';
import {FlowMutator} from './FlowMutator';
import {Plumber} from '../services/Plumber';

var update = require('immutability-helper');
var UUID = require('uuid');

interface FlowProps {
    definition: FlowDefinition;
    mutator: FlowMutator;
}

interface FlowState {
    ghostNode?: NodeProps
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

export class FlowComp extends React.PureComponent<FlowProps, FlowState> {

    private ghostComp: NodeComp;

    constructor(props: FlowProps, state: FlowState) {
        super(props);
        this.onConnectionDrag = this.onConnectionDrag.bind(this);
        this.state = {}
    }

    private onGhostResolved() {
        console.log("Ghost resolved, removing");
        this.setState({ghostNode: null});
    }

    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event 
     */
    private onConnectionDrag(event: ConnectionEvent) {

        let draggedFrom = this.props.mutator.getComponents().getDetails(event.sourceId);

        let fromNode = this.props.mutator.getNode(draggedFrom.nodeUUID);
        var nodeUUID = UUID.v4();

        var ghostNode = {
            uuid: nodeUUID,
            actions: [],
            draggedFrom: {nodeUUID: draggedFrom.nodeUUID, exitUUID: draggedFrom.exitUUID, onResolved: this.onGhostResolved.bind(this)},
            mutator: this.props.mutator,
            exits: [{
                "uuid": UUID.v4(),
                "destination": null
            }],
        } as NodeProps;

        // add an action if we are coming from a split
        if (fromNode.exits.length > 1) {
            let actionUUID = UUID.v4();
            ghostNode.actions.push({
                node: ghostNode,
                uuid: actionUUID,
                type: "msg",
                mutator: this.props.mutator
            } as SendMessageProps);
        } 
        // otherwise we are going to a switch
        else {
            ghostNode['router'] = {type:"switch"}
        }

        this.setState({ghostNode: ghostNode}); 
    }

    public removeDragNode() {
        this.setState({ghostNode: null});
    }

    private componentDidMount() {
        var plumb = Plumber.get();

        plumb.bind("connection", (event: ConnectionEvent) => { return this.onConnection(event)});
        plumb.bind("connectionMoved", (event: ConnectionEvent) => { return this.onConnectionMoved(event)});
        plumb.bind("connectionDrag", (event: ConnectionEvent) => { return this.onConnectionDrag(event)});
        plumb.bind("connectionDragStop", (event: ConnectionEvent) => { return this.onConnectorDrop(event)});
        plumb.bind("beforeDrop", (event: ConnectionEvent) => { return this.onBeforeConnectorDrop(event)});
        
        plumb.bind("connectionDetached", (event: ConnectionEvent) => { return this.onConnectionDetached(event); });
        plumb.bind("connectionAborted", (event: ConnectionEvent) => { return this.onConnectionAborted(event); });

        Plumber.get().connectAll(this.props.definition, ()=>{
            Plumber.get().repaint();
        });
    }

    /**
     * Called right before a connector is dropped onto an existing node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent) {
        this.setState({ghostNode: null});
        return true;
    }

    private onConnection(event: ConnectionEvent) {
        this.props.mutator.updateConnection(event.sourceId, event.targetId);
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    private onConnectorDrop(event: ConnectionEvent) {

        if (this.state.ghostNode != null) {
            let dragPoint = this.state.ghostNode.draggedFrom;
            console.log(dragPoint.exitUUID, this.state.ghostNode.uuid);
            
            Plumber.get().revalidate(this.state.ghostNode.uuid);
            Plumber.get().connect(dragPoint.exitUUID, this.state.ghostNode.uuid);
            // Plumber.get().repaint();

            // click on our ghost node to bring up the editor
            this.ghostComp.onClick(null);
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

    render() {

        var nodes: JSX.Element[] = [];
        for (let node of this.props.definition.nodes) {
            var uiNode = this.props.definition._ui.nodes[node.uuid];
            nodes.push(<NodeComp {...node} _ui={uiNode} mutator={this.props.mutator} key={node.uuid}/>)
        }

        var dragNode = null;
        if (this.state.ghostNode) {
            let node = this.state.ghostNode
            dragNode = <NodeComp ref={(ele) => { this.ghostComp = ele }} {...node} _ui={uiNode} mutator={this.props.mutator} key={node.uuid}/>
        }

        console.log('##################### Rendering flow');
        return(
            <div>
                {/*<SimulatorComp engineURL={this.props.engineUrl}/>*/}
                <div id="flow">
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