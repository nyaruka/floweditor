import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Counter from '~/components/counter/Counter';
import ActionWrapper from '~/components/flow/actions/action/Action';
import { node } from '~/components/flow/actions/startsession/StartSession.scss';
import ExitComp from '~/components/flow/exit/Exit';
import { getCategoriesForExit } from '~/components/flow/node/helpers';
import * as styles from '~/components/flow/node/Node.scss';
import * as shared from '~/components/shared.scss';
import TitleBar from '~/components/titlebar/TitleBar';
import { Types } from '~/config/interfaces';
import { getOperatorConfig } from '~/config/operatorConfigs';
import { getType, getTypeConfig } from '~/config/typeConfigs';
import { AnyAction, Exit, FlowDefinition, FlowNode, RouterTypes, SwitchRouter } from '~/flowTypes';
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
    removeNode,
    RemoveNode
} from '~/store/thunks';
import { ClickHandler, createClickHandler, titleCase } from '~/utils';

export interface NodePassedProps {
    nodeUUID: string;
    plumberMakeTarget: (id: string) => void;
    plumberRecalculate: (id: string) => void;
    plumberMakeSource: (id: string) => void;
    plumberRemove: (id: string) => void;
    plumberConnectExit: (node: FlowNode, exit: Exit) => void;
    plumberUpdateClass: (
        node: FlowNode,
        exit: Exit,
        className: string,
        confirmDelete: boolean
    ) => void;
    startingNode: boolean;
    selected: boolean;
    ghostRef?: any;
    ghost?: boolean;
}

export interface NodeStoreProps {
    results: AssetMap;
    activeCount: number;
    containerOffset: { top: number; left: number };
    translating: boolean;
    dragActive: boolean;
    simulating: boolean;
    debug: DebugState;
    renderNode: RenderNode;
    definition: FlowDefinition;
    onAddToNode: OnAddToNode;
    onNodeMoved: OnNodeMoved;
    onOpenNodeEditor: OnOpenNodeEditor;
    removeNode: RemoveNode;
    mergeEditorState: MergeEditorState;
}

export type NodeProps = NodePassedProps & NodeStoreProps;

const cx = classNames.bind({ ...shared, ...styles });

/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.Component<NodeProps> {
    public ele: HTMLDivElement;
    private firstAction: any;
    private clicking: boolean;
    private events: ClickHandler;

    constructor(props: NodeProps) {
        super(props);

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

    private getGhostListener(): any {
        return (e: MouseEvent) => {
            // move our ghost node into position
            const width = this.ele.getBoundingClientRect().width;
            const left = e.pageX - width / 2 - 15;
            const top = e.pageY + this.ele.scrollTop - (this.props.containerOffset.top + 20);
            const style = this.ele.style;
            style.left = left + 'px';
            style.top = top + 'px';

            // Hide ourselves if there's a drop target
            style.visibility = document.querySelector('.plumb-drop-hover') ? 'hidden' : 'visible';
        };
    }

    public componentDidMount(): void {
        // Make ourselves a target
        this.props.plumberMakeTarget(this.props.renderNode.node.uuid);

        // Move our drag node around as necessary
        if (this.props.ghost) {
            // We store our listener on the window so flow can remove it
            // this is a bit hacky but allows us to remove our dependency on jquery
            // TODO: rework ghost node to manage its location like other nodes
            const ghostListener: any = this.getGhostListener();
            (window as any).ghostListener = ghostListener;
            document.addEventListener('mousemove', ghostListener);
        }
    }

    public componentDidUpdate(prevProps: NodeProps): void {
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

    private getExits(): JSX.Element[] {
        if (this.props.renderNode.node.exits) {
            return this.props.renderNode.node.exits.map(exit => (
                <ExitComp
                    key={exit.uuid}
                    node={this.props.renderNode.node}
                    categories={getCategoriesForExit(this.props.renderNode, exit)}
                    exit={exit}
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

    private isStartNodeVisible(): boolean {
        return this.props.startingNode;
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
            this.props.renderNode.ui.type !== Types.execute_actions
        ) {
            let type = this.props.renderNode.node.router.type;

            if (this.props.renderNode.ui.type) {
                type = getType(this.props.renderNode);
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
            [styles.ghost]: this.props.ghost,
            [styles.flowStart]: this.isStartNodeVisible(),
            [styles.translating]: this.props.translating,
            [styles.selected]: this.isSelected()
        });

        const exitClass = this.props.renderNode.node.router ? styles.unnamed_exit : '';
        const uuid: JSX.Element = this.renderDebug();

        const renderedNode = (
            <div
                id={this.props.renderNode.node.uuid}
                className={`${styles.nodeContainer} ${classes}`}
                ref={this.eleRef}
            >
                {this.isStartNodeVisible() ? (
                    <div className={styles.flowStartMessage}>Flow Start</div>
                ) : null}

                <div className={styles.node}>
                    {uuid}
                    <Counter
                        count={this.props.activeCount}
                        containerStyle={styles.active}
                        countStyle={''}
                        keepVisible={this.props.simulating}
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
        return renderedNode;
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
        editorState: {
            translating,
            debug,
            ghostNode,
            dragActive,
            simulating,
            containerOffset,
            activity
        }
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

    const activeCount = activity.nodes[props.nodeUUID] || 0;

    return {
        results: items,
        activeCount,
        containerOffset,
        translating,
        debug,
        dragActive,
        definition,
        renderNode,
        simulating
    };
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            onAddToNode,
            onNodeMoved,
            onOpenNodeEditor,
            removeNode,
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
