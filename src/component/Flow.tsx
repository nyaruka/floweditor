import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ConfigProviderContext, languagesPT } from '../config';
import { getActivity } from '../external';
import { FlowDefinition, Languages, FlowNode, UINode, StickyNote } from '../flowTypes';
import { v4 as generateUUID } from 'uuid';
import ActivityManager from '../services/ActivityManager';
import Plumber from '../services/Plumber';
import {
    ConnectionEvent,
    DispatchWithState,
    ensureStartNode,
    EnsureStartNode,
    NoParamsAC,
    OnConnectionDrag,
    onConnectionDrag,
    OnOpenNodeEditor,
    onOpenNodeEditor,
    resetNodeEditingState,
    UpdateConnection,
    updateConnection,
    updateCreateNodePosition,
    UpdateCreateNodePosition,
    AppState,
    UpdateDragSelection,
    updateDragSelection,
    updateSticky,
    UpdateSticky
} from '../store';
import { snapToGrid, dump, NODE_PADDING } from '../utils';
import * as styles from './Flow.scss';
import ConnectedNode, { DragPoint } from './Node';
import NodeEditor from './NodeEditor';
import Simulator from './Simulator';
import { RenderNode } from '../store/flowContext';
import { DragSelection } from '../store/flowEditor';
import { getCollisions } from '../store/helpers';
import Sticky from './Sticky';

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
    updateSticky: UpdateSticky;
}

export interface Translations {
    [uuid: string]: any;
}

export class Flow extends React.Component<FlowStoreProps> {
    private Activity: ActivityManager;
    private Plumber: Plumber;
    private containerOffset = { left: 0, top: 0 };
    private ele: HTMLDivElement;
    private nodeContainerUUID: string;

    // Refs
    private ghost: any;

    public static contextTypes = {
        languages: languagesPT
    };

    constructor(props: FlowStoreProps, context: ConfigProviderContext) {
        super(props, context);

        this.nodeContainerUUID = generateUUID();

        this.Activity = new ActivityManager(this.props.definition.uuid, getActivity);

        this.Plumber = new Plumber();

        bindCallbacks(this, {
            include: [/Ref$/, /^on/, /^is/]
        });

        console.time('RenderAndPlumb');
    }

    private onRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
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

        const offset = this.ele.getBoundingClientRect();
        this.containerOffset = { left: offset.left, top: offset.top + window.scrollY };

        console.timeEnd('RenderAndPlumb');

        // deals with safari load rendering throwing
        // off the jsplumb offsets
        window.setTimeout(() => this.Plumber.repaint(), 200);
    }

    public componentDidUpdate(prevProps: FlowStoreProps): void {
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

        if (event.sourceId.split(':')[0] === event.targetId) {
            console.error(event.targetId + ' cannot point to itself');
            return false;
        }

        return true;
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

    private getStickies(): JSX.Element[] {
        let stickyMap = this.props.definition._ui.stickies;
        if (!stickyMap) {
            stickyMap = {};
        }

        return Object.keys(stickyMap).map(uuid => {
            const sticky: StickyNote = stickyMap[uuid];
            return (
                <Sticky
                    key={uuid}
                    uuid={uuid}
                    sticky={sticky}
                    plumberClearDragSelection={this.Plumber.clearDragSelection}
                    plumberDraggable={this.Plumber.draggable}
                    plumberRemove={this.Plumber.remove}
                />
            );
        });
    }

    private getDragNode(): JSX.Element {
        if (this.props.ghostNode) {
            // Start off screen
            const ui: UINode = {
                position: { left: -1000, top: -1000 }
            };

            if (this.props.ghostNode.router) {
                ui.type = 'wait_for_response';
            }

            return (
                <ConnectedNode
                    ref={this.ghostRef}
                    key={this.props.ghostNode.uuid}
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
                    plumberClearDragSelection={this.Plumber.clearDragSelection}
                    plumberSetDragSelection={this.Plumber.setDragSelection}
                    plumberRemoveFromDragSelection={this.Plumber.removeFromDragSelection}
                />
            );
        }

        return null;
    }

    private getSimulator(): JSX.Element {
        /*if (this.context.endpoints.engine) {
            return (
                <Simulator
                    // Editor
                    definition={this.props.definition}
                    // Flow
                    showDefinition={this.onShowDefinition}
                    Activity={this.Activity}
                />
            );
        }*/

        return null;
    }

    private getNodeEditor(): JSX.Element {
        return this.props.nodeEditorOpen ? (
            <NodeEditor
                plumberConnectExit={this.Plumber.connectExit}
                plumberRepaintForDuration={this.Plumber.repaintForDuration}
            />
        ) : null;
    }

    private isClickOnCanvas(event: React.MouseEvent<HTMLDivElement>): boolean {
        // TODO: not sure the TS-safe way to access id here
        return (event.target as any).id === this.nodeContainerUUID;
    }

    private onDoubleClick(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.isClickOnCanvas(event)) {
            const { left, top } = snapToGrid(
                event.clientX - this.containerOffset.left - 100 + NODE_PADDING,
                event.clientY - this.containerOffset.top - NODE_PADDING * 2
            );

            this.props.updateSticky(generateUUID(), {
                position: { left, top },
                title: 'New Note',
                body: '...'
            });
        }
    }

    public onMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.isClickOnCanvas(event)) {
            this.props.updateDragSelection({
                startX: event.pageX - this.containerOffset.left,
                startY: event.pageY - this.containerOffset.top,
                currentX: event.pageX - this.containerOffset.left,
                currentY: event.pageY - this.containerOffset.top,
                selected: null
            });
        }
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
                currentX: event.pageX - this.containerOffset.left,
                currentY: event.pageY - this.containerOffset.top,
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
            const drag = this.props.dragSelection;
            const left = Math.min(drag.startX, drag.currentX);
            const top = Math.min(drag.startY, drag.currentY);
            const width = Math.max(drag.startX, drag.currentX) - left;
            const height = Math.max(drag.startY, drag.currentY) - top;

            return (
                <div
                    key="dragSelect"
                    className={styles.dragSelection}
                    style={{ left, top, width, height }}
                />
            );
        }
        return null;
    }

    public render(): JSX.Element {
        const nodeEditor = this.getNodeEditor();
        const dragNode = this.getDragNode();
        const nodes = this.getNodes();
        const stickies = this.getStickies();
        const simulator = this.getSimulator();

        return (
            <div key={this.props.definition.uuid} id={this.props.definition.uuid} ref={this.onRef}>
                {simulator}
                {dragNode}
                {nodeEditor}
                <div
                    id={this.nodeContainerUUID}
                    className={styles.nodeList}
                    data-spec="nodes"
                    onMouseDown={this.onMouseDown}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onDoubleClick={this.onDoubleClick}
                >
                    {stickies}
                    {this.getDragSelectionBox()}
                    {nodes}
                </div>
            </div>
        );
    }
}

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

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            ensureStartNode,
            resetNodeEditingState,
            onConnectionDrag,
            onOpenNodeEditor,
            updateCreateNodePosition,
            updateConnection,
            updateDragSelection,
            updateSticky
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(Flow);
