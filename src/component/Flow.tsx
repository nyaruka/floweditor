import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { getActivity } from '../external';
import { FlowDefinition, Node, Position, UINode } from '../flowTypes';
import {
    Components,
    ConnectionEvent,
    Constants,
    DispatchWithState,
    ensureStartNode,
    onConnectionDrag,
    ReduxState,
    resetNewConnectionState,
    setNodeEditorOpen,
    updateConnection,
    updateCreateNodePosition
} from '../redux';
import ActivityManager from '../services/ActivityManager';
import Plumber from '../services/Plumber';
import { getConnectionError } from '../utils';
import * as styles from './Flow.scss';
import LanguageSelectorComp, { Language } from './LanguageSelector';
import NodeContainer, { DragPoint } from './Node';

export interface FlowProps {
    nodeDragging: boolean;
    language: Language;
    translating: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    nodes: Node[];
    components: Components;
    ghostNode: Node;
    pendingConnection: DragPoint;
    ensureStartNodeAC: () => void;
    updateConnectionAC: (source: string, target: string) => void;
    setNodeEditorOpenAC: (nodeEitorOpen: boolean) => void;
    resetNewConnectionStateAC: () => void;
    onConnectionDragAC: (event: ConnectionEvent) => void;
    updateCreateNodePositionA: (
        createNodePosition: Position
    ) => { type: Constants; payload: { createNodePosition: Position } };
}

export interface Translations {
    [uuid: string]: any;
}

export class Flow extends React.Component<FlowProps> {
    private Activity: ActivityManager;
    private Plumber: Plumber;

    // Refs
    private ghost: any;

    constructor(props: FlowProps) {
        super(props);

        this.Activity = new ActivityManager(this.props.definition.uuid, getActivity);

        this.Plumber = new Plumber();

        bindCallbacks(this, {
            include: [/Ref$/, /^on/]
        });

        console.time('RenderAndPlumb');
    }

    private ghostRef(ref: any): any {
        return (this.ghost = ref);
    }

    public componentDidMount(): void {
        this.Plumber.bind('connection', (event: ConnectionEvent) =>
            this.props.updateConnectionAC(event.sourceId, event.targetId)
        );
        this.Plumber.bind('beforeDrag', (event: ConnectionEvent) =>
            this.beforeConnectionDrag(event)
        );
        this.Plumber.bind('connectionDrag', (event: ConnectionEvent) =>
            this.props.onConnectionDragAC(event)
        );
        this.Plumber.bind('connectionDragStop', (event: ConnectionEvent) =>
            this.onConnectorDrop(event)
        );
        this.Plumber.bind('beforeStartDetach', (event: ConnectionEvent) => !this.props.translating);
        this.Plumber.bind('beforeDetach', (event: ConnectionEvent) => true);
        this.Plumber.bind('beforeDrop', (event: ConnectionEvent) =>
            this.onBeforeConnectorDrop(event)
        );

        // If we don't have any nodes, create our first one
        this.props.ensureStartNodeAC();

        console.timeEnd('RenderAndPlumb');

        // deals with safari load rendering throwing
        // off the jsplumb offsets
        window.setTimeout(() => this.Plumber.repaint(), 500);
    }

    public componentDidUpdate(prevProps: FlowProps): void {
        // console.log("Updated", this.props.definition);
        // this.props.Mutator.reflow();
    }

    public componentWillUnmount(): void {
        console.log('unmounting');
        this.Plumber.reset();
    }

    // 🚧 Move this to where modal actually closes
    private onModalClose(): void {
        this.props.resetNewConnectionStateAC();
    }

    /**
     * Called right before a connector is dropped onto a new node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent): boolean {
        this.props.resetNewConnectionStateAC();

        const connectionError = getConnectionError(
            event.sourceId,
            event.targetId,
            this.props.components
        );

        if (connectionError != null) {
            console.error(connectionError);
        }

        return connectionError == null;
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
        const { ghostNode, pendingConnection } = this.props;
        // We put this in a zero timeout so jsplumb
        // doesn't swallow any stack traces.
        window.setTimeout(() => {
            if (ghostNode) {
                // Wire up the drag from to our ghost node
                const dragPoint = pendingConnection;
                this.Plumber.recalculate(ghostNode.uuid);
                this.Plumber.connect(dragPoint.exitUUID, ghostNode.uuid);

                // Save our position for later
                const { offsetTop, offsetLeft } = this.ghost.ele;
                const createNodePosition = { x: offsetLeft, y: offsetTop };
                this.props.updateCreateNodePositionA(createNodePosition);

                // Open NodeEditor to bring up the editor
                this.props.setNodeEditorOpenAC(true);
            }

            $(document).off('mousemove');
        }, 0);

        return true;
    }

    private beforeConnectionDrag(event: ConnectionEvent): boolean {
        return !this.props.translating;
    }

    private getNodes(): JSX.Element[] {
        return this.props.definition.nodes.map(node => {
            const ui = this.props.definition._ui.nodes[node.uuid];
            return (
                <NodeContainer
                    key={node.uuid}
                    node={node}
                    ui={ui}
                    Activity={this.Activity}
                    plumberRepaintForDuration={this.Plumber.repaintForDuration}
                    plumberDraggable={this.Plumber.draggable}
                    plumberMakeTarget={this.Plumber.makeTarget}
                    plumberRemove={this.Plumber.remove}
                    plumberRecalculate={this.Plumber.recalculate}
                    plumberMakeSource={this.Plumber.makeSource}
                    plumberConnectExit={this.Plumber.connectExit}
                    plumberSetDragSelection={this.Plumber.setDragSelection}
                    plumberClearDragSelection={this.Plumber.clearDragSelection}
                />
            );
        });
    }

    private getDragNode(): JSX.Element {
        if (this.props.ghostNode) {
            // Start off screen
            const ui: UINode = {
                position: { x: -1000, y: -1000 }
            };

            if (this.props.ghostNode.router) {
                ui.type = 'wait_for_response';
            }

            return (
                <NodeContainer
                    key={this.props.ghostNode.uuid}
                    ghostRef={this.ghostRef}
                    ghost={true}
                    node={this.props.ghostNode}
                    ui={ui}
                    Activity={this.Activity}
                    plumberRepaintForDuration={this.Plumber.repaintForDuration}
                    plumberDraggable={this.Plumber.draggable}
                    plumberMakeTarget={this.Plumber.makeTarget}
                    plumberRemove={this.Plumber.remove}
                    plumberRecalculate={this.Plumber.recalculate}
                    plumberMakeSource={this.Plumber.makeSource}
                    plumberConnectExit={this.Plumber.connectExit}
                    plumberSetDragSelection={this.Plumber.setDragSelection}
                    plumberClearDragSelection={this.Plumber.clearDragSelection}
                />
            );
        }

        return null;
    }

    // private getSimulator(): JSX.Element {
    //     if (this.context.endpoints.engine) {
    //         return (
    //             <SimulatorComp
    //                 // Editor
    //                 definition={this.props.definition}
    //                 // Flow
    //                 showDefinition={this.onShowDefinition}
    //                 plumberRepaint={this.Plumber.repaint}
    //                 Activity={this.Activity}
    //             />
    //         );
    //     }

    //     return null;
    // }

    public render(): JSX.Element {
        const nodes: JSX.Element[] = this.getNodes();
        const dragNode: JSX.Element = this.getDragNode();
        // const simulator: JSX.Element = this.getSimulator();
        return (
            <div key={this.props.definition.uuid}>
                {/* {simulator} */}
                {dragNode}
                {/* <NodeEditor />; */}
                <div className={styles.node_list} data-spec="nodes">
                    {nodes}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    nodeDragging,
    language,
    translating,
    definition,
    dependencies,
    nodes,
    components,
    ghostNode,
    pendingConnection
}: ReduxState): Partial<ReduxState> => ({
    nodeDragging,
    language,
    translating,
    definition,
    dependencies,
    nodes,
    components,
    ghostNode,
    pendingConnection
});

const mapDispatchToProps = (dispatch: DispatchWithState) => ({
    ensureStartNodeAC: () => dispatch(ensureStartNode()),
    setNodeEditorOpenAC: (nodeEditorOpen: boolean) => dispatch(setNodeEditorOpen(nodeEditorOpen)),
    resetNewConnectionStateAC: () => dispatch(resetNewConnectionState()),
    onConnectionDragAC: (event: ConnectionEvent) => dispatch(onConnectionDrag(event)),
    updateCreateNodePositionA: (createNodePosition: Position) =>
        dispatch(updateCreateNodePosition(createNodePosition)),
    updateConnectionAC: (source: string, target: string) =>
        dispatch(updateConnection(source, target))
});

const ConnectedFlow = connect(mapStateToProps, mapDispatchToProps)(Flow);

export default ConnectedFlow;
