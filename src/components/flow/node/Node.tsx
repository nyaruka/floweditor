import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CounterComp from '~/components/counter/Counter';
import ActionWrapper from '~/components/flow/actions/action/Action';
import ExitComp from '~/components/flow/exit/Exit';
import * as styles from '~/components/flow/node/Node.scss';
import * as shared from '~/components/shared.scss';
import TitleBar from '~/components/titlebar/TitleBar';
import { getOperatorConfig } from '~/config/operatorConfigs';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { AnyAction, FlowDefinition, RouterTypes, SwitchRouter } from '~/flowTypes';
import ActivityManager from '~/services/ActivityManager';
import { Asset } from '~/services/AssetService';
import { DragEvent } from '~/services/Plumber';
import { DebugState, DragSelection } from '~/store/editor';
import { RenderNode } from '~/store/flowContext';
import AppState from '~/store/state';
import {
    DispatchWithState,
    mergeEditorState,
    MergeEditorState,
    OnAddToNode,
    onAddToNode,
    OnNodeMoved,
    onNodeMoved,
    OnOpenNodeEditor,
    onOpenNodeEditor,
    RemoveNode,
    removeNode,
    updateDimensions,
    UpdateDimensions
} from '~/store/thunks';
import { ClickHandler, createClickHandler, snapToGrid, titleCase } from '~/utils';

// TODO: Remove use of Function
// tslint:disable:ban-types
export interface NodePassedProps {
    nodeUUID: string;
    Activity: ActivityManager;
    plumberRepaintForDuration: Function;
    plumberDraggable: Function;
    plumberMakeTarget: Function;
    plumberRemove: Function;
    plumberRecalculate: Function;
    plumberMakeSource: Function;
    plumberConnectExit: Function;
    plumberSetDragSelection: Function;
    plumberClearDragSelection: Function;
    plumberRemoveFromDragSelection: Function;
    ghostRef?: any;
    ghost?: boolean;
}

export interface NodeStoreProps {
    translating: boolean;
    dragSelection: DragSelection;
    nodeDragging: boolean;
    debug: DebugState;
    renderNode: RenderNode;
    definition: FlowDefinition;
    languages: Asset[];
    onAddToNode: OnAddToNode;
    onNodeMoved: OnNodeMoved;
    onOpenNodeEditor: OnOpenNodeEditor;
    removeNode: RemoveNode;
    updateDimensions: UpdateDimensions;
    mergeEditorState: MergeEditorState;
}

export type NodeProps = NodePassedProps & NodeStoreProps;

export interface NodeState {
    thisNodeDragging: boolean;
}

const cx = classNames.bind({ ...shared, ...styles });

/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.Component<NodeProps, NodeState> {
    public ele: HTMLDivElement;
    private firstAction: any;
    private clicking: boolean;
    private events: ClickHandler;

    constructor(props: NodeProps) {
        super(props);

        this.state = { thisNodeDragging: false };

        bindCallbacks(this, {
            include: [/Ref$/, /^on/, /^get/, /^handle/]
        });

        this.events = createClickHandler(this.onClick);
    }

    private eleRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
    }

    public componentDidUpdate(prevProps: NodeProps, prevState: NodeState): void {
        if (!this.props.ghost) {
            this.props.plumberRepaintForDuration();

            try {
                this.props.plumberRecalculate(this.props.renderNode.node.uuid);
            } catch (error) {
                console.log(error);
            }

            if (
                !this.props.renderNode.ui.position ||
                (this.props.renderNode.ui.position.right !==
                    this.props.renderNode.ui.position.left + this.ele.clientWidth ||
                    this.props.renderNode.ui.position.bottom !==
                        this.props.renderNode.ui.position.top + this.ele.clientHeight)
            ) {
                if (!this.props.translating) {
                    this.updateDimensions();
                }
            }
        } else {
            this.props.plumberRecalculate(this.props.renderNode.node.uuid);
        }
    }

    public componentDidMount(): void {
        this.props.plumberDraggable(
            this.props.renderNode.node.uuid,
            (event: DragEvent) => {
                this.onDragStart(event);
                this.props.mergeEditorState({ nodeDragging: true });
            },
            (event: DragEvent) => this.onDrag(event),
            (event: DragEvent) => this.onDragStop(event),
            () => {
                if (!this.props.translating) {
                    return true;
                } else {
                    return false;
                }
            }
        );

        // Make ourselves a target
        this.props.plumberMakeTarget(this.props.renderNode.node.uuid);

        // Move our drag node around as necessary
        if (this.props.ghost) {
            $(document).bind('mousemove', e => {
                const ele = $(this.ele);
                const left = e.pageX - ele.width() / 2;
                const top = e.pageY;
                const nodeEle = $(this.ele);

                nodeEle.offset({ left, top });

                // Hide ourselves if there's a drop target
                // TODO: a less ugly way to accomplish this would be great
                if ($('.plumb-drop-hover').length > 0) {
                    nodeEle.hide();
                } else {
                    nodeEle.show();
                }
            });
        } else {
            this.updateDimensions();
        }
    }

    public componentWillUnmount(): void {
        this.props.plumberRemove(this.props.renderNode.node.uuid);
    }

    /* istanbul ignore next */
    private handleUUIDClicked(event: React.MouseEvent<HTMLDivElement>): void {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(event.currentTarget);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
        console.log(event.currentTarget.textContent + ' copied to clipboard.');
    }

    private onAddToNode(): void {
        this.props.onAddToNode(this.props.renderNode.node);
    }

    private onDragStart(event: any): boolean {
        // are we dragging a node not in our selection
        if (this.props.dragSelection && this.props.dragSelection.selected && !this.isSelected()) {
            this.props.mergeEditorState({ dragSelection: null });
            this.props.plumberClearDragSelection();
        }
        this.setState({ thisNodeDragging: true });
        return false;
    }

    private onDrag(event: DragEvent): void {
        return;
    }

    private onDragStop(event: DragEvent): void {
        this.props.mergeEditorState({ nodeDragging: false });

        event.e.preventDefault();
        event.e.stopPropagation();
        event.e.stopImmediatePropagation();

        // For older IE
        if (window.event) {
            window.event.cancelBubble = true;
        }

        this.setState({ thisNodeDragging: false });

        const { left, top } = snapToGrid(event.finalPos[0], event.finalPos[1]);
        this.ele.style.left = `${left}px`;
        this.ele.style.top = `${top}px`;

        // Update our coordinates
        this.props.onNodeMoved(this.props.renderNode.node.uuid, { left, top });
        this.props.plumberRemoveFromDragSelection(this.props.renderNode.node.uuid);
    }

    private updateDimensions(): void {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.updateDimensions(this.props.renderNode.node, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
            }
        }
    }

    // Applies only to router nodes;
    // ./Action/Action handles click logic for Action nodes.
    private onClick(event: React.MouseEvent<HTMLDivElement>): void {
        if (!this.props.nodeDragging) {
            this.props.onOpenNodeEditor({
                originalNode: this.props.renderNode
            });
        }
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.props.removeNode(this.props.renderNode.node);
    }

    private onUnmount(key: string): void {
        this.props.Activity.deregister(key);
    }

    private getCount(): number {
        return this.props.Activity.getActiveCount(this.props.renderNode.node.uuid);
    }

    private getExits(): JSX.Element[] {
        if (this.props.renderNode.node.exits) {
            return this.props.renderNode.node.exits.map(exit => (
                <ExitComp
                    key={exit.uuid}
                    node={this.props.renderNode.node}
                    exit={exit}
                    Activity={this.props.Activity}
                    plumberMakeSource={this.props.plumberMakeSource}
                    plumberRemove={this.props.plumberRemove}
                    plumberConnectExit={this.props.plumberConnectExit}
                />
            ));
        }
        return [];
    }

    private isSelected(): boolean {
        return (
            this.props.dragSelection &&
            this.props.dragSelection.selected &&
            this.props.dragSelection.selected[this.props.renderNode.node.uuid]
        );
    }

    private hasMissing(): boolean {
        if (this.props.renderNode.node.router) {
            const kases = (this.props.renderNode.node.router as SwitchRouter).cases || [];
            for (const kase of kases) {
                if (!getOperatorConfig(kase.type)) {
                    return true;
                }
            }
        }
        return false;
    }

    /* istanbul ignore next */
    private renderDebug(): JSX.Element {
        if (this.props.debug) {
            if (this.props.debug.showUUIDs) {
                return (
                    <span
                        id={`uuid-${this.props.renderNode.node.uuid}`}
                        onClick={this.handleUUIDClicked}
                        className={styles.uuid}
                    >
                        {this.props.renderNode.node.uuid}
                    </span>
                );
            }
        }
    }

    public render(): JSX.Element {
        const actions: JSX.Element[] = [];

        let actionList: JSX.Element = null;
        if (this.props.renderNode.node.actions) {
            // Save the first reference off to manage our clicks
            let firstRef: { ref: (ref: any) => any } | {} = {
                ref: (ref: any) => (this.firstAction = ref)
            };

            this.props.renderNode.node.actions.forEach((action: AnyAction, idx: number) => {
                const actionConfig = getTypeConfig(action.type);

                if (actionConfig.hasOwnProperty('component') && actionConfig.component) {
                    const { component: ActionDiv } = actionConfig;
                    actions.push(
                        <ActionWrapper
                            {...firstRef}
                            key={action.uuid}
                            renderNode={this.props.renderNode}
                            thisNodeDragging={this.state.thisNodeDragging}
                            action={action}
                            first={idx === 0}
                            render={(anyAction: AnyAction) => <ActionDiv {...anyAction} />}
                        />
                    );
                }

                firstRef = {};
            });

            actionList = (
                <FlipMove
                    enterAnimation="fade"
                    leaveAnimation="fade"
                    className={styles.actions}
                    duration={300}
                    easing="ease-out"
                >
                    {actions}
                </FlipMove>
            );
        }

        let header: JSX.Element = null;
        let addActions: JSX.Element = null;

        // Router node display logic
        if (
            !this.props.renderNode.node.actions ||
            !this.props.renderNode.node.actions.length ||
            this.props.renderNode.ui.type != null
        ) {
            let type = this.props.renderNode.node.router.type;

            if (this.props.renderNode.ui.type) {
                type = this.props.renderNode.ui.type as any;
            }

            const config = getTypeConfig(type);
            let { name: title } = config;

            if (this.props.renderNode.node.router.type === RouterTypes.switch) {
                const switchRouter = this.props.renderNode.node.router as SwitchRouter;
                if (switchRouter.result_name) {
                    if (this.props.renderNode.ui.type === Types.split_by_expression) {
                        title = `Split by ${titleCase(switchRouter.result_name)}`;
                    } else if (this.props.renderNode.ui.type === Types.wait_for_response) {
                        title = `Wait for ${titleCase(switchRouter.result_name)}`;
                    }
                }
            }

            if (!this.props.renderNode.node.actions || !this.props.renderNode.node.actions.length) {
                // Router headers are introduced here while action headers are introduced in ./Action/Action

                header = (
                    // Wrap in a relative parent so it honors node clipping
                    <div style={{ position: 'relative' }}>
                        <div {...this.events}>
                            <TitleBar
                                __className={shared[this.hasMissing() ? 'missing' : config.type]}
                                showRemoval={!this.props.translating}
                                onRemoval={this.onRemoval}
                                title={title}
                            />
                        </div>
                    </div>
                );
            }
        } else {
            // Don't show add actions option if we are translating
            if (!this.props.translating) {
                addActions = (
                    <a className={styles.add} onClick={this.onAddToNode}>
                        <span className="fe-add" />
                    </a>
                );
            }
        }

        const exits: JSX.Element[] = this.getExits();

        const classes = cx({
            'plumb-drag': true,
            [styles.dragging]: this.state.thisNodeDragging,
            [styles.ghost]: this.props.ghost,
            [styles.translating]: this.props.translating,
            [styles.nondragged]: this.props.nodeDragging && !this.state.thisNodeDragging,
            [styles.selected]: this.isSelected()
        });

        const exitClass =
            this.props.renderNode.node.exits.length === 1 &&
            !this.props.renderNode.node.exits[0].name
                ? styles.unnamed_exit
                : '';

        const style = {
            left: this.props.renderNode.ui.position.left,
            top: this.props.renderNode.ui.position.top
        };

        const uuid: JSX.Element = this.renderDebug();

        return (
            <div
                style={style}
                id={this.props.renderNode.node.uuid}
                className={`${styles.node_container} ${classes}`}
                ref={this.eleRef}
            >
                <div className={styles.node}>
                    {uuid}

                    <CounterComp
                        ref={this.props.Activity.registerListener}
                        getCount={this.getCount}
                        onUnmount={this.onUnmount}
                        containerStyle={styles.active}
                        countStyle={''}
                    />
                    <div className={styles.cropped}>
                        {header}
                        {actionList}
                    </div>
                    <div className={`${styles.exit_table} ${exitClass}`}>
                        <div className={styles.exits} {...this.events}>
                            {exits}
                        </div>
                        {addActions}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (
    {
        flowContext: { nodes, definition, languages },
        editorState: { translating, debug, dragSelection, nodeDragging, ghostNode }
    }: AppState,
    props: NodePassedProps
) => ({
    translating,
    debug,
    dragSelection,
    nodeDragging,
    definition,
    languages,
    renderNode:
        ghostNode && ghostNode.node.uuid === props.nodeUUID ? ghostNode : nodes[props.nodeUUID]
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            onAddToNode,
            onNodeMoved,
            onOpenNodeEditor,
            removeNode,
            updateDimensions,
            mergeEditorState
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(NodeComp);
