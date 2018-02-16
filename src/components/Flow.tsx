import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';
import { FlowDefinition, Action, Position, Reply, Node, UINode, Dimensions } from '../flowTypes';
import ComponentMap from '../services/ComponentMap';
import NodeComp, { DragPoint } from './Node';
import FlowMutator from '../services/FlowMutator';
import SimulatorComp from './Simulator';
import Plumber from '../services/Plumber';
import ActivityManager from '../services/ActivityManager';
import NodeEditor, { NodeEditorProps } from './NodeEditor';
import LanguageSelectorComp, { Language } from './LanguageSelector';
import { ConfigProviderContext } from '../providers/ConfigProvider/configContext';
import {
    typeConfigListPT,
    operatorConfigListPT,
    getTypeConfigPT,
    getOperatorConfigPT,
    endpointsPT,
    getActivityPT
} from '../providers/ConfigProvider/propTypes';

import * as styles from './Flow.scss';

export interface FlowProps {
    nodeDragging: boolean;
    onDrag(dragging: boolean): void;
    language: Language;
    translating: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    Mutator: FlowMutator;
    ComponentMap: ComponentMap;
}

export interface FlowState {
    ghost?: Node;
    nodeEditor?: NodeEditorProps;
    loading: boolean;
    viewDefinition?: FlowDefinition;
}

export interface Connection {
    previousConnection: Connection;
}

export interface ConnectionEvent {
    connection: Connection;
    source: Element;
    target: Element;
    sourceId: string;
    targetId: string;
    endpoints: any[];
}

export interface Translations {
    [uuid: string]: any;
}

const REPAINT_DURATION = 600;

export default class Flow extends React.Component<FlowProps, FlowState> {
    private repaintDuration: number;
    private Activity: ActivityManager;
    private Plumber: any;
    private Mutator: FlowMutator;

    // dragging details, TODO, state this?
    private pendingConnection: DragPoint;
    private createNodePosition: Position;
    private addToNode: Node;

    private ghost: NodeComp;
    private nodeEditor: NodeEditor;

    public static contextTypes = {
        typeConfigList: typeConfigListPT,
        operatorConfigList: operatorConfigListPT,
        getTypeConfig: getTypeConfigPT,
        getOperatorConfig: getOperatorConfigPT,
        endpoints: endpointsPT,
        getActivity: getActivityPT
    };

    constructor(props: FlowProps, context: ConfigProviderContext) {
        super(props, context);

        this.state = {
            loading: true,
            ghost: null,
            nodeEditor: null,
            viewDefinition: null
        };

        this.repaintDuration = REPAINT_DURATION;

        this.Activity = new ActivityManager(this.props.definition.uuid, this.context.getActivity);

        this.Plumber = new Plumber();

        this.nodeEditorRef = this.nodeEditorRef.bind(this);
        this.ghostRef = this.ghostRef.bind(this);
        this.onConnectionDrag = this.onConnectionDrag.bind(this);
        this.onNodeMoved = this.onNodeMoved.bind(this);
        this.onNodeMounted = this.onNodeMounted.bind(this);
        this.onAddAction = this.onAddAction.bind(this);
        this.onUpdateAction = this.onUpdateAction.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
        this.onShowDefinition = this.onShowDefinition.bind(this);
        this.openEditor = this.openEditor.bind(this);
        this.onUpdateRouter = this.onUpdateRouter.bind(this);
        this.onNodeDragStart = this.onNodeDragStart.bind(this);
        this.onNodeDragStop = this.onNodeDragStop.bind(this);
        this.onNodeBeforeDrag = this.onNodeBeforeDrag.bind(this);
        this.resetState = this.resetState.bind(this);

        console.time('RenderAndPlumb');
    }

    private nodeEditorRef(ref: NodeEditor): NodeEditor {
        return (this.nodeEditor = ref);
    }

    private ghostRef(ref: NodeComp): NodeComp {
        return (this.ghost = ref);
    }

    public componentDidMount(): void {
        this.Plumber.bind('connection', (event: ConnectionEvent) => this.onConnection(event));
        this.Plumber.bind('beforeDrag', (event: ConnectionEvent) =>
            this.beforeConnectionDrag(event)
        );
        this.Plumber.bind('connectionDrag', (event: ConnectionEvent) =>
            this.onConnectionDrag(event)
        );
        this.Plumber.bind('connectionDragStop', (event: ConnectionEvent) =>
            this.onConnectorDrop(event)
        );
        this.Plumber.bind('beforeStartDetach', (event: ConnectionEvent) =>
            this.onBeforeStartDetach(event)
        );
        this.Plumber.bind('beforeDetach', (event: ConnectionEvent) => this.onBeforeDetach(event));
        this.Plumber.bind('beforeDrop', (event: ConnectionEvent) =>
            this.onBeforeConnectorDrop(event)
        );

        // If we don't have any nodes, create our first one
        this.props.Mutator.ensureStartNode();

        console.timeEnd('RenderAndPlumb');

        this.setState({ loading: false });

        // deals with safari load rendering throwing
        // off the jsplumb offsets
        window.setTimeout(() => this.Plumber.repaint(), 500);
    }

    public componentDidUpdate(prevProps: FlowProps, prevState: FlowState): void {
        // console.log("Updated", this.props.definition);
        // this.props.Mutator.reflow();
    }

    public componentWillUnmount(): void {
        console.log('unmounting');

        this.Plumber.reset();
    }

    private onNodeBeforeDrag(node: Node, dragGroup: boolean): void {
        if (!this.props.nodeDragging) {
            if (dragGroup) {
                const nodesBelow = this.props.ComponentMap.getNodesBelow(node);
                this.Plumber.setDragSelection(nodesBelow);
            } else {
                this.Plumber.clearDragSelection();
            }
        }
    }

    private onNodeDragStart(node: Node): void {
        this.props.onDrag(true);
    }

    private onNodeDragStop(node: Node): void {
        this.props.onDrag(false);
    }

    private openEditor(props: NodeEditorProps): void {
        console.log('openEditor', props);

        props.onClose = (canceled: boolean) => {
            // make sure we re-wire the old connection
            if (canceled) {
                if (this.pendingConnection) {
                    const exit = this.props.Mutator.getExit(this.pendingConnection.exitUUID);
                    if (exit) {
                        this.Plumber.connectExit(exit);
                    }
                }
            }

            this.setState(
                {
                    ghost: null
                },
                () => this.resetState()
            );
        };

        this.setState({ nodeEditor: props }, () => {
            this.props.onDrag(false);
            this.nodeEditor.open();
        });
    }

    private onAddAction(node: Node): void {
        const {
            Mutator: { updateLocalizations: onUpdateLocalizations },
            definition,
            translating,
            language,
            ComponentMap: CompMap
        } = this.props;

        const newAction: Reply = {
            uuid: generateUUID(),
            type: 'reply',
            text: ''
        };

        this.openEditor({
            onUpdateAction: this.onUpdateAction,
            onUpdateRouter: this.onUpdateRouter,
            onUpdateLocalizations,
            definition,
            translating,
            language,
            node,
            action: newAction,
            actionsOnly: true,
            ComponentMap: CompMap
        });

        this.addToNode = node;
    }

    private onNodeMoved(uuid: string, position: Position): void {
        this.props.Mutator.updateNodeUI(uuid, {
            position: { $set: position }
        });

        this.Plumber.repaintForDuration(this.repaintDuration);
    }

    private onNodeMounted(props: Node): void {
        this.props.Mutator.resolvePendingConnection(props);
    }

    private onModalClose(): void {
        this.resetState();
    }

    private onUpdateAction({ uuid }: Node, action: Action): void {
        console.log('Flow.onUpdateAction', action);

        this.props.Mutator.updateAction(
            action,
            uuid,
            this.pendingConnection,
            this.createNodePosition,
            this.addToNode
        );

        this.resetState();

        this.Plumber.repaintForDuration(this.repaintDuration);
    }

    private onUpdateRouter(node: Node, type: string, previousAction?: Action): void {
        console.log('Flow.onUpdateRouter', node);

        const { uuid: nodeUUID } = node;

        const { uuid: newUUID } = this.props.Mutator.updateRouter(
            node,
            type,
            this.pendingConnection,
            this.createNodePosition,
            previousAction
        );

        if (nodeUUID !== newUUID) {
            this.Plumber.repaintForDuration(this.repaintDuration);
        }

        this.resetState();
    }

    /**
     * Called when a connection begins to be dragged from an endpoint both
     * when a new connection is desired or when an existing one is being moved.
     * @param event
     */
    private onConnectionDrag(event: ConnectionEvent): void {
        // We finished dragging a ghost node, create the spec for our new ghost component
        const draggedFromDetails = this.props.ComponentMap.getDetails(event.sourceId);
        const fromNode = this.props.Mutator.getNode(draggedFromDetails.nodeUUID);
        const fromNodeUI = this.props.Mutator.getNodeUI(fromNode.uuid);
        const draggedFrom = {
            nodeUUID: draggedFromDetails.nodeUUID,
            exitUUID: draggedFromDetails.exitUUID
        };

        const ghost: Node = {
            uuid: generateUUID(),
            actions: [],
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: null
                }
            ]
        };

        // Add an action if we are coming from a split
        if (fromNode.wait || fromNodeUI.type === 'webhook') {
            const replyAction: Reply = {
                uuid: generateUUID(),
                type: 'reply',
                text: ''
            };

            ghost.actions.push(replyAction);
        } else {
            // Otherwise we are going to a switch
            ghost.exits[0].name = 'All Responses';
            ghost.router = { type: 'switch' };
        }

        // Set our ghost spec so it gets rendered.
        // TODO: this is here to workaround a jsplumb
        // weirdness where offsets go off the handle upon
        // dragging connections.
        window.setTimeout(
            () =>
                this.setState({
                    ghost
                }),
            0
        );

        // Save off our drag point for later
        this.pendingConnection = draggedFrom;
    }

    private onBeforeStartDetach(event: any): boolean {
        return !this.props.translating;
    }

    private onBeforeDetach(event: ConnectionEvent): boolean {
        return true;
    }

    /**
     * Called right before a connector is dropped onto a new node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent): boolean {
        this.resetState();

        const connectionError = this.props.Mutator.getConnectionError(
            event.sourceId,
            event.targetId
        );

        if (connectionError != null) {
            console.error(connectionError);
        }

        return connectionError == null;
    }

    private onConnection(event: ConnectionEvent): void {
        this.props.Mutator.updateConnection(event.sourceId, event.targetId);
    }

    private onShowDefinition(definition: FlowDefinition): void {
        // TODO: make this work, it's cool!
        // this.Plumber.reset();
        // this.setState({ viewDefinition: definition }, () => { this.Plumber.repaint() });
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    private onConnectorDrop(event: ConnectionEvent): boolean {
        // we put this in a zero timeout so jsplumb doesn't swallow any stack traces
        window.setTimeout(() => {
            if (this.state.ghost) {
                // wire up the drag from to our ghost node
                const dragPoint = this.pendingConnection;

                this.Plumber.recalculate(this.state.ghost.uuid);
                this.Plumber.connect(dragPoint.exitUUID, this.state.ghost.uuid);

                // save our position for later
                const { offsetTop, offsetLeft } = this.ghost.ele;

                this.createNodePosition = { x: offsetLeft, y: offsetTop };

                // click on our ghost node to bring up the editor
                this.ghost.onClick();
            }

            $(document).off('mousemove');
        }, 0);

        return true;
    }

    private resetState(): void {
        this.setState({ ghost: null }, () => {
            this.pendingConnection = null;
            this.createNodePosition = null;
            this.addToNode = null;
        });
    }

    private beforeConnectionDrag(event: ConnectionEvent): boolean {
        return !this.props.translating;
    }

    /**
     * Computes translations prop for `Node` components in render()
     */
    private getTranslations(): Translations {
        if (this.props.definition.localization) {
            return this.props.definition.localization[this.props.language.iso];
        }

        return null;
    }

    private getNodes(definition: FlowDefinition): JSX.Element[] {
        return definition.nodes.map(node => {
            const ui = definition._ui.nodes[node.uuid];
            const { uuid: key } = node;
            const translations: Translations = this.getTranslations();

            return (
                <NodeComp
                    key={key}
                    // Editor
                    nodeDragging={this.props.nodeDragging}
                    definition={this.props.definition}
                    ComponentMap={this.props.ComponentMap}
                    onUpdateDimensions={this.props.Mutator.updateDimensions}
                    onDisconnectExit={this.props.Mutator.disconnectExit}
                    onRemoveNode={this.props.Mutator.removeNode}
                    onUpdateLocalizations={this.props.Mutator.updateLocalizations}
                    onRemoveAction={this.props.Mutator.removeAction}
                    onMoveActionUp={this.props.Mutator.moveActionUp}
                    // Flow
                    node={node}
                    ui={ui}
                    language={this.props.language}
                    translations={translations}
                    translating={this.props.translating}
                    Activity={this.Activity}
                    onNodeMounted={this.onNodeMounted}
                    onNodeMoved={this.onNodeMoved}
                    onNodeDragStart={this.onNodeDragStart}
                    onNodeBeforeDrag={this.onNodeBeforeDrag}
                    onNodeDragStop={this.onNodeDragStop}
                    openEditor={this.openEditor}
                    onAddAction={this.onAddAction}
                    onUpdateAction={this.onUpdateAction}
                    onUpdateRouter={this.onUpdateRouter}
                    plumberDraggable={this.Plumber.draggable}
                    plumberMakeTarget={this.Plumber.makeTarget}
                    plumberRemove={this.Plumber.remove}
                    plumberRecalculate={this.Plumber.recalculate}
                    plumberMakeSource={this.Plumber.makeSource}
                    plumberConnectExit={this.Plumber.connectExit}
                />
            );
        });
    }

    private getDragNode(): JSX.Element {
        if (this.state.ghost) {
            // Start off screen
            const ui: UINode = {
                position: { x: -1000, y: -1000 }
            };

            if (this.state.ghost.router) {
                ui.type = 'wait_for_response';
            }

            return (
                <NodeComp
                    key={this.state.ghost.uuid}
                    ref={this.ghostRef}
                    // Editor
                    definition={this.props.definition}
                    ComponentMap={this.props.ComponentMap}
                    onUpdateDimensions={this.props.Mutator.updateDimensions}
                    onDisconnectExit={this.props.Mutator.disconnectExit}
                    onRemoveNode={this.props.Mutator.removeNode}
                    onUpdateLocalizations={this.props.Mutator.updateLocalizations}
                    onRemoveAction={this.props.Mutator.removeAction}
                    onMoveActionUp={this.props.Mutator.moveActionUp}
                    // Flow
                    ghost={true}
                    node={this.state.ghost}
                    ui={ui}
                    language={this.props.language}
                    translations={null}
                    translating={this.props.translating}
                    Activity={this.Activity}
                    onNodeMounted={this.onNodeMounted}
                    onNodeMoved={this.onNodeMoved}
                    onNodeDragStart={this.onNodeDragStart}
                    onNodeBeforeDrag={this.onNodeBeforeDrag}
                    onNodeDragStop={this.onNodeDragStop}
                    openEditor={this.openEditor}
                    onAddAction={this.onAddAction}
                    onUpdateAction={this.onUpdateAction}
                    onUpdateRouter={this.onUpdateRouter}
                    plumberDraggable={this.Plumber.draggable}
                    plumberMakeTarget={this.Plumber.makeTarget}
                    plumberRemove={this.Plumber.remove}
                    plumberRecalculate={this.Plumber.recalculate}
                    plumberMakeSource={this.Plumber.makeSource}
                    plumberConnectExit={this.Plumber.connectExit}
                />
            );
        }

        return null;
    }

    private getSimulator(): JSX.Element {
        if (this.context.endpoints.engine) {
            return (
                <SimulatorComp
                    // Editor
                    definition={this.props.definition}
                    // Flow
                    showDefinition={this.onShowDefinition}
                    plumberRepaint={this.Plumber.repaint}
                    Activity={this.Activity}
                />
            );
        }

        return null;
    }

    private getModal(): JSX.Element {
        if (this.state.nodeEditor) {
            return (
                <NodeEditor
                    ref={this.nodeEditorRef}
                    // Editor
                    ComponentMap={this.props.ComponentMap}
                    // Flow
                    language={this.props.language}
                    definition={this.props.definition}
                    translating={this.props.translating}
                    {...this.state.nodeEditor}
                />
            );
        }

        return null;
    }

    public render(): JSX.Element {
        const definition: FlowDefinition = this.state.viewDefinition
            ? this.state.viewDefinition
            : this.props.definition;

        const nodes: JSX.Element[] = this.getNodes(definition);

        const dragNode: JSX.Element = this.getDragNode();

        const simulator: JSX.Element = this.getSimulator();

        const modal: JSX.Element = this.getModal();

        return (
            <div key={definition.uuid}>
                {simulator}
                {dragNode}
                {modal}
                <div className={styles.node_list} data-spec="nodes">
                    {nodes}
                </div>
            </div>
        );
    }
}
