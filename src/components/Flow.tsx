import * as React from 'react';
import {FlowDefinition, DragPoint, NodeProps, SendMessageProps, NodeEditorProps, ActionProps, LocationProps} from '../interfaces';
import {Node} from './Node';
import {NodeModal, NodeModalProps} from './NodeModal';
import {FlowMutator} from './FlowMutator';
import {Simulator} from './Simulator';
import {Plumber} from '../services/Plumber';

var update = require('immutability-helper');
var UUID = require('uuid');

interface FlowProps {
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    mutator: FlowMutator;
    engineURL?: string;
}

interface FlowState {
    ghostProps?: NodeProps
    modalProps?: NodeModalProps
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

export class Flow extends React.PureComponent<FlowProps, FlowState> {

    private ghostComp: Node;
    private modalComp: NodeModal;

    constructor(props: FlowProps, state: FlowState) {
        super(props);
        this.onConnectionDrag = this.onConnectionDrag.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onNodeMoved = this.onNodeMoved.bind(this);
        this.onNodeMounted = this.onNodeMounted.bind(this);
        this.onUpdateAction = this.onUpdateAction.bind(this);
        
        this.state = { 
            loading: true,
            modalProps: { 
                changeType: true,
                onUpdateAction: this.onUpdateAction,
            }
        }
        console.time("RenderAndPlumb");
    }

    private onEdit(props: NodeEditorProps) {
        var modalProps = update(this.state.modalProps, {initial: {$set:props}});
        this.setState({ modalProps: modalProps }, ()=> {this.modalComp.open()});
    }

    private onNodeMoved(uuid: string, position: LocationProps) {
        this.props.mutator.updateNodeUI(uuid, {
            position: { $set: position }
        });
    }

    private onNodeMounted(props: NodeProps) {
        if (props.pendingConnection) {
            this.props.mutator.resolvePendingConnection(props);
        }
    }

    private onUpdateAction(props: ActionProps) {
        this.props.mutator.updateAction(props, 
            this.state.modalProps.draggedFrom, 
            this.state.modalProps.newPosition, 
            this.state.modalProps.addToNode
        );
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
            onResolved: (() => { 
                this.setState({ghostProps: null});
            })
        }

        var ghostProps = {
            onEdit: this.onEdit,
            uuid: nodeUUID,
            actions: [],
            exits: [{
                "uuid": UUID.v4(),
                "destination": null,
                "name": null
            }],
        } as NodeProps;

        // add an action if we are coming from a split
        if (fromNode.exits.length > 1) {
            let actionUUID = UUID.v4();
            ghostProps.actions.push({
                uuid: actionUUID,
                type: "msg",
                text: ""
            } as SendMessageProps);
        } 
        // otherwise we are going to a switch
        else {
            ghostProps.exits[0].name = "All Responses";
            ghostProps['router'] = {type:"switch"}
        }

        var modalProps = {
            draggedFrom: draggedFrom,
            onUpdateAction: this.onUpdateAction,
            changeType: true
        }

        // set our ghost spec so it gets rendered
        this.setState({
            ghostProps: ghostProps,
            modalProps: modalProps
        }); 
    }

    private componentDidUpdate(prevProps: FlowProps, prevState: FlowState) {
        Plumber.get().repaint();            
    }

    private componentDidMount() {

        var plumb = Plumber.get();

        plumb.bind("connection", (event: ConnectionEvent) => { return this.onConnection(event)});
        plumb.bind("connectionDrag", (event: ConnectionEvent) => { return this.onConnectionDrag(event)});
        plumb.bind("connectionDragStop", (event: ConnectionEvent) => { return this.onConnectorDrop(event)});
        plumb.bind("beforeDrop", (event: ConnectionEvent) => { return this.onBeforeConnectorDrop(event)});

        // if we don't have any nodes, create our first one
        if (this.props.definition.nodes.length == 0) {
            var nodeProps = {
                onEdit: this.onEdit,
                onNodeMounted: this.onNodeMounted,
                onNodeMoved: this.onNodeMoved,
                onRemoveNode: this.props.mutator.removeNode,
                uuid: UUID.v4(),
                actions: [{
                    uuid: UUID.v4(),
                    type: "msg",
                    text: "hey hey",
                    onEdit: this.onEdit,
                    dragging: false,
                    onUpdateAction: this.onUpdateAction,
                    onRemoveAction: this.props.mutator.removeNode,
                }],
                exits:[{
                    uuid: UUID.v4()
                }]
            }

            this.props.mutator.addNode(nodeProps, {position: {x: 0, y: 0}});
            this.setState({loading: false});    
        } else {
            Plumber.get().connectAll(this.props.definition).then(()=>{
                console.timeEnd("RenderAndPlumb");
                Plumber.get().repaint();
                this.setState({loading: false});    
            });
        }
    }
    
    componentWillUnmount() {
        Plumber.get().reset();
    }

    /**
     * Called right before a connector is dropped onto an existing node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent) {
        this.setState({ghostProps: null});
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

        if (this.state.ghostProps != null) {

            // update our ghost spec with our drop location
            if (this.state.ghostProps.exits.length > 0) {
                var {left, top} = $(this.ghostComp.ele).offset();
                var modalProps = update(this.state.modalProps, {$merge:{newPosition: {x: left, y: top}}});
                this.setState({modalProps: modalProps});
            }

            // wire up the drag from to our ghost node
            let dragPoint = this.state.modalProps.draggedFrom;
            Plumber.get().revalidate(this.state.ghostProps.uuid);
            Plumber.get().connect(dragPoint.exitUUID, this.state.ghostProps.uuid);

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
            nodes.push(<Node {...node} _ui={uiNode} key={node.uuid} 
                        onEdit={this.onEdit} 
                        onRemoveAction={this.props.mutator.removeAction}
                        onMoved={this.onNodeMoved}
                        onMounted={this.onNodeMounted}
                        />)
        }

        var dragNode = null;
        if (this.state.ghostProps) {
            let node = this.state.ghostProps
            dragNode = <Node ref={(ele) => { this.ghostComp = ele }} {...node} _ui={uiNode} key={node.uuid} 
                        ghost={true}
                        onMounted={this.onNodeMounted}
                        onEdit={this.onEdit}/>
        }

        var simulator = null;
        
        // the simulator wants the primary definition first in a list of all dependencies
        var flows: FlowDefinition[] = []
        flows.push(this.props.definition);
        flows = flows.concat(this.props.dependencies);
        
        if (this.props.engineURL) {
            simulator = <Simulator 
                            engineURL={this.props.engineURL}
                            definitions={flows}/>
        }

        var modal = null;
        if (this.state.modalProps && this.state.modalProps.initial) {
            modal = <NodeModal ref={(ele) => { this.modalComp = ele }} {...this.state.modalProps}/>
        }

        return (
            <div className={ this.state.loading ? "loading" : ""}>
                {/*simulator*/}
                <div id="flow">
                    <div className="nodes">
                    {nodes}
                    {dragNode}
                    </div>
                    {modal}
                </div>

            </div>
        )
    }
}

export default Flow;