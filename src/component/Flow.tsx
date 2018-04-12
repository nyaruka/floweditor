import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ConfigProviderContext, endpointsPT, languagesPT } from '../config';
import { getActivity } from '../external';
import { FlowDefinition, FlowNode } from '../flowTypes';
import ActivityManager from '../services/ActivityManager';
import Plumber from '../services/Plumber';
import {
    AppState,
    ConnectionEvent,
    DispatchWithState,
    EnsureStartNode,
    ensureStartNode,
    NoParamsAC,
    OnConnectionDrag,
    onConnectionDrag,
    OnOpenNodeEditor,
    onOpenNodeEditor,
    resetNodeEditingState,
    updateConnection,
    UpdateConnection,
    updateCreateNodePosition,
    UpdateCreateNodePosition,
    UpdateDragSelection,
    updateDragSelection
} from '../store';
import { RenderNode } from '../store/flowContext';
import { DragSelection } from '../store/flowEditor';
import { getCollisions } from '../store/helpers';
import { isRealValue, renderIf, snapToGrid } from '../utils';
import * as styles from './Flow.scss';
import ConnectedNode, { DragPoint } from './Node';
import ConnectedNodeEditor from './NodeEditor';
import Simulator from './Simulator';

export interface FlowStoreProps {
    translating: boolean;
    definition: FlowDefinition;
    nodes: { [uuid: string]: RenderNode };
    dependencies: FlowDefinition[];
    ghostNode: FlowNode;
    pendingConnection: DragPoint;
    dragSelection: DragSelection;
    nodeEditorOpen: boolean;
    ensureStartNode: EnsureStartNode;
    updateConnection: UpdateConnection;
    onOpenNodeEditor: OnOpenNodeEditor;
    resetNodeEditingState: NoParamsAC;
    onConnectionDrag: OnConnectionDrag;
    updateCreateNodePosition: UpdateCreateNodePosition;
    updateDragSelection: UpdateDragSelection;
}

export interface Translations {
    [uuid: string]: any;
}

export const REPAINT_TIMEOUT = 500;
export const GHOST_POSITION_INITIAL = { left: -1000, top: -1000 };

export const nodeSpecId = 'node';
export const nodesContainerSpecId = 'node-container';
export const ghostNodeSpecId = 'ghost-node';
export const dragSelectSpecId = 'drag-select';

export const getGhostUI = (ghostNode: FlowNode = {} as any) => ({
    position: GHOST_POSITION_INITIAL,
    ...(ghostNode.router ? { type: 'wait_for_response' } : {})
});

export const isDraggingBack = (event: ConnectionEvent) =>
    event.suspendedElementId === event.targetId && event.source !== null;

export const getDragStyle = (drag: DragSelection) => {
    const left = Math.min(drag.startX, drag.currentX);
    const top = Math.min(drag.startY, drag.currentY);
    const width = Math.max(drag.startX, drag.currentX) - left;
    const height = Math.max(drag.startY, drag.currentY) - top;
    return {
        left,
        top,
        width,
        height
    };
};

export class Flow extends React.Component<FlowStoreProps, {}> {
    private Activity: ActivityManager;
    private Plumber: Plumber;
    private containerOffset = { x: 0, y: 0 };

    // Refs
    private ghost: any;

    public static contextTypes = {
        languages: languagesPT,
        endpoints: endpointsPT
    };

    constructor(props: FlowStoreProps, context: ConfigProviderContext) {
        super(props, context);

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

        this.Plumber.bind('connectionDrag', (event: ConnectionEvent) => {
            this.props.onConnectionDrag(event);
        });

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
        window.setTimeout(() => this.Plumber.repaint(), REPAINT_TIMEOUT);
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

        if (event.sourceId.split(':')[0] === event.targetId) {
            console.error(event.targetId + ' cannot point to itself');
            return false;
        }

        return true;
    }

    // private onShowDefinition(definition: FlowDefinition): void {
    //     TODO: make this work, it's cool!
    //     this.Plumber.reset();
    //     this.setState({ viewDefinition: definition }, () => { this.Plumber.repaint() });
    // }

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
            if (isRealValue(ghostNode) && !isDraggingBack(event)) {
                // Wire up the drag from to our ghost node
                const dragPoint = pendingConnection;
                this.Plumber.recalculate(ghostNode.uuid);
                this.Plumber.connect(dragPoint.nodeUUID + ':' + dragPoint.exitUUID, ghostNode.uuid);

                // Save our position for later
                const { left, top } = snapToGrid(
                    this.ghost.wrappedInstance.ele.offsetLeft,
                    this.ghost.wrappedInstance.ele.offsetTop
                );

                this.props.updateCreateNodePosition({ left, top });

                // Bring up the node editor
                this.props.onOpenNodeEditor(this.props.ghostNode, null, this.context.languages);
            }

            // To-do: mock this out
            /* istanbul ignore next */
            $(document).off('mousemove');
        }, 0);

        return true;
    }

    private beforeConnectionDrag(event: ConnectionEvent): boolean {
        return !this.props.translating;
    }

    private getNodes(): JSX.Element[] {
        return Object.keys(this.props.nodes).map(uuid => {
            const renderNode = this.props.nodes[uuid];
            return (
                <ConnectedNode
                    key={uuid}
                    data-spec={nodeSpecId}
                    node={renderNode.node}
                    ui={renderNode.ui}
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
                    plumberRemoveFromDragSelection={this.Plumber.removeFromDragSelection}
                />
            );
        });
    }

    private getDragNode(): JSX.Element {
        return isRealValue(this.props.ghostNode) ? (
            <ConnectedNode
                ref={this.ghostRef}
                key={this.props.ghostNode.uuid}
                data-spec={ghostNodeSpecId}
                ghost={true}
                node={this.props.ghostNode}
                ui={getGhostUI(this.props.ghostNode)}
                Activity={this.Activity}
                plumberRepaintForDuration={this.Plumber.repaintForDuration}
                plumberDraggable={this.Plumber.draggable}
                plumberMakeTarget={this.Plumber.makeTarget}
                plumberRemove={this.Plumber.remove}
                plumberRecalculate={this.Plumber.recalculate}
                plumberMakeSource={this.Plumber.makeSource}
                plumberConnectExit={this.Plumber.connectExit}
                plumberClearDragSelection={this.Plumber.clearDragSelection}
                plumberSetDragSelection={this.Plumber.setDragSelection}
                plumberRemoveFromDragSelection={this.Plumber.removeFromDragSelection}
            />
        ) : null;
    }

    private getSimulator(): JSX.Element {
        return renderIf(this.context.endpoints.engine)(
            <Simulator definition={this.props.definition} Activity={this.Activity} />
        );
    }

    private getNodeEditor(): JSX.Element {
        return renderIf(this.props.nodeEditorOpen)(
            <ConnectedNodeEditor
                plumberConnectExit={this.Plumber.connectExit}
                plumberRepaintForDuration={this.Plumber.repaintForDuration}
            />
        );
    }

    public onMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
        this.containerOffset.x = event.nativeEvent.offsetX - event.pageX;
        this.containerOffset.y = event.nativeEvent.offsetY - event.pageY;

        this.props.updateDragSelection({
            startX: event.pageX + this.containerOffset.x,
            startY: event.pageY + this.containerOffset.y,
            currentX: event.pageX + this.containerOffset.x,
            currentY: event.pageY + this.containerOffset.y
        });
    }

    public onMouseMove(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.props.dragSelection && this.props.dragSelection.startX) {
            const drag = this.props.dragSelection;
            const left = Math.min(drag.startX, drag.currentX);
            const top = Math.min(drag.startY, drag.currentY);
            const right = Math.max(drag.startX, drag.currentX);
            const bottom = Math.max(drag.startY, drag.currentY);

            this.props.updateDragSelection({
                startX: drag.startX,
                startY: drag.startY,
                currentX: event.pageX + this.containerOffset.x,
                currentY: event.pageY + this.containerOffset.y,
                selected: getCollisions(this.props.nodes, { left, top, right, bottom })
            });
        }
    }

    public onMouseUp(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.props.dragSelection) {
            this.props.updateDragSelection({
                startX: null,
                startY: null,
                currentX: null,
                currentY: null,
                selected: this.props.dragSelection.selected
            });

            if (this.props.dragSelection.selected) {
                this.Plumber.setDragSelection(this.props.dragSelection.selected);
            }
        }
    }

    public getDragSelectionBox(): JSX.Element {
        if (this.props.dragSelection && this.props.dragSelection.startX) {
            return (
                <div
                    data-spec={dragSelectSpecId}
                    className={styles.dragSelection}
                    style={{ ...getDragStyle(this.props.dragSelection) }}
                />
            );
        }
        return null;
    }

    public render(): JSX.Element {
        return (
            <>
                {this.getSimulator()}
                {this.getDragNode()}
                {this.getNodeEditor()}
                <div
                    className={styles.nodeList}
                    data-spec={nodesContainerSpecId}
                    onMouseDown={this.onMouseDown}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                >
                    {this.getDragSelectionBox()}
                    {this.getNodes()}
                </div>
            </>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { definition, dependencies, nodes },
    flowEditor: {
        editorUI: { translating, nodeEditorOpen },
        flowUI: { ghostNode, pendingConnection, dragSelection }
    }
}: AppState) => ({
    translating,
    definition,
    nodes,
    dependencies,
    ghostNode,
    pendingConnection,
    nodeEditorOpen,
    dragSelection
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            ensureStartNode,
            resetNodeEditingState,
            onConnectionDrag,
            onOpenNodeEditor,
            updateCreateNodePosition,
            updateConnection,
            updateDragSelection
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(Flow);
