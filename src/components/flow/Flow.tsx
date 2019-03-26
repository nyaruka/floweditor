import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Canvas } from '~/components/canvas/Canvas';
import { CanvasDraggableProps } from '~/components/canvas/CanvasDraggable';
import ConnectedNode from '~/components/flow/node/Node';
import { getDraggedFrom } from '~/components/helpers';
import ConnectedNodeEditor from '~/components/nodeeditor/NodeEditor';
import Simulator from '~/components/simulator/Simulator';
import Sticky, { STICKY_BODY, STICKY_TITLE } from '~/components/sticky/Sticky';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { getActivity } from '~/external';
import { Exit, FlowDefinition, FlowPosition } from '~/flowTypes';
import ActivityManager from '~/services/ActivityManager';
import Plumber from '~/services/Plumber';
import { DragSelection, EditorState } from '~/store/editor';
import { RenderNode } from '~/store/flowContext';
import { detectLoops } from '~/store/helpers';
import { NodeEditorSettings } from '~/store/nodeEditor';
import AppState from '~/store/state';
import {
    ConnectionEvent,
    DispatchWithState,
    ensureStartNode,
    EnsureStartNode,
    mergeEditorState,
    MergeEditorState,
    NoParamsAC,
    OnConnectionDrag,
    onConnectionDrag,
    OnOpenNodeEditor,
    onOpenNodeEditor,
    OnUpdateCanvasPositions,
    onUpdateCanvasPositions,
    resetNodeEditingState,
    UpdateConnection,
    updateConnection,
    updateSticky,
    UpdateSticky
} from '~/store/thunks';
import { contextTypes } from '~/testUtils';
import {
    createUUID,
    isRealValue,
    NODE_PADDING,
    renderIf,
    snapToGrid,
    timeEnd,
    timeStart
} from '~/utils';
import Debug from '~/utils/debug';

export interface FlowStoreProps {
    editorState: Partial<EditorState>;
    mergeEditorState: MergeEditorState;

    definition: FlowDefinition;
    nodes: { [uuid: string]: RenderNode };
    dependencies: FlowDefinition[];
    nodeEditorSettings: NodeEditorSettings;

    ensureStartNode: EnsureStartNode;
    updateConnection: UpdateConnection;
    onOpenNodeEditor: OnOpenNodeEditor;
    onUpdateCanvasPositions: OnUpdateCanvasPositions;
    resetNodeEditingState: NoParamsAC;
    onConnectionDrag: OnConnectionDrag;
    updateSticky: UpdateSticky;
}

export interface Translations {
    [uuid: string]: any;
}

export const DRAG_THRESHOLD = 3;
export const REPAINT_TIMEOUT = 500;
export const GHOST_POSITION_INITIAL = { left: -1000, top: -1000 };

export const nodeSpecId = 'node';
export const nodesContainerSpecId = 'node-container';
export const ghostNodeSpecId = 'ghost-node';
export const dragSelectSpecId = 'drag-select';

export const isDraggingBack = (event: ConnectionEvent) => {
    return event.suspendedElementId === event.targetId && event.source !== null;
};

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
    private containerOffset = { left: 0, top: 0 };
    private ele: HTMLDivElement;
    private nodeContainerUUID: string;

    // Refs
    private ghost: any;

    public static contextTypes = {
        config: fakePropType,
        endpoints: fakePropType,
        debug: fakePropType
    };

    constructor(props: FlowStoreProps, context: ConfigProviderContext) {
        super(props, context);

        this.nodeContainerUUID = createUUID();

        this.Activity = new ActivityManager(this.props.definition.uuid, getActivity);

        this.Plumber = new Plumber();

        /* istanbul ignore next */
        if (context.debug) {
            window.fe = new Debug(props, this.props.editorState.debug);
        }

        bindCallbacks(this, {
            include: [/Ref$/, /^on/, /^is/, /^get/]
        });

        timeStart('RenderAndPlumb');
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
            this.props.onConnectionDrag(event, this.context.config.flowType);
        });

        this.Plumber.bind('connectionDragStop', (event: ConnectionEvent) =>
            this.onConnectorDrop(event)
        );
        this.Plumber.bind(
            'beforeStartDetach',
            (event: ConnectionEvent) => !this.props.editorState.translating
        );
        this.Plumber.bind('beforeDetach', (event: ConnectionEvent) => true);
        this.Plumber.bind('beforeDrop', (event: ConnectionEvent) =>
            this.onBeforeConnectorDrop(event)
        );

        // If we don't have any nodes, create our first one
        this.props.ensureStartNode();

        let offset = { left: 0, top: 0 };

        /* istanbul ignore next */
        if (this.ele) {
            offset = this.ele.getBoundingClientRect();
        }
        this.containerOffset = { left: offset.left, top: offset.top + window.scrollY };

        timeEnd('RenderAndPlumb');

        // deals with safari load rendering throwing
        // off the jsplumb offsets
        window.setTimeout(() => this.Plumber.repaint(), REPAINT_TIMEOUT);
    }

    public componentWillUnmount(): void {
        this.Plumber.reset();
    }

    /**
     * Called right before a connector is dropped onto a new node
     */
    private onBeforeConnectorDrop(event: ConnectionEvent): boolean {
        this.props.resetNodeEditingState();
        const fromNodeUUID = event.sourceId.split(':')[0];
        try {
            detectLoops(this.props.nodes, fromNodeUUID, event.targetId);
        } catch {
            return false;
        }
        return true;
    }

    /**
     * Called the moment a connector is done dragging, whether it is dropped on an
     * existing node or on to empty space.
     */
    private onConnectorDrop(event: ConnectionEvent): boolean {
        const { ghostNode } = this.props.editorState;
        // Don't show the node editor if we a dragging back to where we were
        if (isRealValue(ghostNode) && !isDraggingBack(event)) {
            // Wire up the drag from to our ghost node
            this.Plumber.recalculate(ghostNode.node.uuid);

            const dragPoint = getDraggedFrom(ghostNode);
            this.Plumber.connect(
                dragPoint.nodeUUID + ':' + dragPoint.exitUUID,
                ghostNode.node.uuid
            );

            // Save our position for later
            const { left, top } = (this.ghost &&
                snapToGrid(
                    this.ghost.wrappedInstance.ele.offsetLeft,
                    this.ghost.wrappedInstance.ele.offsetTop
                )) || { left: 0, top: 0 };

            this.props.editorState.ghostNode.ui.position = { left, top };
            let originalAction = null;
            if (ghostNode.node.actions && ghostNode.node.actions.length === 1) {
                originalAction = ghostNode.node.actions[0];
            }

            // Bring up the node editor
            this.props.onOpenNodeEditor({
                originalNode: ghostNode,
                originalAction
            });
        }

        /* istanbul ignore next */
        $(document).off('mousemove');
        return true;
    }

    private beforeConnectionDrag(event: ConnectionEvent): boolean {
        return !this.props.editorState.translating;
    }

    private getNodes(): CanvasDraggableProps[] {
        return Object.keys(this.props.nodes).map(uuid => {
            const renderNode = this.props.nodes[uuid];
            return {
                uuid,
                position: renderNode.ui.position,
                ele: (selected: boolean) => (
                    <ConnectedNode
                        selected={selected}
                        key={renderNode.node.uuid}
                        data-spec={nodeSpecId}
                        nodeUUID={renderNode.node.uuid}
                        Activity={this.Activity}
                        plumberMakeTarget={this.Plumber.makeTarget}
                        plumberRemove={this.Plumber.remove}
                        plumberRecalculate={this.Plumber.recalculate}
                        plumberMakeSource={this.Plumber.makeSource}
                        plumberConnectExit={this.Plumber.connectExit}
                        plumberUpdateClass={this.Plumber.updateClass}
                    />
                )
            };
        });
    }

    private getStickies(): CanvasDraggableProps[] {
        const stickyMap = this.props.definition._ui.stickies || {};
        return Object.keys(stickyMap).map(uuid => {
            return {
                uuid,
                ele: (selected: boolean) => (
                    <Sticky key={uuid} uuid={uuid} sticky={stickyMap[uuid]} selected={selected} />
                ),
                position: stickyMap[uuid].position
            };
        });
    }

    private getDragNode(): JSX.Element {
        return isRealValue(this.props.editorState.ghostNode) ? (
            <div style={{ position: 'absolute', display: 'block' }}>
                <ConnectedNode
                    selected={false}
                    ref={this.ghostRef}
                    key={this.props.editorState.ghostNode.node.uuid}
                    data-spec={ghostNodeSpecId}
                    ghost={true}
                    nodeUUID={this.props.editorState.ghostNode.node.uuid}
                    Activity={this.Activity}
                    plumberMakeTarget={this.Plumber.makeTarget}
                    plumberRemove={this.Plumber.remove}
                    plumberRecalculate={this.Plumber.recalculate}
                    plumberMakeSource={this.Plumber.makeSource}
                    plumberConnectExit={this.Plumber.connectExit}
                    plumberUpdateClass={this.Plumber.updateClass}
                />
            </div>
        ) : null;
    }

    private getSimulator(): JSX.Element {
        return renderIf(this.context.endpoints && this.context.endpoints.simulateStart)(
            <Simulator mergeEditorState={this.props.mergeEditorState} Activity={this.Activity} />
        );
    }

    private getNodeEditor(): JSX.Element {
        return renderIf(this.props.nodeEditorSettings !== null)(
            <ConnectedNodeEditor
                plumberConnectExit={this.Plumber.connectExit}
                plumberRepaintForDuration={this.Plumber.repaintForDuration}
            />
        );
    }

    private isClickOnCanvas(event: React.MouseEvent<HTMLDivElement>): boolean {
        // TODO: not sure the TS-safe way to access id here
        return (event.target as any).id === this.nodeContainerUUID;
    }

    private onDoubleClick(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.isClickOnCanvas(event)) {
            const { left, top } = snapToGrid(
                event.pageX - this.containerOffset.left - 100 + NODE_PADDING,
                event.pageY - this.containerOffset.top - NODE_PADDING * 2 - 40
            );

            this.props.updateSticky(createUUID(), {
                position: { left, top },
                title: STICKY_TITLE,
                body: STICKY_BODY
            });
        }
    }

    private getCurrentPosition(uuid: string): FlowPosition {
        const renderNode = this.props.nodes[uuid];
        if (renderNode) {
            return renderNode.ui.position;
        }

        const sticky = this.props.definition._ui.stickies[uuid];
        if (sticky) {
            return sticky.position;
        }

        return { left: 0, top: 0 };
    }

    public render(): JSX.Element {
        const draggables = this.getStickies().concat(this.getNodes());

        return (
            <div onDoubleClick={this.onDoubleClick} ref={this.onRef}>
                <Canvas
                    onDragging={(uuids: string[]) => {
                        uuids.forEach((uuid: string) => {
                            if (uuid in this.props.nodes) {
                                this.props.nodes[uuid].node.exits.forEach((exit: Exit) => {
                                    if (exit.destination_uuid) {
                                        uuids.push(uuid + ':' + exit.uuid);
                                    }
                                });
                            }
                        });
                        this.Plumber.recalculateUUIDs(uuids);
                    }}
                    uuid={this.nodeContainerUUID}
                    dragActive={this.props.editorState.dragActive}
                    mergeEditorState={this.props.mergeEditorState}
                    draggables={draggables}
                    onUpdatePositions={this.props.onUpdateCanvasPositions}
                >
                    {this.getSimulator()}
                    {this.getDragNode()}
                    {this.getNodeEditor()}
                </Canvas>
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { definition, dependencies, nodes },
    editorState,
    nodeEditor: { settings }
}: AppState) => {
    return {
        nodeEditorSettings: settings,
        definition,
        nodes,
        dependencies,
        editorState: editorState as Partial<EditorState>
    };
};

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            mergeEditorState,
            ensureStartNode,
            resetNodeEditingState,
            onConnectionDrag,
            onOpenNodeEditor,
            onUpdateCanvasPositions,
            updateConnection,
            updateSticky
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Flow);
