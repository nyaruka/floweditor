import * as React from 'react';
import * as axios from 'axios';
import * as Interfaces from '../interfaces';
import {Motion, spring} from '../../node_modules/react-motion';
import {Plumber, DragEvent} from '../services/Plumber';
import FlowStore from '../services/FlowStore';
import Config from '../services/Config';
import NodeModal from './NodeModal';
import ActionComp from './ActionComp';
import ExitComp from './ExitComp';
import TitleBar from './TitleBar';

var UUID = require('uuid');
var shallowCompare = require('react-addons-shallow-compare');

export interface NodeState {
    dragging: boolean;
}

/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.PureComponent<Interfaces.NodeProps, NodeState> {

    public ele: any;
    private modal: any;
    private firstAction: ActionComp<Interfaces.ActionProps>;

    context: Interfaces.FlowContext;
    
    static childContextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }

    static contextTypes = {
        flow: React.PropTypes.object
    }
       
    getChildContext(): Interfaces.FlowContext {
        return {
            flow: this.context.flow,
            node: this
        }
    }

    constructor(props: Interfaces.NodeProps){
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
        this.context.flow.updateNodeUI(this.props.uuid, {
            position: { $set: {
                x: event.finalPos[0],
                y: event.finalPos[1]
            }}
        });
    }

    shouldComponentUpdate(nextProps: Interfaces.NodeProps, nextState: NodeState) {

        // TODO: these should be inverse evaluations since things can be batched
        if (nextProps._ui.position.x != this.props._ui.position.x || nextProps._ui.position.y != this.props._ui.position.y) {
            return false;
        }

        if (nextState.dragging != this.state.dragging) {
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

        // update our props with our current location
        if (this.props.pendingConnection) {
            this.context.flow.resolvePendingConnection(this.props);
        }
    }

    componentWillUnmount() {
        console.log('unmounted', this.props.uuid);
        Plumber.get().remove(this.props.uuid);
    }

    componentDidUpdate(prevProps: Interfaces.NodeProps, prevState: NodeState) {
        if (!this.props.ghost) {
            Plumber.get().recalculate(this.props.uuid);
        }
        Plumber.get().repaint();
    }

    onClick (event: any) {
        if (!this.state.dragging) {
            // if we have one action, defer to it
            if (this.props.actions && this.props.actions.length == 1) {
                this.firstAction.onClick(event);
            } else {
                this.modal.open();
            }
        }
    }

    private onAddAction() {
        // console.log("Adding a new action!");
        this.context.flow.openNewActionModal(this.props.uuid);
    }

    private onRemoval(event: React.MouseEvent<HTMLDivElement>) {
        this.context.flow.removeNode(this.props);
    }

    render() {

        var classes = ["node"];
        var actions: JSX.Element[] = [];
        if (this.props.actions) {
            // save the first reference off to manage our clicks
            var firstRef: any = {ref:(ele: any)=>{this.firstAction = ele}};
            for (let definition of this.props.actions) {
                actions.push(<ActionComp key={definition.uuid} nodeUUID={this.props.uuid} {...definition} {...firstRef}/>);
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
            let renderer = new config.renderer(this.props.router, this.context);

            header = <TitleBar className={"split-title " + this.props.router.type} 
                               onRemoval={this.onRemoval.bind(this)} 
                               title={config.name} {...events}/>

            modal = <NodeModal ref={(ele: any) => {this.modal = ele}} 
                               initial={this.props.router}
                               context={this.context}
                               changeType={false}
            />
        } else {
            if (actions.length == 0) {
                header = <div className={"split-title switch"} {...events}>Split</div>
            }

            addActions = <a className="add" onClick={this.onAddAction.bind(this)}><span className="icon-add"/></a>
        }

        var exits: JSX.Element[] = []
        if (this.props.exits) {
            var first = true;
            for (let exit of this.props.exits) {
                exits.push(<ExitComp {...exit} first={first} totalExits={this.props.exits.length} key={exit.uuid}/>);
                first = false;
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
                <div className="exit-table">
                    <div className="exits" {...events}>
                        {exits}
                    </div>
                </div>
                {addActions}
                {modal}
            </div>
        )
    }
}

export default NodeComp;