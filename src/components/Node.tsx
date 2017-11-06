import * as React from 'react';
import * as axios from 'axios';
import * as update from 'immutability-helper';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';
import * as FlipMove from 'react-flip-move';
import { IActionProps } from './Action';
import { IFlowContext } from './Flow';
import { IDragEvent } from '../services/Plumber';
import {
    IType,
    IOperator,
    TGetTypeConfig,
    TGetOperatorConfig,
    IEndpoints,
    ILanguages
} from '../services/EditorConfig';
import { ActionComp } from './Action';
import ExitComp from './Exit';
import TitleBar from './TitleBar';
import { INode, IPosition, ISwitchRouter, IAction, IUINode } from '../flowTypes';
import { CounterComp } from './Counter';
import ActivityManager from '../services/ActivityManager';
import ComponentMap from '../services/ComponentMap';
import Localization, { LocalizedObject } from '../services/Localization';

const styles = require('./Node.scss');
const shared = require('./shared.scss');

/**
 * A point in the flow from which a drag is initiated
 */
export interface IDragPoint {
    exitUUID: string;
    nodeUUID: string;
    onResolved?(canceled: boolean): void;
}

export interface INodeState {
    dragging?: boolean;
    createPosition?: IPosition;
}

export interface INodeCompProps {
    node: INode;
    context: IFlowContext;
    ui: IUINode;
    Activity: ActivityManager;
    translations: { [uuid: string]: any };
    language: string;
    ghost?: boolean;

    typeConfigList: IType[];
    operatorConfigList: IOperator[];
    getTypeConfig: TGetTypeConfig;
    getOperatorConfig: TGetOperatorConfig;
    endpoints: IEndpoints;
    languages: ILanguages;
    ComponentMap: ComponentMap;

    plumberDraggable: Function;
    plumberMakeTarget: Function;
    plumberRemove: Function;
    plumberRecalculate: Function;
    plumberMakeSource: Function;
    plumberConnectExit: Function;
}

/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.Component<INodeCompProps, INodeState> {
    public ele: HTMLDivElement;
    private firstAction: ActionComp<IAction>;
    private clicking: boolean;
    private dragGroup: boolean;

    constructor(props: INodeCompProps) {
        super(props);
        this.state = { dragging: false };
        this.onClick = this.onClick.bind(this);
    }

    onDragStart(event: any) {
        this.clicking = false;
        this.setState({ dragging: true });
        return false;
    }

    onDrag(event: IDragEvent) {}

    onDragStop(event: IDragEvent) {
        this.setState({ dragging: false });
        this.props.context.eventHandler.onNodeDragStop(this.props.node);

        var position = $(event.target).position();
        event.e.preventDefault();
        event.e.stopPropagation();
        event.e.stopImmediatePropagation();

        // for older IE
        if (window.event) {
            window.event.cancelBubble = true;
        }

        // update our coordinates
        this.props.context.eventHandler.onNodeMoved(this.props.node.uuid, {
            x: event.finalPos[0],
            y: event.finalPos[1]
        });
    }

    shouldComponentUpdate(nextProps: INodeCompProps, nextState: INodeState): boolean {
        if (
            nextProps.ui.position.x != this.props.ui.position.x ||
            nextProps.ui.position.y != this.props.ui.position.y
        ) {
            return true;
        }
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {
        this.props.plumberDraggable(
            this.props.node.uuid,
            (event: IDragEvent) => {
                this.onDragStart.bind(this)(event);
                this.props.context.eventHandler.onNodeDragStart(this.props.node);
            },
            (event: IDragEvent) => {
                this.onDrag.bind(this)(event);
            },
            (event: IDragEvent) => {
                this.onDragStop.bind(this)(event);
            },
            () => {
                if (this.isMutable()) {
                    this.props.context.eventHandler.onNodeBeforeDrag(
                        this.props.node,
                        this.dragGroup
                    );
                    return true;
                } else {
                    return false;
                }
            }
        );

        // make ourselves a target
        this.props.plumberMakeTarget(this.props.node.uuid);

        // resolve our pending connections, etc
        if (this.props.context.eventHandler.onNodeMounted) {
            this.props.context.eventHandler.onNodeMounted(this.props.node);
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
            if (this.ele.hasOwnProperty('clientWidth') && this.ele.hasOwnProperty('clientHeight')) {
                this.props.context.eventHandler.onUpdateDimensions(this.props.node, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
            }
        }
    }

    componentWillUnmount() {
        this.props.plumberRemove(this.props.node.uuid);
    }

    componentDidUpdate(prevProps: INodeCompProps, prevState: INodeState) {
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
                if (!this.props.language) {
                    this.updateDimensions();
                }
            }
        } else {
            this.props.plumberRecalculate(this.props.node.uuid);
        }
    }

    onClick(event?: any) {
        // console.log("INode.onClick");
        var action: IAction = null;

        var localizations: LocalizedObject[] = [];

        // click the last action in the list if we have one

        if (this.props.language) {
            if (this.props.node.router.type == 'switch') {
                var router = this.props.node.router as ISwitchRouter;
                for (let kase of router.cases) {
                    localizations.push(
                        Localization.translate(
                            kase,
                            this.props.language,
                            this.props.languages,
                            this.props.translations
                        )
                    );
                }
            }

            // add our exit localizations
            for (let exit of this.props.node.exits) {
                localizations.push(
                    Localization.translate(
                        exit,
                        this.props.language,
                        this.props.languages,
                        this.props.translations
                    )
                );
            }
        } else if (this.props.node.actions && this.props.node.actions.length > 0) {
            action = this.props.node.actions[this.props.node.actions.length - 1];
        }

        this.props.context.eventHandler.openEditor({
            context: this.props.context,
            node: this.props.node,
            action: action,
            actionsOnly: true,
            nodeUI: this.props.ui,
            localizations: localizations,
            typeConfigList: this.props.typeConfigList,
            operatorConfigList: this.props.operatorConfigList,
            getTypeConfig: this.props.getTypeConfig,
            getOperatorConfig: this.props.getOperatorConfig,
            endpoints: this.props.endpoints,
            ComponentMap: this.props.ComponentMap
        });
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.props.context.eventHandler.onRemoveNode(this.props.node);
    }

    private isMutable(): boolean {
        return this.props.language == null;
    }

    render() {
        var classes = ['plumb-drag', styles.node];

        if (this.props.language) {
            classes.push(styles.translating);
        }

        var actions: JSX.Element[] = [];
        var actionList = null;
        if (this.props.node.actions) {
            // save the first reference off to manage our clicks
            var firstRef: any = {
                ref: (ele: any) => {
                    this.firstAction = ele;
                }
            };
            this.props.node.actions.map((action: IAction, idx: number) => {
                let actionConfig = this.props.getTypeConfig(action.type);
                if (actionConfig.component != null) {
                    var localization: LocalizedObject;
                    if (this.props.translations) {
                        localization = Localization.translate(
                            action,
                            this.props.language,
                            this.props.languages,
                            this.props.translations
                        );
                    }

                    var actionProps: IActionProps = {
                        action: action,
                        dragging: this.state.dragging,
                        context: this.props.context,
                        node: this.props.node,
                        first: idx === 0,
                        hasRouter: this.props.node.router != null,
                        Localization: localization,
                        getTypeConfig: this.props.getTypeConfig,
                        getOperatorConfig: this.props.getOperatorConfig,
                        typeConfigList: this.props.typeConfigList,
                        operatorConfigList: this.props.operatorConfigList,
                        endpoints: this.props.endpoints,
                        ComponentMap: this.props.ComponentMap
                    };

                    actions.push(
                        React.createElement(actionConfig.component, {
                            key: action.uuid,
                            ...actionProps,
                            ...firstRef
                        })
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

        var events = {
            onMouseDown: () => {
                this.clicking = true;
            },
            onMouseUp: (event: any) => {
                if (this.clicking) {
                    this.clicking = false;
                    this.onClick(event);
                }
            }
        };

        var header: JSX.Element = null;
        var addActions: JSX.Element = null;

        if (
            !this.props.node.actions ||
            this.props.node.actions.length == 0 ||
            this.props.ui.type != null
        ) {
            var type = this.props.node.router.type;
            if (this.props.ui.type) {
                type = this.props.ui.type;
            }

            let config = this.props.getTypeConfig(type);
            var title = config.name;

            if (this.props.node.router.type == 'switch') {
                let switchRouter = this.props.node.router as ISwitchRouter;
                if (switchRouter.result_name) {
                    if (this.props.ui.type == 'expression') {
                        title = 'Split by ' + switchRouter.result_name;
                    } else if (this.props.ui.type == 'wait_for_response') {
                        title = 'Wait for ' + switchRouter.result_name;
                    }
                }
            }

            if (!this.props.node.actions || this.props.node.actions.length == 0) {
                header = (
                    <div {...events}>
                        <TitleBar
                            className={shared[config.type]}
                            showRemoval={!this.props.language}
                            onRemoval={this.onRemoval.bind(this)}
                            title={title}
                        />
                    </div>
                );
            }
        } else {
            // don't show add actions option if we are translating
            if (this.isMutable()) {
                addActions = (
                    <a
                        className={styles.add}
                        onClick={() => {
                            this.props.context.eventHandler.onAddAction(this.props.node);
                        }}>
                        <span className="icon-add" />
                    </a>
                );
            }
        }

        var exits: JSX.Element[] = [];
        if (this.props.node.exits) {
            for (let exit of this.props.node.exits) {
                exits.push(
                    <ExitComp
                        exit={exit}
                        key={exit.uuid}
                        onDisconnect={this.props.context.eventHandler.onDisconnectExit}
                        Activity={this.props.Activity}
                        Localization={Localization.translate(
                            exit,
                            this.props.language,
                            this.props.translations
                        )}
                        plumberMakeSource={this.props.plumberMakeSource}
                        plumberRemove={this.props.plumberRemove}
                        plumberConnectExit={this.props.plumberConnectExit}
                    />
                );
            }
        }

        var modalTitle = <div>Router</div>;

        // are we dragging
        if (this.state.dragging) {
            classes.push(styles.dragging);
        }

        // is this a ghost node
        if (this.props.ghost) {
            classes.push(styles.ghost);
        }

        var exitClass = '';
        if (this.props.node.exits.length == 1 && !this.props.node.exits[0].name) {
            exitClass = styles.actions;
        }

        var dragLink = null;
        if (this.isMutable()) {
            dragLink = (
                <a
                    title="Drag to move all nodes below here"
                    className={styles.drag_group}
                    onMouseOver={() => {
                        this.dragGroup = true;
                    }}
                    onMouseOut={() => {
                        this.dragGroup = false;
                    }}>
                    <span className="icon-link" />
                </a>
            );
        }

        // console.log("Rendering " + this.props.node.uuid, this.props.ui.position);
        return (
            <div
                className={classes.join(' ')}
                ref={(ele: any) => {
                    this.ele = ele;
                }}
                id={this.props.node.uuid}
                style={{
                    left: this.props.ui.position.x,
                    top: this.props.ui.position.y
                }}>
                {dragLink}
                <CounterComp
                    ref={this.props.Activity.registerListener}
                    getCount={() => {
                        return this.props.Activity.getActiveCount(this.props.node.uuid);
                    }}
                    onUnmount={(key: string) => {
                        this.props.Activity.deregister(key);
                    }}
                    containerStyle={styles.active}
                    countStyle={styles.count}
                />
                {header}
                {actionList}
                <div className={styles.exit_table + ' ' + exitClass}>
                    <div className={styles.exits} {...events}>
                        {exits}
                    </div>
                </div>
                {addActions}
            </div>
        );
    }
}

export default NodeComp;
