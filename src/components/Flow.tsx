import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import * as update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';
import {
    FlowDefinition,
    Action,
    Position,
    Reply,
    Node,
    UINode,
    LocalizationMap,
    Dimensions
} from '../flowTypes';
import ComponentMap from '../services/ComponentMap';
import NodeComp, { DragPoint } from './Node';
import FlowMutator from '../services/FlowMutator';
import SimulatorComp from './Simulator';
import Plumber from '../services/Plumber';
import EditorConfig from '../services/EditorConfig';
import External from '../services/External';
import ActivityManager from '../services/ActivityManager';
import NodeEditorComp, { NodeEditorProps } from './NodeEditor';
import LanguageSelectorComp, { Language } from './LanguageSelector';

const styles = require('./Flow.scss');

export interface IFlowProps {
    EditorConfig: EditorConfig;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    External: External;
    Mutator: FlowMutator;
    ComponentMap: ComponentMap;
}

export interface IFlowState {
    ghost?: Node;
    nodeEditor?: NodeEditorProps;
    loading: boolean;
    viewDefinition?: FlowDefinition;
    draggingNode?: Node;
    language?: Language;
    translating: boolean;
}

export interface IConnection {
    previousConnection: IConnection;
}

export interface IConnectionEvent {
    connection: IConnection;
    source: Element;
    target: Element;
    sourceId: string;
    targetId: string;
    endpoints: any[];
}

const REPAINT_DURATION = 600;

export default class Flow extends React.PureComponent<IFlowProps, IFlowState> {
    private repaintDuration: number;
    private Activity: ActivityManager;
    private Plumber: any;
    private Mutator: FlowMutator;

    // dragging details, TODO, state this?
    private pendingConnection: DragPoint;
    private createNodePosition: Position;
    private addToNode: Node;

    private ghost: NodeComp;
    private nodeEditor: NodeEditorComp;

    constructor(props: IFlowProps) {
        super(props);

        this.state = {
            loading: true,
            ghost: null,
            nodeEditor: null,
            viewDefinition: null,
            draggingNode: null,
            language: this.props.EditorConfig.baseLanguage,
            translating: false
        };

        this.repaintDuration = REPAINT_DURATION;

        this.Activity = new ActivityManager(
            this.props.definition.uuid,
            this.props.External.getActivity
        );

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
        this.setLanguage = this.setLanguage.bind(this);

        console.time('RenderAndPlumb');
    }

    private nodeEditorRef(ref: any): void {
        return (this.nodeEditor = ref);
    }

    private ghostRef(ref: any): void {
        return (this.ghost = ref);
    }

    private onNodeBeforeDrag(node: Node, dragGroup: boolean) {
        if (!this.state.draggingNode) {
            if (dragGroup) {
                const nodesBelow = this.props.ComponentMap.getNodesBelow(node);
                this.Plumber.setDragSelection(nodesBelow);
            } else {
                this.Plumber.clearDragSelection();
            }
        }
    }

    private onNodeDragStart(node: Node) {
        if (!this.state.draggingNode) {
            this.setState({ draggingNode: node });
        }
    }

    private onNodeDragStop(node: Node) {
        if (this.state.draggingNode) {
            this.setState({ draggingNode: null });
        }
    }

    private openEditor(props: NodeEditorProps) {
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
                () => {
                    this.resetState();
                }
            );
        };

        this.setState({ nodeEditor: props, draggingNode: null }, () => {
            this.nodeEditor.open();
        });
    }

    private onAddAction(addToNode: Node) {
        const newAction: Reply = {
            uuid: generateUUID(),
            type: 'reply',
            text: ''
        };

        this.openEditor({
            onUpdateAction: this.onUpdateAction,
            onUpdateLocalizations: this.props.Mutator.updateLocalizations,
            onUpdateRouter: this.onUpdateRouter,
            node: addToNode,
            action: newAction,
            actionsOnly: true,
            typeConfigList: this.props.EditorConfig.typeConfigList,
            operatorConfigList: this.props.EditorConfig.operatorConfigList,
            getTypeConfig: this.props.EditorConfig.getTypeConfig,
            getOperatorConfig: this.props.EditorConfig.getOperatorConfig,
            endpoints: this.props.EditorConfig.endpoints,
            ComponentMap: this.props.ComponentMap
        });

        this.addToNode = addToNode;
    }

    private onNodeMoved(uuid: string, position: Position) {
        this.props.Mutator.updateNodeUI(uuid, {
            position: { $set: position }
        });
        this.Plumber.repaintForDuration(this.repaintDuration);
    }

    private onNodeMounted(props: Node) {
        this.props.Mutator.resolvePendingConnection(props);
    }

    private onModalClose() {
        this.resetState();
    }

    private resetState() {
        this.setState({ ghost: null }, () => {
            this.pendingConnection = null;
            this.createNodePosition = null;
            this.addToNode = null;
        });
    }

    private onUpdateAction(node: Node, action: Action) {
        console.log('Flow.onUpdateAction', action);
        this.props.Mutator.updateAction(
            action,
            node.uuid,
            this.pendingConnection,
            this.createNodePosition,
            this.addToNode
        );

        this.resetState();

        this.Plumber.repaintForDuration(this.repaintDuration);
    }

    private onUpdateRouter(node: Node, type: string, previousAction?: Action) {
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
    private onConnectionDrag(event: IConnectionEvent) {
        // we finished dragging a ghost node, create the spec for our new ghost component
        let draggedFromDetails = this.props.ComponentMap.getDetails(event.sourceId);

        let fromNode = this.props.Mutator.getNode(draggedFromDetails.nodeUUID);
        let fromNodeUI = this.props.Mutator.getNodeUI(fromNode.uuid);

        const draggedFrom = {
            nodeUUID: draggedFromDetails.nodeUUID,
            exitUUID: draggedFromDetails.exitUUID
        };

        let ghost: Node = {
            uuid: generateUUID(),
            actions: [],
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: null
                }
            ]
        };

        // add an action if we are coming from a split
        if (fromNode.wait || fromNodeUI.type === 'webhook') {
            let replyAction: Reply = {
                uuid: generateUUID(),
                type: 'reply',
                text: null
            };

            ghost = update(ghost, {
                actions: {
                    $push: [replyAction]
                }
            });
        } else {
            // otherwise we are going to a switch
            ghost = {
                ...ghost,
                exits: [
                    {
                        ...ghost.exits[0],
                        name: 'All Responses'
                    }
                ],
                router: { type: 'switch' }
            };
        }

        // set our ghost spec so it gets rendered
        // TODO: this is here to workaround a jsplumb
        // weirdness where offsets go off the handle upon
        // dragging connections
        window.setTimeout(() => {
            this.setState({
                ghost
            });
        }, 0);

        // save off our drag point for later
        this.pendingConnection = draggedFrom;
    }

    componentDidUpdate(prevProps: IFlowProps, prevState: IFlowState) {
        // console.log("Updated", this.props.definition);
        // this.props.Mutator.reflow();
    }

    componentDidMount() {
        const Plumber = this.Plumber;

        Plumber.bind('connection', (event: IConnectionEvent) => this.onConnection(event));
        Plumber.bind('beforeDrag', (event: IConnectionEvent) => this.beforeConnectionDrag(event));
        Plumber.bind('connectionDrag', (event: IConnectionEvent) => this.onConnectionDrag(event));
        Plumber.bind('connectionDragStop', (event: IConnectionEvent) =>
            this.onConnectorDrop(event)
        );
        Plumber.bind('beforeStartDetach', (event: IConnectionEvent) =>
            this.onBeforeStartDetach(event)
        );
        Plumber.bind('beforeDetach', (event: IConnectionEvent) => this.onBeforeDetach(event));
        Plumber.bind('beforeDrop', (event: IConnectionEvent) => this.onBeforeConnectorDrop(event));

        this.props.Mutator.ensureStartNode();

        // if we don't have any nodes, create our first one

        console.timeEnd('RenderAndPlumb');
        this.setState({ loading: false });

        // deals with safari load rendering throwing
        // off the jsplumb offsets
        window.setTimeout(() => {
            this.Plumber.repaint();
        }, 500);
    }

    componentWillUnmount() {
        this.Plumber.reset();
    }

    private beforeConnectionDrag(event: IConnectionEvent) {
        return !this.state.translating
    }

    private onBeforeStartDetach(event: any) {
        return !this.state.translating;
    }

    private onBeforeDetach(event: IConnectionEvent) {
        return true;
    }

    /**
     * Called right before a connector is dropped onto a new node
     */
    private onBeforeConnectorDrop(event: IConnectionEvent) {
        this.resetState();
        var connectionError = this.props.Mutator.getConnectionError(event.sourceId, event.targetId);
        if (connectionError != null) {
            console.error(connectionError);
        }
        return connectionError == null;
    }

    private onConnection(event: IConnectionEvent) {
        this.props.Mutator.updateConnection(event.sourceId, event.targetId);
    }

    private onShowDefinition(definition: FlowDefinition) {
        // TODO: make this work, it's cool!
        // this.Plumber.reset();
        // this.setState({ viewDefinition: definition }, () => { this.Plumber.repaint() });
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    private onConnectorDrop(event: IConnectionEvent) {
        // we put this in a zero timeout so jsplumb doesn't swallow any stack traces
        window.setTimeout(() => {
            if (this.ghost && $(this.ghost.ele).is(':visible')) {
                // wire up the drag from to our ghost node
                let dragPoint = this.pendingConnection;
                this.Plumber.recalculate(this.state.ghost.uuid);
                this.Plumber.connect(dragPoint.exitUUID, this.state.ghost.uuid);

                // save our position for later
                var { offsetTop, offsetLeft } = $(this.ghost.ele)[0];
                this.createNodePosition = { x: offsetLeft, y: offsetTop };

                // click on our ghost node to bring up the editor
                this.ghost.onClick();
            }

            $(document).unbind('mousemove');
        }, 0);

        return true;
    }

    private setLanguage(language: Language): void {
        const { EditorConfig: { baseLanguage } } = this.props;
        const translating: boolean = JSON.stringify(language) !== JSON.stringify(baseLanguage);

        this.setState({
            language,
            translating
        });
    }

    render() {
        let translations: { [uuid: string]: any };

        if (this.props.definition.localization) {
            translations = this.props.definition.localization[this.state.language.iso];
        }

        if (!translations) {
            translations = null;
        }

        let definition = this.props.definition;

        if (this.state.viewDefinition) {
            definition = this.state.viewDefinition;
        }

        let nodes: JSX.Element[] = [];

        const { nodes: nodesInDef } = definition;

        nodesInDef.forEach(node => {
            const ui = definition._ui.nodes[node.uuid];
            const { uuid: key } = node;

            nodes = [
                ...nodes,
                <NodeComp
                    key={key}
                    node={node}
                    ui={ui}
                    translating={this.state.translating}
                    Activity={this.Activity}
                    onNodeMounted={this.onNodeMounted}
                    onUpdateDimensions={this.props.Mutator.updateDimensions}
                    onNodeMoved={this.onNodeMoved}
                    onNodeDragStart={this.onNodeDragStart}
                    onNodeBeforeDrag={this.onNodeBeforeDrag}
                    onDisconnectExit={this.props.Mutator.disconnectExit}
                    onNodeDragStop={this.onNodeDragStop}
                    openEditor={this.openEditor}
                    onAddAction={this.onAddAction}
                    onRemoveNode={this.props.Mutator.removeNode}
                    onUpdateLocalizations={this.props.Mutator.updateLocalizations}
                    onUpdateAction={this.onUpdateAction}
                    onUpdateRouter={this.onUpdateRouter}
                    onRemoveAction={this.props.Mutator.removeAction}
                    onMoveActionUp={this.props.Mutator.moveActionUp}
                    baseLanguage={this.props.EditorConfig.baseLanguage}
                    iso={this.state.language.iso}
                    translations={translations}
                    typeConfigList={this.props.EditorConfig.typeConfigList}
                    operatorConfigList={this.props.EditorConfig.operatorConfigList}
                    getTypeConfig={this.props.EditorConfig.getTypeConfig}
                    getOperatorConfig={this.props.EditorConfig.getOperatorConfig}
                    endpoints={this.props.EditorConfig.endpoints}
                    languages={this.props.EditorConfig.languages}
                    ComponentMap={this.props.ComponentMap}
                    plumberDraggable={this.Plumber.draggable}
                    plumberMakeTarget={this.Plumber.makeTarget}
                    plumberRemove={this.Plumber.remove}
                    plumberRecalculate={this.Plumber.recalculate}
                    plumberMakeSource={this.Plumber.makeSource}
                    plumberConnectExit={this.Plumber.connectExit}
                />
            ];
        });

        let dragNode: JSX.Element = null;

        if (this.state.ghost) {
            let ghost = this.state.ghost;

            // start off screen
            let ui: UINode = {
                position: { x: -1000, y: -1000 }
            };

            if (ghost.router) {
                ui = { ...ui, type: 'wait_for_response' };
            }

            dragNode = (
                <NodeComp
                    key={ghost.uuid}
                    ref={this.ghostRef}
                    iso={null}
                    translating={this.state.translating}
                    translations={null}
                    Activity={this.Activity}
                    node={ghost}
                    baseLanguage={this.props.EditorConfig.baseLanguage}
                    onNodeMounted={this.onNodeMounted}
                    onUpdateDimensions={this.props.Mutator.updateDimensions}
                    onNodeMoved={this.onNodeMoved}
                    onNodeDragStart={this.onNodeDragStart}
                    onNodeBeforeDrag={this.onNodeBeforeDrag}
                    onDisconnectExit={this.props.Mutator.disconnectExit}
                    onNodeDragStop={this.onNodeDragStop}
                    openEditor={this.openEditor}
                    onAddAction={this.onAddAction}
                    onRemoveNode={this.props.Mutator.removeNode}
                    onUpdateLocalizations={this.props.Mutator.updateLocalizations}
                    onUpdateAction={this.onUpdateAction}
                    onUpdateRouter={this.onUpdateRouter}
                    onRemoveAction={this.props.Mutator.removeAction}
                    onMoveActionUp={this.props.Mutator.moveActionUp}
                    ui={ui}
                    ghost={true}
                    typeConfigList={this.props.EditorConfig.typeConfigList}
                    operatorConfigList={this.props.EditorConfig.operatorConfigList}
                    getTypeConfig={this.props.EditorConfig.getTypeConfig}
                    getOperatorConfig={this.props.EditorConfig.getOperatorConfig}
                    endpoints={this.props.EditorConfig.endpoints}
                    languages={this.props.EditorConfig.languages}
                    ComponentMap={this.props.ComponentMap}
                    plumberDraggable={this.Plumber.draggable}
                    plumberMakeTarget={this.Plumber.makeTarget}
                    plumberRemove={this.Plumber.remove}
                    plumberRecalculate={this.Plumber.recalculate}
                    plumberMakeSource={this.Plumber.makeSource}
                    plumberConnectExit={this.Plumber.connectExit}
                />
            );
        }

        let simulator: JSX.Element = null;

        if (this.props.EditorConfig.endpoints.engine) {
            simulator = (
                <SimulatorComp
                    definition={this.props.definition}
                    engineURL={this.props.EditorConfig.endpoints.engine}
                    getFlow={this.props.External.getFlow}
                    showDefinition={this.onShowDefinition}
                    plumberRepaint={this.Plumber.repaint}
                    Activity={this.Activity}
                />
            );
        }

        let modal: JSX.Element = null;

        if (this.state.nodeEditor) {
            modal = (
                <NodeEditorComp
                    ref={this.nodeEditorRef}
                    typeConfigList={this.props.EditorConfig.typeConfigList}
                    operatorConfigList={this.props.EditorConfig.operatorConfigList}
                    getTypeConfig={this.props.EditorConfig.getTypeConfig}
                    getOperatorConfig={this.props.EditorConfig.getOperatorConfig}
                    endpoints={this.props.EditorConfig.endpoints}
                    ComponentMap={this.props.ComponentMap}
                    {...this.state.nodeEditor}
                />
            );
        }

        let classes: string[] = [];

        if (this.state.loading) {
            classes = [...classes, styles.loading];
        } else {
            classes = [...classes, styles.loaded];
        }

        if (this.state.draggingNode) {
            classes = [...classes, styles.dragging];
        }

        if (this.state.translating) {
            classes = [...classes, styles.translation];
        }

        let languageSelector: JSX.Element;

        if (this.props.EditorConfig.languages) {
            languageSelector = (
                <LanguageSelectorComp
                    iso={this.state.language.iso}
                    languages={this.props.EditorConfig.languages}
                    onChange={this.setLanguage}
                />
            );
        }

        return (
            <div className={classes.join(' ')}>
                {languageSelector}
                {simulator}
                <div key={definition.uuid} className={styles.flow}>
                    <div className={styles.node_list}>{nodes}</div>
                    {dragNode}
                    {modal}
                </div>
            </div>
        );
    }
}
