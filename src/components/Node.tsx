import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import * as shallowCompare from 'react-addons-shallow-compare';
import { Language } from './LanguageSelector';
import Action, { ActionProps } from './Action/Action';
import { IDragEvent } from '../services/Plumber';
import ExitComp from './Exit';
import TitleBarComp from './TitleBar';
import {
    FlowDefinition,
    Node,
    UINode,
    Position,
    SwitchRouter,
    AnyAction,
    Endpoints,
    Languages
} from '../flowTypes';
import { titleCase } from '../helpers/utils';
import CounterComp from './Counter';
import ActivityManager from '../services/ActivityManager';
import ComponentMap from '../services/ComponentMap';
import Localization, { LocalizedObject } from '../services/Localization';
import {
    typeConfigListPT,
    operatorConfigListPT,
    getOperatorConfigPT,
    endpointsPT,
    getTypeConfigPT,
    languagesPT
} from '../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../providers/ConfigProvider/configContext';

import * as styles from './Node.scss';
import * as shared from './shared.scss';

/**
 * A point in the flow from which a drag is initiated
 */
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
    iso: string;
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
    openEditor: Function;
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

    /** Account for localized cases */
    if (node.router.type === 'switch') {
        const router = node.router as SwitchRouter;
        router.cases.forEach(kase =>
            localizations.push(Localization.translate(kase, iso, languages, translations))
        );
    }

    /** Account for localized exits */
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
    private firstAction: React.ComponentClass<{}>;
    private clicking: boolean;
    private dragGroup: boolean;

    public static contextTypes = {
        typeConfigList: typeConfigListPT,
        operatorConfigList: operatorConfigListPT,
        getTypeConfig: getTypeConfigPT,
        getOperatorConfig: getOperatorConfigPT,
        endpoints: endpointsPT,
        languages: languagesPT
    };

    constructor(props: NodeProps, context: ConfigProviderContext) {
        super(props);

        this.state = { dragging: false };

        this.eleRef = this.eleRef.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragStop = this.onDragStop.bind(this);
        this.onRemoval = this.onRemoval.bind(this);
    }

    private eleRef(ref: any): void {
        return (this.ele = ref);
    }

    onDragStart(event: any) {
        this.clicking = false;
        this.setState({ dragging: true });
        return false;
    }

    onDrag(event: IDragEvent) {}

    onDragStop(event: IDragEvent) {
        this.setState({ dragging: false });
        this.props.onNodeDragStop(this.props.node);

        var position = $(event.target).position();
        event.e.preventDefault();
        event.e.stopPropagation();
        event.e.stopImmediatePropagation();

        // for older IE
        if (window.event) {
            window.event.cancelBubble = true;
        }

        // update our coordinates
        this.props.onNodeMoved(this.props.node.uuid, {
            x: event.finalPos[0],
            y: event.finalPos[1]
        });
    }

    shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState): boolean {
        if (
            nextProps.ui.position.x !== this.props.ui.position.x ||
            nextProps.ui.position.y !== this.props.ui.position.y
        ) {
            return true;
        }
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {
        this.props.plumberDraggable(
            this.props.node.uuid,
            (event: IDragEvent) => {
                this.onDragStart(event);
                this.props.onNodeDragStart(this.props.node);
            },
            (event: IDragEvent) => {
                this.onDrag(event);
            },
            (event: IDragEvent) => {
                this.onDragStop(event);
            },
            () => {
                if (!this.props.translating) {
                    this.props.onNodeBeforeDrag(this.props.node, this.dragGroup);
                    return true;
                } else {
                    return false;
                }
            }
        );

        // make ourselves a target
        this.props.plumberMakeTarget(this.props.node.uuid);

        // resolve our pending connections, etc
        if (this.props.onNodeMounted) {
            this.props.onNodeMounted(this.props.node);
        }

        // move our drag node around as necessary
        if (this.props.ghost) {
            $(document).bind('mousemove', e => {
                var ele = $(this.ele);
                var left = e.pageX - ele.width() / 2;
                var top = e.pageY;
                var nodeEle = $(this.ele);
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

    private updateDimensions() {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.onUpdateDimensions(this.props.node, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
            }
        }
    }

    componentWillUnmount() {
        this.props.plumberRemove(this.props.node.uuid);
    }

    componentDidUpdate(prevProps: NodeProps, prevState: NodeState) {
        if (!this.props.ghost) {
            try {
                this.props.plumberRecalculate(this.props.node.uuid);
            } catch (error) {
                console.log(error);
            }

            if (
                !this.props.ui.dimensions ||
                (this.props.ui.dimensions.width != this.ele.clientWidth ||
                    this.props.ui.dimensions.height != this.ele.clientHeight)
            ) {
                if (!this.props.translating) {
                    this.updateDimensions();
                }
            }
        } else {
            this.props.plumberRecalculate(this.props.node.uuid);
        }
    }

    onClick(event?: any) {
        let action: AnyAction;
        let localizations: LocalizedObject[] = [];

        // click the last action in the list if we have one
        if (this.props.translating) {
            localizations = getLocalizations(
                this.props.node,
                this.props.iso,
                this.context.languages,
                this.props.translations
            );
        } else if (this.props.node.actions && this.props.node.actions.length > 0) {
            action = this.props.node.actions[this.props.node.actions.length - 1];
        }

        this.props.openEditor({
            /** Node */
            action,
            actionsOnly: true,
            /** Flow */
            node: this.props.node,
            definitinon: this.props.definition,
            iso: this.props.iso,
            nodeUI: this.props.ui,
            localizations,
            typeConfigList: this.context.typeConfigList,
            operatorConfigList: this.context.operatorConfigList,
            getTypeConfig: this.context.getTypeConfig,
            getOperatorConfig: this.context.getOperatorConfig,
            endpoints: this.context.endpoints,
            ComponentMap: this.props.ComponentMap,
            onUpdateLocalizations: this.props.onUpdateLocalizations,
            onUpdateAction: this.props.onUpdateAction,
            onUpdateRouter: this.props.onUpdateRouter
        });
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.props.onRemoveNode(this.props.node);
    }

    render() {
        const classes = ['plumb-drag', styles.node];

        let actions: JSX.Element[] = [];
        let actionList: JSX.Element = null;

        if (this.props.node.actions) {
            // save the first reference off to manage our clicks
            let firstRef: any = {
                ref: (ele: any) => (this.firstAction = ele)
            };

            this.props.node.actions.map((action: AnyAction, idx: number) => {
                const actionConfig = this.context.getTypeConfig(action.type);

                if (actionConfig.hasOwnProperty('component') && actionConfig.component) {
                    let localization: LocalizedObject;

                    if (this.props.translations) {
                        localization = Localization.translate(
                            action,
                            this.props.iso,
                            this.context.languages,
                            this.props.translations
                        );
                    }

                    const actionProps: ActionProps = {
                        /** Flow */
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
                        Localization: localization
                    };

                    const { component: ActionDiv } = actionConfig;

                    actions.push(
                        <Action {...firstRef} key={action.uuid} {...actionProps}>
                            {(action: AnyAction) => <ActionDiv {...action} />}
                        </Action>
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

        const events = {
            onMouseDown: () => (this.clicking = true),
            onMouseUp: (event: any) => {
                if (this.clicking) {
                    this.clicking = false;
                    this.onClick(event);
                }
            }
        };

        let header: JSX.Element = null;
        let addActions: JSX.Element = null;

        if (
            !this.props.node.actions ||
            this.props.node.actions.length == 0 ||
            this.props.ui.type != null
        ) {
            let type = this.props.node.router.type;
            if (this.props.ui.type) {
                type = this.props.ui.type;
            }

            let config = this.context.getTypeConfig(type);
            let { name: title } = config;

            if (this.props.node.router.type === 'switch') {
                let switchRouter = this.props.node.router as SwitchRouter;
                if (switchRouter.result_name) {
                    if (this.props.ui.type === 'expression') {
                        title = `Split by ${titleCase(switchRouter.result_name)}`;
                    } else if (this.props.ui.type === 'wait_for_response') {
                        title = `Wait for ${titleCase(switchRouter.result_name)}`;
                    }
                }
            }

            if (!this.props.node.actions || !this.props.node.actions.length) {
                header = (
                    <div {...events}>
                        <TitleBarComp
                            className={shared[config.type]}
                            showRemoval={!this.props.translating}
                            onRemoval={this.onRemoval}
                            title={title}
                        />
                    </div>
                );
            }
        } else {
            // don't show add actions option if we are translating
            if (!this.props.translating) {
                addActions = (
                    <a
                        className={styles.add}
                        onClick={() => this.props.onAddAction(this.props.node)}>
                        <span className="icon-add" />
                    </a>
                );
            }
        }

        const exits: JSX.Element[] = [];

        if (this.props.node.exits) {
            for (const exit of this.props.node.exits) {
                exits.push(
                    <ExitComp
                        key={exit.uuid}
                        /** Node */
                        exit={exit}
                        Localization={Localization.translate(
                            exit,
                            this.props.iso,
                            this.context.languages,
                            this.props.translations
                        )}
                        /** Flow */
                        translating={this.props.translating}
                        onDisconnect={this.props.onDisconnectExit}
                        Activity={this.props.Activity}
                        plumberMakeSource={this.props.plumberMakeSource}
                        plumberRemove={this.props.plumberRemove}
                        plumberConnectExit={this.props.plumberConnectExit}
                    />
                );
            }
        }

        const modalTitle = <div>Router</div>;

        // are we dragging
        if (this.state.dragging) {
            classes.push(styles.dragging);
        }

        // is this a ghost node
        if (this.props.ghost || (this.props.nodeDragging && !this.state.dragging)) {
            classes.push(styles.ghost);
        }

        let exitClass = '';
        if (this.props.node.exits.length === 1 && !this.props.node.exits[0].name) {
            exitClass = styles.actions;
        }

        let dragLink = null;
        if (!this.props.translating) {
            dragLink = (
                <a
                    title="Drag to move all nodes below here"
                    className={styles.drag_group}
                    onMouseOver={() => (this.dragGroup = true)}
                    onMouseOut={() => (this.dragGroup = false)}>
                    <span className="icon-link" />
                </a>
            );
        }

        // console.log("Rendering " + this.props.node.uuid, this.props.ui.position);
        return (
            <div
                className={classes.join(' ')}
                ref={this.eleRef}
                id={this.props.node.uuid}
                style={{
                    left: this.props.ui.position.x,
                    top: this.props.ui.position.y
                }}>
                {dragLink}
                <CounterComp
                    ref={this.props.Activity.registerListener}
                    getCount={() => this.props.Activity.getActiveCount(this.props.node.uuid)}
                    onUnmount={(key: string) => this.props.Activity.deregister(key)}
                    containerStyle={styles.active}
                    countStyle={''}
                />
                {header}
                {actionList}
                <div className={`${styles.exit_table} ${exitClass}`}>
                    <div className={styles.exits} {...events}>
                        {exits}
                    </div>
                </div>
                {addActions}
            </div>
        );
    }
}
