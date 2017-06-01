import * as React from 'react';
import * as axios from 'axios';
import * as update from 'immutability-helper';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';

import { LocationProps, ActionProps, RouterProps, SaveToContactProps, FlowContext } from '../interfaces';
import { Plumber, DragEvent } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { NodeModal } from './NodeModal';
import { ActionComp } from './Action';
import { ExitComp } from './Exit';
import { TitleBar } from './TitleBar';
import { SwitchRouterProps } from './routers/SwitchRouter';

import { Node, Position, SwitchRouter } from '../FlowDefinition'

var styles = require("./Node.scss");
var shared = require("./shared.scss");

/**
 * A point in the flow from which a drag is initiated
 */
export interface DragPoint {
    exitUUID: string;
    nodeUUID: string;
    onResolved?: Function;
}

export interface NodeState {
    dragging?: boolean;
    createPosition?: LocationProps;
}

export interface NodeProps {
    node: Node;
    context: FlowContext;
    position: Position;
    ghost?: boolean;
}

/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.PureComponent<NodeProps, NodeState> {

    public ele: any;
    private modal: NodeModal;
    private firstAction: ActionComp<ActionProps>;
    private newActionModal: NodeModal;

    constructor(props: NodeProps) {
        super(props);
        this.state = { dragging: false }
        this.onClick = this.onClick.bind(this);
    }

    onDragStart(event: any) {
        this.setState({ dragging: true });
        $('#root').addClass('dragging');
    }

    onDrag(event: DragEvent) { }

    onDragStop(event: DragEvent) {
        this.setState({ dragging: false });
        $('#root').removeClass('dragging');
        var position = $(event.target).position();

        // update our coordinates
        this.props.context.eventHandler.onNodeMoved(this.props.node.uuid, { x: event.finalPos[0], y: event.finalPos[1] });
    }

    shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState): boolean {

        // TODO: these should be inverse evaluations since things can be batched
        if (nextProps.position.x != this.props.position.x || nextProps.position.y != this.props.position.y) {
            return false;
        }
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {
        let plumber = Plumber.get();
        plumber.draggable(this.ele,
            (event: DragEvent) => { this.onDragStart.bind(this)(event) },
            (event: DragEvent) => { this.onDrag.bind(this)(event) },
            (event: DragEvent) => { this.onDragStop.bind(this)(event) }
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
        }


    }

    componentWillUnmount() {
        Plumber.get().remove(this.props.node.uuid);
    }

    componentDidUpdate(prevProps: NodeProps, prevState: NodeState) {
        // console.log("Node updated..", this.props.uuid);
        if (!this.props.ghost) {
            Plumber.get().recalculate(this.props.node.uuid);
        }
        Plumber.get().repaint();
    }

    onClick(event: any) {
        if (!this.state.dragging) {
            // if we have one action, defer to it
            if (this.props.node.actions && this.props.node.actions.length == 1) {

                var action = this.props.node.actions[0];
                this.props.context.eventHandler.onEditNode({
                    initial: action,
                    uuid: action.uuid,
                    type: action.type,
                    context: this.props.context
                });
            } else {
                if (this.props.node.router.type == "switch") {

                    var uuid = this.props.node.uuid;
                    if (this.props.ghost) {
                        uuid = null;
                    }

                    var initial: SwitchRouterProps = {
                        router: this.props.node.router as SwitchRouter,
                        exits: this.props.node.exits,
                        type: "switch",
                        uuid: this.props.node.uuid,
                        context: this.props.context
                    };

                    this.props.context.eventHandler.onEditNode({
                        initial: initial,
                        uuid: uuid,
                        type: this.props.node.router.type,
                        context: this.props.context
                    });
                }
            }
        }
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>) {
        this.props.context.eventHandler.onRemoveNode(this.props.node);
    }

    render() {
        var classes = ["plumb-drag", styles.node];
        var actions: JSX.Element[] = [];
        if (this.props.node.actions) {
            // save the first reference off to manage our clicks
            var firstRef: any = { ref: (ele: any) => { this.firstAction = ele } };
            for (let actionProps of this.props.node.actions) {
                let actionConfig = Config.get().getTypeConfig(actionProps.type);
                if (actionConfig.component != null) {
                    actions.push(React.createElement(actionConfig.component, {
                        ...actionProps,
                        ...firstRef,
                        dragging: this.state.dragging,
                        key: actionProps.uuid,
                        context: this.props.context,
                    } as ActionProps));
                }
                firstRef = {};
            }
        }

        var events = {}
        if (!this.state.dragging) {
            events = { onMouseUpCapture: (event: any) => { this.onClick(event) } }
        }

        var header: JSX.Element = null;
        var addActions: JSX.Element = null;

        if (this.props.node.router) {
            let config = Config.get().getTypeConfig(this.props.node.router.type);

            if (actions.length == 0) {
                header = <TitleBar className={shared[this.props.node.router.type]}
                    onRemoval={this.onRemoval.bind(this)}
                    title={config.name} {...events} />
            }
        } else {
            addActions = <a className={styles.add} onClick={() => { this.props.context.eventHandler.onAddAction(this.props.node.uuid) }}><span className="icon-add" /></a>
        }

        var exits: JSX.Element[] = []
        if (this.props.node.exits) {
            for (let exit of this.props.node.exits) {
                exits.push(<ExitComp exit={exit} key={exit.uuid} />);
            }
        }

        var modalTitle = <div>Router</div>

        // are we dragging
        if (this.state.dragging) {
            classes.push("z-depth-4");
        } else {
            classes.push("z-depth-1");
        }

        // is this a ghost node
        if (this.props.ghost) {
            classes.push(styles.ghost);
        }

        var exitClass = "";
        if (this.props.node.exits.length == 1 && !this.props.node.exits[0].name) {
            exitClass = styles.actions;
        }

        // console.log("Rendering node", this.props.uuid);
        return (
            <div className={classes.join(' ')}
                ref={(ele: any) => { this.ele = ele }}
                id={this.props.node.uuid}
                style={{
                    left: this.props.position.x,
                    top: this.props.position.y
                }}>
                {header}
                <div className={styles.actions}>
                    {actions}
                </div>
                <div className={styles["exit-table"] + " " + exitClass}>
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