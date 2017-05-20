import * as React from 'react';
import * as axios from 'axios';
import * as update from 'immutability-helper';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';

import {NodeProps, LocationProps, ActionProps} from '../interfaces';
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
        // booo
        $('#root').addClass('dragging');
    }

    onDrag(event: DragEvent) {}

    onDragStop(event: DragEvent) {
        this.setState({dragging: false});

        // booo
        $('#root').removeClass('dragging');
        var position = $(event.target).position();

        // update our coordinates
        this.props.mutator.updateNodeUI(this.props.uuid, {
            position: { $set: {
                x: event.finalPos[0],
                y: event.finalPos[1]
            }}
        });
    }

    shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState) {

        // TODO: these should be inverse evaluations since things can be batched
        if (nextProps._ui.position.x != this.props._ui.position.x || nextProps._ui.position.y != this.props._ui.position.y) {
            return false;
        }
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidMount() {
        // console.log("Node mounted", this.props.uuid);
        // console.log("mounted", this.props);
        let plumber = Plumber.get();
        plumber.draggable(this.ele,
           (event: DragEvent) => {this.onDragStart.bind(this)(event)},
           (event: DragEvent) => {this.onDrag.bind(this)(event)}, 
           (event: DragEvent) => {this.onDragStop.bind(this)(event)}
        );

        // make ourselves a target
        plumber.makeTarget(this.props.uuid);

        // update our props with our current location
        if (this.props.pendingConnection) {
            this.props.mutator.resolvePendingConnection(this.props);
        }

        // move our drag node around as necessary
        if (this.props.draggedFrom) {
            $(document).bind('mousemove', (e) => {
                var ele = $(this.ele);
                var left = e.pageX - (ele.width() / 2);
                var top = e.pageY;
                $(this.ele).offset({left, top});
            });
        }
    }

    componentWillUnmount() {
        console.log('unmounted', this.props.uuid);
        Plumber.get().remove(this.props.uuid);
    }

    componentDidUpdate(prevProps: NodeProps, prevState: NodeState) {
        if (!this.props.draggedFrom) {
            Plumber.get().recalculate(this.props.uuid);
        }
        Plumber.get().repaint();
    }

    onClick (event: any) {
        if (!this.state.dragging) {
            // if we have one action, defer to it
            if (this.props.actions && this.props.actions.length == 1) {
                this.firstAction.openModal();
            } else {
                this.modal.open();
            }
        }
    }

    private onAddAction() {
        this.newActionModal.open();
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>) {
        this.props.mutator.removeNode(this.props);
    }

    render() {
        console.log(this.props);
        var classes = ["node"];
        var actions: JSX.Element[] = [];
        if (this.props.actions) {
            // save the first reference off to manage our clicks
            var firstRef: any = {ref:(ele: any)=>{this.firstAction = ele}};
            for (let actionProps of this.props.actions) {
                let actionConfig = Config.get().getTypeConfig(actionProps.type);
                if (actionConfig.component != null){
                    actions.push(React.createElement(actionConfig.component, { 
                        ...actionProps,
                        ...firstRef,
                        key: actionProps.uuid,
                        mutator: this.props.mutator, 
                        dragging: this.state.dragging, 
                        draggedFrom: this.props.draggedFrom,
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
        var modal: JSX.Element = null;
        var addActions: JSX.Element = null;

        if (this.props.router) {
            let config = Config.get().getTypeConfig(this.props.router.type);

            if (actions.length == 0){
                header = <TitleBar className={"split-title " + this.props.router.type} 
                                onRemoval={this.onRemoval.bind(this)} 
                                title={config.name} {...events}/>
            }

            modal = <NodeModal ref={(ele: any) => {this.modal = ele}} 
                               initial={{...this.props.router, exits: this.props.exits}}
                               exits={this.props.exits}
                               changeType={true}
            />
        } else {
            if (actions.length == 0) {
                header = <div className={"split-title switch"} {...events}>Split</div>
            }

            addActions = <a className="add" onClick={this.onAddAction.bind(this)}><span className="icon-add"/></a>
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
        if (this.props.draggedFrom) {
            classes.push("ghost")
        }

        // create our empty modal for creating new actions
        let newAction = <NodeModal 
            ref={(ele: any) => {this.newActionModal = ele}}
            initial={{addToNode: this.props.uuid, type:"msg", uuid:UUID.v4(), mutator: this.props.mutator} as ActionProps}
            changeType={true}
        />

        var exitClass = "";
        if (this.props.exits.length == 1 && !this.props.exits[0].name) {
            exitClass = "actions"
        }
        

        // console.log("Rendering node", this.props.uuid);
        return(
            <div className={classes.join(' ')}
                ref={(ele: any) => { this.ele = ele }}
                key={this.props.uuid}
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
                {modal}
                {newAction}
            </div>
        )
    }
}

export default Node;