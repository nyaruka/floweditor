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
import { AnyAction, Endpoints, FlowDefinition, RouterTypes, SwitchRouter } from '~/flowTypes';
import ActivityManager from '~/services/ActivityManager';
import { DebugState } from '~/store/editor';
import { AssetMap, RenderNode } from '~/store/flowContext';
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
import { ClickHandler, createClickHandler, titleCase } from '~/utils';

// TODO: Remove use of Function
// tslint:disable:ban-types
export interface NodePassedProps {
    nodeUUID: string;
    Activity: ActivityManager;
    plumberRepaintForDuration: Function;
    plumberMakeTarget: Function;
    plumberRemove: Function;
    plumberRecalculate: Function;
    plumberMakeSource: Function;
    plumberConnectExit: Function;
    plumberUpdateClass: Function;
    selected: boolean;
    ghostRef?: any;
    ghost?: boolean;
}

export interface NodeStoreProps {
    results: AssetMap;
    translating: boolean;
    dragActive: boolean;
    debug: DebugState;
    renderNode: RenderNode;
    definition: FlowDefinition;
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

        this.events = createClickHandler(this.onClick, this.onShouldCancelClick);
    }

    private onShouldCancelClick(): boolean {
        return this.props.dragActive;
    }

    private eleRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
    }

    public componentDidMount(): void {
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
        }
    }

    public componentDidUpdate(prevProps: NodeProps, prevState: NodeState): void {
        // when our exits change, we need to recalculate the endpoints
        if (!this.props.ghost) {
            try {
                this.props.plumberRecalculate(this.props.renderNode.node.uuid);
                for (const exit of this.props.renderNode.node.exits) {
                    this.props.plumberRecalculate(
                        this.props.renderNode.node.uuid + ':' + exit.uuid
                    );
                }
            } catch (error) {
                // console.log(error);
            }
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

    private updateDimensions(): void {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.updateDimensions(this.props.renderNode.node.uuid, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
            }
        }
    }

    // Applies only to router nodes;
    // ./Action/Action handles click logic for Action nodes.
    private onClick(event: React.MouseEvent<HTMLDivElement>): void {
        this.props.onOpenNodeEditor({
            originalNode: this.props.renderNode
        });
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>): void {
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
                    plumberUpdateClass={this.props.plumberUpdateClass}
                />
            ));
        }
        return [];
    }

    private isSelected(): boolean {
        return this.props.selected;
    }

    private hasMissing(): boolean {
        // see if we are splitting on a missing result
        if (
            this.props.renderNode.ui.type === Types.split_by_run_result ||
            this.props.renderNode.ui.type === Types.split_by_run_result_delimited
        ) {
            if (!(this.props.renderNode.ui.config.operand.id in this.props.results)) {
                return true;
            }
        }

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
                            render={(anyAction: AnyAction, endpoints: Endpoints) => (
                                <ActionDiv {...anyAction} {...{ mediaRoot: endpoints.mediaRoot }} />
                            )}
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
            this.props.renderNode.ui.type !== Types.execute_actions
        ) {
            let type = this.props.renderNode.node.router.type;

            if (this.props.renderNode.ui.type) {
                type = this.props.renderNode.ui.type as any;
            }

            const config = getTypeConfig(type);
            // let { name: title } = config;

            let title: string = null;

            if (this.props.renderNode.node.router.type === RouterTypes.switch) {
                const switchRouter = this.props.renderNode.node.router as SwitchRouter;
                if (switchRouter.result_name) {
                    if (
                        this.props.renderNode.ui.type === Types.split_by_expression ||
                        this.props.renderNode.ui.type === Types.split_by_contact_field
                    ) {
                        title = `Split by ${titleCase(switchRouter.result_name)}`;
                    } else if (this.props.renderNode.ui.type === Types.wait_for_response) {
                        title = `Wait for ${titleCase(switchRouter.result_name)}`;
                    }
                }
            }

            if (
                title === null &&
                (this.props.renderNode.ui.type === Types.split_by_run_result ||
                    this.props.renderNode.ui.type === Types.split_by_run_result_delimited)
            ) {
                if (this.props.renderNode.ui.config.operand.id in this.props.results) {
                    title = `Split by ${
                        this.props.results[this.props.renderNode.ui.config.operand.id].name
                    }`;
                } else {
                    title = `Missing ${this.props.renderNode.ui.config.operand.id}`;
                }
            }

            if (title === null) {
                title = config.name;
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
                                shouldCancelClick={() => this.props.dragActive}
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
                    <div
                        className={styles.add}
                        {...createClickHandler(this.onAddToNode, this.onShouldCancelClick)}
                    >
                        <span className="fe-add" />
                    </div>
                );
            }
        }

        const exits: JSX.Element[] = this.getExits();

        const classes = cx({
            'plumb-drag': true,
            [styles.dragging]: this.state.thisNodeDragging,
            [styles.ghost]: this.props.ghost,
            [styles.translating]: this.props.translating,
            // [styles.nondragged]: this.props.nodeDragging && !this.state.thisNodeDragging,
            [styles.selected]: this.isSelected()
        });

        const exitClass =
            this.props.renderNode.node.exits.length === 1 &&
            !this.props.renderNode.node.exits[0].name
                ? styles.unnamed_exit
                : '';

        const uuid: JSX.Element = this.renderDebug();

        return (
            <div
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
        flowContext: {
            nodes,
            definition,
            assetStore: {
                results: { items }
            }
        },
        editorState: { translating, debug, ghostNode, dragActive }
    }: AppState,
    props: NodePassedProps
) => {
    let renderNode: RenderNode = null;

    // if we match our ghost node use that
    if (ghostNode && ghostNode.node.uuid === props.nodeUUID) {
        renderNode = ghostNode;
    }

    // otherwise look up our node from the list
    else if (props.nodeUUID in nodes) {
        renderNode = nodes[props.nodeUUID];
    }

    if (!renderNode) {
        throw Error("Couldn't find node for " + props.nodeUUID);
    }

    return {
        results: items,
        translating,
        debug,
        dragActive,
        definition,
        renderNode
    };
};

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
