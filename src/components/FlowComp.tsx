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
    loading: boolean
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
        this.state = { loading: true }
        console.time("RenderAndPlumb");
    }

    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event 
     */
    private onConnectionDrag(event: ConnectionEvent) {

        // we finished dragging a ghost node, create the spec for our new ghost component
        let draggedFromDetails = this.props.mutator.getComponents().getDetails(event.sourceId);
        let fromNode = this.props.mutator.getNode(draggedFromDetails.nodeUUID);
        var nodeUUID = UUID.v4();
        var draggedFrom = {
            nodeUUID: draggedFromDetails.nodeUUID, 
            exitUUID: draggedFromDetails.exitUUID, 
            onResolved: (() => { this.setState({ghostNode: null});})
        }

        var ghostNode = {
            uuid: nodeUUID,
            actions: [],
            draggedFrom: draggedFrom,
            mutator: this.props.mutator,
            exits: [{
                "uuid": UUID.v4(),
                "destination": null,
                "name": null
            }],
        } as NodeProps;

        // add an action if we are coming from a split
        if (fromNode.exits.length > 1) {
            let actionUUID = UUID.v4();
            ghostNode.actions.push({
                uuid: actionUUID,
                type: "msg",
                text: "",
                draggedFrom: draggedFrom,
                mutator: this.props.mutator
            } as SendMessageProps);
        } 
        // otherwise we are going to a switch
        else {
            ghostNode['router'] = {type:"switch"}
        }

        // set our ghost spec so it get's rendered
        this.setState({ghostNode: ghostNode}); 
    }

    private componentDidMount() {
        var plumb = Plumber.get();

        plumb.bind("connection", (event: ConnectionEvent) => { return this.onConnection(event)});
        plumb.bind("connectionDrag", (event: ConnectionEvent) => { return this.onConnectionDrag(event)});
        plumb.bind("connectionDragStop", (event: ConnectionEvent) => { return this.onConnectorDrop(event)});
        plumb.bind("beforeDrop", (event: ConnectionEvent) => { return this.onBeforeConnectorDrop(event)});
        
        Plumber.get().connectAll(this.props.definition, ()=>{
            Plumber.get().repaint();
            this.setState({loading: false});
            console.timeEnd("RenderAndPlumb");
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

            // update our ghost spec with our drop location
            if (this.state.ghostNode.actions.length > 0) {
                var {left, top} = $(this.ghostComp.ele).offset();
                var newGhost = update(this.state.ghostNode, {
                    actions: {[0]: { $merge:{ 
                        newPosition: {x: left, y: top},
                    }}}
                });
                this.setState({ghostNode: newGhost});
            }

            // wire up the drag from to our ghost node
            let dragPoint = this.state.ghostNode.draggedFrom;
            Plumber.get().revalidate(this.state.ghostNode.uuid);
            Plumber.get().connect(dragPoint.exitUUID, this.state.ghostNode.uuid);

            // click on our ghost node to bring up the editor
            this.ghostComp.onClick(null);
        }

        $(document).unbind('mousemove');
    }

    render() {
        // console.time("Rendered Flow");
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

        var rendered = (
            <div className={ this.state.loading ? "loading" : ""}>
                {/*<SimulatorComp engineURL={this.props.engineUrl}/>*/}
                <div id="flow">
                    <div className="nodes">
                    {nodes}
                    {dragNode}
                    </div>
                </div>
            </div>
        )

        // console.timeEnd("Rendered Flow");
        return rendered;
    }
}

export default FlowComp;