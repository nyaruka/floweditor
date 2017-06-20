import * as React from 'react';
import * as axios from 'axios';
import * as update from 'immutability-helper';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';

import { ActionProps } from './Action';
import { FlowContext } from './Flow';
import { Plumber, DragEvent } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { ActionComp } from './Action';
import { ExitComp } from './Exit';
import { TitleBar } from './TitleBar';
import { External } from '../services/External';

import { Node, Position, SwitchRouter, Action, UINode, Exit } from '../FlowDefinition'
import { CounterComp } from "./Counter";
import { ActivityManager } from "../services/ActivityManager";
import { ComponentMap } from "./ComponentMap";

var styles = require("./Node.scss");
var shared = require("./shared.scss");

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
    node: Node;
    context: FlowContext;
    ui: UINode;
    external: External;
    ghost?: boolean;
}

/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.Component<NodeProps, NodeState> {

    public ele: HTMLDivElement;
    private firstAction: ActionComp<Action>;
    private clicking: boolean;
    private dragGroup: boolean;

    constructor(props: NodeProps) {
        super(props);
        this.state = { dragging: false }
        this.onClick = this.onClick.bind(this);
    }

    onDragStart(event: any) {
        this.clicking = false;
        this.setState({ dragging: true });
    }

    onDrag(event: DragEvent) { }

    onDragStop(event: DragEvent) {
        this.setState({ dragging: false });
        this.props.context.eventHandler.onNodeDragStop(this.props.node)

        var position = $(event.target).position();
        event.e.preventDefault();
        event.e.stopPropagation();
        event.e.stopImmediatePropagation();
        window.event.cancelBubble = true;
        // update our coordinates
        this.props.context.eventHandler.onNodeMoved(this.props.node.uuid, { x: event.finalPos[0], y: event.finalPos[1] });
    }

    shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState): boolean {
        if (nextProps.ui.position.x != this.props.ui.position.x || nextProps.ui.position.y != this.props.ui.position.y) {
            return true;
        }
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {
        let plumber = Plumber.get();
        plumber.draggable(this.props.node.uuid,
            (event: DragEvent) => {
                this.onDragStart.bind(this)(event);
                this.props.context.eventHandler.onNodeDragStart(this.props.node);
            },
            (event: DragEvent) => { this.onDrag.bind(this)(event) },
            (event: DragEvent) => { this.onDragStop.bind(this)(event); },
            () => { this.props.context.eventHandler.onNodeBeforeDrag(this.props.node, this.dragGroup); }
        );

        // make ourselves a target
        plumber.makeTarget(this.props.node.uuid);

        // resolve our pending connections, etc
        if (this.props.context.eventHandler.onNodeMounted) {
            this.props.context.eventHandler.onNodeMounted(this.props.node);
        }

        // move our drag node around as necessary
        if (this.props.ghost) {
            $(document).bind('mousemove', (e) => {
                var ele = $(this.ele);
                var left = e.pageX - (ele.width() / 2);
                var top = e.pageY;
                var nodeEle = $(this.ele);
                nodeEle.offset({ left, top });

                // hide ourselves there's a drop target
                // TODO: a less ugly way to accomplish this would be great
                if ($(".plumb-drop-hover").length > 0) {
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
        this.props.context.eventHandler.onUpdateDimensions(this.props.node, {
            width: this.ele.clientWidth,
            height: this.ele.clientHeight
        });
    }

    componentWillUnmount() {
        Plumber.get().remove(this.props.node.uuid);
    }

    componentDidUpdate(prevProps: NodeProps, prevState: NodeState) {
        if (!this.props.ghost) {
            try {
                Plumber.get().recalculate(this.props.node.uuid);
            } catch (error) {
                console.log(error);
            }

            if (!this.props.ui.dimensions || (this.props.ui.dimensions.width != this.ele.clientWidth ||
                this.props.ui.dimensions.height != this.ele.clientHeight)) {
                this.updateDimensions();
            }
        } else {
            Plumber.get().recalculate(this.props.node.uuid);
        }
    }

    onClick(event?: any) {

        // console.log("Node.onClick");
        var action: Action = null;

        // click the last action in the list if we have one
        if (this.props.node.actions && this.props.node.actions.length > 0) {
            action = this.props.node.actions[this.props.node.actions.length - 1];
        }

        this.props.context.eventHandler.openEditor({
            context: this.props.context,
            node: this.props.node,
            action: action,
            actionsOnly: true,
            nodeUI: this.props.ui
        });

    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.props.context.eventHandler.onRemoveNode(this.props.node);
    }

    render() {
        var classes = ["plumb-drag", styles.node];
        var actions: JSX.Element[] = [];
        var actionList = null;
        if (this.props.node.actions) {
            // save the first reference off to manage our clicks
            var firstRef: any = { ref: (ele: any) => { this.firstAction = ele } };
            var first = true;
            for (let action of this.props.node.actions) {
                let actionConfig = Config.get().getTypeConfig(action.type);
                if (actionConfig.component != null) {

                    var actionProps: ActionProps = {
                        action: action,
                        dragging: this.state.dragging,
                        context: this.props.context,
                        node: this.props.node,
                        first: first,
                    };

                    actions.push(React.createElement(actionConfig.component, { key: action.uuid, ...actionProps, ...firstRef }));
                }
                first = false;
                firstRef = {};
            }

            actionList = (
                <div className={styles.actions}>
                    {actions}
                </div>
            )
        }

        var events = {
            onMouseDown: () => { this.clicking = true },
            onMouseUp: (event: any) => { if (this.clicking) { this.clicking = false; this.onClick(event) } }
        }

        var header: JSX.Element = null;
        var addActions: JSX.Element = null;

        if (!this.props.node.actions || this.props.node.actions.length == 0 || this.props.ui.type != null) {

            var type = this.props.node.router.type;
            if (this.props.ui.type) {
                type = this.props.ui.type;
            }

            let config = Config.get().getTypeConfig(type);
            var title = config.name;

            if (this.props.node.router.type == "switch") {
                let switchRouter = this.props.node.router as SwitchRouter;
                if (switchRouter.result_name) {
                    if (this.props.ui.type == "expression") {
                        title = "Split by " + switchRouter.result_name;
                    } else if (this.props.ui.type == "wait_for_response") {
                        title = "Wait for " + switchRouter.result_name;
                    }
                }
            }

            if (!this.props.node.actions || this.props.node.actions.length == 0) {
                header = (
                    <div {...events}>
                        <TitleBar className={shared[config.type]} onRemoval={this.onRemoval.bind(this)} title={title} />
                    </div>
                )
            }
        } else {
            addActions = <a className={styles.add} onClick={() => { this.props.context.eventHandler.onAddAction(this.props.node) }}><span className="icon-add" /></a>
        }

        var exits: JSX.Element[] = []
        if (this.props.node.exits) {
            for (let exit of this.props.node.exits) {
                exits.push(
                    <ExitComp
                        exit={exit}
                        key={exit.uuid}
                        onDisconnect={this.props.context.eventHandler.onDisconnectExit}
                    />
                );
            }
        }

        var modalTitle = <div>Router</div>

        // are we dragging
        if (this.state.dragging) {
            classes.push(styles.dragging);
        }

        // is this a ghost node
        if (this.props.ghost) {
            classes.push(styles.ghost);
        }

        var exitClass = "";
        if (this.props.node.exits.length == 1 && !this.props.node.exits[0].name) {
            exitClass = styles.actions;
        }

        var activity = ActivityManager.get();
        // console.log("Rendering " + this.props.node.uuid, this.props.ui.position);
        return (
            <div className={classes.join(' ')}
                ref={(ele: any) => { this.ele = ele }}
                id={this.props.node.uuid}
                style={{
                    left: this.props.ui.position.x,
                    top: this.props.ui.position.y
                }}>
                <a title="Drag to move all nodes below here" className={styles.drag_group}
                    onMouseOver={() => { this.dragGroup = true; }}
                    onMouseOut={() => { this.dragGroup = false; }}>

                    <span className="icon-link" /></a>
                <CounterComp
                    ref={activity.registerListener}
                    getCount={() => { return activity.getActiveCount(this.props.node.uuid) }}
                    onUnmount={(key: string) => { activity.deregister(key); }}
                    containerStyle={styles.active}
                    countStyle={styles.count}
                />
                {header}
                {actionList}
                <div className={styles.exit_table + " " + exitClass}>
                    <div className={styles.exits} {...events}>
                        {exits}
                    </div>
                </div>
                {addActions}
            </div>
        )
    }
}

export default NodeComp;