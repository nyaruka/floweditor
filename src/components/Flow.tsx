import * as React from 'react';
import { ActionProps } from './Action';
import { FlowDefinition, Action, Node, Position, SendMessage, UINode, SwitchRouter } from '../FlowDefinition';
import { ContactFieldResult, SearchResult } from './ComponentMap';
import { NodeComp, NodeProps } from './Node';
import { NodeModal, NodeModalProps, EditableProps, NodeEditorProps } from './NodeModal';
import { FlowMutator } from './FlowMutator';
import { Simulator } from './Simulator';
import { Plumber } from '../services/Plumber';
import { External } from '../services/External';
import { Config, Endpoints } from '../services/Config';
import { SwitchRouterProps, SwitchRouterForm } from "./routers/SwitchRouter";

var update = require('immutability-helper');
var UUID = require('uuid');

var styles = require("./Flow.scss");

export interface FlowContext {
    eventHandler: FlowEventHandler;
    endpoints: Endpoints;
    getContactFields(): ContactFieldResult[];
    getGroups(): SearchResult[];
}

export interface FlowEventHandler {
    onRemoveAction(props: Action): void;
    onNodeMoved(nodeUUID: string, position: Position): void;
    onAddAction(nodeUUID: string): void;
    onRemoveNode(props: Node): void;
    onEditNode(props: NodeProps): void;
    onEditAction(props: ActionProps, onlyActions: boolean): void;
    onNodeMounted(props: Node): void;
    onAddContactField(field: ContactFieldResult): void;
    onAddGroup(group: SearchResult): void;
}


interface FlowProps {
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    external: External;
    mutator: FlowMutator;
    endpoints: Endpoints;
}

interface FlowState {
    ghost?: Node
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

    private ghostComp: NodeComp;
    private modalComp: NodeModal;

    constructor(props: FlowProps, state: FlowState) {
        super(props);
        this.onConnectionDrag = this.onConnectionDrag.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onEditAction = this.onEditAction.bind(this);
        this.onEditNode = this.onEditNode.bind(this);
        this.onNodeMoved = this.onNodeMoved.bind(this);
        this.onNodeMounted = this.onNodeMounted.bind(this);
        this.onAddAction = this.onAddAction.bind(this);
        this.onUpdateAction = this.onUpdateAction.bind(this);
        this.onUpdateRouter = this.onUpdateRouter.bind(this);
        this.onModalClose = this.onModalClose.bind(this);

        this.state = {
            loading: true,
            modalProps: {
                onlyActions: false,
                changeType: true,
                onUpdateAction: this.onUpdateAction,
                onUpdateRouter: this.onUpdateRouter,
                onClose: this.onModalClose
            },
            context: {
                getContactFields: this.props.mutator.getContactFields,
                getGroups: this.props.mutator.getGroups,
                eventHandler: {
                    onAddContactField: this.props.mutator.addContactField,
                    onRemoveAction: this.props.mutator.removeAction,
                    onAddAction: this.onAddAction,
                    onRemoveNode: this.props.mutator.removeNode,
                    onEditNode: this.onEditNode,
                    onEditAction: this.onEditAction,
                    onNodeMoved: this.onNodeMoved,
                    onNodeMounted: this.onNodeMounted,
                    onAddGroup: this.props.mutator.addGroup
                },
                endpoints: this.props.endpoints
            }
        }
        console.time("RenderAndPlumb");
    }

    private onEditNode(props: NodeProps) {

        var uuid = props.node.uuid;
        if (props.ghost) {
            uuid = null;
        }

        var action = null;
        if (props.node.actions && props.node.actions.length > 0) {
            action = props.node.actions[0];
        }

        var initial: SwitchRouterProps = {
            router: props.node.router as SwitchRouter,
            action: action,
            exits: props.node.exits,
            type: props.ui.type,
            uuid: props.node.uuid,
            context: props.context,
            config: Config.get().getTypeConfig(props.ui.type)
        };

        this.onEdit({
            initial: initial,
            uuid: uuid,
            type: props.ui.type,
            context: props.context
        });
    }

    private onEditAction(props: ActionProps, onlyActions: boolean) {
        var config = Config.get().getTypeConfig(props.action.type);
        if (config.form.prototype instanceof SwitchRouterForm) {
            // if we are editing an existing action, get the node
            var indexes = this.props.mutator.getComponents().getDetails(props.action.uuid);
            if (indexes) {
                var node = this.props.mutator.getNode(indexes.nodeUUID);
                var nodeProps: NodeProps = {
                    node: node,
                    context: this.state.context,
                    ui: this.props.mutator.getNodeUI(node.uuid)
                }
                this.onEditNode(nodeProps);
            }
        } else {
            var modalProps = update(this.state.modalProps, { $merge: { onlyActions: onlyActions } });
            this.setState({
                modalProps: modalProps
            }, () => {
                this.onEdit({
                    initial: props,
                    type: props.action.type,
                    uuid: props.action.uuid,
                    context: this.state.context
                });
            });
        }
    }

    private onEdit(props: EditableProps) {
        var modalProps = update(this.state.modalProps, { $merge: { editableProps: props } });
        delete modalProps["addToNode"];
        this.setState({ modalProps: modalProps }, () => { this.modalComp.open() });
    }


    private onAddAction(addToNode: string) {

        var uuid = UUID.v4();
        var newAction: ActionProps = {
            action: {
                uuid: uuid,
                type: "reply",
                text: ""
            } as SendMessage,
            context: this.state.context,
            dragging: false,
            type: "reply",
            uuid: uuid,
            config: Config.get().getTypeConfig("reply")
        };

        var editableProps: EditableProps = {
            initial: newAction,
            type: newAction.type,
            uuid: newAction.uuid,
            context: this.state.context
        }

        var modalProps: NodeModalProps = {
            editableProps: editableProps,
            changeType: true,
            onUpdateAction: this.onUpdateAction,
            onUpdateRouter: this.onUpdateRouter,
            addToNode: addToNode,
            onlyActions: true,
            onClose: this.onModalClose
        };

        this.setState({ modalProps: modalProps }, () => { this.modalComp.open() });
    }

    private onNodeMoved(uuid: string, position: Position) {
        this.props.mutator.updateNodeUI(uuid, {
            position: { $set: position }
        });
    }

    private onNodeMounted(props: Node) {
        this.props.mutator.resolvePendingConnection(props);
    }

    private onModalClose() {
        this.resetState();
    }

    private resetState() {
        this.setState({
            ghost: null,
            modalProps: {
                onClose: this.onModalClose,
                onUpdateAction: this.onUpdateAction,
                onUpdateRouter: this.onUpdateRouter,
                changeType: true,
                onlyActions: false
            }
        });
    }

    private onUpdateAction(action: Action) {
        this.props.mutator.updateAction(action,
            this.state.modalProps.draggedFrom,
            this.state.modalProps.newPosition,
            this.state.modalProps.addToNode
        );
        this.resetState();
    }

    private onUpdateRouter(props: Node, type: string) {
        this.props.mutator.updateRouter(props, type,
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
                    ghost: null,
                    modalProps: {
                        onClose: this.onModalClose,
                        onUpdateAction: this.onUpdateAction,
                        onUpdateRouter: this.onUpdateRouter,
                        changeType: true,
                        onlyActions: false
                    }
                });
            })
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
        if (fromNode.wait) {
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

        var modalProps = {
            draggedFrom: draggedFrom,
            onClose: this.onModalClose,
            onUpdateAction: this.onUpdateAction,
            onUpdateRouter: this.onUpdateRouter,
            onlyActions: false,
            changeType: true
        }

        // set our ghost spec so it gets rendered
        this.setState({
            ghost: ghost,
            modalProps: modalProps,
        });
    }

    componentDidUpdate(prevProps: FlowProps, prevState: FlowState) {
        Plumber.get().repaint();
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
            // wire up the drag from to our ghost node
            let dragPoint = this.state.modalProps.draggedFrom;
            Plumber.get().revalidate(this.state.ghost.uuid);
            Plumber.get().connect(dragPoint.exitUUID, this.state.ghost.uuid);

            // update our modal with our drop location
            var { offsetTop, offsetLeft } = $(this.ghostComp.ele)[0];
            var modalProps = update(this.state.modalProps, { $merge: { newPosition: { x: offsetLeft, y: offsetTop } } });
            this.setState({ modalProps: modalProps });

            // click on our ghost node to bring up the editor
            this.ghostComp.onClick(null);
        }

        $(document).unbind('mousemove');
    }

    render() {
        var nodes: JSX.Element[] = [];
        for (let node of this.props.definition.nodes) {
            var uiNode = this.props.definition._ui.nodes[node.uuid];
            nodes.push(<NodeComp key={node.uuid} node={node} ui={uiNode} context={this.state.context} />)
        }

        var dragNode = null;
        if (this.state.ghost) {
            let ghost = this.state.ghost

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

            />
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
                external={this.props.external}
                engineURL={this.props.endpoints.engine}
                flowUUID={this.props.definition.uuid}
            />
        }

        var modal = null;
        if (this.state.modalProps && this.state.modalProps.editableProps) {
            modal = <NodeModal ref={(ele) => { this.modalComp = ele }} {...this.state.modalProps} />
        }

        var loading = this.state.loading ? styles.loading : styles.loaded
        return (
            <div className={loading}>
                {simulator}
                <div className={styles.flow}>
                    <div className={styles["node-list"]}>
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