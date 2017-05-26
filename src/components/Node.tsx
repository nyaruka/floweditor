import * as React from 'react';
import * as axios from 'axios';
import * as update from 'immutability-helper';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';

import {NodeProps, LocationProps, ActionProps, RouterProps, SwitchRouterProps, SaveToContactProps} from '../interfaces';
import {Plumber, DragEvent} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {Config} from '../services/Config';
import {NodeModal} from './NodeModal';
import {Action} from './Action';
import {Exit} from './Exit';
import {TitleBar} from './TitleBar';

export interface NodeState {
    dragging?: boolean;
    createPosition?: LocationProps;
}

/**
 * A single node in the rendered flow
 */
export class Node extends React.PureComponent<NodeProps, NodeState> {

    public ele: any;
    private modal: NodeModal;
    private firstAction: Action<ActionProps>;
    private newActionModal: NodeModal;

    constructor(props: NodeProps){
        super(props);
        this.state = { dragging: false }
        this.onClick = this.onClick.bind(this);
    }

    onDragStart(event: any) {
        this.setState({dragging: true});
        $('#root').addClass('dragging');
    }

    onDrag(event: DragEvent) {}

    onDragStop(event: DragEvent) {
        this.setState({dragging: false});
        $('#root').removeClass('dragging');
        var position = $(event.target).position();

        // update our coordinates
        this.props.context.eventHandler.onNodeMoved(this.props.uuid, {x: event.finalPos[0], y: event.finalPos[1]});
    }

    shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState) {

        // TODO: these should be inverse evaluations since things can be batched
        if (nextProps._ui.position.x != this.props._ui.position.x || nextProps._ui.position.y != this.props._ui.position.y) {
            return false;
        }
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {
        let plumber = Plumber.get();
        plumber.draggable(this.ele,
           (event: DragEvent) => {this.onDragStart.bind(this)(event)},
           (event: DragEvent) => {this.onDrag.bind(this)(event)}, 
           (event: DragEvent) => {this.onDragStop.bind(this)(event)}
        );

        // make ourselves a target
        plumber.makeTarget(this.props.uuid);

        // resolve our pending connections, etc
        if (this.props.context.eventHandler.onNodeMounted) {
            this.props.context.eventHandler.onNodeMounted(this.props);
        }

        // move our drag node around as necessary
        if (this.props.ghost) {
            $(document).bind('mousemove', (e) => {
                var ele = $(this.ele);
                var left = e.pageX - (ele.width() / 2);
                var top = e.pageY;
                var nodeEle = $(this.ele);
                nodeEle.offset({left, top});

                // hide ourselves there's a drop target
                // TODO: a less ugly way to accomplish this would be great
                if ($("#editor .drop-hover").length > 0) {
                    nodeEle.hide();
                } else {
                    nodeEle.show();
                }
            });
        }
    }

    componentWillUnmount() {
        Plumber.get().remove(this.props.uuid);
    }

    componentDidUpdate(prevProps: NodeProps, prevState: NodeState) {
        // console.log("Node updated..", this.props.uuid);
        if (!this.props.ghost) {
            Plumber.get().recalculate(this.props.uuid);
        }
        Plumber.get().repaint();
    }

    onClick (event: any) {
        if (!this.state.dragging) {
            // if we have one action, defer to it
            if (this.props.actions && this.props.actions.length == 1) {
                this.props.context.eventHandler.onEditNode(this.props.actions[0]);
            } else {
                if (this.props.router.type == "switch") {

                    var uuid = this.props.uuid;
                    if (this.props.ghost) {
                        uuid = null;
                    }

                    this.props.context.eventHandler.onEditNode({
                        ...this.props.router,
                        exits: this.props.exits,
                        uuid: uuid
                    } as SwitchRouterProps);
                }
            }
        }
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>) {
        this.props.context.eventHandler.onRemoveNode(this.props);
    }

    render() {
        var classes = ["node"];
        var actions: JSX.Element[] = [];
        if (this.props.actions) {
            // save the first reference off to manage our clicks
            var firstRef: any = {ref:(ele: any)=>{this.firstAction = ele}};
            for (let actionProps of this.props.actions) {
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
            events = {onMouseUpCapture: (event: any)=>{this.onClick(event)}}
        }

        var header: JSX.Element = null;
        var addActions: JSX.Element = null;

        if (this.props.router) {
            let config = Config.get().getTypeConfig(this.props.router.type);

            if (actions.length == 0){
                header = <TitleBar className={"split-title " + this.props.router.type} 
                                onRemoval={this.onRemoval.bind(this)} 
                                title={config.name} {...events}/>
            }
        } else {
            if (actions.length == 0) {
                header = <div className={"split-title switch"} {...events}>Split</div>
            }

            addActions = <a className="add" onClick={()=>{this.props.context.eventHandler.onAddAction(this.props.uuid)}}><span className="icon-add"/></a>
        }

        var exits: JSX.Element[] = []
        if (this.props.exits) {
            for (let exit of this.props.exits) {
                exits.push(<Exit {...exit} key={exit.uuid}/>);
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
            classes.push("ghost")
        }

        var exitClass = "";
        if (this.props.exits.length == 1 && !this.props.exits[0].name) {
            exitClass = "actions"
        }
        
        // console.log("Rendering node", this.props.uuid);
        return(
            <div className={classes.join(' ')}
                ref={(ele: any) => { this.ele = ele }}
                id={this.props.uuid}
                style={{
                    left: this.props._ui.position.x,
                    top: this.props._ui.position.y
                }}>
                {header}
                <div className="actions">
                    {actions}
                </div>
                <div className={"exit-table " + exitClass}>
                    <div className="exits" {...events}>
                        {exits}
                    </div>
                </div>
                {addActions}
            </div>
        )
    }
}

export default Node;