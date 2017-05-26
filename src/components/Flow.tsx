import * as React from 'react';
import {FlowDefinition, DragPoint, FlowContext, NodeProps, SendMessageProps, NodeEditorProps, ActionProps, RouterProps, LocationProps, Endpoints, ContactFieldResult} from '../interfaces';
import {Node} from './Node';
import {NodeModal, NodeModalProps} from './NodeModal';
import {FlowMutator} from './FlowMutator';
import {Simulator} from './Simulator';
import {Plumber} from '../services/Plumber';
import {Config} from '../services/Config';

var update = require('immutability-helper');
var UUID = require('uuid');

interface FlowProps {
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    mutator: FlowMutator;
    
    endpoints: Endpoints;
}

interface FlowState {
    ghostProps?: NodeProps
    modalProps?: NodeModalProps
    loading: boolean
    context: FlowContext
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
    endpoints: any[];
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
        this.onAddAction = this.onAddAction.bind(this);
        this.onUpdateAction = this.onUpdateAction.bind(this);
        this.onUpdateRouter = this.onUpdateRouter.bind(this);

        this.state = { 
            loading: true,
            modalProps: {
                changeType: true,
                onUpdateAction: this.onUpdateAction,
                onUpdateRouter: this.onUpdateRouter
            },
            context: {
                getContactFields: this.props.mutator.getContactFields,
                getGroups: this.props.mutator.getGroups,
                eventHandler: {
                    onAddContactField: this.props.mutator.addContactField,
                    onRemoveAction: this.props.mutator.removeAction,
                    onAddAction: this.onAddAction,
                    onRemoveNode: this.props.mutator.removeNode,
                    onEditNode: this.onEdit,
                    onNodeMoved: this.onNodeMoved,
                    onNodeMounted: this.onNodeMounted,
                    onAddGroup: this.props.mutator.addGroup
                },
                endpoints: this.props.endpoints
            }
        }
        console.time("RenderAndPlumb");
    }

    private onEdit(propsToEdit: NodeEditorProps) {
        var modalProps = update(this.state.modalProps, {$merge: {initial: propsToEdit}});

        // TODO: is this necessary
        delete modalProps["addToNode"];

        this.setState({ modalProps: modalProps }, ()=> {this.modalComp.open()});
    }

    private onAddAction(addToNode: string) {

        var newAction = {
            uuid: UUID.v4(),
            type: "msg",
            dragging: false,
            context: this.state.context
        }

        var modalProps: NodeModalProps = {
            initial: newAction,
            changeType: true,
            onUpdateAction: this.onUpdateAction,
            onUpdateRouter: this.onUpdateRouter,
            addToNode: addToNode,
        };

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

    private resetState() {
        this.setState({
            ghostProps: null,
            modalProps: {
                onUpdateAction: this.onUpdateAction,
                onUpdateRouter: this.onUpdateRouter,
                changeType: true
            }
        });
    }

    private onUpdateAction(props: ActionProps) {
        this.props.mutator.updateAction(props, 
            this.state.modalProps.draggedFrom, 
            this.state.modalProps.newPosition, 
            this.state.modalProps.addToNode
        );
        this.resetState();        
    }

    private onUpdateRouter(props: NodeProps) {
        this.props.mutator.updateRouter(props, 
            this.state.modalProps.draggedFrom, 
            this.state.modalProps.newPosition);
        this.resetState();
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
                this.setState({
                    ghostProps: null,
                    modalProps: {
                        onUpdateAction: this.onUpdateAction,
                        onUpdateRouter: this.onUpdateRouter,
                        changeType: true
                    }
                });
            })
        }

        var ghostProps = {
            context: this.state.context,
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
                context: this.state.context,
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
            onUpdateRouter: this.onUpdateRouter,
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
        plumb.bind("beforeStartDetach", (event: ConnectionEvent) => { return this.onBeforeStartDetach(event)});
        plumb.bind("beforeDetach", (event: ConnectionEvent) => { return this.onBeforeDetach(event)});
        plumb.bind("beforeDrop", (event: ConnectionEvent) => { return this.onBeforeConnectorDrop(event)});

        // if we don't have any nodes, create our first one
        if (this.props.definition.nodes.length == 0) {
            var nodeProps = {
                uuid: UUID.v4(),
                context: this.state.context,
                actions: [{
                    context: this.state.context,
                    uuid: UUID.v4(),
                    type: "msg",
                    text: "Hi there, this the first message in your flow!",
                    onEdit: this.onEdit,
                    dragging: false,

                }],
                exits:[{
                    uuid: UUID.v4()
                }]
            }

            this.props.mutator.addNode(nodeProps, {position: {x: 0, y: 0}});
            this.setState({loading: false});    
        } else {
            this.setState({loading: false});
            console.timeEnd("RenderAndPlumb");
        }
    }
    
    componentWillUnmount() {
        Plumber.get().reset();
    }

    private onBeforeStartDetach(event: any) {
        // console.log("onBeforeStartDetach", event);

        Plumber.get().removeEndpoint(event.endpoint);
        return true;
    }

    private onBeforeDetach(event: ConnectionEvent) {
        // console.log("beforeDetach", event);
        return true;
    }

    /**
     * Called right before a connector is dropped onto a new node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent) {
        // console.log("beforeDrop", event);
        this.resetState();
        var connectionError = this.props.mutator.getConnectionError(event.sourceId, event.targetId);
        if (connectionError != null) {
            console.error(connectionError);
        }
        return connectionError == null;
    }

    private onConnection(event: ConnectionEvent) {
        this.props.mutator.updateConnection(event.sourceId, event.targetId);
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    private onConnectorDrop(event: ConnectionEvent) {

        if (this.ghostComp && $(this.ghostComp.ele).is(":visible")) {
        // if (this.state.ghostProps != null && event.sourceId == "asdf") {
            
            // wire up the drag from to our ghost node
            let dragPoint = this.state.modalProps.draggedFrom;
            Plumber.get().revalidate(this.state.ghostProps.uuid);
            Plumber.get().connect(dragPoint.exitUUID, this.state.ghostProps.uuid);

            // update our modal with our drop location
            var {left, top} = $(this.ghostComp.ele).offset();
            var modalProps = update(this.state.modalProps, {$merge:{newPosition: {x: left, y: top}}});
            this.setState({modalProps: modalProps});

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
            nodes.push(<Node {...node} _ui={uiNode} key={node.uuid} context={this.state.context}/>)
        }

        var dragNode = null;
        if (this.state.ghostProps) {
            let node = this.state.ghostProps
            // start off screen
            var uiNode = {position: {x: -1000, y:-1000}};
            dragNode = <Node ref={(ele) => { this.ghostComp = ele }} {...node} _ui={uiNode} key={node.uuid} 
                        ghost={true} context={this.state.context}/>
        }

        var simulator = null;
        
        // the simulator wants the primary definition first in a list of all dependencies
        var flows: FlowDefinition[] = []
        flows.push(this.props.definition);
        if (this.props.dependencies) {
            flows = flows.concat(this.props.dependencies);
        }
        
        if (this.props.endpoints.engine) {
            simulator = <Simulator 
                            engineURL={this.props.endpoints.engine}
                            definitions={flows}/>
        }
        simulator = null;

        var modal = null;
        if (this.state.modalProps && this.state.modalProps.initial) {
            modal = <NodeModal ref={(ele) => { this.modalComp = ele }} {...this.state.modalProps}/>
        }

        return (
            <div className={ this.state.loading ? "loading" : ""}>
                {simulator}
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