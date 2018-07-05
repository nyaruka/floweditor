import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as isEqual from 'fast-deep-equal';
import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CounterComp from '~/components/Counter';
import ExitComp from '~/components/Exit';
import ActionWrapper from '~/components/flow/actions/action/Action';
import * as styles from '~/components/Node.scss';
import * as shared from '~/components/shared.scss';
import TitleBar from '~/components/titlebar';
import { getOperatorConfig } from '~/config/operatorConfigs';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import {
    AnyAction,
    FlowDefinition,
    FlowNode,
    RouterTypes,
    SwitchRouter,
    UINode
} from '~/flowTypes';
import ActivityManager from '~/services/ActivityManager';
import { Asset } from '~/services/AssetService';
import Plumber, { DragEvent } from '~/services/Plumber';
import {
    AppState,
    DispatchWithState,
    OnAddToNode,
    onAddToNode,
    OnNodeMoved,
    onNodeMoved,
    OnOpenNodeEditor,
    onOpenNodeEditor,
    RemoveNode,
    removeNode,
    updateDimensions,
    UpdateDimensions,
    UpdateDragGroup,
    updateDragGroup,
    UpdateDragSelection,
    UpdateNodeDragging,
    updateNodeDragging
} from '~/store';
import { DragSelection, updateDragSelection } from '~/store/flowEditor';
import { ClickHandler, createClickHandler, snapToGrid, titleCase } from '~/utils';

// TODO: Remove use of Function
// tslint:disable:ban-types
// A point in the flow from which a drag is initiated
export interface DragPoint {
    exitUUID: string;
    nodeUUID: string;
    onResolved?(canceled: boolean): void;
}

export interface NodePassedProps {
    node: FlowNode;
    ui: UINode;
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
    definition: FlowDefinition;
    languages: Asset[];
    nodeDragging: boolean;
    updateNodeDragging: UpdateNodeDragging;
    onAddToNode: OnAddToNode;
    onNodeMoved: OnNodeMoved;
    onOpenNodeEditor: OnOpenNodeEditor;
    removeNode: RemoveNode;
    updateDimensions: UpdateDimensions;
    updateDragGroup: UpdateDragGroup;
    updateDragSelection: UpdateDragSelection;
    dragSelection: DragSelection;
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
            include: [/Ref$/, /^on/, /^get/]
        });

        this.events = createClickHandler(this.onClick);
    }

    private eleRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
    }

    public shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState): boolean {
        if (nextState.thisNodeDragging !== this.state.thisNodeDragging) {
            return true;
        }

        if (!isEqual(nextProps, this.props)) {
            return true;
        }

        return false;
    }

    public componentDidUpdate(prevProps: NodeProps, prevState: NodeState): void {
        if (!this.props.ghost) {
            this.props.plumberRepaintForDuration();

            try {
                this.props.plumberRecalculate(this.props.node.uuid);
            } catch (error) {
                console.log(error);
            }

            if (
                !this.props.ui.position ||
                (this.props.ui.position.right !==
                    this.props.ui.position.left + this.ele.clientWidth ||
                    this.props.ui.position.bottom !==
                        this.props.ui.position.top + this.ele.clientHeight)
            ) {
                if (!this.props.translating) {
                    this.updateDimensions();
                }
            }
        } else {
            this.props.plumberRecalculate(this.props.node.uuid);
        }
    }

    public componentDidMount(): void {
        this.props.plumberDraggable(
            this.props.node.uuid,
            (event: DragEvent) => {
                this.onDragStart(event);
                this.props.updateNodeDragging(true);
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
        this.props.plumberMakeTarget(this.props.node.uuid);

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
        this.props.plumberRemove(this.props.node.uuid);
    }

    private onMouseOver(): void {
        this.props.updateDragGroup(true);
    }

    private onMouseOut(): void {
        this.props.updateDragGroup(false);
    }

    private onAddToNode(): void {
        this.props.onAddToNode(this.props.node);
    }

    private onDragStart(event: any): boolean {
        // are we dragging a node not in our selection
        if (this.props.dragSelection && this.props.dragSelection.selected && !this.isSelected()) {
            this.props.updateDragSelection(null);
            this.props.plumberClearDragSelection();
        }
        this.setState({ thisNodeDragging: true });
        return false;
    }

    private onDrag(event: DragEvent): void {
        return;
    }

    private onDragStop(event: DragEvent): void {
        this.props.updateNodeDragging(false);

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
        this.props.onNodeMoved(this.props.node.uuid, { left, top });
        this.props.plumberRemoveFromDragSelection(this.props.node.uuid);
    }

    private updateDimensions(): void {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.updateDimensions(this.props.node, {
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
            this.props.onOpenNodeEditor({ originalNode: this.props.node });
        }
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.props.removeNode(this.props.node);
    }

    private onUnmount(key: string): void {
        this.props.Activity.deregister(key);
    }

    private getCount(): number {
        return this.props.Activity.getActiveCount(this.props.node.uuid);
    }

    private getExits(): JSX.Element[] {
        if (this.props.node.exits) {
            return this.props.node.exits.map(exit => (
                <ExitComp
                    key={exit.uuid}
                    node={this.props.node}
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
            this.props.dragSelection.selected[this.props.node.uuid]
        );
    }

    private hasMissing(): boolean {
        if (this.props.node.router) {
            const kases = (this.props.node.router as SwitchRouter).cases || [];
            for (const kase of kases) {
                if (!getOperatorConfig(kase.type)) {
                    return true;
                }
            }
        }
        return false;
    }

    public render(): JSX.Element {
        const actions: JSX.Element[] = [];

        let actionList: JSX.Element = null;
        if (this.props.node.actions) {
            // Save the first reference off to manage our clicks
            let firstRef: { ref: (ref: any) => any } | {} = {
                ref: (ref: any) => (this.firstAction = ref)
            };

            this.props.node.actions.forEach((action: AnyAction, idx: number) => {
                const actionConfig = getTypeConfig(action.type);

                if (actionConfig.hasOwnProperty('component') && actionConfig.component) {
                    const { component: ActionDiv } = actionConfig;
                    actions.push(
                        <ActionWrapper
                            {...firstRef}
                            key={action.uuid}
                            node={this.props.node}
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
            !this.props.node.actions ||
            !this.props.node.actions.length ||
            this.props.ui.type != null
        ) {
            let type = this.props.node.router.type;

            if (this.props.ui.type) {
                type = this.props.ui.type as any;
            }

            const config = getTypeConfig(type);
            let { name: title } = config;

            if (this.props.node.router.type === RouterTypes.switch) {
                const switchRouter = this.props.node.router as SwitchRouter;
                if (switchRouter.result_name) {
                    if (this.props.ui.type === Types.split_by_expression) {
                        title = `Split by ${titleCase(switchRouter.result_name)}`;
                    } else if (this.props.ui.type === Types.wait_for_response) {
                        title = `Wait for ${titleCase(switchRouter.result_name)}`;
                    }
                }
            }

            if (!this.props.node.actions || !this.props.node.actions.length) {
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
            this.props.node.exits.length === 1 && !this.props.node.exits[0].name
                ? styles.unnamed_exit
                : '';

        const style = {
            left: this.props.ui.position.left,
            top: this.props.ui.position.top
        };

        return (
            <div
                style={style}
                id={this.props.node.uuid}
                className={`${styles.node_container} ${classes}`}
                ref={this.eleRef}
            >
                <div className={styles.node}>
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

const mapStateToProps = ({
    flowContext: { definition, languages },
    flowEditor: {
        editorUI: { translating },
        flowUI: { nodeDragging, dragSelection }
    }
}: AppState) => ({
    translating,
    definition,
    languages,
    nodeDragging,
    dragSelection
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateDragSelection,
            updateNodeDragging,
            onAddToNode,
            onNodeMoved,
            onOpenNodeEditor,
            removeNode,
            updateDimensions,
            updateDragGroup
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(NodeComp);
