import * as classNames from 'classnames/bind';
import * as React from 'react';
import * as shallowCompare from 'react-addons-shallow-compare';
import * as FlipMove from 'react-flip-move';
import * as isEqual from 'fast-deep-equal';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Config, getTypeConfig } from '../config';
import { AnyAction, FlowDefinition, Languages, Node, SwitchRouter, UINode } from '../flowTypes';
import {
    DispatchWithState,
    getTranslations,
    onAddAction,
    OnAddAction,
    onNodeBeforeDrag,
    OnNodeBeforeDrag,
    OnNodeMoved,
    onNodeMoved,
    onOpenNodeEditor,
    OnOpenNodeEditor,
    AppState,
    RemoveNode,
    removeNode,
    ResolvePendingConnection,
    resolvePendingConnection,
    UpdateDimensions,
    updateDimensions,
    UpdateDragGroup,
    updateNodeDragging,
    UpdateNodeDragging
} from '../store';
import { updateDragGroup } from '../store';
import ActivityManager from '../services/ActivityManager';
import Localization, { LocalizedObject } from '../services/Localization';
import { DragEvent } from '../services/Plumber';
import { snapToGrid, titleCase, createClickHandler, ClickHandler } from '../utils';
import ActionWrapper from './actions/Action';
import CounterComp from './Counter';
import ExitComp from './Exit';
import { Language } from './LanguageSelector';
import * as styles from './Node.scss';
import * as shared from './shared.scss';
import TitleBar from './TitleBar';

// A point in the flow from which a drag is initiated
export interface DragPoint {
    exitUUID: string;
    nodeUUID: string;
    onResolved?(canceled: boolean): void;
}

export interface NodeContainerProps {
    node: Node;
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
    ghostRef?: any;
    ghost?: boolean;
}

export interface NodeStoreProps {
    languages: Languages;
    language: Language;
    translating: boolean;
    definition: FlowDefinition;
    nodeDragging: boolean;
    updateNodeDragging: UpdateNodeDragging;
    onNodeBeforeDrag: OnNodeBeforeDrag;
    resolvePendingConnection: ResolvePendingConnection;
    onAddAction: OnAddAction;
    onNodeMoved: OnNodeMoved;
    onOpenNodeEditor: OnOpenNodeEditor;
    removeNode: RemoveNode;
    updateDimensions: UpdateDimensions;
    updateDragGroup: UpdateDragGroup;
}

export type NodeProps = NodeContainerProps & NodeStoreProps;

export interface NodeState {
    thisNodeDragging: boolean;
}

const cx = classNames.bind({ ...shared, ...styles });

const NodeContainer: React.SFC<NodeContainerProps> = ({
    node,
    ui,
    ghost,
    ghostRef,
    Activity,
    plumberRepaintForDuration,
    plumberDraggable,
    plumberMakeTarget,
    plumberRemove,
    plumberRecalculate,
    plumberMakeSource,
    plumberConnectExit,
    plumberSetDragSelection,
    plumberClearDragSelection
}) => (
    <Config
        render={({ languages }) => (
            <ConnectedNode
                ref={ghostRef}
                node={node}
                ui={ui}
                ghost={ghost}
                languages={languages}
                Activity={Activity}
                plumberRepaintForDuration={plumberRepaintForDuration}
                plumberDraggable={plumberDraggable}
                plumberMakeTarget={plumberMakeTarget}
                plumberRemove={plumberRemove}
                plumberRecalculate={plumberRecalculate}
                plumberMakeSource={plumberMakeSource}
                plumberConnectExit={plumberConnectExit}
                plumberSetDragSelection={plumberSetDragSelection}
                plumberClearDragSelection={plumberClearDragSelection}
            />
        )}
    />
);

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
            try {
                this.props.plumberRecalculate(this.props.node.uuid);
            } catch (error) {
                console.log(error);
            }

            if (
                !this.props.ui.dimensions ||
                (this.props.ui.dimensions.width !== this.ele.clientWidth ||
                    this.props.ui.dimensions.height !== this.ele.clientHeight)
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
                    this.props.onNodeBeforeDrag(
                        this.props.node,
                        this.props.plumberSetDragSelection,
                        this.props.plumberClearDragSelection
                    );
                    return true;
                } else {
                    return false;
                }
            }
        );

        // Make ourselves a target
        this.props.plumberMakeTarget(this.props.node.uuid);

        // Resolve pending connection
        this.props.resolvePendingConnection(this.props.node);

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

    private onAddAction(): void {
        this.props.onAddAction(this.props.node, this.props.languages);
    }

    private onDragStart(event: any): boolean {
        this.setState({ thisNodeDragging: true });
        return false;
    }

    private onDrag(event: DragEvent): void {
        return;
    }

    private onDragStop(event: DragEvent): void {
        this.setState({ thisNodeDragging: false });
        this.props.updateNodeDragging(false);

        const position = $(event.target).position();

        event.e.preventDefault();
        event.e.stopPropagation();
        event.e.stopImmediatePropagation();

        // For older IE
        if (window.event) {
            window.event.cancelBubble = true;
        }

        const { left, top } = snapToGrid(event.finalPos[0], event.finalPos[1]);
        this.ele.style.left = `${left}px`;
        this.ele.style.top = `${top}px`;

        // Update our coordinates
        this.props.onNodeMoved(
            this.props.node.uuid,
            { x: left, y: top },
            this.props.plumberRepaintForDuration
        );
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
            // prettier-ignore
            this.props.onOpenNodeEditor(
            this.props.node,
            null,
            this.props.languages
        );
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
            return this.props.node.exits.map(exit => {
                const translations = getTranslations(this.props.definition, this.props.language);
                const localization: LocalizedObject = Localization.translate(
                    exit,
                    this.props.language.iso,
                    this.props.languages,
                    translations
                );
                return (
                    <ExitComp
                        key={exit.uuid}
                        exit={exit}
                        localization={localization}
                        Activity={this.props.Activity}
                        plumberMakeSource={this.props.plumberMakeSource}
                        plumberRemove={this.props.plumberRemove}
                        plumberConnectExit={this.props.plumberConnectExit}
                    />
                );
            });
        }

        return [];
    }

    private getDragLink(): JSX.Element {
        if (!this.props.translating) {
            return (
                <a
                    title="Drag to move all nodes below here"
                    className={styles.drag_group}
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.onMouseOut}>
                    <span className="icon-link" />
                </a>
            );
        }

        return null;
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
                    const translations = getTranslations(
                        this.props.definition,
                        this.props.language
                    );

                    const localization = Localization.translate(
                        action,
                        this.props.language.iso,
                        this.props.languages,
                        translations
                    );

                    const { component: ActionDiv } = actionConfig;

                    actions.push(
                        <ActionWrapper
                            {...firstRef}
                            key={action.uuid}
                            node={this.props.node}
                            thisNodeDragging={this.state.thisNodeDragging}
                            action={action}
                            first={idx === 0}
                            localization={localization}
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
                    easing="ease-out">
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
                type = this.props.ui.type;
            }

            const config = getTypeConfig(type);
            let { name: title } = config;

            if (this.props.node.router.type === 'switch') {
                const switchRouter = this.props.node.router as SwitchRouter;
                if (switchRouter.result_name) {
                    if (this.props.ui.type === 'split_by_expression') {
                        title = `Split by ${titleCase(switchRouter.result_name)}`;
                    } else if (this.props.ui.type === 'wait_for_response') {
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
                                className={shared[config.type]}
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
                    <a className={styles.add} onClick={this.onAddAction}>
                        <span className="icon-add" />
                    </a>
                );
            }
        }

        const exits: JSX.Element[] = this.getExits();

        const classes = cx({
            'plumb-drag': true,
            [styles.node]: true,
            [styles.dragging]: this.state.thisNodeDragging,
            [styles.ghost]: this.props.ghost,
            [styles.translating]: this.props.translating,
            [styles.nondragged]: this.props.nodeDragging && !this.state.thisNodeDragging.valueOf
        });

        const exitClass =
            this.props.node.exits.length === 1 && !this.props.node.exits[0].name
                ? styles.unnamed_exit
                : '';

        const dragLink = this.getDragLink();

        const style = {
            left: this.props.ui.position.x,
            top: this.props.ui.position.y
        };

        return (
            <div
                ref={this.eleRef}
                style={style}
                id={this.props.node.uuid}
                className={styles.node_container}>
                <div className={classes}>
                    {dragLink}
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
    flowContext: { definition },
    flowEditor: { editorUI: { language, translating }, flowUI: { nodeDragging } }
}: AppState) => ({
    language,
    translating,
    definition,
    nodeDragging
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateNodeDragging,
            onNodeBeforeDrag,
            resolvePendingConnection,
            onAddAction,
            onNodeMoved,
            onOpenNodeEditor,
            removeNode,
            updateDimensions,
            updateDragGroup
        },
        dispatch
    );

// prettier-ignore
const ConnectedNode = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(
    NodeComp
);

export default NodeContainer;
