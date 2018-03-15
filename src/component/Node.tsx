import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import * as shallowCompare from 'react-addons-shallow-compare';
import { Language } from './LanguageSelector';
import ActionComp, { ActionProps } from './actions/Action';
import { DragEvent } from '../services/Plumber';
import ExitComp from './Exit';
import TitleBar from './TitleBar';
import {
    Exit,
    FlowDefinition,
    Node,
    UINode,
    Position,
    SwitchRouter,
    AnyAction,
    Endpoints,
    Languages
} from '../flowTypes';
import { titleCase, snapToGrid } from '../utils';
import CounterComp from './Counter';
import ActivityManager from '../services/ActivityManager';
import ComponentMap from '../services/ComponentMap';
import Localization, { LocalizedObject } from '../services/Localization';
import { ConfigProviderContext, endpointsPT, languagesPT, getTypeConfig } from '../config';
import { NodeEditorProps } from './NodeEditor/NodeEditor';

import * as styles from './Node.scss';
import * as shared from './shared.scss';
import { react as bindCallbacks } from 'auto-bind';

// A point in the flow from which a drag is initiated
export interface DragPoint {
    exitUUID: string;
    nodeUUID: string;
    onResolved?(canceled: boolean): void;
}

export interface NodeState {
    dragging?: boolean;
    createPosition?: Position;
}

export interface NodeProps {
    nodeDragging?: boolean;
    node: Node;
    ui: UINode;
    Activity: ActivityManager;
    translations: { [uuid: string]: any };
    language: Language;
    translating: boolean;
    definition: FlowDefinition;
    ghost?: boolean;
    onNodeMounted: Function;
    onUpdateDimensions: Function;
    onNodeMoved: Function;
    onNodeDragStart: Function;
    onNodeBeforeDrag: Function;
    onDisconnectExit(exitUUID: string): void;
    onNodeDragStop: Function;
    openEditor(props: NodeEditorProps): void;
    onAddAction: Function;
    onRemoveNode: Function;
    onUpdateLocalizations: Function;
    onUpdateAction: Function;
    onUpdateRouter: Function;
    onRemoveAction: Function;
    onMoveActionUp: Function;
    ComponentMap: ComponentMap;
    plumberDraggable: Function;
    plumberMakeTarget: Function;
    plumberRemove: Function;
    plumberRecalculate: Function;
    plumberMakeSource: Function;
    plumberConnectExit: Function;
}

export const getLocalizations = (
    node: Node,
    iso: string,
    languages: Languages,
    translations?: { [uuid: string]: any }
): LocalizedObject[] => {
    const localizations: LocalizedObject[] = [];

    // Account for localized cases
    if (node.router && node.router.type === 'switch') {
        const router = node.router as SwitchRouter;

        router.cases.forEach(kase =>
            localizations.push(Localization.translate(kase, iso, languages, translations))
        );
    }

    // Account for localized exits
    node.exits.forEach(exit => {
        localizations.push(Localization.translate(exit, iso, languages, translations));
    });

    return localizations;
};

/**
 * A single node in the rendered flow
 */
export default class NodeComp extends React.Component<NodeProps, NodeState> {
    public ele: HTMLDivElement;
    private firstAction: ActionComp;
    private clicking: boolean;
    private dragGroup: boolean;
    private events: { onMouseDown(): void; onMouseUp(event: any): void };

    public static contextTypes = {
        endpoints: endpointsPT,
        languages: languagesPT
    };

    constructor(props: NodeProps, context: ConfigProviderContext) {
        super(props);

        this.state = { dragging: false };

        bindCallbacks(this, {
            include: [
                'eleRef',
                'onMouseOver',
                'onMouseOut',
                'onAddAction',
                'onClick',
                'onDragStart',
                'onDrag',
                'onDragStop',
                'onRemoval',
                'onUnmount',
                'getCount'
            ]
        });

        this.events = {
            onMouseDown: () => (this.clicking = true),
            onMouseUp: (event: any) => {
                if (this.clicking) {
                    this.clicking = false;

                    this.onClick(event);
                }
            }
        };
    }

    private eleRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
    }

    public componentDidMount(): void {
        this.props.plumberDraggable(
            this.props.node.uuid,
            (event: DragEvent) => {
                this.onDragStart(event);
                this.props.onNodeDragStart(this.props.node);
            },
            (event: DragEvent) => this.onDrag(event),
            (event: DragEvent) => this.onDragStop(event),
            () => {
                if (!this.props.translating) {
                    this.props.onNodeBeforeDrag(this.props.node, this.dragGroup);

                    return true;
                } else {
                    return false;
                }
            }
        );

        // Make ourselves a target
        this.props.plumberMakeTarget(this.props.node.uuid);

        // Resolve our pending connections, etc
        if (this.props.onNodeMounted) {
            this.props.onNodeMounted(this.props.node);
        }

        // move our drag node around as necessary
        if (this.props.ghost) {
            $(document).bind('mousemove', e => {
                const ele = $(this.ele);
                let left = e.pageX - ele.width() / 2;
                let top = e.pageY;
                const nodeEle = $(this.ele);

                nodeEle.offset({ left, top });

                // hide ourselves there's a drop target
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

    public shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState): boolean {
        if (
            nextProps.ui.position.x !== this.props.ui.position.x ||
            nextProps.ui.position.y !== this.props.ui.position.y
        ) {
            return true;
        }
        return shallowCompare(this, nextProps, nextState);
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

    public componentWillUnmount(): void {
        this.props.plumberRemove(this.props.node.uuid);
    }

    private onMouseOver(): boolean {
        return (this.dragGroup = true);
    }

    private onMouseOut(): boolean {
        return (this.dragGroup = false);
    }

    private onAddAction(): void {
        this.props.onAddAction(this.props.node);
    }

    private onDragStart(event: any): boolean {
        this.clicking = false;
        this.setState({ dragging: true });

        return false;
    }

    private onDrag(event: DragEvent): void {}

    private onDragStop(event: DragEvent): void {
        this.setState({ dragging: false });

        this.props.onNodeDragStop(this.props.node);

        const position = $(event.target).position();

        event.e.preventDefault();
        event.e.stopPropagation();
        event.e.stopImmediatePropagation();

        // For older IE
        if (window.event) {
            window.event.cancelBubble = true;
        }

        const { left, top } = snapToGrid(event.finalPos[0], event.finalPos[1]);
        this.ele.style.left = left + 'px';
        this.ele.style.top = top + 'px';

        // Update our coordinates
        this.props.onNodeMoved(this.props.node.uuid, { x: left, y: top });
    }

    private updateDimensions(): void {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.onUpdateDimensions(this.props.node, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
            }
        }
    }

    // Applies only to router nodes; ./Action/Action handles click logic for Action nodes
    public onClick(event?: any): void {
        let localizations: LocalizedObject[] = [];

        // click the last action in the list if we have one
        if (this.props.translating) {
            localizations = getLocalizations(
                this.props.node,
                this.props.language.iso,
                this.context.languages,
                this.props.translations
            );
        }

        let nodeEditorProps: NodeEditorProps = {
            // Flow
            node: this.props.node,
            definition: this.props.definition,
            language: this.props.language,
            nodeUI: this.props.ui,
            translating: this.props.translating,
            localizations,
            ComponentMap: this.props.ComponentMap,
            onUpdateLocalizations: this.props.onUpdateLocalizations,
            onUpdateAction: this.props.onUpdateAction,
            onUpdateRouter: this.props.onUpdateRouter
        };

        // account for hybrids or clicking on the empty exit table
        if (this.props.node.actions && this.props.node.actions.length) {
            nodeEditorProps = {
                ...nodeEditorProps,
                action: this.props.node.actions[this.props.node.actions.length - 1]
            };
        }

        this.props.openEditor(nodeEditorProps);
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.props.onRemoveNode(this.props.node);
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
                const localization: LocalizedObject = Localization.translate(
                    exit,
                    this.props.language.iso,
                    this.context.languages,
                    this.props.translations
                );

                return (
                    <ExitComp
                        key={exit.uuid}
                        // Node
                        exit={exit}
                        localization={localization}
                        // Flow
                        translating={this.props.translating}
                        onDisconnect={this.props.onDisconnectExit}
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
        const classes = ['plumb-drag', styles.node];

        const actions: JSX.Element[] = [];
        let actionList: JSX.Element = null;

        if (this.props.node.actions) {
            // Save the first reference off to manage our clicks
            let firstRef: { ref(ref: ActionComp): ActionComp } | {} = {
                ref: (ref: ActionComp): ActionComp => (this.firstAction = ref)
            };

            this.props.node.actions.forEach((action: AnyAction, idx: number) => {
                const actionConfig = getTypeConfig(action.type);

                if (actionConfig.hasOwnProperty('component') && actionConfig.component) {
                    const localization: LocalizedObject = Localization.translate(
                        action,
                        this.props.language.iso,
                        this.context.languages,
                        this.props.translations
                    );

                    const actionProps: ActionProps = {
                        // Flow
                        node: this.props.node,
                        ComponentMap: this.props.ComponentMap,
                        openEditor: this.props.openEditor,
                        onRemoveAction: this.props.onRemoveAction,
                        onMoveActionUp: this.props.onMoveActionUp,
                        onUpdateLocalizations: this.props.onUpdateLocalizations,
                        onUpdateAction: this.props.onUpdateAction,
                        onUpdateRouter: this.props.onUpdateRouter,
                        /** Node */
                        dragging: this.state.dragging,
                        action,
                        first: idx === 0,
                        hasRouter:
                            this.props.node.hasOwnProperty('router') &&
                            (this.props.node.router !== undefined ||
                                this.props.node.router !== null),
                        definition: this.props.definition,
                        language: this.props.language,
                        translating: this.props.translating,
                        localization
                    };

                    const { component: ActionDiv } = actionConfig;

                    actions.push(
                        <ActionComp {...firstRef} key={action.uuid} {...actionProps}>
                            {(injectedProps: AnyAction) => <ActionDiv {...injectedProps} />}
                        </ActionComp>
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
                    <div {...this.events}>
                        <TitleBar
                            __className={shared[config.type]}
                            node={this.props.node}
                            showRemoval={!this.props.translating}
                            onRemoval={this.onRemoval}
                            title={title}
                        />
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

        const modalTitle = <div>Router</div>;

        if (this.state.dragging) {
            classes.push(styles.dragging);
        }

        if (this.props.ghost) {
            classes.push(styles.ghost);
        }

        if (this.props.translating) {
            classes.push(styles.translating);
        }

        if (this.props.nodeDragging && !this.state.dragging) {
            classes.push(styles.nondragged);
        }

        let exitClass = '';

        if (this.props.node.exits.length === 1 && !this.props.node.exits[0].name) {
            exitClass = styles.unnamed_exit;
        }

        const dragLink = this.getDragLink();

        const style = {
            left: this.props.ui.position.x,
            top: this.props.ui.position.y
        };

        return (
            <div
                className={classes.join(' ')}
                ref={this.eleRef}
                id={this.props.node.uuid}
                style={style}>
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
        );
    }
}
