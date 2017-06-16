import * as React from 'react';
import { ActionProps } from './Action';
import { FlowDefinition, Action, Node, Position, SendMessage, UINode, SwitchRouter, Exit, Dimensions } from '../FlowDefinition';
import { ContactFieldResult, SearchResult, ComponentMap } from './ComponentMap';
import { NodeComp, NodeProps, DragPoint } from './Node';
import { FlowMutator } from './FlowMutator';
import { Simulator } from './Simulator';
import { Plumber } from '../services/Plumber';
import { External } from '../services/External';
import { Config, Endpoints } from '../services/Config';
import { SwitchRouterForm } from "./routers/SwitchRouter";
import { ActivityManager } from "../services/ActivityManager";
import { NodeEditor, NodeEditorProps } from "./NodeEditor";

var update = require('immutability-helper');
var UUID = require('uuid');

var styles = require("./Flow.scss");

export interface FlowContext {
    eventHandler: FlowEventHandler;
    endpoints: Endpoints;
}

export interface FlowEventHandler {
    onUpdateAction(node: Node, action: Action): void;
    onUpdateRouter(node: Node, type: string): void;
    onUpdateDimensions(node: Node, dimensions: Dimensions): void;

    onRemoveAction(action: Action): void;
    onMoveActionUp(action: Action): void;
    onDisconnectExit(exitUUID: string): void;
    onNodeMoved(nodeUUID: string, position: Position): void;
    onAddAction(addToNode: Node): void;
    onRemoveNode(props: Node): void;
    openEditor(props: NodeEditorProps): void;
    onNodeMounted(props: Node): void;
}


interface FlowProps {
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    external: External;
    mutator: FlowMutator;
    endpoints: Endpoints;
}

interface FlowState {
    ghost?: Node;
    nodeEditor?: NodeEditorProps;
    loading: boolean;
    context: FlowContext;
    viewDefinition?: FlowDefinition;
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

    // dragging details, TODO, state this?
    private pendingConnection: DragPoint;
    private createNodePosition: Position;
    private addToNode: Node;

    private ghostComp: NodeComp;
    private nodeEditorComp: NodeEditor;

    constructor(props: FlowProps, state: FlowState) {
        super(props);

        this.onConnectionDrag = this.onConnectionDrag.bind(this);
        this.onNodeMoved = this.onNodeMoved.bind(this);
        this.onNodeMounted = this.onNodeMounted.bind(this);
        this.onAddAction = this.onAddAction.bind(this);
        this.onUpdateAction = this.onUpdateAction.bind(this);
        this.onUpdateRouter = this.onUpdateRouter.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
        this.onShowDefinition = this.onShowDefinition.bind(this);
        this.openEditor = this.openEditor.bind(this);
        this.onUpdateRouter = this.onUpdateRouter.bind(this);

        ActivityManager.initialize(this.props.external, this.props.definition.uuid);
        Config.initialize(this.props.endpoints);

        this.state = {
            loading: true,
            context: {
                eventHandler: {
                    onUpdateAction: this.onUpdateAction,
                    onUpdateRouter: this.onUpdateRouter,
                    onUpdateDimensions: this.props.mutator.updateDimensions,
                    openEditor: this.openEditor,
                    onRemoveAction: this.props.mutator.removeAction,
                    onMoveActionUp: this.props.mutator.moveActionUp,
                    onAddAction: this.onAddAction,
                    onRemoveNode: this.props.mutator.removeNode,
                    onNodeMoved: this.onNodeMoved,
                    onNodeMounted: this.onNodeMounted,
                    onDisconnectExit: this.props.mutator.disconnectExit
                },
                endpoints: this.props.endpoints
            }
        }
        console.time("RenderAndPlumb");
    }

    private openEditor(props: NodeEditorProps) {

        props.onClose = (canceled: boolean) => {
            // make sure we re-wire the old connection
            if (canceled) {
                if (this.pendingConnection) {
                    var exit = this.props.mutator.getExit(this.pendingConnection.exitUUID);
                    if (exit) {
                        Plumber.get().connectExit(exit, false);
                    }
                }
            }

            this.setState({
                ghost: null
            });
        };

        this.setState({ nodeEditor: props }, () => {
            this.nodeEditorComp.open();
        });
    }

    private onAddAction(addToNode: Node) {

        var newAction: SendMessage = {
            uuid: UUID.v4(),
            type: "reply",
            text: ""
        };

        this.openEditor({
            context: this.state.context,
            node: addToNode,
            action: newAction,
            actionsOnly: true,
        });

        this.addToNode = addToNode;
    }

    private onNodeMoved(uuid: string, position: Position) {
        this.props.mutator.updateNodeUI(uuid, {
            position: { $set: position }
        });

        Plumber.get().animate(200);
    }

    private onNodeMounted(props: Node) {
        this.props.mutator.resolvePendingConnection(props);
    }

    private onModalClose() {
        this.resetState();
    }

    private resetState() {
        this.setState({ ghost: null });
        this.pendingConnection = null;
        this.createNodePosition = null;
        this.addToNode = null;
    }

    private onUpdateAction(node: Node, action: Action) {
        console.log("Flow.onUpdateAction", action);
        this.props.mutator.updateAction(action, node.uuid, this.pendingConnection, this.createNodePosition, this.addToNode);
        this.resetState();

        Plumber.get().animate(200);
    }

    private onUpdateRouter(node: Node, type: string) {
        console.log("Flow.onUpdateRouter", node);
        var router = node.router as any;
        var newNode = this.props.mutator.updateRouter(node, type, this.pendingConnection, this.createNodePosition);
        if (newNode.uuid != node.uuid) {
            Plumber.get().animate(200);
        }
        this.resetState();
    }

    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event 
     */
    private onConnectionDrag(event: ConnectionEvent) {

        // we finished dragging a ghost node, create the spec for our new ghost component
        let components = ComponentMap.get();
        let draggedFromDetails = components.getDetails(event.sourceId);

        let fromNode = this.props.mutator.getNode(draggedFromDetails.nodeUUID);
        let fromNodeUI = this.props.mutator.getNodeUI(fromNode.uuid);

        var nodeUUID = UUID.v4();
        var draggedFrom = {
            nodeUUID: draggedFromDetails.nodeUUID,
            exitUUID: draggedFromDetails.exitUUID
        }

        var ghost: Node = {
            uuid: nodeUUID,
            actions: [],
            exits: [{
                uuid: UUID.v4(),
                destination_node_uuid: null
            }]
        };

        // add an action if we are coming from a split
        if (fromNode.wait || "webhook" == fromNodeUI.type) {
            let replyAction: SendMessage = {
                uuid: UUID.v4(),
                type: "reply",
                text: ""
            }
            ghost.actions.push(replyAction);
        }

        // otherwise we are going to a switch
        else {
            ghost.exits[0].name = "All Responses";
            ghost.router = { type: "switch" }
        }

        // set our ghost spec so it gets rendered
        // TODO: this is here to workaround a jsplumb
        // weirdness where offsets go off the handle upon
        // dragging connections
        window.setTimeout(() => {
            this.setState({
                ghost: ghost,
            });
        }, 0);

        // save off our drag point for later
        this.pendingConnection = draggedFrom;
    }

    componentDidUpdate(prevProps: FlowProps, prevState: FlowState) {
        // console.log("Updated", this.props.definition);
        this.props.mutator.reflow();
    }

    componentDidMount() {

        var plumb = Plumber.get();

        plumb.bind("connection", (event: ConnectionEvent) => { return this.onConnection(event) });
        plumb.bind("connectionDrag", (event: ConnectionEvent) => { return this.onConnectionDrag(event) });
        plumb.bind("connectionDragStop", (event: ConnectionEvent) => { return this.onConnectorDrop(event) });
        plumb.bind("beforeStartDetach", (event: ConnectionEvent) => { return this.onBeforeStartDetach(event) });
        plumb.bind("beforeDetach", (event: ConnectionEvent) => { return this.onBeforeDetach(event) });
        plumb.bind("beforeDrop", (event: ConnectionEvent) => { return this.onBeforeConnectorDrop(event) });

        // if we don't have any nodes, create our first one
        if (this.props.definition.nodes.length == 0) {

            let initialAction: SendMessage = {
                uuid: UUID.v4(),
                type: "reply",
                text: "Hi there, this the first message in your flow!"
            };

            var node: Node = {
                uuid: UUID.v4(),
                actions: [initialAction],
                exits: [{
                    uuid: UUID.v4()
                }]
            };

            this.props.mutator.addNode(node, { position: { x: 0, y: 0 } });
            this.setState({ loading: false });

        } else {

            console.timeEnd("RenderAndPlumb");
            this.setState({ loading: false });

            // deals with safari load rendering throwing 
            // off the jsplumb offsets
            window.setTimeout(() => {
                Plumber.get().repaint();
            }, 500);
        }
    }

    componentWillUnmount() {
        Plumber.get().reset();
    }

    private onBeforeStartDetach(event: any) {
        return true;
    }

    private onBeforeDetach(event: ConnectionEvent) {
        return true;
    }

    /**
     * Called right before a connector is dropped onto a new node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent) {
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

    private onShowDefinition(definition: FlowDefinition) {
        // TODO: make this work, it's cool!
        // Plumber.get().reset();
        // this.setState({ viewDefinition: definition }, () => { Plumber.get().repaint() });
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    private onConnectorDrop(event: ConnectionEvent) {

        // we put this in a zero timeout so jsplumb doesn't swallow any stack traces
        window.setTimeout(() => {
            if (this.ghostComp && $(this.ghostComp.ele).is(":visible")) {
                // wire up the drag from to our ghost node
                let dragPoint = this.pendingConnection;
                Plumber.get().revalidate(this.state.ghost.uuid);
                Plumber.get().connect(dragPoint.exitUUID, this.state.ghost.uuid);

                // save our position for later
                var { offsetTop, offsetLeft } = $(this.ghostComp.ele)[0];
                this.createNodePosition = { x: offsetLeft, y: offsetTop };

                // click on our ghost node to bring up the editor
                this.ghostComp.onClick();
            }

            $(document).unbind('mousemove');
        }, 0);

        return true;

    }

    render() {

        var definition = this.props.definition;

        if (this.state.viewDefinition) {
            definition = this.state.viewDefinition;
        }

        var nodes: JSX.Element[] = [];
        for (let node of definition.nodes) {
            var ui = definition._ui.nodes[node.uuid];
            nodes.push(<NodeComp key={node.uuid} node={node} ui={ui} context={this.state.context} external={this.props.external} />)
        }

        var dragNode = null;
        if (this.state.ghost) {
            let ghost = this.state.ghost;

            // start off screen
            var ui: UINode = {
                position: { x: -1000, y: -1000 }
            }

            if (ghost.router) {
                ui.type = "wait_for_response"
            }

            dragNode = <NodeComp
                key={ghost.uuid}
                ref={(ele) => { this.ghostComp = ele }}
                node={ghost}
                context={this.state.context}
                ui={ui}
                ghost={true}
                external={this.props.external}
            />
        }

        var simulator = null;
        if (this.props.endpoints.engine) {
            simulator = <Simulator
                external={this.props.external}
                engineURL={this.props.endpoints.engine}
                flowUUID={this.props.definition.uuid}
                showDefinition={this.onShowDefinition}
            />
        }

        var modal = null;
        if (this.state.nodeEditor) {
            modal = <NodeEditor ref={(ele) => { this.nodeEditorComp = ele }} {...this.state.nodeEditor} />
        }

        var loading = this.state.loading ? styles.loading : styles.loaded

        return (
            <div className={loading}>
                {simulator}
                <div key={definition.uuid} className={styles.flow}>
                    <div className={styles.node_list}>
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