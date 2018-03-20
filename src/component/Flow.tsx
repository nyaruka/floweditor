import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Config } from '../config';
import { getActivity } from '../external';
import { FlowDefinition, Languages, Node, UINode } from '../flowTypes';
import {
    Components,
    ConnectionEvent,
    DispatchWithState,
    ensureStartNode,
    getConnectionError,
    NoParamsAC,
    OnConnectionDrag,
    onConnectionDrag,
    OnOpenNodeEditor,
    onOpenNodeEditor,
    ReduxState,
    resetNodeEditingState,
    UpdateConnection,
    updateConnection,
    updateCreateNodePosition,
    UpdateCreateNodePosition
} from '../redux';
import ActivityManager from '../services/ActivityManager';
import Plumber from '../services/Plumber';
import { snapToGrid } from '../utils';
import * as styles from './Flow.scss';
import NodeContainer, { DragPoint } from './Node';
import NodeEditor from './NodeEditor';

export interface FlowPassedProps {
    languages: Languages;
}

export interface FlowDuxProps {
    translating: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    components: Components;
    ghostNode: Node;
    pendingConnection: DragPoint;
    nodeEditorOpen: boolean;
    ensureStartNode: NoParamsAC;
    updateConnection: UpdateConnection;
    onOpenNodeEditor: OnOpenNodeEditor;
    resetNodeEditingState: NoParamsAC;
    onConnectionDrag: OnConnectionDrag;
    updateCreateNodePosition: UpdateCreateNodePosition;
}

export type FlowProps = FlowPassedProps & FlowDuxProps;

export interface Translations {
    [uuid: string]: any;
}

const FlowContainer = () => (
    <Config render={({ languages }) => <ConnectedFlow languages={languages} />} />
);

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
            this.props.updateConnection(event.sourceId, event.targetId)
        );
        this.Plumber.bind('beforeDrag', (event: ConnectionEvent) =>
            this.beforeConnectionDrag(event)
        );

        this.Plumber.bind('connectionDrag', (event: ConnectionEvent) =>
            this.props.onConnectionDrag(event)
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
        this.props.ensureStartNode();

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

    /**
     * Called right before a connector is dropped onto a new node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent): boolean {
        this.props.resetNodeEditingState();

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
            // Don't show the node editor if we a dragging back to where we were
            const draggingBack =
                event.suspendedElementId === event.targetId && event.source !== null;

            if (ghostNode && !draggingBack) {
                // Wire up the drag from to our ghost node
                const dragPoint = pendingConnection;
                this.Plumber.recalculate(ghostNode.uuid);
                this.Plumber.connect(dragPoint.exitUUID, ghostNode.uuid);

                // Save our position for later
                const { left, top } = snapToGrid(
                    this.ghost.wrappedInstance.ele.offsetLeft,
                    this.ghost.wrappedInstance.ele.offsetTop
                );

                this.props.updateCreateNodePosition({ x: left, y: top });

                // Bring up the node editor
                this.props.onOpenNodeEditorAC(this.props.ghostNode, null, this.props.languages);
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

    private getNodeEditor(): JSX.Element {
        return this.props.nodeEditorOpen ? (
            <NodeEditor
                plumberConnectExit={this.Plumber.connectExit}
                plumberRepaintForDuration={this.Plumber.repaintForDuration}
            />
        ) : null;
    }

    public render(): JSX.Element {
        const nodeEditor = this.getNodeEditor();
        const dragNode = this.getDragNode();
        const nodes = this.getNodes();
        // const simulator = this.getSimulator();
        return (
            <div key={this.props.definition.uuid}>
                {/* {simulator} */}
                {dragNode}
                {nodeEditor}
                <div className={styles.node_list} data-spec="nodes">
                    {nodes}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    translating,
    definition,
    dependencies,
    components,
    ghostNode,
    pendingConnection,
    nodeEditorOpen
}: ReduxState): Partial<ReduxState> => ({
    translating,
    definition,
    dependencies,
    components,
    ghostNode,
    pendingConnection,
    nodeEditorOpen
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            ensureStartNode,
            resetNodeEditingState,
            onConnectionDrag,
            onOpenNodeEditor,
            updateCreateNodePosition,
            updateConnection
        },
        dispatch
    );

const ConnectedFlow = connect(mapStateToProps, mapDispatchToProps)(Flow);

export default FlowContainer;
